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
import { TimetableGrid } from "@/features/timetable/components/TimetableGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";

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

  const slots = (query.data?.data || []) as any[];
  const lessons = useMemo(
    () => slots.filter((s) => s.scheduleType === "bell" || s.scheduleType === "lecture"),
    [slots]
  );
  const exams = useMemo(() => slots.filter((s) => s.scheduleType === "exam"), [slots]);
  const isLoading = query.isLoading;

  if (isLoading) {
    return (
      <ListView>
        <div className="space-y-12">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-14 w-80 rounded-2xl" />
            <Skeleton className="h-4 w-64 rounded-lg" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-12 w-32 rounded-2xl" />
            <Skeleton className="h-12 w-32 rounded-2xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-8 rounded-xl" />
                <Skeleton className="h-32 rounded-3xl" />
              </div>
            ))}
          </div>
        </div>
      </ListView>
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
            {lessons.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 md:p-20 bg-card/20 rounded-[3rem] border-2 border-dashed border-border/40 text-center">
                <EmptyState
                  icon={Calendar}
                  title={t("timetable.teacher.noLessons", "No Lessons Scheduled")}
                  description={t(
                    "timetable.teacher.noLessonsDesc",
                    "You don't have any lessons assigned to your schedule yet."
                  )}
                />
              </div>
            ) : (
              <TimetableGrid
                slots={lessons}
                isLoading={isLoading}
                onAction={(slot) =>
                  push(`/classes/show/${slot.classId}${slot.isLive ? "?subtab=live" : ""}`)
                }
              />
            )}
          </TabsContent>

          <TabsContent value="exams" className="mt-0 outline-none">
            {exams.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 md:p-20 bg-card/20 rounded-[3rem] border-2 border-dashed border-border/40 text-center">
                <EmptyState
                  icon={BookOpen}
                  title={t("timetable.teacher.noExams", "No Exams Scheduled")}
                  description={t(
                    "timetable.teacher.noExamsDesc",
                    "Your upcoming exam proctoring or management schedule is empty."
                  )}
                />
              </div>
            ) : (
              <TimetableGrid
                slots={exams}
                isLoading={isLoading}
                onAction={(slot) => push(`/classes/show/${slot.classId}`)}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ListView>
  );
}
