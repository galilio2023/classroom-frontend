import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomMutation } from "@refinedev/core";
import { UserRole, Class } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Video, ExternalLink, MonitorUp, Sparkles } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Whiteboard } from "./whiteboard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { AILiveCompanion } from "@/features/ai/components/AiLiveCompanion";
import { useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/providers/utils/api-errors";

// Hooks
import { useLiveSession } from "@/features/classes/hooks/useLiveSession";
import { useJitsi } from "@/features/classes/hooks/useJitsi";
import { useLiveClassroomSocket, LiveInitPayload } from "@/features/classes/hooks/useLiveClassroomSocket";

// Sub-components
import { LiveSessionHeader } from "@/features/classes/components/live/LiveSessionHeader";
import { RoadmapDisplay } from "@/features/classes/components/live/RoadmapDisplay";

interface LiveClassroomProps {
  classId: string; // 🚀 Normalized to string for Layout consistency
  className?: string;
  isMiniMode?: boolean;
  onJoin?: () => void;
}

export const LiveClassroom = ({
  classId: classIdString,
  isMiniMode = false,
  onJoin,
}: LiveClassroomProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === "ar";
  const queryClient = useQueryClient();

  const {
    identity,
    isTeacher,
    classData,
    isLoading,
    setIsLoading,
    studentCount,
    setStudentCount,
    isBreakoutActive,
    setIsBreakoutActive,
    currentGroupId,
    setCurrentGroupId,
    myGroup,
    groups,
    generateRoadmap,
    setGenerateRoadmap,
    handleStartLiveSession,
    handleToggleBreakout,
    handleEndSession,
    markLiveAttendance,
    refetchClass,
    isJoined,
    setIsJoined,
    setActiveClassId,
  } = useLiveSession(classIdString);

  const [isAiDegraded, setIsAiDegraded] = useState(false);

  // 🛡️ RULE 6: Tab Visibility Safety (Privacy Mandate)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && isJoined) {
        // 1. Stop Speech Synthesis
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        
        // 🚀 2. Hardware Muting (Rule 6 Implementation)
        // Note: Microphone muting for AI Interaction is handled inside AILiveCompanion 
        // via its internal useHardwareSafety hook which also listens to visibilitychange.
        
        toast.info(t("classes.live.privacy.paused", "Privacy Safety: Interaction paused while tab is hidden."));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isJoined, t]);

  const { mutate: getRoomToken } = useCustomMutation();
  const { mutate: saveRecording } = useCustomMutation();
  const { mutate: startLiveSession } = useCustomMutation(); // for AI delegation

  const roomTokenFetcher = useCallback(
    async (groupId?: number) => {
      return new Promise<{ roomName: string; token?: string }>((resolve, reject) => {
        getRoomToken(
          {
            url: "/live-session/token",
            method: "post",
            values: { classId: Number(classIdString), groupId },
          },
          {
            onSuccess: (data: any) => resolve(data.data),
            onError: (err) => reject(err),
          }
        );
      });
    },
    [getRoomToken, classIdString]
  );

  const { jitsiContainerRef, apiRef, isJitsiLoading, startMeeting, disposeJitsi } = useJitsi(
    classIdString,
    identity,
    isTeacher,
    (groupId) => {
      setIsLoading(false);
      setIsJoined(true);
      setActiveClassId(classIdString);
      onJoin?.();
      if (identity?.role === UserRole.STUDENT && !groupId) {
        markLiveAttendance({
          url: "/attendance/live",
          method: "post",
          values: { classId: Number(classIdString) },
        });
      }
    },
    () => {
      setIsLoading(false);
      setIsJoined(false);
    },
    () => {
      setIsJoined(false);
    },
    (link) => {
      saveRecording(
        {
          url: "/resources",
          method: "post",
          values: {
            classId: Number(classIdString),
            title: `Live Session Recording - ${new Date().toLocaleDateString()}`,
            url: link,
            type: "video",
            description: "Recording of the live session held on " + new Date().toLocaleString(),
          },
        },
        { onSuccess: () => toast.success(t("classes.live.toasts.recordingSaved")) }
      );
    }
  );

  const handleCompanionFinished = useCallback(() => {
    if (isTeacher) {
      toast.info(t("classes.live.ai.segmentFinished", "AI Co-teacher has finished the segment."));
    }
  }, [isTeacher, t]);

  useLiveClassroomSocket(Number(classIdString), {
    onSessionStarted: (data) => {
      if (!isTeacher) {
        toast.info(t("classes.live.toasts.sessionStarted", { name: data.startedBy }), {
          action: {
            label: t("notifications.joinNow"),
            onClick: () => startMeeting(roomTokenFetcher),
          },
        });
      }
    },
    onSessionEnded: () => {
      setIsJoined(false);
      disposeJitsi();
      toast.error(t("classes.live.toasts.sessionEnded"));
    },
    onBreakoutStarted: () => {
      setIsBreakoutActive(true);
      toast.info(t("classes.live.toasts.breakoutStarted"));
      if (!isTeacher && myGroup) {
        toast.success(t("classes.live.toasts.joiningGroup", { name: myGroup.name }));
        setCurrentGroupId(myGroup.id);
        startMeeting(roomTokenFetcher, myGroup.id);
      }
    },
    onBreakoutEnded: () => {
      setIsBreakoutActive(false);
      setCurrentGroupId(null);
      toast.info(t("classes.live.toasts.breakoutEnded"));
      startMeeting(roomTokenFetcher);
    },
    onTeacherDelegated: () => refetchClass(),
    onTeacherResumed: (data) => {
      refetchClass();
      if (data.reason === "ai_degraded") {
        setIsAiDegraded(true);
        // 🛡️ RULE 8: Traceability (Enhanced error feedback)
        // UUID is now automatically generated by the handleError utility
        void handleError({
          status: 503,
          message: t("classes.live.ai.fallback", "AI Co-teacher is having trouble. Teacher has resumed control."),
        }).then((err) => {
          toast.warning(err.message, {
            description: `${t("classes.live.ai.supportInfo", "Support Info: AI degraded via socket signal.")} (Trace: ${err.meta?.correlationId})`,
            duration: 8000,
          });
        });
      } else {
        setIsAiDegraded(false);
      }
    },
    onPulseUpdate: (data) => setStudentCount(data.count),
    onLiveInit: (data: LiveInitPayload) => {
      // 🛡️ RECONNECTION OPTIMIZATION: Update local cache directly with safe validation
      queryClient.setQueryData(["classes", classIdString], (old: Class | undefined) => {
        if (!old) return old;
        
        // 🚀 SAFE MERGE: Preserve existing complex objects (subject, teachers) while updating live state
        return {
          ...old,
          isAiDelegated: data.isAiDelegated,
          isBreakoutActive: data.isBreakoutActive,
          aiDelegationPhoto: data.aiPhoto !== undefined ? data.aiPhoto : old.aiDelegationPhoto,
          aiDelegationContext: {
            ...old.aiDelegationContext,
            script: data.currentScript !== undefined ? data.currentScript : old.aiDelegationContext?.script,
            visualCue: data.visualCue !== undefined ? data.visualCue : old.aiDelegationContext?.visualCue,
          }
        };
      });
      setIsBreakoutActive(!!data.isBreakoutActive);
    },
  });

  useEffect(() => {
    if (isJoined && !apiRef.current && !isLoading && !isJitsiLoading) {
      startMeeting(roomTokenFetcher);
    }
  }, [isJoined, isLoading, isJitsiLoading, startMeeting, roomTokenFetcher, apiRef]);

  const [activeTab, setActiveTab] = useState("video");

  const handleDelegateToAI = useCallback(async () => {
    if (!apiRef.current) return;
    setIsLoading(true);
    try {
      const snapshot = await apiRef.current.captureLargeVideoScreenshot();
      startLiveSession(
        {
          url: `/live-session/${classIdString}/delegate`,
          method: "patch",
          values: {
            photo: typeof snapshot === "string" ? snapshot : snapshot.dataURL,
            language: i18n.language === "ar" ? "Arabic" : "English",
            lastPoint: "The current topic in the roadmap",
          },
        },
        {
          onSuccess: () => {
            toast.success(t("classes.live.delegateAi", "Delegate to AI"));
            refetchClass();
          },
        }
      );
    } catch (err) {
      toast.error("Failed to hand off to AI.");
    } finally {
      setIsLoading(false);
    }
  }, [apiRef, classIdString, i18n.language, refetchClass, startLiveSession, t, setIsLoading]);

  const handleResumeSession = useCallback(async () => {
    setIsLoading(true);
    try {
      startLiveSession(
        {
          url: `/live-session/${classIdString}/resume`,
          method: "patch",
          values: {},
        },
        {
          onSuccess: () => {
            toast.success("You have resumed control.");
            refetchClass();
          },
        }
      );
    } catch (err) {
      toast.error("Failed to resume session.");
    } finally {
      setIsLoading(false);
    }
  }, [classIdString, startLiveSession, refetchClass, setIsLoading]);

  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (isMiniMode) {
      setContainerRect(null);
      return;
    }
    const updateRect = () => {
      const container = document.getElementById("live-session-container");
      setContainerRect(container?.getBoundingClientRect() || null);
    };
    updateRect();
    const interval = setInterval(updateRect, 1000);
    window.addEventListener("resize", updateRect);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", updateRect);
    };
  }, [isMiniMode]);

  if (isMiniMode && !isJoined) return null;

  const inlineStyle: React.CSSProperties = containerRect
    ? {
        position: "fixed",
        top: containerRect.top,
        left: containerRect.left,
        width: containerRect.width,
        height: containerRect.height,
        zIndex: 50,
        margin: 0,
        pointerEvents: "auto",
      }
    : !isMiniMode
      ? {
          position: "relative",
          width: "100%",
          minHeight: "600px",
          zIndex: 10,
        }
      : {};

  const isDelegated = classData?.isAiDelegated;

  return (
    <div
      className={cn(
        "transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
        isMiniMode
          ? "fixed bottom-6 end-6 w-72 md:w-96 z-[9999] group shadow-2xl scale-100 opacity-100"
          : "w-full space-y-6"
      )}
      style={inlineStyle}
      dir={isAr ? "rtl" : "ltr"}
    >
      {!isMiniMode && (
        <LiveSessionHeader
          currentGroupId={currentGroupId}
          isBreakoutActive={isBreakoutActive}
          isTeacher={isTeacher}
          isJoined={isJoined}
          studentCount={studentCount}
          isDelegated={!!isDelegated}
          isAiDegraded={isAiDegraded}
          isLoading={isLoading || isJitsiLoading}
          roadmapTitle={classData?.liveLessonRoadmap?.sessionTitle}
          onDelegate={handleDelegateToAI}
          onResume={handleResumeSession}
          onEnd={handleEndSession}
          onToggleBreakout={handleToggleBreakout}
        />
      )}

      {isMiniMode && (
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center rounded-2xl backdrop-blur-sm">
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-black font-black uppercase tracking-widest text-[10px] gap-2 rounded-full border-none shadow-xl"
            onClick={() => navigate(`/classes/show/${classIdString}?subtab=live`)}
          >
            <ExternalLink className="h-3 w-3" />
            {t("classes.live.indicator.backToSession", "Back to Session")}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-live-primary text-white rounded-full border-none shadow-xl h-8 w-8"
            onClick={() => apiRef.current?.executeCommand("togglePip")}
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
            onClick={() => {
              setCurrentGroupId(null);
              startMeeting(roomTokenFetcher);
            }}
          >
            {t("classes.live.mainHall")}
          </Button>
          {groups.map((group: any) => (
            <Button
              key={group.id}
              variant={currentGroupId === group.id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setCurrentGroupId(group.id);
                startMeeting(roomTokenFetcher, group.id);
              }}
            >
              {group.name}
            </Button>
          ))}
        </div>
      )}

      {!isJoined ? (
        <Card className="border-dashed py-12 text-center bg-muted/10 rounded-2xl md:rounded-4xl">
          <CardContent className="flex flex-col items-center gap-4 text-start">
            <div className="p-4 bg-live-secondary rounded-full mx-auto">
              <Users className="h-8 w-8 text-live-primary" />
            </div>
            <div className="space-y-2 text-center">
              <h4 className="text-xl font-bold">{t("classes.live.readyToJoin")}</h4>
              <p className="text-muted-foreground max-w-md mx-auto">
                {isBreakoutActive && !isTeacher
                  ? t("classes.live.breakoutDescription")
                  : classData?.isLive
                    ? t("classes.live.mainDescription")
                    : t("classes.live.sessionNotStarted")}
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
              {isTeacher && !classData?.isLive ? (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 bg-ai-primary/5 p-4 rounded-2xl border border-ai-primary/10">
                    <Checkbox
                      id="roadmap-toggle"
                      checked={generateRoadmap}
                      onCheckedChange={(checked) => setGenerateRoadmap(!!checked)}
                      className="border-ai-primary data-[state=checked]:bg-ai-primary"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="roadmap-toggle"
                        className="text-sm font-black flex items-center gap-2"
                      >
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
                      <Loader2 className="h-4 w-4 animate-spin me-2" />
                    ) : (
                      <Video className="h-4 w-4 me-2" />
                    )}
                    {t("classes.live.startLiveSession")}
                  </Button>
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={() =>
                    isBreakoutActive && myGroup
                      ? (setCurrentGroupId(myGroup.id), startMeeting(roomTokenFetcher, myGroup.id))
                      : startMeeting(roomTokenFetcher)
                  }
                  disabled={isLoading || !classData?.isLive}
                  className="bg-live-primary hover:bg-live-primary/90 text-white shadow-lg shadow-live-primary/20 rounded-2xl w-full"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin me-2" />
                  ) : (
                    <Video className="h-4 w-4 me-2" />
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 max-w-150 rounded-full bg-muted/20 p-1">
                <TabsTrigger
                  value="video"
                  className="flex items-center gap-2 rounded-full font-bold"
                >
                  <Video className="h-4 w-4" />
                  {t("classes.live.videoSession")}
                </TabsTrigger>
                <TabsTrigger
                  value="whiteboard"
                  className="flex items-center gap-2 rounded-full font-bold"
                >
                  <Sparkles className="h-4 w-4" />
                  {t("classes.live.whiteboard.title")}
                </TabsTrigger>
                <TabsTrigger
                  value="roadmap"
                  className="flex items-center gap-2 rounded-full font-bold"
                >
                  <Sparkles className="h-4 w-4" />
                  {t("classes.live.roadmap", "AI Roadmap")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <div className={cn("mt-4 relative", isMiniMode && "mt-0")}>
            <div
              className={cn(
                "rounded-2xl md:rounded-4xl overflow-hidden border shadow-2xl bg-black transition-all duration-500 relative",
                activeTab !== "video" && !isMiniMode && "hidden",
                isMiniMode ? "h-48 md:h-60" : "h-150"
              )}
            >
              {isDelegated && (
                <div className="absolute inset-0 z-50">
                  <AILiveCompanion
                    classId={classIdString}
                    photo={classData?.aiDelegationPhoto ?? null}
                    script={classData?.aiDelegationContext?.script ?? null}
                    visualCue={classData?.aiDelegationContext?.visualCue || "idle"}
                    language={classData?.subject?.language || "English"}
                    onFinished={handleCompanionFinished}
                  />
                </div>
              )}
              <div ref={jitsiContainerRef} className="w-full h-full" />
            </div>

            {!isMiniMode && activeTab === "whiteboard" && (
              <div className="h-162.5">
                <Whiteboard
                  classId={classIdString}
                  roomId={currentGroupId ? `group-${currentGroupId}` : classIdString}
                />
              </div>
            )}

            {!isMiniMode && activeTab === "roadmap" && (
              <RoadmapDisplay roadmap={classData?.liveLessonRoadmap} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
