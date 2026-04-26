import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DayName } from "../study-planner";

interface StudyBlock {
  day: DayName;
  timeSlot: "Morning" | "Afternoon" | "Evening";
  task: string;
  assignmentId?: number;
  duration: string;
}

interface StudyPlanDayCardProps {
  day: DayName;
  dayBlocks: StudyBlock[];
  completedBlocks: Record<string, boolean>;
  onToggleBlock: (blockId: string) => void;
}

const TIME_SLOTS = ["Morning", "Afternoon", "Evening"] as const;

/**
 * 🚀 PERFORMANCE: Memoized to prevent full schedule re-renders on single block toggles.
 */
export const StudyPlanDayCard = React.memo(
  ({ day, dayBlocks, completedBlocks, onToggleBlock }: StudyPlanDayCardProps) => {
    const { t } = useTranslation();

    if (dayBlocks.length === 0) return null;

    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-xl rounded-4xl overflow-hidden group/card transition-all hover:shadow-2xl hover:shadow-primary/5">
        <CardHeader className="bg-muted/30 border-b border-border/40 p-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover/card:scale-110 transition-transform">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-black uppercase tracking-tight">
              {t(`common.days.${day.toLowerCase()}` as `common.days.${Lowercase<DayName>}`)}
            </CardTitle>{" "}
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
                          {t(
                            `studyPlanner.slots.${slot.toLowerCase()}` as `studyPlanner.slots.${Lowercase<typeof slot>}`
                          )}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-bold rounded-lg border-border/40"
                        >
                          {block.duration}
                        </Badge>
                      </div>
                      <p
                        className={cn(
                          "text-lg font-bold leading-tight transition-all",
                          isCompleted
                            ? "text-muted-foreground/40 line-through decoration-2"
                            : "text-foreground"
                        )}
                      >
                        {block.task}
                      </p>
                    </div>
                  </div>

                  {block.assignmentId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-12 w-12 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all"
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
  }
);
