import React from "react";
import { Video, Users, Bot, RotateCcw, Loader2, Grid, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface LiveSessionHeaderProps {
  currentGroupId: number | null;
  isBreakoutActive: boolean;
  isTeacher: boolean;
  isJoined: boolean;
  studentCount: number;
  isDelegated: boolean;
  isAiDegraded?: boolean;
  isLoading: boolean;
  roadmapTitle?: string;
  onDelegate: () => void;
  onResume: () => void;
  onEnd: () => void;
  onToggleBreakout: () => void;
}

export const LiveSessionHeader = React.memo(
  ({
    currentGroupId,
    isBreakoutActive,
    isTeacher,
    isJoined,
    studentCount,
    isDelegated,
    isAiDegraded,
    isLoading,
    roadmapTitle,
    onDelegate,
    onResume,
    onEnd,
    onToggleBreakout,
  }: LiveSessionHeaderProps) => {
    const { t } = useTranslation();

    return (
      <div className="flex items-center justify-between mb-6 text-start">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Video className="h-5 w-5 text-live-primary" />
              {t("classes.live.title")}{" "}
              {currentGroupId ? t("classes.live.breakoutRoom") : t("classes.live.mainHall")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isBreakoutActive ? t("classes.live.breakoutActive") : t("classes.live.mainActive")}
            </p>
          </div>
          {isTeacher && isJoined && (
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1.5 rounded-full font-black gap-2 animate-in fade-in zoom-in duration-500"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <Users className="h-3.5 w-3.5" />
              {studentCount} {t("classes.live.studentsPresent", "Live Now")}
            </Badge>
          )}
          {isAiDegraded && (
            <Badge
              variant="destructive"
              aria-live="polite"
              className="bg-destructive/20 text-destructive border-ai-primary/50 border-2 px-3 py-1.5 rounded-full font-black gap-2 animate-pulse shadow-[0_0_10px_rgba(var(--ai-primary),0.3)]"
            >
              <BrainCircuit className="h-3.5 w-3.5 text-ai-primary" />
              {t("classes.live.ai.degraded", "AI System Degraded")}
            </Badge>
          )}
        </div>

        {isTeacher && isJoined && (
          <div className="flex gap-2">
            {!isDelegated ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onDelegate}
                disabled={isLoading || !roadmapTitle}
                className="bg-ai-primary/10 text-ai-primary border-ai-primary/20 hover:bg-ai-primary hover:text-white rounded-2xl"
              >
                <Bot className="h-4 w-4 me-2" />
                {t("classes.live.delegateAi", "Delegate to AI")}
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={onResume}
                disabled={isLoading}
                className="rounded-2xl"
              >
                <RotateCcw className="h-4 w-4 me-2" />
                {t("classes.live.resumeLesson", "Resume Lesson")}
              </Button>
            )}
            <Button variant="destructive" size="sm" onClick={onEnd} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin me-2" />
              ) : (
                <Video className="h-4 w-4 me-2" />
              )}
              {t("classes.live.endLiveSession", "Finish Session")}
            </Button>
            <Button
              variant={isBreakoutActive ? "destructive" : "secondary"}
              size="sm"
              onClick={onToggleBreakout}
            >
              <Grid className={cn("h-4 w-4", "me-2")} />
              {isBreakoutActive ? t("classes.live.endBreakouts") : t("classes.live.startBreakouts")}
            </Button>
          </div>
        )}
      </div>
    );
  }
);
