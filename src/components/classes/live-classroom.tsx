import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  useCustomMutation,
  useGetIdentity,
  useList,
  useOne,
  GetOneResponse,
} from "@refinedev/core";
import { User, UserRole, Class } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grid, Loader2, Presentation, Users, Video, ExternalLink, MonitorUp, ListChecks, Bot, RotateCcw, Sparkles, BrainCircuit } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { socket } from "@/lib/socket";
import { Whiteboard } from "./whiteboard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { usePersistentLive } from "@/hooks/use-persistent-live";

import { Badge } from "@/components/ui/badge";
import { AILiveCompanion } from "./ai-live-companion";

interface LiveClassroomProps {
  classId: string;
  className?: string;
  isMiniMode?: boolean;
  onJoin?: () => void;
}

interface SessionStartedData {
  classId: string | number;
  startedBy: string;
}

interface SessionEndedData {
  classId: string | number;
}

interface BreakoutStartedData {
  classId: string | number;
}

interface BreakoutEndedData {
  classId: string | number;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: typeof JitsiMeetExternalAPI;
  }
}

interface LiveSessionResponse {
  roomName: string;
  token?: string;
}

export const LiveClassroom = ({
  classId: classIdString,
  isMiniMode = false,
  onJoin,
}: LiveClassroomProps) => {
  const { t, i18n } = useTranslation();
  const { data: identity } = useGetIdentity<User>();
  const { isJoined, setIsJoined, activeClassId } = usePersistentLive();
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiMeetExternalAPI | null>(null);
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
  const { query: classQuery } = useOne<Class>({
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
  const { query: groupsQuery } = useList<any>({
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

  const groups = useMemo(() => groupsQuery.data?.data || [], [groupsQuery.data?.data]);

  useEffect(() => {
    if (groups.length > 0 && identity && !isTeacher) {
      // Find the group the student belongs to
      const group = groups.find((g: any) =>
        g.members?.some((m: any) => m.studentId === identity.id),
      );
      setMyGroup(group);
    }
  }, [groups, identity, isTeacher]);

  const initializeJitsi = useCallback((
    roomName: string,
    token?: string,
    groupId?: number,
  ) => {
    if (!window.JitsiMeetExternalAPI || !identity) return;

    setIsJoined(true);
    onJoin?.(); // 🚀 Notify global store that we've joined

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
        apiRef.current = newApi;

        newApi.on("videoConferenceJoined", () => {
          setIsLoading(false);
          if (identity.role === UserRole.STUDENT && !groupId) {
            markLiveAttendance({
              url: "/attendance/live",
              method: "post",
              values: { classId: numericClassId },
            });
          }
        });

        newApi.on("videoConferenceLeft", () => {
          if (groupId) {
            setCurrentGroupId(null);
          } else {
            setIsJoined(false);
            apiRef.current = null;
          }
        });

        newApi.on("readyToClose", () => {
          setIsJoined(false);
          apiRef.current = null;
        });

        newApi.on("recordingStatusChanged", (payload: {
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
        });
      } catch (err) {
        console.error("Error initializing Jitsi:", err);
        setIsLoading(false);
        setIsJoined(false);
        toast.error(t("classes.live.toasts.initFailed"));
      }
    }, 100);
  }, [identity, isTeacher, numericClassId, onJoin, setIsJoined, markLiveAttendance, saveRecording, t]);

  const startMeeting = useCallback((groupId?: number) => {
    if (!window.JitsiMeetExternalAPI || !identity || isNaN(numericClassId))
      return;

    setIsLoading(true);
    if (apiRef.current) {
      apiRef.current.dispose();
      apiRef.current = null;
    }

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
        onSuccess: (data: GetOneResponse<LiveSessionResponse>) => {
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
  }, [identity, numericClassId, getRoomToken, initializeJitsi, t]);

  const joinBreakoutRoom = useCallback((groupId: number) => {
    setCurrentGroupId(groupId);
    startMeeting(groupId);
  }, [startMeeting]);

  useEffect(() => {
    if (isJoined && numericClassId === Number(activeClassId) && !apiRef.current && !isLoading) {
        // 🚀 AUTO-RESUME: Reconnect if state says we were joined
        void startMeeting();
    }
  }, [isJoined, activeClassId, numericClassId, isLoading, startMeeting]);

  useEffect(() => {
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // Real-time Socket Listeners
    if (!socket.connected) socket.connect();

    const handleSessionStarted = (data: SessionStartedData) => {
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
    };

    const handleSessionEnded = (data: SessionEndedData) => {
      if (Number(data.classId) === numericClassId) {
        setIsJoined(false); // 🚀 Global store cleanup
        if (apiRef.current) {
          apiRef.current.dispose();
          apiRef.current = null;
        }
        toast.error(t("classes.live.toasts.sessionEnded"));
      }
    };

    const handleBreakoutStarted = (data: BreakoutStartedData) => {
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
    };

    const handleBreakoutEnded = (data: BreakoutEndedData) => {
      if (Number(data.classId) === numericClassId) {
        setIsBreakoutActive(false);
        setCurrentGroupId(null);
        toast.info(t("classes.live.toasts.breakoutEnded"));
        // Re-join main hall
        startMeeting();
      }
    };

    socket.on("live_session_started", handleSessionStarted);
    socket.on("live_session_ended", handleSessionEnded);
    socket.on("breakout_session_started", handleBreakoutStarted);
    socket.on("breakout_session_ended", handleBreakoutEnded);

    return () => {
      // 🛡️ HARD CLEANUP: Dispose Jitsi instance on unmount
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
      socket.off("live_session_started", handleSessionStarted);
      socket.off("live_session_ended", handleSessionEnded);
      socket.off("breakout_session_started", handleBreakoutStarted);
      socket.off("breakout_session_ended", handleBreakoutEnded);
    };
  }, [numericClassId, isTeacher, myGroup, t, startMeeting, joinBreakoutRoom, setIsJoined]);

  const [generateRoadmap, setGenerateRoadmap] = useState(true);

  const handleStartLiveSession = useCallback(() => {
    setIsLoading(true);
    startLiveSession(
      {
        url: "/live-session/start",
        method: "post",
        values: { classId: numericClassId, generateRoadmap },
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
  }, [numericClassId, generateRoadmap, startLiveSession, startMeeting, t]);

  const handleToggleBreakout = useCallback(() => {
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
  }, [isBreakoutActive, manageBreakout, numericClassId, t]);

  const handleEndSession = useCallback(() => {
    if (!window.confirm("Are you sure you want to end the class for everyone? This will stop the video and clear the live status.")) return;
    
    setIsLoading(true);
    endLiveSession(
      {
        url: "/live-session/end",
        method: "post",
        values: { classId: numericClassId },
      },
      {
        onSuccess: () => {
          setIsJoined(false);
          if (apiRef.current) {
            apiRef.current.dispose();
            apiRef.current = null;
          }
          toast.success("Class session ended successfully.");
          setIsLoading(false);
        },
        onError: () => {
          setIsLoading(false);
          toast.error("Failed to end the session. Please try again.");
        }
      }
    );
  }, [endLiveSession, numericClassId, setIsJoined]);

  const handleDelegateToAI = useCallback(async () => {
    if (!apiRef.current) return;
    setIsLoading(true);

    try {
        // 1. Capture Teacher Frame from Jitsi
        const snapshot = await apiRef.current.captureLargeVideoScreenshot();
        
        // 2. Trigger Backend Delegation
        await startLiveSession({
            url: `/${numericClassId}/delegate`,
            method: "patch",
            values: { 
                photo: snapshot.dataURL,
                language: i18n.language === "ar" ? "Arabic" : "English",
                lastPoint: "The current topic in the roadmap"
            }
        });
        toast.success(t("classes.live.delegateAi", "Delegate to AI"));
    } catch (err) {
        console.error("Delegation failed:", err);
        toast.error("Failed to hand off to AI.");
    } finally {
        setIsLoading(false);
    }
  }, [i18n.language, numericClassId, startLiveSession, t]);

  const handleResumeSession = useCallback(async () => {
      setIsLoading(true);
      try {
          await startLiveSession({
              url: `/${numericClassId}/resume`,
              method: "patch",
              values: {}
          });
          toast.success("You have resumed control.");
      } catch (err) {
          toast.error("Failed to resume session.");
      } finally {
          setIsLoading(false);
      }
  }, [numericClassId, startLiveSession]);

  const isClassLive = classData?.isLive;
  const isDelegated = classData?.isAiDelegated;

  // 🚀 MINI-PLAYER LOGIC: Hide completely if in mini-mode but not joined
  if (isMiniMode && !isJoined) return null;

  return (
    <div 
        className={cn(
            "transition-all duration-500 ease-in-out",
            isMiniMode ? "fixed bottom-6 end-6 w-72 md:w-96 z-[9999] group shadow-2xl scale-100" : "w-full space-y-6"
        )} 
        dir={isAr ? "rtl" : "ltr"}
    >
      {!isMiniMode && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 text-start">
                <Video className="h-5 w-5 text-live-primary" />
                {t("classes.live.title")}{" "}
                {currentGroupId
                  ? t("classes.live.breakoutRoom")
                  : t("classes.live.mainHall")}
              </h3>
              <p className="text-sm text-muted-foreground text-start">
                {isBreakoutActive
                  ? t("classes.live.breakoutActive")
                  : t("classes.live.mainActive")}
              </p>
            </div>

            {isTeacher && isJoined && (
              <div className="flex gap-2">
                {!isDelegated ? (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDelegateToAI}
                        disabled={isLoading || !classData?.liveLessonRoadmap?.sessionTitle}
                        className="bg-ai-primary/10 text-ai-primary border-ai-primary/20 hover:bg-ai-primary hover:text-white rounded-2xl"
                    >
                        <Bot className="h-4 w-4 me-2" />
                        {t("classes.live.delegateAi", "Delegate to AI")}
                    </Button>
                ) : (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleResumeSession}
                        disabled={isLoading}
                        className="rounded-2xl"
                    >
                        <RotateCcw className="h-4 w-4 me-2" />
                        {t("classes.live.resumeLesson", "Resume Lesson")}
                    </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleEndSession}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Video className="h-4 w-4 me-2" />}
                  {t("classes.live.endLiveSession", "Finish Session")}
                </Button>
                <Button
                  variant={isBreakoutActive ? "destructive" : "secondary"}
                  size="sm"
                  onClick={handleToggleBreakout}
                >
                  <Grid className={cn("h-4 w-4", "me-2")} />
                  {isBreakoutActive
                    ? t("classes.live.endBreakouts")
                    : t("classes.live.startBreakouts")}
                </Button>
              </div>
            )}
          </div>
      )}

      {/* Mini-Player Overlay (Only shows on hover in mini-mode) */}
      {isMiniMode && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center rounded-2xl backdrop-blur-sm">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white text-black font-black uppercase tracking-widest text-[10px] gap-2 rounded-full border-none shadow-xl"
                onClick={() => {
                    const params = new URLSearchParams(window.location.search);
                    params.set("subtab", "live");
                    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
                    // Force a re-render by notifying parent or using search params
                    window.dispatchEvent(new PopStateEvent('popstate'));
                }}
              >
                  <ExternalLink className="h-3 w-3" />
                  {t("classes.live.indicator.backToSession", "Back to Session")}
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="bg-live-primary text-white rounded-full border-none shadow-xl h-8 w-8"
                onClick={() => {
                    if (apiRef.current) apiRef.current.executeCommand('togglePip');
                }}
                title="Pop Out to System"
              >
                  <MonitorUp className="h-4 w-4" />
              </Button>
          </div>
      )}

      {!isMiniMode && isTeacher && isBreakoutActive && isJoined && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
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
        <Card className="border-dashed py-12 text-center bg-muted/10 rounded-2xl md:rounded-4xl">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="p-4 bg-live-secondary rounded-full">
              <Users className="h-8 w-8 text-live-primary" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-center">
                {t("classes.live.readyToJoin")}
              </h4>
              <p className="text-muted-foreground max-w-md mx-auto text-center">
                {isBreakoutActive && !isTeacher
                  ? t("classes.live.breakoutDescription")
                  : isClassLive
                    ? t("classes.live.mainDescription")
                    : t("classes.live.sessionNotStarted")}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {isTeacher && !isClassLive ? (
                <div className="space-y-6">
                    <div className="flex items-center space-x-3 bg-ai-primary/5 p-4 rounded-2xl border border-ai-primary/10 max-w-sm mx-auto">
                        <Checkbox 
                            id="roadmap-toggle" 
                            checked={generateRoadmap} 
                            onCheckedChange={(checked) => setGenerateRoadmap(!!checked)}
                            className="border-ai-primary data-[state=checked]:bg-ai-primary"
                        />
                        <div className="grid gap-1.5 leading-none text-start">
                            <Label htmlFor="roadmap-toggle" className="text-sm font-black flex items-center gap-2">
                                <Sparkles className="h-3 w-3 text-ai-primary" />
                                {t("classes.live.roadmap.generate", "Generate AI Roadmap")}
                            </Label>
                            <p className="text-[10px] text-muted-foreground font-medium">
                                Create a time-boxed outline and key concepts automatically.
                            </p>
                        </div>
                    </div>
                    
                    <Button
                      size="lg"
                      onClick={handleStartLiveSession}
                      disabled={isLoading}
                      className="bg-live-primary hover:bg-live-primary/90 text-white shadow-lg shadow-live-primary/20 rounded-2xl w-full"
                    >
                      {isLoading ? (
                        <Loader2
                          className={cn(
                            "h-4 w-4 animate-spin",
                            "me-2",
                          )}
                        />
                      ) : (
                        <Video className={cn("h-4 w-4", "me-2")} />
                      )}
                      {t("classes.live.startLiveSession")}
                    </Button>
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={() =>
                    isBreakoutActive && myGroup
                      ? joinBreakoutRoom(myGroup.id)
                      : startMeeting()
                  }
                  disabled={isLoading || !isClassLive}
                  className="bg-live-primary hover:bg-live-primary/90 text-white shadow-lg shadow-live-primary/20 rounded-2xl"
                >
                  {isLoading ? (
                    <Loader2
                      className={cn(
                        "h-4 w-4 animate-spin",
                        "me-2",
                      )}
                    />
                  ) : (
                    <Video className={cn("h-4 w-4", "me-2")} />
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
        <div className={cn("space-y-4", isMiniMode && "space-y-0")}>
          {!isMiniMode && (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 max-w-150 rounded-full bg-muted/20 p-1">
                  <TabsTrigger value="video" className="flex items-center gap-2 rounded-full font-bold">
                    <Video className="h-4 w-4" />
                    {t("classes.live.videoSession")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="whiteboard"
                    className="flex items-center gap-2 rounded-full font-bold"
                  >
                    <Presentation className="h-4 w-4" />
                    {t("classes.live.whiteboard")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="roadmap"
                    className="flex items-center gap-2 rounded-full font-bold"
                  >
                    <ListChecks className="h-4 w-4" />
                    {t("classes.live.roadmap", "AI Roadmap")}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
          )}

          <div className={cn("mt-4 relative", isMiniMode && "mt-0")}>
              {/* VIDEO LAYER */}
              <div className={cn(
                  "rounded-2xl md:rounded-4xl overflow-hidden border shadow-2xl bg-black transition-all duration-500 relative",
                  activeTab !== "video" && !isMiniMode && "hidden",
                  isMiniMode ? "h-48 md:h-60" : "h-150"
              )}>
                {/* 🚀 AI CO-TEACHER COMPANION (Overlays Jitsi during delegation) */}
                {isDelegated && (
                    <div className="absolute inset-0 z-50">
                        <AILiveCompanion 
                            classId={classIdString}
                            photo={classData?.aiDelegationPhoto}
                            script={classData?.aiDelegationContext?.script}
                            visualCue={classData?.aiDelegationContext?.visualCue || "talking"}
                            language={i18n.language === "ar" ? "Arabic" : "English"}
                            onFinished={() => {
                                if (isTeacher) {
                                    // Optionally auto-resume or wait for teacher
                                    toast.info("AI Co-teacher has finished the segment.");
                                }
                            }}
                        />
                    </div>
                )}
                
                <div ref={jitsiContainerRef} className="w-full h-full" />
              </div>

              {/* WHITEBOARD LAYER (Only in full mode) */}
              {!isMiniMode && (
                  <div className={cn(
                      "h-162.5",
                      activeTab !== "whiteboard" && "hidden"
                  )}>
                    <Whiteboard
                      classId={classIdString}
                      roomId={
                        currentGroupId ? `group-${currentGroupId}` : classIdString
                      }
                    />
                  </div>
              )}

              {/* ROADMAP LAYER */}
              {!isMiniMode && activeTab === "roadmap" && (
                  <div className="bg-card/50 backdrop-blur-xl border-border/40 border rounded-4xl p-8 md:p-10 space-y-8 h-150 overflow-y-auto custom-scrollbar text-start">
                      {classData?.liveLessonRoadmap?.sessionTitle ? (
                          <div className="space-y-10">
                              <div className="space-y-2">
                                  <Badge className="bg-ai-primary/10 text-ai-primary border-ai-primary/20 font-black uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full mb-2">
                                      {t("classes.live.roadmap.sessionTitle", "Session Title")}
                                  </Badge>
                                  <h2 className="text-3xl md:text-4xl font-black tracking-tight">{classData.liveLessonRoadmap.sessionTitle}</h2>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                  <div className="space-y-6">
                                      <div className="flex items-center gap-3">
                                          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600">
                                              <Sparkles className="h-5 w-5" />
                                          </div>
                                          <h3 className="text-xl font-black tracking-tight">{t("classes.live.roadmap.icebreaker", "Icebreaker")}</h3>
                                      </div>
                                      <p className="p-6 rounded-2xl bg-orange-500/5 border border-orange-500/10 text-orange-700/80 font-medium italic italic-leading-relaxed">
                                          "{classData.liveLessonRoadmap.icebreaker}"
                                      </p>
                                  </div>

                                  <div className="space-y-6">
                                      <div className="flex items-center gap-3">
                                          <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                              <Presentation className="h-5 w-5" />
                                          </div>
                                          <h3 className="text-xl font-black tracking-tight">{t("classes.live.roadmap.keyConcepts", "Key Concepts")}</h3>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                          {classData.liveLessonRoadmap.keyConcepts?.map((concept: string, idx: number) => (
                                              <Badge key={idx} variant="outline" className="rounded-full px-4 py-2 border-primary/20 bg-primary/5 font-bold text-xs">
                                                  {concept}
                                              </Badge>
                                          ))}
                                      </div>
                                  </div>
                              </div>

                              <div className="space-y-6">
                                  <div className="flex items-center gap-3">
                                      <div className="p-2 rounded-xl bg-ai-primary/10 text-ai-primary">
                                          <ListChecks className="h-5 w-5" />
                                      </div>
                                      <h3 className="text-xl font-black tracking-tight">{t("classes.live.roadmap.outline", "Lesson Outline")}</h3>
                                  </div>
                                  <div className="space-y-4">
                                      {classData.liveLessonRoadmap.outline?.map((item: any, idx: number) => (
                                          <div key={idx} className="flex items-start gap-6 p-6 rounded-2xl bg-muted/30 border border-border/20 group hover:border-primary/30 transition-all">
                                              <div className="text-sm font-black text-primary bg-primary/10 px-3 py-1 rounded-lg shrink-0">
                                                  {item.time}
                                              </div>
                                              <div className="space-y-1">
                                                  <h4 className="font-black text-lg group-hover:text-primary transition-colors">{item.topic}</h4>
                                                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">{item.goal}</p>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>

                              <div className="p-8 rounded-3xl bg-destructive/5 border-2 border-dashed border-destructive/20 space-y-3">
                                  <h4 className="font-black uppercase tracking-widest text-[10px] text-destructive flex items-center gap-2">
                                      <Users className="h-3 w-3" />
                                      {t("classes.live.roadmap.watchouts", "Student Watch-outs")}
                                  </h4>
                                  <p className="text-sm font-bold text-destructive/80 leading-relaxed">
                                      {classData.liveLessonRoadmap.studentWatchouts}
                                  </p>
                              </div>
                          </div>
                      ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                              <div className="p-6 bg-muted rounded-full">
                                  <BrainCircuit className="h-12 w-12" />
                              </div>
                              <div className="space-y-1">
                                  <h3 className="font-black uppercase tracking-widest text-xs">No Roadmap Generated</h3>
                                  <p className="text-sm font-medium">Teacher can enable AI Roadmap when starting the session.</p>
                              </div>
                          </div>
                      )}
                  </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};
