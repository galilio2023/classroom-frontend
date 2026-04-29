import { useGetIdentity, useList, useNavigation } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  Radio,
  ChevronRight,
  Play,
  TrendingUp,
  MapPin,
  Layers,
  BookOpen,
} from "lucide-react";
import { TimetableSlot, User, UserRole } from "@/types";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import usePageTitle from "@/hooks/use-page-title";
import { Breadcrumb } from "@/components/refine/layout/breadcrumb";
import { ListView } from "@/components/refine/views/list-view";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useCapabilities } from "@/hooks/use-capabilities";
import { DAYS } from "@/constants/calendar";

export default function LecturerScheduleViewPage() {
  const { t } = useTranslation();
  const { isFacultySuite, isTeacher, isAdmin } = useCapabilities();
  const { push } = useNavigation() as any;

  usePageTitle(t("timetable.lecturer.weeklyTitle", "My Lecture Schedule"));

  const { query } = useList<TimetableSlot>({
    resource: "timetable/lecturer-weekly",
    queryOptions: {
      enabled: isTeacher || isAdmin,
    },
  });

  const slots = query.data?.data || [];
  const isLoading = query.isLoading;

  if (!isFacultySuite) {
    return (
      <div className="flex items-center justify-center p-20">
        <Card className="max-w-md p-8 text-center space-y-4 rounded-4xl border-border/40">
          <TrendingUp className="w-12 h-12 text-muted-foreground/20 mx-auto" />
          <h2 className="text-xl font-black">Access Denied</h2>
          <p className="text-muted-foreground">
            The Lecturer Weekly View is optimized for the Tablawy Faculty suite.
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
          className="space-y-4 text-start"
        >
          <Breadcrumb />
          <h1 className="page-title mb-0 flex items-center gap-3 text-3xl md:text-5xl font-black">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/5 shadow-sm">
              <Calendar className="h-8 w-8" />
            </div>
            {t("timetable.lecturer.weeklyTitle", "My Lecture Schedule")}
          </h1>
          <p className="text-muted-foreground font-medium max-w-2xl">
            A comprehensive view of your scheduled course sections for the current semester.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          {DAYS.map((label, idx) => {
            const daySlots = slots.filter((s) => s.dayOfWeek === idx);
            const isToday = dayjs().get("day") === idx;

            return (
              <div
                key={idx}
                className={cn(
                  "space-y-4 p-2 rounded-[2rem] transition-colors duration-500",
                  isToday ? "bg-purple-500/5 ring-1 ring-purple-500/10" : ""
                )}
              >
                <div
                  className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] text-center py-2 border-b border-border/40 mb-4 flex flex-col items-center gap-1",
                    isToday ? "text-purple-500" : "text-muted-foreground/60"
                  )}
                >
                  {label}
                  {isToday && <div className="w-1 h-1 rounded-full bg-purple-600 animate-pulse" />}
                </div>
                <div className="space-y-3">
                  {daySlots.length === 0 ? (
                    <div className="h-20 rounded-3xl border border-dashed border-border/40 flex items-center justify-center opacity-30">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                        Empty
                      </span>
                    </div>
                  ) : (
                    daySlots.map((slot) => (
                      <Card
                        key={slot.id}
                        className="p-4 rounded-3xl border-border/40 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden bg-card/60 backdrop-blur-xl border-l-4 border-l-purple-500/40 text-start text-start"
                      >
                        <div className="flex flex-col items-start gap-2">
                          <span className="text-[10px] font-black tracking-tight text-purple-600">
                            {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                          </span>
                          <div className="space-y-1 min-w-0 w-full">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Layers className="w-3 h-3 text-purple-500 shrink-0" />
                              <h4 className="text-[10px] font-black truncate">
                                {(slot as any).section?.name || "Section"}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1.5 opacity-60">
                              <BookOpen className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                              <span className="text-[8px] font-bold truncate">
                                {(slot as any).subject?.name || "Course"}
                              </span>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full h-8 rounded-xl text-[8px] font-black uppercase tracking-widest gap-1.5 mt-1 hover:bg-purple-500/10 hover:text-purple-600"
                            onClick={() => push(`/classes/${slot.classId}`)}
                          >
                            Go to Section
                            <ChevronRight className="w-2.5 h-2.5" />
                          </Button>
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
