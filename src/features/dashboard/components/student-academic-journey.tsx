import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { TrendingUp, BookOpen, CheckCircle2, Clock, XCircle, Target, Trophy, Sparkles, ArrowRight, LayoutDashboard, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PracticeModal } from "@/components/practice/practice-modal";
import { NoChartData } from "./no-chart-data";
import { AttendanceStatCard } from "./attendance-stat-card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartConfig 
} from "@/components/ui/chart";
import { useNavigation } from "@refinedev/core";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface StudentAcademicJourneyProps {
  gradeTrends: any[];
  subjectMastery: any[];
  attendanceSummary: any;
}

export const StudentAcademicJourney = ({ gradeTrends, subjectMastery, attendanceSummary }: StudentAcademicJourneyProps) => {
  const [practiceTopic, setPracticeTopic] = useState<string | null>(null);
  const [practiceSubjectId, setPracticeSubjectId] = useState<number | null>(null);
  const { list } = useNavigation();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const weakSubjects = subjectMastery.filter(s => s.avgGrade < 70);
  const hasData = gradeTrends.length > 0 || subjectMastery.length > 0 || (attendanceSummary?.total || 0) > 0;

  const attendedCount = (attendanceSummary?.present || 0) + (attendanceSummary?.late || 0);
  const attendanceRate = attendanceSummary?.total > 0 
    ? Math.round((attendedCount / attendanceSummary.total) * 100) 
    : 0;

  const gradeConfig = {
    grade: {
      label: t("reportCard.grade"),
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  const masteryConfig = {
    avgGrade: {
      label: t("reportCard.avgScore"),
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  return (
    <div className="space-y-10 md:space-y-16">
      {/* 1. Onboarding / Welcome State */}
      {!hasData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden py-16 md:py-24 text-center group">
            <CardContent className="space-y-6 md:space-y-8">
              <div className="relative mx-auto w-fit">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative p-6 md:p-8 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <Sparkles className="h-12 w-12 md:h-16 md:w-16 opacity-40" />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl md:text-3xl font-black tracking-tight">{t("dashboard.student.welcomeJourney")}</h4>
                <p className="text-sm md:text-base text-muted-foreground/80 font-medium max-w-md mx-auto leading-relaxed">{t("dashboard.student.welcomeJourneyDesc")}</p>
              </div>
              <Button 
                onClick={() => list("classes")}
                size="lg"
                className="mt-4 rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              >
                {t("buttons.exploreClasses")}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 2. AI Intervention / Practice Suggestion */}
      <AnimatePresence>
        {weakSubjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-border/40 shadow-2xl bg-orange-500/[0.03] backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border-2 border-dashed group">
              <div className="h-1.5 bg-orange-500/20 w-full animate-pulse" />
              <CardHeader className="p-8 md:p-10 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-600 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                      <Target className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-xl md:text-2xl font-black tracking-tight text-orange-700">{t("dashboard.student.focusArea")}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-ai-primary opacity-40" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t("dashboard.student.aiRecommendation")}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-widest bg-orange-500/10 text-orange-600 border border-orange-500/20 shadow-sm">
                    {t("dashboard.student.actionRequiredBadge")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8 md:p-10 pt-2 space-y-6">
                <p className="text-sm md:text-base font-medium text-orange-600/80 leading-relaxed italic">
                  {t("dashboard.student.strugglingWith", { subject: weakSubjects[0].subject })}
                </p>
                <Button 
                  onClick={() => {
                    setPracticeTopic(weakSubjects[0].subject);
                    setPracticeSubjectId(weakSubjects[0].subjectId); 
                  }}
                  size="lg"
                  className="h-14 rounded-2xl px-10 font-black uppercase tracking-widest text-[10px] gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20 transition-all hover:scale-105 active:scale-95"
                >
                  <Trophy className="h-4 w-4" />
                  {t("buttons.practiceLevelUp")}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Performance Charts */}
      <div className="grid gap-8 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/40 shadow-2xl overflow-hidden bg-card/50 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] group h-full">
            <div className="h-1.5 bg-primary/10 w-full" />
            <CardHeader className="p-8 md:p-10 pb-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-3 text-2xl font-black tracking-tighter">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500 shadow-sm">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    {t("dashboard.student.gradeProgress")}
                  </CardTitle>
                  <CardDescription className="font-medium text-muted-foreground/60 text-sm md:text-base">{t("dashboard.student.gradeProgressDesc")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[300px] p-8 md:p-10 pt-6">
              {gradeTrends.length > 0 ? (
                <ChartContainer config={gradeConfig} className="h-full w-full">
                    <LineChart data={gradeTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted-foreground/10" />
                      <XAxis 
                        dataKey="title" 
                        axisLine={false} 
                        tickLine={false} 
                        tickMargin={12}
                        className="fill-muted-foreground/60 text-[10px] font-black uppercase tracking-widest"
                        reversed={isArabic}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        axisLine={false} 
                        tickLine={false} 
                        tickMargin={12}
                        className="fill-muted-foreground/60 text-[10px] font-black uppercase tracking-widest" 
                        orientation={isArabic ? "right" : "left"}
                        tickFormatter={(val) => new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-US').format(val)}
                      />
                      <ChartTooltip 
                        cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '4 4' }} 
                        content={<ChartTooltipContent className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl p-4 font-bold" />} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="grade" 
                        stroke="hsl(var(--primary))"
                        strokeWidth={4} 
                        dot={{ r: 6, className: "fill-primary stroke-background", strokeWidth: 3 }} 
                        activeDot={{ r: 8, strokeWidth: 0, className: "fill-primary shadow-xl" }}
                        animationDuration={2000}
                        animationEasing="ease-out"
                      />
                    </LineChart>
                </ChartContainer>
              ) : (
                <NoChartData icon={TrendingUp} message={t("dashboard.student.noGradeData")} />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/40 shadow-2xl overflow-hidden bg-card/50 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] group h-full">
            <div className="h-1.5 bg-primary/10 w-full" />
            <CardHeader className="p-8 md:p-10 pb-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-3 text-2xl font-black tracking-tighter">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500 shadow-sm">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    {t("dashboard.student.subjectMastery")}
                  </CardTitle>
                  <CardDescription className="font-medium text-muted-foreground/60 text-sm md:text-base">{t("dashboard.student.subjectMasteryDesc")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[300px] p-8 md:p-10 pt-6">
              {subjectMastery.length > 0 ? (
                <ChartContainer config={masteryConfig} className="h-full w-full">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectMastery}>
                      <PolarGrid className="stroke-muted-foreground/10" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        className="fill-muted-foreground/60 text-[9px] font-black uppercase tracking-widest"
                      />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name={t("reportCard.avgScore")}
                        dataKey="avgGrade"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        strokeWidth={3}
                        fillOpacity={0.15}
                        animationDuration={2000}
                        animationEasing="ease-out"
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl p-4 font-bold" />} 
                      />
                    </RadarChart>
                </ChartContainer>
              ) : (
                <NoChartData icon={BookOpen} message={t("dashboard.student.noSubjectData")} />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 4. Attendance Stats */}
      <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
        {[
          { label: t("classes.attendance.present"), value: attendanceSummary?.present || 0, icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
          { label: t("classes.attendance.absent"), value: attendanceSummary?.absent || 0, icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
          { label: t("classes.attendance.late"), value: attendanceSummary?.late || 0, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
          { label: t("classes.attendance.rate"), value: `${attendanceRate}%`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + (idx * 0.05) }}
          >
            <AttendanceStatCard 
              icon={stat.icon} 
              value={stat.value} 
              label={stat.label} 
              colorClass={cn(stat.bg, stat.color)} 
              hoverBorderClass="hover:border-primary/20" 
            />
          </motion.div>
        ))}
      </div>

      {practiceTopic && (
        <PracticeModal 
          topic={practiceTopic} 
          subjectId={practiceSubjectId}
          onClose={() => setPracticeTopic(null)} 
        />
      )}
    </div>
  );
};
