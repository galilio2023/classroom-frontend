import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Sparkles, Activity } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart as RechartsBarChart,
  Bar,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { AttendanceTrend } from "@/types/dashboard";
import { NoChartData } from "./no-chart-data";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface GradeDistribution {
  range: string;
  count: number;
}

interface EngagementChartProps {
  attendanceData: AttendanceTrend[];
  gradeData?: GradeDistribution[];
}

const ChartCard = React.memo(
  ({
    title,
    description,
    icon: Icon,
    children,
    hasData,
    delay = 0,
  }: {
    title: string;
    description: string;
    icon: any;
    children: React.ReactNode;
    hasData: boolean;
    delay?: number;
  }) => {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === "ar";

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="h-full"
      >
        <Card className="h-full border-none shadow-2xl overflow-hidden bg-card/50 backdrop-blur-xl rounded-4xl md:rounded-[2.5rem] group">
          {/* Top Accent Bar */}
          <div className="h-1.5 bg-linear-to-r from-primary via-ai-primary to-primary w-full opacity-20 group-hover:opacity-100 transition-opacity duration-500" />

          <CardHeader className="p-6 md:p-8 pb-2 text-start">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle
                  className={cn(
                    "flex items-center gap-3 text-xl md:text-2xl tracking-tighter",
                    isArabic ? "font-bold" : "font-black"
                  )}
                >
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500">
                    <Icon className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  {title}
                </CardTitle>
                <CardDescription className="font-medium text-muted-foreground/60 text-sm">
                  {description}
                </CardDescription>
              </div>
              <Badge
                variant="secondary"
                className="rounded-full px-3 py-1 font-black text-[9px] md:text-[10px] uppercase tracking-widest bg-primary/5 text-primary border-none w-fit"
              >
                {t("dashboard.charts.last7Days")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[250px] md:h-[300px] p-4 md:p-8 pt-6">
            {hasData ? (
              children
            ) : (
              <NoChartData
                icon={Icon}
                message={t("dashboard.charts.noData", {
                  title: title.toLowerCase(),
                })}
              />
            )}
          </CardContent>

          {/* Footer Stats */}
          <div className="px-6 md:px-8 pb-6 md:pb-8 flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                {t("dashboard.charts.activeEngagement")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-ai-primary opacity-30" />
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                {t("dashboard.charts.aiInsights")}
              </span>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }
);

export const EngagementChart = React.memo(
  ({ attendanceData, gradeData }: EngagementChartProps) => {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === "ar";

    const attendanceConfig = {
      present: {
        label: t("dashboard.charts.attendance.students"),
        color: "hsl(var(--primary))",
      },
    } satisfies ChartConfig;

    const gradeConfig = {
      count: {
        label: t("dashboard.charts.grades.students"),
        color: "hsl(var(--primary))",
      },
    } satisfies ChartConfig;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        <ChartCard
          title={t("dashboard.charts.attendance.title")}
          description={t("dashboard.charts.attendance.description")}
          icon={Activity}
          hasData={attendanceData.length > 0}
          delay={0.1}
        >
          <ChartContainer config={attendanceConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={attendanceData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  className="stroke-muted-foreground/10"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                  className="fill-muted-foreground/60 text-[8px] md:text-[10px] font-black uppercase tracking-widest"
                  tickFormatter={(str) => {
                    try {
                      return new Date(str).toLocaleDateString(
                        i18n.language === "ar" ? "ar-EG" : "en-US",
                        { weekday: "short" }
                      );
                    } catch {
                      return str;
                    }
                  }}
                  reversed={isArabic}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                  className="fill-muted-foreground/60 text-[8px] md:text-[10px] font-black uppercase tracking-widest"
                  orientation={isArabic ? "right" : "left"}
                  tickFormatter={(val) =>
                    new Intl.NumberFormat(isArabic ? "ar-EG" : "en-US").format(val)
                  }
                />
                <ChartTooltip
                  cursor={{
                    stroke: "hsl(var(--primary))",
                    strokeWidth: 2,
                    strokeDasharray: "4 4",
                  }}
                  content={
                    <ChartTooltipContent className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl p-4 font-bold" />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="present"
                  stroke="hsl(var(--primary))"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#fillPresent)"
                  animationDuration={2000}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        {gradeData && (
          <ChartCard
            title={t("dashboard.charts.grades.title")}
            description={t("dashboard.charts.grades.description")}
            icon={BarChart}
            hasData={gradeData.length > 0}
            delay={0.2}
          >
            <ChartContainer config={gradeConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={gradeData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    className="stroke-muted-foreground/10"
                  />
                  <XAxis
                    dataKey="range"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={12}
                    className="fill-muted-foreground/60 text-[8px] md:text-[10px] font-black uppercase tracking-widest"
                    reversed={isArabic}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickMargin={12}
                    className="fill-muted-foreground/60 text-[8px] md:text-[10px] font-black uppercase tracking-widest"
                    orientation={isArabic ? "right" : "left"}
                    tickFormatter={(val) =>
                      new Intl.NumberFormat(isArabic ? "ar-EG" : "en-US").format(val)
                    }
                  />
                  <ChartTooltip
                    cursor={{
                      fill: "hsl(var(--primary))",
                      opacity: 0.05,
                      radius: 8,
                    }}
                    content={
                      <ChartTooltipContent className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl p-4 font-bold" />
                    }
                  />
                  <Bar
                    dataKey="count"
                    fill="url(#barGradient)"
                    radius={[8, 8, 0, 0]}
                    barSize={40}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  >
                    {gradeData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartCard>
        )}
      </div>
    );
  },
  (prev, next) => {
    // 🚀 PERFORMANCE: Only re-render if data lengths change or content changed
    return (
      prev.attendanceData.length === next.attendanceData.length &&
      prev.gradeData?.length === next.gradeData?.length &&
      JSON.stringify(prev.attendanceData) === JSON.stringify(next.attendanceData) &&
      JSON.stringify(prev.gradeData) === JSON.stringify(next.gradeData)
    );
  }
);
