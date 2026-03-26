import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Brain, TrendingDown, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface QuestionStat {
  question: string;
  correctPercentage: number;
  totalAttempts: number;
}

interface QuizAnalyticsProps {
  stats: QuestionStat[];
  title: string;
}

export const QuizAnalytics: React.FC<QuizAnalyticsProps> = ({ stats, title }) => {
  const { t } = useTranslation();

  // Identify hardest questions (less than 50% correct)
  const hardestQuestions = stats
    .filter(s => s.correctPercentage < 50)
    .sort((a, b) => a.correctPercentage - b.correctPercentage);

  const chartConfig = {
    correctPercentage: {
      label: t("classes.analytics.correctLabel", "Correct %"),
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2 border-none shadow-2xl bg-card/50 backdrop-blur-3xl rounded-4xl overflow-hidden">
          <CardHeader className="p-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black tracking-tight">{t("classes.analytics.performanceTitle", "Question Performance")}</CardTitle>
                <CardDescription className="font-bold">{title}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-0 h-[400px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted-foreground/10" />
                  <XAxis 
                    dataKey="question" 
                    hide 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(value) => `${value}%`}
                    className="text-[10px] font-black uppercase tracking-widest fill-muted-foreground/60"
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl p-4 font-bold" />} 
                  />
                  <Bar 
                    dataKey="correctPercentage" 
                    radius={[12, 12, 0, 0]} 
                    barSize={40}
                  >
                    {stats.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.correctPercentage < 50 ? "hsl(var(--destructive))" : entry.correctPercentage > 80 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.6)"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Insights Panel */}
        <Card className="border-none shadow-2xl bg-primary/5 backdrop-blur-3xl rounded-4xl overflow-hidden border-primary/10">
          <CardHeader className="p-8">
            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              {t("classes.analytics.insights", "Critical Insights")}
            </CardTitle>
            <CardDescription className="font-bold">{t("classes.analytics.insightsDesc", "Topics needing immediate review")}</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-4">
            {hardestQuestions.length > 0 ? (
              hardestQuestions.map((q, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="p-4 rounded-2xl bg-background/50 border border-destructive/10 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {t("classes.analytics.lowPerformance", "High Failure Rate")}
                    </span>
                    <span className="text-sm font-black text-destructive">{q.correctPercentage}%</span>
                  </div>
                  <p className="text-xs font-bold leading-relaxed line-clamp-2">
                    {q.question}
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="py-12 text-center space-y-3 opacity-40">
                <CheckCircle2 className="h-12 w-12 mx-auto text-primary" />
                <p className="text-xs font-black uppercase tracking-widest">{t("classes.analytics.perfect", "Class is crushing it!")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatItem 
          icon={<CheckCircle2 className="text-emerald-500" />}
          label={t("classes.analytics.avgScore", "Average Class Score")}
          value={`${Math.round(stats.reduce((acc, s) => acc + s.correctPercentage, 0) / stats.length)}%`}
          color="emerald"
        />
        <StatItem 
          icon={<XCircle className="text-destructive" />}
          label={t("classes.analytics.hardest", "Hardest Question")}
          value={hardestQuestions[0]?.correctPercentage ? `${hardestQuestions[0].correctPercentage}%` : "N/A"}
          color="destructive"
        />
        <StatItem 
          icon={<Brain className="text-primary" />}
          label={t("classes.analytics.totalQuestions", "Total Questions")}
          value={stats.length.toString()}
          color="primary"
        />
      </div>
    </div>
  );
};

const StatItem = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: 'emerald' | 'destructive' | 'primary' }) => {
  const bgColorMap = {
    emerald: "bg-emerald-500/10",
    destructive: "bg-destructive/10",
    primary: "bg-primary/10"
  };

  return (
    <div className="p-6 rounded-4xl bg-card/50 backdrop-blur-xl border border-black/3 dark:border-white/3 flex items-center gap-4">
      <div className={cn("p-3 rounded-2xl", bgColorMap[color])}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{label}</p>
        <p className="text-2xl font-black tracking-tight">{value}</p>
      </div>
    </div>
  );
};
