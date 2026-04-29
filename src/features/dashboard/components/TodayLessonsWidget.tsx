import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Clock,
  Sparkles,
  Calendar,
  Info,
  MapPin,
  BookOpen,
  Radio,
  ChevronRight,
  User as UserIcon,
  Play,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCustom, useNavigation } from "@refinedev/core";
import { cn } from "@/lib/utils";

export const TodayLessonsWidget: React.FC = () => {
  const { t } = useTranslation();
  const { push } = useNavigation() as any;

  const { data: queryData, isLoading } = useCustom({
    url: `${import.meta.env.VITE_API_URL}/timetable/student-today`,
    method: "get",
  }) as any;

  const lessons = (queryData?.data as any[]) || [];

  if (isLoading) {
    return <Card className="h-[400px] animate-pulse bg-muted/10 rounded-4xl border-border/40" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border border-border/80 dark:border-white/5 shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] relative group">
        <CardHeader className="p-8 pb-4 relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-black flex items-center gap-3 tracking-tighter uppercase">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform duration-500">
                <Clock className="h-6 w-6" />
              </div>
              {t("dashboard.schedule.today", "Today's Lessons")}
            </CardTitle>
            <Badge
              variant="secondary"
              className="rounded-full px-3 py-1 font-black text-[10px] uppercase tracking-widest bg-blue-500/5 text-blue-500 border-none"
            >
              {t("dashboard.schedule.classesCount", { count: lessons.length })}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-8 pt-4 space-y-6 relative">
          <AnimatePresence mode="popLayout">
            {lessons.length > 0 ? (
              <div className="grid gap-4">
                {lessons.map((lesson, idx) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group/item"
                  >
                    <div
                      className={cn(
                        "flex items-center justify-between p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden",
                        lesson.isLive
                          ? "bg-blue-500/5 border-blue-500/20 ring-1 ring-blue-500/10"
                          : "bg-background/40 border-border/40 hover:border-blue-500/20 hover:bg-background/60"
                      )}
                    >
                      {lesson.isLive && (
                        <div className="absolute top-0 start-0 w-1 h-full bg-blue-500" />
                      )}

                      <div className="flex items-center gap-5 flex-1 min-w-0">
                        <div className="text-center shrink-0 w-16">
                          <div className="text-xs font-black text-primary">
                            {lesson.startTime.slice(0, 5)}
                          </div>
                          <div className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase">
                            {lesson.endTime.slice(0, 5)}
                          </div>
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-black tracking-tight truncate">
                              {lesson.subject?.name || "Subject"}
                            </h3>
                            {lesson.isLive && (
                              <Badge
                                variant="destructive"
                                className="h-5 px-2 rounded-full text-[8px] font-black animate-pulse uppercase tracking-widest gap-1"
                              >
                                <Radio className="w-2 h-2" /> Live
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground font-medium text-xs">
                            <div className="flex items-center gap-1.5">
                              <UserIcon className="w-3.5 h-3.5 opacity-40" />
                              <span className="truncate">T. {lesson.teacher?.name || "Staff"}</span>
                            </div>
                            {lesson.roomId && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 opacity-40" />
                                <span>{lesson.roomId}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="ms-4 shrink-0">
                        {lesson.isLive ? (
                          <Button
                            size="sm"
                            className="rounded-2xl h-10 px-6 font-black uppercase tracking-widest text-[9px] bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 gap-2 group-hover/item:scale-105 transition-transform"
                            onClick={() =>
                              push(`/classes/${lesson.classId}?session=${lesson.sessionId}`)
                            }
                          >
                            <Play className="w-3 h-3 fill-current" />
                            Join Now
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full h-10 w-10 opacity-0 group-hover/item:opacity-100 transition-opacity"
                          >
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/5 rounded-[2rem] border border-dashed border-border/40">
                <Calendar className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-lg font-black">
                  {t("dashboard.schedule.freeDay", "No Lessons Scheduled")}
                </h3>
                <p className="text-sm text-muted-foreground font-medium max-w-[200px] mx-auto mt-2">
                  Enjoy your time off or check your study planner.
                </p>
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};
