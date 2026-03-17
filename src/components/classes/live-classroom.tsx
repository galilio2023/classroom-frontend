import { useEffect, useRef, useState } from "react";
import {
  useCustomMutation,
  useGetIdentity,
  useList,
  useOne,
} from "@refinedev/core";
import { User, UserRole } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grid, Loader2, Presentation, Users, Video } from "lucide-react";
import { toast } from "sonner";
import { socket } from "@/lib/socket";
import { Whiteboard } from "./whiteboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface LiveClassroomProps {
  classId: string;
  className?: string;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export const LiveClassroom = ({
  classId: classIdString,
}: LiveClassroomProps) => {
  const { t, i18n } = useTranslation();
  const { data: identity } = useGetIdentity<User>();
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("video");

  // Breakout Room State
  const [isBreakoutActive, setIsBreakoutActive] = useState(false);
  const [currentGroupId, setCurrentGroupId] = useState<number | null>(null);
  const [myGroup, setMyGroup] = useState<any>(null);

  const { mutate: markLiveAttendance } = useCustomMutation();
  const { mutate: getRoomToken } = useCustomMutation();
  const { mutate: endLiveSession } = useCustomMutation();
  const { mutate: saveRecording } = useCustomMutation();
  const { mutate: manageBreakout } = useCustomMutation();
  const { mutate: startLiveSession } = useCustomMutation();

  const isTeacher =
    identity?.role === UserRole.TEACHER || identity?.role === UserRole.ADMIN;
  const numericClassId = Number(classIdString);
  const isAr = i18n.language === "ar";

  // Sync Class State (for persistence)
  const { query: classQuery } = useOne({
    resource: "classes",
    id: classIdString,
    queryOptions: {
      enabled: !!numericClassId,
    },
  });

  const classData = classQuery.data?.data;

  useEffect(() => {
    if (classQuery.isError) {
      console.error("Error fetching class data:", classQuery.error);
    }
  }, [classQuery.isError, classQuery.error]);

  useEffect(() => {
    if (classData?.isBreakoutActive) {
      setIsBreakoutActive(true);
    }
  }, [classData]);

  // Fetch groups to determine student's group or list for teacher
  const { query: groupsQuery } = useList({
    resource: "project-groups",
    filters: [{ field: "classId", operator: "eq", value: numericClassId }],
    queryOptions: {
      enabled: !!numericClassId,
    },
    pagination: { mode: "off" },
  });

  useEffect(() => {
    if (groupsQuery.isError) {
      console.error("Error fetching project groups:", groupsQuery.error);
    }
  }, [groupsQuery.isError, groupsQuery.error]);

  const groups = groupsQuery.data?.data || [];

  useEffect(() => {
    if (groups.length > 0 && identity && !isTeacher) {
      // Find the group the student belongs to
      const group = groups.find((g: any) =>
        g.members?.some((m: any) => m.studentId === identity.id),
      );
      setMyGroup(group);
    }
  }, [groups, identity, isTeacher]);

  useEffect(() => {
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // Real-time Socket Listeners
    if (!socket.connected) socket.connect();

    socket.on("live_session_started", (data) => {
      if (Number(data.classId) === numericClassId && !isTeacher) {
        toast.info(
          t("classes.live.toasts.sessionStarted", { name: data.startedBy }),
          {
            action: {
              label: t("notifications.joinNow"),
              onClick: () => startMeeting(),
            },
          },
        );
      }
    });

    socket.on("live_session_ended", (data) => {
      if (Number(data.classId) === numericClassId) {
        setIsJoined(false);
        if (api) api.dispose();
        toast.error(t("classes.live.toasts.sessionEnded"));
      }
    });

    socket.on("breakout_session_started", (data) => {
      if (Number(data.classId) === numericClassId) {
        setIsBreakoutActive(true);
        toast.info(t("classes.live.toasts.breakoutStarted"));

        // Auto-join for students if they are already in the call
        if (!isTeacher && myGroup) {
          toast.success(
            t("classes.live.toasts.joiningGroup", { name: myGroup.name }),
          );
          joinBreakoutRoom(myGroup.id);
        }
      }
    });

    socket.on("breakout_session_ended", (data) => {
      if (Number(data.classId) === numericClassId) {
        setIsBreakoutActive(false);
        setCurrentGroupId(null);
        toast.info(t("classes.live.toasts.breakoutEnded"));
        // Re-join main hall
        startMeeting();
      }
    });

    return () => {
      if (api) {
        api.dispose();
      }
      socket.off("live_session_started");
      socket.off("live_session_ended");
      socket.off("breakout_session_started");
      socket.off("breakout_session_ended");
    };
  }, [api, numericClassId, isTeacher, myGroup, t]);

  const handleStartLiveSession = () => {
    setIsLoading(true);
    startLiveSession(
      {
        url: "/live-session/start",
        method: "post",
        values: { classId: numericClassId },
      },
      {
        onSuccess: () => {
          toast.success(t("classes.live.toasts.sessionStartedTeacher"));
          startMeeting();
        },
        onError: (error: any) => {
          setIsLoading(false);
          toast.error(
            error?.data?.message || t("classes.live.toasts.startFailed"),
          );
          console.error("Failed to start live session:", error);
        },
      },
    );
  };

  const startMeeting = (groupId?: number) => {
    if (!window.JitsiMeetExternalAPI || !identity || isNaN(numericClassId))
      return;

    setIsLoading(true);
    if (api) api.dispose();

    // If joining main hall, clear group ID
    if (!groupId) setCurrentGroupId(null);

    getRoomToken(
      {
        url: "/live-session/token",
        method: "post",
        values: {
          classId: numericClassId,
          groupId: groupId, // Optional: if provided, joins breakout room
        },
      },
      {
        onSuccess: (data: any) => {
          const { roomName, token } = data.data;
          initializeJitsi(roomName, token, groupId);
        },
        onError: (error: any) => {
          setIsLoading(false);
          toast.error(t("classes.live.toasts.joinFailed"));
          console.error("Live session error:", error);
        },
      },
    );
  };

  const joinBreakoutRoom = (groupId: number) => {
    setCurrentGroupId(groupId);
    startMeeting(groupId);
  };

  const initializeJitsi = (
    roomName: string,
    token?: string,
    groupId?: number,
  ) => {
    if (!window.JitsiMeetExternalAPI || !identity) return;

    setIsJoined(true);

    setTimeout(() => {
      if (!jitsiContainerRef.current) {
        setIsLoading(false);
        setIsJoined(false);
        return;
      }

      // Clear container before starting
      jitsiContainerRef.current.innerHTML = "";

      const domain = "meet.jit.si";
      const options = {
        roomName: roomName,
        jwt: token,
        width: "100%",
        height: 600,
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: identity.name,
          email: identity.email,
        },
        configOverwrite: {
          startWithAudioMuted: !isTeacher,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          enableLobby: false,
          disableRecording: !!groupId && !isTeacher,
        },
        interfaceConfigOverwrite: {},
      };

      try {
        const newApi = new window.JitsiMeetExternalAPI(domain, options);
        setApi(newApi);

        newApi.addEventListeners({
          videoConferenceJoined: () => {
            setIsLoading(false);
            if (identity.role === UserRole.STUDENT && !groupId) {
              markLiveAttendance({
                url: "/attendance/live",
                method: "post",
                values: { classId: numericClassId },
              });
            }
          },
          videoConferenceLeft: () => {
            if (groupId) {
              setCurrentGroupId(null);
            } else {
              setIsJoined(false);
              setApi(null);
              if (isTeacher) {
                endLiveSession({
                  url: "/live-session/end",
                  method: "post",
                  values: { classId: numericClassId },
                });
              }
            }
          },
          readyToClose: () => {
            setIsJoined(false);
            setApi(null);
          },
          recordingStatusChanged: (payload: {
            on: boolean;
            link?: string;
            error?: string;
          }) => {
            if (!payload.on && payload.link && isTeacher && !groupId) {
              saveRecording(
                {
                  url: "/resources",
                  method: "post",
                  values: {
                    classId: numericClassId,
                    title: `Live Session Recording - ${new Date().toLocaleDateString()}`,
                    url: payload.link,
                    type: "video",
                    description:
                      "Recording of the live session held on " +
                      new Date().toLocaleString(),
                  },
                },
                {
                  onSuccess: () =>
                    toast.success(t("classes.live.toasts.recordingSaved")),
                },
              );
            }
          },
        });
      } catch (err) {
        console.error("Error initializing Jitsi:", err);
        setIsLoading(false);
        setIsJoined(false);
        toast.error(t("classes.live.toasts.initFailed"));
      }
    }, 100);
  };

  const handleToggleBreakout = () => {
    const endpoint = isBreakoutActive ? "/breakout/end" : "/breakout/start";
    manageBreakout(
      {
        url: `/live-session${endpoint}`,
        method: "post",
        values: { classId: numericClassId },
      },
      {
        onSuccess: () => {
          toast.success(
            isBreakoutActive
              ? t("classes.live.toasts.breakoutEnded")
              : t("classes.live.toasts.breakoutStarted"),
          );
          setIsBreakoutActive(!isBreakoutActive);
        },
      },
    );
  };

  const isClassLive = classData?.isLive;

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Video className="h-5 w-5 text-live-primary" />
            {t("classes.live.title")}{" "}
            {currentGroupId
              ? t("classes.live.breakoutRoom")
              : t("classes.live.mainHall")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isBreakoutActive
              ? t("classes.live.breakoutActive")
              : t("classes.live.mainActive")}
          </p>
        </div>

        {isTeacher && isJoined && (
          <div className="flex gap-2">
            <Button
              variant={isBreakoutActive ? "destructive" : "secondary"}
              size="sm"
              onClick={handleToggleBreakout}
            >
              <Grid className={cn("h-4 w-4", isAr ? "ml-2" : "mr-2")} />
              {isBreakoutActive
                ? t("classes.live.endBreakouts")
                : t("classes.live.startBreakouts")}
            </Button>
          </div>
        )}
      </div>

      {isTeacher && isBreakoutActive && isJoined && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={currentGroupId === null ? "default" : "outline"}
            size="sm"
            onClick={() => startMeeting()}
          >
            {t("classes.live.mainHall")}
          </Button>
          {groups.map((group: any) => (
            <Button
              key={group.id}
              variant={currentGroupId === group.id ? "default" : "outline"}
              size="sm"
              onClick={() => joinBreakoutRoom(group.id)}
            >
              {group.name}
            </Button>
          ))}
        </div>
      )}

      {!isJoined ? (
        <Card className="border-dashed py-12 text-center bg-muted/10">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="p-4 bg-live-secondary rounded-full">
              <Users className="h-8 w-8 text-live-primary" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-bold">
                {t("classes.live.readyToJoin")}
              </h4>
              <p className="text-muted-foreground max-w-md mx-auto">
                {isBreakoutActive && !isTeacher
                  ? t("classes.live.breakoutDescription")
                  : isClassLive
                    ? t("classes.live.mainDescription")
                    : t("classes.live.sessionNotStarted")}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {isTeacher && !isClassLive ? (
                <Button
                  size="lg"
                  onClick={handleStartLiveSession}
                  disabled={isLoading}
                  className="bg-live-primary hover:bg-live-primary/90 text-white shadow-lg shadow-live-primary/20"
                >
                  {isLoading ? (
                    <Loader2
                      className={cn(
                        "h-4 w-4 animate-spin",
                        isAr ? "ml-2" : "mr-2",
                      )}
                    />
                  ) : (
                    <Video className={cn("h-4 w-4", isAr ? "ml-2" : "mr-2")} />
                  )}
                  {t("classes.live.startLiveSession")}
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={() =>
                    isBreakoutActive && myGroup
                      ? joinBreakoutRoom(myGroup.id)
                      : startMeeting()
                  }
                  disabled={isLoading || !isClassLive}
                  className="bg-live-primary hover:bg-live-primary/90 text-white shadow-lg shadow-live-primary/20"
                >
                  {isLoading ? (
                    <Loader2
                      className={cn(
                        "h-4 w-4 animate-spin",
                        isAr ? "ml-2" : "mr-2",
                      )}
                    />
                  ) : (
                    <Video className={cn("h-4 w-4", isAr ? "ml-2" : "mr-2")} />
                  )}
                  {isBreakoutActive && myGroup
                    ? t("classes.live.joinGroup", { name: myGroup.name })
                    : t("classes.live.joinNow")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 max-w-100">
              <TabsTrigger value="video" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                {t("classes.live.videoSession")}
              </TabsTrigger>
              <TabsTrigger
                value="whiteboard"
                className="flex items-center gap-2"
              >
                <Presentation className="h-4 w-4" />
                {t("classes.live.whiteboard")}
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <TabsContent
                value="video"
                forceMount
                className={cn("m-0", activeTab !== "video" && "hidden")}
              >
                <div className="rounded-xl overflow-hidden border shadow-2xl bg-black">
                  <div ref={jitsiContainerRef} className="w-full h-150" />
                </div>
              </TabsContent>

              <TabsContent
                value="whiteboard"
                forceMount
                className={cn("m-0", activeTab !== "whiteboard" && "hidden")}
              >
                <div className="h-162.5">
                  <Whiteboard
                    classId={classIdString}
                    roomId={
                      currentGroupId ? `group-${currentGroupId}` : classIdString
                    }
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      )}
    </div>
  );
};
