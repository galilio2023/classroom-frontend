import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface StudyBlock {
  day: string;
  timeSlot: "Morning" | "Afternoon" | "Evening";
  task: string;
  assignmentId?: number;
  duration: string;
}

interface StudyPlanDayCardProps {
  day: string;
  dayBlocks: StudyBlock[];
  completedBlocks: Record<string, boolean>;
  onToggleBlock: (blockId: string) => void;
  isAr: boolean;
}

const TIME_SLOTS = ["Morning", "Afternoon", "Evening"] as const;

export const StudyPlanDayCard = ({
  day,
  dayBlocks,
  completedBlocks,
  onToggleBlock,
  isAr,
}: StudyPlanDayCardProps) => {
  const { t } = useTranslation();

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-xl rounded-3xl overflow-hidden text-start">
      <CardHeader className="border-b border-border/40 py-6 px-8 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl font-black uppercase tracking-tight">
            {t(`common.days.${day.toLowerCase()}` as any)}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/40">
          {TIME_SLOTS.map((slot) => {
            const block = dayBlocks.find((b) => b.timeSlot === slot);
            if (!block) return null;
            const blockId = `${day}-${slot}`;
            const isCompleted = completedBlocks[blockId];

            return (
              <div
                key={slot}
                className={cn(
                  "flex items-center justify-between p-8 group transition-colors",
                  isCompleted ? "bg-emerald-500/5" : "hover:bg-muted/30"
                )}
              >
                <div className="flex items-start gap-6">
                  <button
                    onClick={() => onToggleBlock(blockId)}
                    className={cn(
                      "mt-1 h-8 w-8 rounded-xl border-2 flex items-center justify-center transition-all shrink-0",
                      isCompleted
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-border/60 hover:border-primary group-hover:scale-110"
                    )}
                  >
                    {isCompleted && <CheckCircle2 className="h-5 w-5" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        {t(`studyPlanner.slots.${slot.toLowerCase()}` as any)}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold rounded-lg border-border/40"
                      >
                        {block.duration}
                      </Badge>
                    </div>
                    <h4
                      className={cn(
                        "text-xl font-black tracking-tight leading-tight",
                        isAr ? "font-noto-arabic" : "font-sans",
                        isCompleted && "line-through text-muted-foreground/60"
                      )}
                    >
                      {block.task}
                    </h4>
                  </div>
                </div>

                {block.assignmentId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Link to={`/assignments/show/${block.assignmentId}`}>
                      <ExternalLink className="h-5 w-5" />
                    </Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
