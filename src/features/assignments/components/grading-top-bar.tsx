import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Submission } from "@/types";

interface GradingTopBarProps {
  submission: Submission;
  currentIndex: number;
  totalSubmissions: number;
  hasPrev: boolean;
  hasNext: boolean;
  isAISuggested: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

export const GradingTopBar = ({
  submission,
  currentIndex,
  totalSubmissions,
  hasPrev,
  hasNext,
  isAISuggested,
  onPrev,
  onNext,
  onClose,
}: GradingTopBarProps) => {
  const { t } = useTranslation();

  return (
    <div className="h-16 border-b bg-card/50 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border-2 border-primary/10">
            <AvatarImage src={submission.student?.image || undefined} />
            <AvatarFallback className="font-black text-xs">
              {submission.student?.name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-black tracking-tight leading-none">
              {submission.student?.name}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
              {t("assignments.grading.attempt", { count: submission.attemptNumber })}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-xl border">
        <Button
          variant="ghost"
          size="icon"
          disabled={!hasPrev}
          onClick={onPrev}
          className="h-9 w-9 rounded-lg hover:bg-background shadow-sm"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {currentIndex + 1} / {totalSubmissions}
        </div>
        <Button
          variant="ghost"
          size="icon"
          disabled={!hasNext}
          onClick={onNext}
          className="h-9 w-9 rounded-lg hover:bg-background shadow-sm"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        {isAISuggested && (
          <Badge className="bg-ai-primary/10 text-ai-primary border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg animate-pulse">
            <Sparkles className="h-3 w-3 me-1.5" />
            {t("assignments.grading.aiSuggested")}
          </Badge>
        )}
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl h-10 w-10">
          <Maximize2 className="h-4 w-4 rotate-45" />
        </Button>
      </div>
    </div>
  );
};
