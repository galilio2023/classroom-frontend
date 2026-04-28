import React, { useMemo, useEffect } from "react";
import { useList, useGo, type HttpError } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, ShieldAlert, ArrowRight, Layers, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import usePageTitle from "@/hooks/use-page-title";
import { Breadcrumb } from "@/components/refine/layout/breadcrumb";
import { ListView } from "@/components/refine/views/list-view";
import { useTranslation } from "react-i18next";
import { useCapabilities } from "@/hooks/use-capabilities";
import { Badge } from "@/components/ui/badge";
import { DAYS_SHORT, VACATION_INDEX } from "@/constants/calendar";
import { useOfflineSync } from "@/features/engagement/hooks/use-offline-sync";
import { PlannerDayColumn } from "../../components/PlannerDayColumn";
import { useNotifyError } from "@/hooks/use-notify-error";

export interface TimetableSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  hasConflict?: boolean;
  section?: { name: string };
  subject?: { name: string };
  conflictDetails?: { with: string; reason: string };
}

export default function DeptSemesterPlannerPage() {
  const { t } = useTranslation();
  const { isFacultySuite } = useCapabilities();
  const go = useGo();
  const { isOnline } = useOfflineSync();
  const { notifyError } = useNotifyError();

  usePageTitle(t("timetable.deptPlanner.title", "Dept Semester Planner"));

  // 🚀 RULE 4: Use useList to leverage Dexie/IndexedDB offline cache (Rural Pocket Hardening)
  const { query } = useList<TimetableSlot, HttpError>({
    resource: "timetable/dept-planner",
    queryOptions: {
      staleTime: 5 * 60 * 1000, // 5 mins
    },
  });

  const { data, isLoading, isError, error } = query;

  /**
   * 🛡️ RULE 5: Standardized Error Handling
   */
  useEffect(() => {
    if (isError && error) {
      notifyError(error);
    }
  }, [isError, error, notifyError]);

  /**
   * 🚀 OPTIMIZATION (Review #5 + #8): Group slots by day to reduce O(N*M) complexity in the grid render.
   */
  const { slotsByDay, hasConflicts, conflictCount } = useMemo(() => {
    const slots = data?.data || [];
    const grouped = (slots as TimetableSlot[]).reduce(
      (acc: Record<number, TimetableSlot[]>, slot: TimetableSlot) => {
        acc[slot.dayOfWeek] = [...(acc[slot.dayOfWeek] || []), slot];
        return acc;
      },
      {} as Record<number, TimetableSlot[]>
    );

    const conflicts = (slots as TimetableSlot[]).filter((s) => s.hasConflict);

    return {
      slotsByDay: grouped,
      hasConflicts: conflicts.length > 0,
      conflictCount: conflicts.length,
    };
  }, [data]);

  if (!isFacultySuite) {
    return (
      <div className="flex items-center justify-center p-20">
        <Card className="max-w-md p-8 text-center space-y-4 rounded-[2.5rem] border-border/40 shadow-2xl">
          <Layers className="w-12 h-12 text-muted-foreground/20 mx-auto" />
          <h2 className="text-xl font-black italic">
            {t("timetable.deptPlanner.facultyLogicRequired", "Faculty Logic Required")}
          </h2>
          <p className="text-muted-foreground font-medium">
            {t(
              "timetable.deptPlanner.facultyLogicDesc",
              "The Department Planner is a specialized tool for the Tablawy Faculty suite."
            )}
          </p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-20 text-center animate-pulse">
        {t("timetable.deptPlanner.loading", "Loading Planner Grid...")}
      </div>
    );
  }

  return (
    <ListView>
      <div className="space-y-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-start"
        >
          <div className="space-y-4 flex-1">
            <Breadcrumb />
            <h1 className="page-title mb-0 flex items-center gap-4 text-3xl md:text-5xl font-black italic">
              <div className="p-4 rounded-[1.5rem] bg-purple-500/10 text-purple-500 border border-purple-500/5 shadow-xl">
                <BookOpen className="h-8 w-8" />
              </div>
              {t("timetable.deptPlanner.gridTitle", "Semester Grid")}
              {!isOnline && (
                <Badge
                  variant="destructive"
                  className="ml-4 rounded-full h-8 px-3 font-black uppercase gap-2 animate-pulse shadow-lg shadow-destructive/20"
                >
                  <WifiOff className="w-4 h-4" />
                  {t("status.offline", "Offline Mode")}
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground font-medium max-w-2xl text-lg">
              {t(
                "timetable.deptPlanner.gridDescription",
                "Manage all departmental sections and resolve timetable overlaps before student registration."
              )}
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => go({ to: { resource: "reports", action: "list" } })}
              className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-purple-500/20 bg-purple-600"
            >
              {t("timetable.deptPlanner.generateReports", "Generate Reports")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* CONFLICT SUMMARY ALERT */}
        <AnimatePresence>
          {hasConflicts && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div className="bg-destructive/5 border border-destructive/20 rounded-[2rem] p-6 flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-destructive/10 text-destructive animate-pulse">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="flex-1 text-start">
                  <h3 className="text-lg font-black text-destructive uppercase">
                    {t("timetable.deptPlanner.collisionsDetected", "Timetable Collisions Detected")}
                  </h3>
                  <p className="text-sm font-medium text-destructive/80">
                    {t(
                      "timetable.deptPlanner.collisionsDescription",
                      "Multiple lecture sections have overlapping times or rooms. Resolve these to prevent registration blocks."
                    )}
                  </p>
                </div>
                <Badge variant="destructive" className="rounded-full h-8 px-4 font-black uppercase">
                  {t("timetable.deptPlanner.conflictsCount", {
                    count: conflictCount,
                  })}
                </Badge>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-6 overflow-x-auto pb-4 custom-scrollbar">
          {DAYS_SHORT.map((day: string, idx: number) => {
            const isVacation = idx === VACATION_INDEX;
            const daySlots = slotsByDay[idx] || [];

            return (
              <PlannerDayColumn key={idx} dayName={day} isVacation={isVacation} slots={daySlots} />
            );
          })}
        </div>
      </div>
    </ListView>
  );
}
