import { useCustom, useNavigation } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, AlertTriangle, Layers, ShieldAlert, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import usePageTitle from "@/hooks/use-page-title";
import { Breadcrumb } from "@/components/refine/layout/breadcrumb";
import { ListView } from "@/components/refine/views/list-view";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useList, useNavigation } from "@refinedev/core";
...
import { Badge } from "@/components/ui/badge";
import { DAYS } from "@/constants/calendar";

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
  const { push } = useNavigation() as any;

  usePageTitle(t("timetable.deptPlanner.title", "Dept Semester Planner"));

  // 🚀 RULE 4: Use useList to leverage Dexie/IndexedDB offline cache (Rural Pocket Hardening)
  const { data: queryData, isLoading } = useList<TimetableSlot>({
    resource: "timetable/dept-planner",
    queryOptions: {
      staleTime: 5 * 60 * 1000, // 5 mins
    },
  });

  const slots = queryData?.data || [];
  if (!isFacultySuite) {
    return (
      <div className="flex items-center justify-center p-20">
        <Card className="max-w-md p-8 text-center space-y-4 rounded-[2.5rem] border-border/40 shadow-2xl">
          <Layers className="w-12 h-12 text-muted-foreground/20 mx-auto" />
          <h2 className="text-xl font-black italic">Faculty Logic Required</h2>
          <p className="text-muted-foreground font-medium">
            The Department Planner is a specialized tool for the Tablawy Faculty suite.
          </p>
        </Card>
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
              {t("timetable.deptPlanner.title", "Semester Grid")}
            </h1>
            <p className="text-muted-foreground font-medium max-w-2xl text-lg">
              Manage all departmental sections and resolve timetable overlaps before student
              registration.
            </p>
          </div>
          <div className="flex gap-4">
            <Button className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-purple-500/20 bg-purple-600">
              Generate Reports
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* CONFLICT SUMMARY ALERT */}
        <AnimatePresence>
          {slots.some((s) => s.hasConflict) && (
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
                    Timetable Collisions Detected
                  </h3>
                  <p className="text-sm font-medium text-destructive/80">
                    Multiple lecture sections have overlapping times or rooms. Resolve these to
                    prevent registration blocks.
                  </p>
                </div>
                <Badge variant="destructive" className="rounded-full h-8 px-4 font-black uppercase">
                  {slots.filter((s) => s.hasConflict).length} Conflicts
                </Badge>
              </div>
            </motion.div>
          )}
        import { DAYS_SHORT } from "@/constants/calendar";
        ...
                <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
                  {DAYS_SHORT.map((day, idx) => {
                    const daySlots = slots.filter((s) => s.dayOfWeek === idx);
                    return (
                      <div key={idx} className="space-y-4">
                        <header className="py-2 border-b border-border/40 mb-4">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-center text-muted-foreground/60">
                            {day}
                          </h4>
                        </header>
                <div className="space-y-3">
                  {daySlots.length === 0 ? (
                    <div className="h-20 rounded-3xl border border-dashed border-border/40 flex items-center justify-center opacity-10">
                      <span className="text-[8px] font-bold">No Lectures</span>
                    </div>
                  ) : (
                    daySlots.map((slot) => (
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
                              <AlertTriangle className="w-2 h-2" /> Collision
                            </Badge>
                          )}
                          <span
                            className={cn(
                              "text-[10px] font-black tracking-tight",
                              slot.hasConflict ? "text-destructive" : "text-purple-600"
                            )}
                          >
                            {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                          </span>
                          <div className="space-y-1 min-w-0 w-full">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Layers
                                className={cn(
                                  "w-3 h-3 shrink-0",
                                  slot.hasConflict ? "text-destructive" : "text-purple-500"
                                )}
                              />
                              <h5 className="text-[10px] font-black truncate">
                                Sec {slot.section?.name}
                              </h5>
                            </div>
                            <div className="flex items-center gap-1.5 opacity-60">
                              <BookOpen className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                              <span className="text-[9px] font-bold truncate">
                                {slot.subject?.name}
                              </span>
                            </div>
                          </div>

                          {slot.hasConflict && (
                            <div className="mt-2 pt-2 border-t border-destructive/10 w-full">
                              <p className="text-[8px] font-black text-destructive uppercase leading-tight italic">
                                Conflict with {slot.conflictDetails?.with}:<br />
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
          })}
        </div>
      </div>
    </ListView>
  );
}
