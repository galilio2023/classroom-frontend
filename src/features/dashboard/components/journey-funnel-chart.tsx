import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LabelList } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useTranslation } from "react-i18next";
import { Compass, Sparkles } from "lucide-react";
import { NoChartData } from "./no-chart-data";

// 🛡️ TYPE SAFETY: Define valid journey stages as a union
type JourneyStage =
  | "onboarding"
  | "planning"
  | "learning"
  | "assessing"
  | "intervening"
  | "reporting"
  | "completed";

interface JourneyFunnelChartProps {
  data: { stage: string; count: number }[];
}

export const JourneyFunnelChart = ({ data }: JourneyFunnelChartProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  if (!data || data.length === 0) {
    return <NoChartData icon={Compass} message={t("dashboard.staff.noJourneyData")} />;
  }

  // Define logical order for stages
  const stageOrder: JourneyStage[] = [
    "onboarding",
    "planning",
    "learning",
    "assessing",
    "intervening",
    "reporting",
    "completed",
  ];

  // 🛡️ SORTING FIX: Fallback for unknown stages to prevent them floating to top
  const sortedData = [...data].sort((a, b) => {
    const indexA = stageOrder.indexOf(a.stage as JourneyStage);
    const indexB = stageOrder.indexOf(b.stage as JourneyStage);
    const orderA = indexA === -1 ? 99 : indexA;
    const orderB = indexB === -1 ? 99 : indexB;
    return orderA - orderB;
  });

  const chartConfig = {
    count: {
      label: t("dashboard.staff.studentCount"),
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  // 🛡️ MAINTAINABILITY: Colors mapped specifically to stages
  const STAGE_COLORS: Record<JourneyStage, string> = {
    onboarding: "hsl(var(--muted-foreground))",
    planning: "hsl(var(--ai-primary))",
    learning: "hsl(var(--primary))",
    assessing: "hsl(var(--orange-500))",
    intervening: "hsl(var(--destructive))",
    reporting: "hsl(var(--info))",
    completed: "hsl(var(--success))",
  };

  const getStageColor = (stage: string) =>
    STAGE_COLORS[stage as JourneyStage] || STAGE_COLORS.onboarding;

  return (
    <Card className="border-border/40 shadow-2xl overflow-hidden bg-card/50 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] group">
      <div className="h-1.5 bg-primary/10 w-full" />
      <CardHeader className="p-8 md:p-10 pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-3 text-2xl font-black tracking-tighter">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500 shadow-sm">
                <Compass className="h-6 w-6" />
              </div>
              {t("dashboard.staff.journeyFunnel")}
            </CardTitle>
            <CardDescription className="font-medium text-muted-foreground/60 text-sm md:text-base">
              {t("dashboard.staff.journeyFunnelDesc")}
            </CardDescription>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/5 border border-primary/10">
            <Sparkles className="h-4 w-4 text-ai-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">
              {t("dashboard.staff.lifecycleInsight")}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[400px] p-8 md:p-10 pt-6">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-muted-foreground/10"
            />
            <XAxis type="number" hide />
            <YAxis
              dataKey="stage"
              type="category"
              axisLine={false}
              tickLine={false}
              tickFormatter={(val: JourneyStage) => t(`dashboard.journey.stages.${val}`)}
              className="fill-muted-foreground/80 text-[10px] font-black uppercase tracking-widest"
              width={100}
              orientation={isArabic ? "right" : "left"}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--primary)/0.05)" }}
              content={
                <ChartTooltipContent className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl p-4 font-bold" />
              }
            />
            <Bar dataKey="count" radius={[0, 12, 12, 0]} barSize={40}>
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getStageColor(entry.stage)} />
              ))}
              <LabelList
                dataKey="count"
                position={isArabic ? "left" : "right"}
                className="fill-muted-foreground font-black text-xs"
                offset={10}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
