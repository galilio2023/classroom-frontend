import { useCustom, useNavigation } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  TrendingUp,
  MapPin,
  Download,
  AlertTriangle,
  Flame,
  Activity,
  Layers,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import usePageTitle from "@/hooks/use-page-title";
import { Breadcrumb } from "@/components/refine/layout/breadcrumb";
import { ListView } from "@/components/refine/views/list-view";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useCapabilities } from "@/hooks/use-capabilities";
import { DAYS, VACATION_INDEX } from "@/constants/calendar";

export default function AcademicYearPlannerPage() {
  const { t } = useTranslation();
  const { isSchoolSuite, isAdmin } = useCapabilities();
  const { push } = useNavigation() as any;

  usePageTitle(t("timetable.planner.title", "Principal Year Planner"));

  const { data: queryData, isLoading } = useCustom({
    url: `${import.meta.env.VITE_API_URL}/timetable/year-planner`,
    method: "get",
  } as any) as any;

  const data = (queryData?.data as any) || { density: [], exams: [], terms: [], years: [] };

  const getHeatmapColor = (count: number, isVacation: boolean) => {
    if (isVacation) return "bg-primary/5 text-primary/40 border border-dashed border-primary/20";
    if (count === 0) return "bg-muted/10";
    if (count < 5) return "bg-blue-500/20 text-blue-700";
    if (count < 10) return "bg-blue-500/40 text-blue-900";
    if (count < 15) return "bg-amber-500/60 text-amber-900";
    return "bg-destructive/60 text-destructive-foreground font-black";
  };

  if (!isSchoolSuite) {
    return (
      <div className="flex items-center justify-center p-20">
        <Card className="max-w-md p-8 text-center space-y-4 rounded-[2.5rem] border-border/40 shadow-2xl">
          <Activity className="w-12 h-12 text-muted-foreground/20 mx-auto" />
          <h2 className="text-xl font-black italic">School DNA Required</h2>
          <p className="text-muted-foreground font-medium">
            The Year Planner is an industrial management tool for the Tablawy School suite.
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
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
        >
          <div className="space-y-4 flex-1 text-start">
            <Breadcrumb />
            <h1 className="page-title mb-0 flex items-center gap-4 text-3xl md:text-5xl font-black">
              <div className="p-4 rounded-[1.5rem] bg-primary/10 text-primary border border-primary/5 shadow-xl">
                <Layers className="h-8 w-8" />
              </div>
              {t("timetable.planner.title", "Academic Year Planner")}
            </h1>
            <p className="text-muted-foreground font-medium max-w-2xl text-lg">
              Aggregate infrastructure oversight: density heatmap, term tracking, and exam
              orchestration.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] gap-2 border-border/60"
            >
              <Download className="w-4 h-4" />
              Export PDF (Bidi)
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* HEATMAP COLUMN */}
          <Card className="lg:col-span-2 rounded-[3rem] border-border/40 shadow-2xl bg-card/40 backdrop-blur-3xl overflow-hidden group">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                  <Flame className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">
                  Timetable Density Heatmap
                </CardTitle>
              </div>
              <CardDescription className="font-medium ms-10">
                Identifying scheduling bottlenecks across the week.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <div className="grid grid-cols-7 gap-4">
                {DAYS.map((day, idx) => {
                  const count = data.density.find((d: any) => d.day === idx)?.count || 0;
                  const isVacation = idx === VACATION_INDEX;
                  return (
                    <div key={idx} className="space-y-3">
                      <div
                        className={cn(
                          "h-32 rounded-3xl flex flex-col items-center justify-center transition-all duration-500 group-hover:scale-[1.02]",
                          getHeatmapColor(count, isVacation)
                        )}
                      >
                        <span className={cn("text-2xl font-black", isVacation && "opacity-20")}>
                          {count}
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60">
                          {isVacation ? t("status.off", "Off") : "Periods"}
                        </span>
                      </div>
                      <div className="text-[8px] font-black uppercase tracking-widest text-center text-muted-foreground/60">
                        {t(`timetable.calendar.days.${day.toLowerCase()}`).slice(0, 3)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* SUMMARY STATS COLUMN */}
          <div className="space-y-6">
            <Card className="rounded-[2.5rem] border-border/40 bg-primary/5 p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 rounded-full bg-primary/10 text-primary">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-black">{data.years.length}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Managed Cycles
                </p>
              </div>
            </Card>

            <Card className="rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-xl overflow-hidden">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-destructive" />
                  Upcoming Exams
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2 space-y-3">
                {data.exams.length > 0 ? (
                  data.exams.slice(0, 3).map((ex: any) => (
                    <div
                      key={ex.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-destructive/5 border border-destructive/10"
                    >
                      <div className="min-w-0">
                        <div className="text-[10px] font-black truncate">
                          Exam Slot {ex.id.slice(-4)}
                        </div>
                        <div className="text-[8px] font-bold text-muted-foreground">
                          {ex.startTime}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="h-5 px-2 rounded-full text-[8px] border-destructive/20 text-destructive"
                      >
                        {ex.roomId}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] font-bold text-muted-foreground italic text-center py-4">
                    No exams scheduled this week.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* YEAR TIMELINE */}
        <section className="space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 ms-2">
            <Clock className="w-6 h-6 text-primary" />
            Academic Terms Overview
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.years.map((year: any) => (
              <Card
                key={year.id}
                className="rounded-[2rem] border-border/40 shadow-lg overflow-hidden group"
              >
                <div className="h-2 bg-primary/40 w-full" />
                <CardHeader className="p-6">
                  <CardTitle className="text-lg font-black">{year.name}</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest">
                    {dayjs(year.startDate).format("YYYY")} — {dayjs(year.endDate).format("YYYY")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-8 space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                    <span>Cycle Status</span>
                    <Badge className="bg-primary/10 text-primary border-none rounded-full h-5 text-[8px] font-black uppercase">
                      {year.status}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full h-10 rounded-xl text-[9px] font-black uppercase tracking-widest border border-dashed border-border/60 hover:bg-primary/5 hover:text-primary transition-all"
                  >
                    Review All Terms
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </ListView>
  );
}
