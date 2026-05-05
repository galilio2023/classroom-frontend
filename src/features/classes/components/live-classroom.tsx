import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomMutation, useGetIdentity } from "@refinedev/core";
import { UserRole, Class, User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Users,
  Video,
  ExternalLink,
  MonitorUp,
  Sparkles,
  WifiOff,
  Captions,
  MessageSquare,
  X,
  Play,
  Maximize2,
} from "lucide-react";
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
import { useHardwareSafety } from "@/hooks/use-hardware-safety";
import { useLowBandwidth } from "@/hooks/use-low-bandwidth";
import { useLiveCaptions } from "../hooks/use-live-captions";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

// Hooks
import { useLiveSession } from "@/features/classes/hooks/useLiveSession";
import { useJitsi } from "@/features/classes/hooks/useJitsi";
import {
  useLiveClassroomSocket,
  LiveInitPayload,
  BreakoutStartedPayload,
  SessionStartedPayload,
  TeacherResumedPayload,
} from "@/features/classes/hooks/useLiveClassroomSocket";

// Sub-components
import { LiveSessionHeader } from "@/features/classes/components/live/LiveSessionHeader";
import { RoadmapDisplay } from "@/features/classes/components/live/RoadmapDisplay";

interface LiveClassroomProps {
  classId: string;
  className?: string;
  isMiniMode?: boolean;
  onJoin?: () => void;
}

export const LiveClassroom = ({ classId, isMiniMode = false, onJoin }: LiveClassroomProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === "ar";
  const queryClient = useQueryClient();

  const numericClassId = useMemo(() => {
    const n = Number(classId);
    return isNaN(n) ? 0 : n;
  }, [classId]);

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
  } = useLiveSession(classId);

  const [isAiDegraded, setIsAiDegraded] = useState(false);
  const [isJitsiInitialized, setIsJitsiInitialized] = useState(false);
  const apiRef = useRef<any>(null);

  useHardwareSafety({
    onHidden: () => {
      if (isJoined && apiRef.current?.executeCommand) {
        apiRef.current.executeCommand("setAudioMute", true);
      }
    },
  });

  const isLowBandwidth = useLowBandwidth();
  const [showCaptions, setShowCaptions] = useState(true);
  const { caption, isStreaming: isCaptioning } = useLiveCaptions(
    String(classData?.id || classId || ""),
    !!(classData?.isLive && showCaptions)
  );

  const { jitsiContainerRef } = useJitsi(
    classId,
    identity,
    isTeacher,
    () => {
      setIsJitsiInitialized(true);
    }, // onJoinSuccess
    () => {
      setIsJoined(false);
    }, // onJoinFailed
    () => {
      setIsJoined(false);
    } // onLeave
  );

  if (isMiniMode && !isJoined) return null;

  return (
    <div
      className={cn(
        "transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
        isMiniMode
          ? "fixed bottom-6 end-6 w-72 md:w-96 z-[9999] group shadow-2xl scale-100 opacity-100"
          : "w-full space-y-6"
      )}
      dir={isAr ? "rtl" : "ltr"}
    >
      {!isMiniMode && (
        <LiveSessionHeader
          currentGroupId={currentGroupId}
          isBreakoutActive={isBreakoutActive}
          isTeacher={isTeacher}
          isJoined={isJoined}
          studentCount={studentCount}
          isDelegated={!!classData?.isAiDelegated}
          isAiDegraded={isAiDegraded}
          isLoading={isLoading}
          onEnd={handleEndSession}
          onToggleBreakout={handleToggleBreakout}
          onDelegate={() => {}} // Placeholder or real handler if available
          onResume={() => {}} // Placeholder or real handler if available
        />
      )}

      {isJoined ? (
        <div
          className={cn(
            "relative overflow-hidden rounded-[2.5rem] bg-black shadow-2xl",
            isMiniMode ? "aspect-video" : "h-[600px]"
          )}
        >
          <div ref={jitsiContainerRef} className="w-full h-full" />

          <div className="absolute top-4 start-4 flex flex-col gap-2 z-[100]">
            <Badge className="bg-destructive text-white border-none px-3 py-1 font-black animate-pulse uppercase tracking-widest text-[9px] shadow-lg">
              {t("classes.live.liveLabel", { defaultValue: "LIVE" })}
            </Badge>
            {isCaptioning && (
              <Badge className="bg-blue-600 text-white border-none px-3 py-1 font-black uppercase tracking-widest text-[9px] shadow-lg flex gap-1.5 items-center">
                <Captions className="h-3 w-3" />
                CC: AR
              </Badge>
            )}
          </div>

          <AnimatePresence>
            {caption && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-24 inset-x-0 flex justify-center px-6 z-[110] pointer-events-none"
              >
                <div className="bg-black/80 backdrop-blur-xl border border-white/20 px-8 py-4 rounded-2xl md:rounded-3xl shadow-2xl max-w-2xl text-center">
                  <p className="text-white text-lg md:text-2xl font-bold tracking-tight leading-relaxed italic">
                    {caption}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="border-none shadow-2xl overflow-hidden rounded-[3rem] bg-background/50 backdrop-blur-xl">
          <CardContent className="p-12 flex flex-col items-center text-center space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
              <div className="relative p-6 bg-primary/10 rounded-full">
                <Video className="h-12 w-12 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl font-black tracking-tight">
                {classData?.isLive
                  ? t("classes.live.sessionStarted", { defaultValue: "Session Started" })
                  : t("classes.live.sessionNotStarted", { defaultValue: "Session Not Started" })}
              </h3>
              <p className="text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
                {classData?.isLive
                  ? t("classes.live.readyToJoin", { defaultValue: "Ready to Join" })
                  : t("classes.live.waitNotice", { defaultValue: "Please wait for the teacher." })}
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
              {isLowBandwidth && (
                <div className="flex items-center gap-3 p-3 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20 text-xs font-bold">
                  <WifiOff className="h-4 w-4 shrink-0" />
                  {t(
                    "classes.live.lowBandwidthNotice",
                    "Notice: Low-bandwidth mode is active. Live video may be unstable."
                  )}
                </div>
              )}

              {classData?.isLive && (
                <Button
                  size="lg"
                  className="h-16 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 group"
                  onClick={() => {
                    setIsJoined(true);
                    onJoin?.();
                  }}
                >
                  {t("classes.live.joinNow", { defaultValue: "Join Now" })}
                  <Sparkles className="ms-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
