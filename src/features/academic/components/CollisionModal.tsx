import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ShieldAlert, Clock, Building2, Calendar, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { DAYS } from "@/constants/calendar";
import { formatTime } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

export interface ConflictDetail {
  id?: string | number;
  tenantName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  scheduleType: string;
}

interface CollisionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflicts: ConflictDetail[];
}

export const CollisionModal: React.FC<CollisionModalProps> = ({
  open,
  onOpenChange,
  conflicts,
}) => {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-[2.5rem] border-destructive/20 bg-card/95 backdrop-blur-3xl shadow-2xl p-0 overflow-hidden max-w-xl">
        <div className="p-8 md:p-12 space-y-8">
          <AlertDialogHeader className="text-start space-y-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "p-4 rounded-2xl bg-destructive/10 text-destructive",
                  !shouldReduceMotion && "animate-pulse"
                )}
              >
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <AlertDialogTitle className="text-3xl font-black uppercase tracking-tight text-destructive">
                  {t("timetable.collision.title", "Schedule Collision")}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-base font-medium">
                  {conflicts.length === 1
                    ? t(
                        "timetable.collision.single",
                        "A double-booking has been detected for this teacher."
                      )
                    : t("timetable.collision.multiple", {
                        count: conflicts.length,
                        defaultValue: `We detected ${conflicts.length} scheduling conflicts for this teacher.`,
                      })}
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ms-2">
              {t("timetable.collision.assignments", "Conflicting Assignments")}
            </div>
            <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {conflicts.map((conflict, idx) => (
                <motion.div
                  key={
                    conflict.id ||
                    `${conflict.tenantName}-${conflict.dayOfWeek}-${conflict.startTime}-${idx}`
                  }
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-5 rounded-3xl bg-destructive/5 border border-destructive/10 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-destructive opacity-40" />
                      <span className="text-xs font-black uppercase tracking-tight">
                        {conflict.tenantName}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-5 px-2 rounded-full text-[8px] font-black uppercase border-destructive/20 text-destructive",
                        !shouldReduceMotion && "group-hover:animate-pulse"
                      )}
                    >
                      {conflict.scheduleType}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground font-medium text-[10px]">
                      <Calendar className="w-3.5 h-3.5 opacity-40" />
                      <span>
                        {t(
                          `timetable.calendar.days.${(DAYS[conflict.dayOfWeek] || "").toLowerCase()}`,
                          {
                            defaultValue: DAYS[conflict.dayOfWeek],
                          }
                        ) || t("common.unknown", "Unknown")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground font-medium text-[10px]">
                      <Clock className="w-3.5 h-3.5 opacity-40" />
                      <span>
                        {formatTime(conflict.startTime)} - {formatTime(conflict.endTime)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex gap-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] font-medium leading-relaxed">
              <strong>{t("timetable.collision.industrialRule", "Industrial Rule")}:</strong>{" "}
              {t(
                "timetable.collision.industrialRuleDesc",
                "A teacher's time is physically finite. Double-booking across suites will cause session failures. Please choose a different timeframe."
              )}
            </p>
          </div>

          <AlertDialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-destructive/20 bg-destructive hover:bg-destructive/90"
            >
              {t("timetable.collision.adjust", "Adjust My Schedule")}
            </Button>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
