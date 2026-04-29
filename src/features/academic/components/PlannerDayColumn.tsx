import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Layers, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { formatTime } from "@/lib/date-utils";
import { type TimetableSlot } from "../pages/departments/DeptSemesterPlanner";
import { useSchoolTheme } from "@/contexts/school-theme-context";

interface PlannerDayColumnProps {
  dayName: string;
  isVacation: boolean;
  slots: TimetableSlot[];
}

export const PlannerDayColumn: React.FC<PlannerDayColumnProps> = ({
  dayName,
  isVacation,
  slots,
}) => {
  const { t } = useTranslation();
  const { primaryColor } = useSchoolTheme();

  return (
    <div
      className={cn(
        "space-y-4 rounded-3xl p-1 transition-colors min-w-[200px]",
        isVacation && "bg-muted/5"
      )}
    >
      <header className="py-2 border-b border-border/40 mb-4 flex items-center justify-between px-2">
        <h4
          className={cn(
            "text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60",
            isVacation && "text-primary/40"
          )}
        >
          {t(`timetable.calendar.days.${dayName.toLowerCase()}`, { defaultValue: dayName })}
        </h4>
        {isVacation && (
          <span className="text-[7px] font-black uppercase tracking-widest text-primary/30">
            {t("status.vacation", "Vacation")}
          </span>
        )}
      </header>
      <div className="space-y-3">
        {slots.length === 0 ? (
          <div
            className={cn(
              "h-20 rounded-3xl border border-dashed border-border/40 flex items-center justify-center",
              isVacation ? "opacity-5" : "opacity-10"
            )}
          >
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
              {isVacation
                ? t("status.off", "Off")
                : t("timetable.deptPlanner.noLectures", "No Lectures")}
            </span>
          </div>
        ) : (
          slots.map((slot) => (
            <Card
              key={slot.id}
              className={cn(
                "p-4 rounded-3xl transition-all group relative overflow-hidden text-start",
                slot.hasConflict
                  ? "border-destructive/40 bg-destructive/5 shadow-destructive/10"
                  : "border-border/40 bg-card/60 backdrop-blur-xl shadow-sm hover:shadow-lg"
              )}
            >
              <div className="flex flex-col items-start gap-2">
                {slot.hasConflict && (
                  <Badge
                    variant="destructive"
                    className="h-5 px-2 rounded-full text-[7px] font-black uppercase tracking-widest gap-1 animate-pulse"
                  >
                    <AlertTriangle className="w-2 h-2" />{" "}
                    {t("timetable.collision.title", "Collision")}
                  </Badge>
                )}
                <span
                  className={cn("text-[10px] font-black tracking-tight")}
                  style={{ color: slot.hasConflict ? undefined : primaryColor }}
                >
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </span>
                <div className="space-y-1 min-w-0 w-full">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Layers
                      className={cn("w-3 h-3 shrink-0")}
                      style={{ color: slot.hasConflict ? undefined : primaryColor }}
                    />
                    <h5 className="text-[10px] font-black truncate">Sec {slot.section?.name}</h5>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-60">
                    <BookOpen className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                    <span className="text-[9px] font-bold truncate">{slot.subject?.name}</span>
                  </div>
                </div>

                {slot.hasConflict && (
                  <div className="mt-2 pt-2 border-t border-destructive/10 w-full">
                    <p className="text-[8px] font-black text-destructive uppercase leading-tight italic">
                      {t("timetable.deptPlanner.conflictWith", {
                        name: slot.conflictDetails?.with,
                        defaultValue: `Conflict with ${slot.conflictDetails?.with}`,
                      })}
                      :<br />
                      {slot.conflictDetails?.reason}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
