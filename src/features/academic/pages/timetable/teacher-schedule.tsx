import { useGetIdentity, useList, useNavigation } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function TeacherSchedulePage() {
  const { t } = useTranslation();
  const { isSchoolSuite, isTeacher, isAdmin } = useCapabilities();
  const { push } = useNavigation() as any;

  usePageTitle(t("timetable.teacher.title", "My Schedule"));

  const { query } = useList<TimetableSlot>({
    resource: "timetable/teacher-weekly",
    queryOptions: {
      enabled: isTeacher || isAdmin,
    },
  });

  const slots = query.data?.data || [];
  const lessons = useMemo(
    () => slots.filter((s) => s.scheduleType === "bell" || s.scheduleType === "lecture"),
    [slots]
  );
  const exams = useMemo(() => slots.filter((s) => s.scheduleType === "exam"), [slots]);
  const isLoading = query.isLoading;

  if (!isSchoolSuite) {
    return (
      <div className="flex items-center justify-center p-20">
        <Card className="max-w-md p-8 text-center space-y-4 rounded-4xl border-border/40">
          <TrendingUp className="w-12 h-12 text-muted-foreground/20 mx-auto" />
          <h2 className="text-xl font-black">Feature Restricted</h2>
          <p className="text-muted-foreground">
            The Weekly Timetable is currently optimized for the Tablawy School suite.
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
            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
              <Calendar className="h-8 w-8" />
            </div>
            {t("timetable.teacher.title", "My Weekly Schedule")}
          </h1>
          <p className="text-muted-foreground font-medium max-w-2xl">
            View and manage your assigned periods across all classes.
          </p>
        </motion.div>

        <Tabs defaultValue="lessons" className="space-y-8">
          <div className="flex justify-center md:justify-start">
            <TabsList className="bg-muted/20 p-1 rounded-2xl h-12">
              <TabsTrigger
                value="lessons"
                className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-background transition-all"
              >
                Lessons
              </TabsTrigger>
              <TabsTrigger
                value="exams"
                className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-background transition-all"
              >
                Exams
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="lessons" className="mt-0 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
              {DAYS.map((label, idx) => {
                const daySlots = lessons.filter((s) => s.dayOfWeek === idx);
                const isToday = dayjs().get("day") === idx;

                return (
                  <div
                    key={idx}
                    className={cn(
                      "space-y-4 p-2 rounded-[2rem] transition-colors duration-500",
                      isToday ? "bg-primary/5 ring-1 ring-primary/10" : ""
                    )}
                  >
                    <div
                      className={cn(
                        "text-[10px] font-black uppercase tracking-[0.2em] text-center py-2 border-b border-border/40 mb-4 flex flex-col items-center gap-1",
                        isToday ? "text-primary" : "text-muted-foreground/60"
                      )}
                    >
                      {label}
                      {isToday && <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />}
                    </div>
                    <div className="space-y-3">
                      {daySlots.length === 0 ? (
                        <div className="h-20 rounded-3xl border border-dashed border-border/40 flex items-center justify-center opacity-30">
                          <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                            Free
                          </span>
                        </div>
                      ) : (
                        daySlots.map((slot) => (
                          <Card
                            key={slot.id}
                            className="p-4 rounded-3xl border-border/40 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden bg-card/60 backdrop-blur-xl border-l-4 border-l-primary/40 text-start"
                          >
                            <div className="flex flex-col items-start gap-2">
                              <span className="text-[10px] font-black tracking-tight text-primary">
                                {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                              </span>
                              <div className="space-y-1 min-w-0 w-full">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <BookOpen className="w-3 h-3 text-blue-500 shrink-0" />
                                  <h4 className="text-xs font-black truncate">
                                    {(slot as any).subject?.name || "Subject"}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-1.5 opacity-60">
                                  <Layers className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                                  <span className="text-[9px] font-bold truncate">
                                    {(slot as any).class?.name || "Class"}
                                  </span>
                                </div>
                              </div>

                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full h-8 rounded-xl text-[8px] font-black uppercase tracking-widest gap-1.5 mt-1 border-primary/20 hover:bg-primary hover:text-primary-foreground group"
                                onClick={() => push(`/classes/${slot.classId}`)}
                              >
                                <Play className="w-2.5 h-2.5 fill-current" />
                                Go Live
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
          </TabsContent>

          <TabsContent value="exams" className="mt-0 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
              {DAYS.map((label, idx) => {
                const dayExams = exams.filter((s) => s.dayOfWeek === idx);
                return (
                  <div key={idx} className="space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-center py-2 border-b border-border/40 mb-4 text-destructive">
                      {label}
                    </div>
                    <div className="space-y-3">
                      {dayExams.length === 0 ? (
                        <div className="h-20 rounded-3xl border border-dashed border-border/40 flex items-center justify-center opacity-20">
                          <span className="text-[8px] font-bold">None</span>
                        </div>
                      ) : (
                        dayExams.map((slot) => (
                          <Card
                            key={slot.id}
                            className="p-4 rounded-3xl border-destructive/20 shadow-sm transition-all group relative bg-destructive/5 text-start"
                          >
                            <div className="flex flex-col items-start gap-1">
                              <span className="text-[10px] font-black tracking-tight text-destructive">
                                {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                              </span>
                              <h4 className="text-[10px] font-black truncate">
                                {(slot as any).subject?.name}
                              </h4>
                              <div className="flex items-center gap-1 opacity-60 text-destructive">
                                <MapPin className="w-2.5 h-2.5" />
                                <span className="text-[8px] font-bold">{slot.roomId}</span>
                              </div>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ListView>
  );
}
