import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, TrendingUp, Zap, Target } from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  // //   Tooltip,
  // //   ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  ComposedChart,
} from "recharts";
import { RLHFDataPoint } from "@/types/dashboard";
import { NoChartData } from "./no-chart-data";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import {} from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface RLHFAlignmentChartProps {
  data: RLHFDataPoint[];
  title?: string;
  description?: string;
}

const rlhfConfig = {
  avgAdjustmentGap: {
    label: "Adjustment Gap (pts)",
    color: "hsl(var(--primary))",
  },
  acceptanceRate: {
    label: "AI Acceptance Rate (%)",
    color: "hsl(var(--ai-primary))",
  },
} satisfies ChartConfig;

export const RLHFAlignmentChart = ({
  data,
  title = "AI Alignment (RLHF)",
  description = "Tracking the gap between AI suggestions and teacher grades.",
}: RLHFAlignmentChartProps) => {
  const { t } = useTranslation();
  const hasData = data && data.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-none shadow-2xl overflow-hidden bg-card/50 backdrop-blur-xl rounded-4xl group">
        {/* Top Accent Bar */}
        <div className="h-1.5 bg-linear-to-r from-primary via-ai-primary to-primary w-full opacity-20 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="p-8 pb-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-3 text-2xl font-black tracking-tighter">
                <div className="p-2.5 rounded-xl bg-ai-primary/10 text-ai-primary group-hover:rotate-12 transition-transform duration-500">
                  <Target className="h-6 w-6" />
                </div>
                {title}
              </CardTitle>
              <CardDescription className="font-medium text-muted-foreground/60">
                {description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-full px-3 py-1 font-black text-[10px] uppercase tracking-widest bg-ai-primary/5 text-ai-primary border-ai-primary/20"
              >
                <Sparkles className="h-3 w-3 me-1.5" />
                RLHF Enabled
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="h-[400px] p-8 pt-6">
          {hasData ? (
            <ChartContainer config={rlhfConfig} className="h-full w-full">
              <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gapGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--ai-primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--ai-primary))" stopOpacity={0} />
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
                  className="fill-muted-foreground/60 text-[10px] font-black uppercase tracking-widest"
                  tickFormatter={(val) =>
                    new Date(val).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                  }
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                  className="fill-muted-foreground/60 text-[10px] font-black uppercase tracking-widest"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                  className="fill-muted-foreground/60 text-[10px] font-black uppercase tracking-widest"
                  domain={[0, 100]}
                />
                <ChartTooltip
                  cursor={{
                    stroke: "hsl(var(--ai-primary))",
                    strokeWidth: 2,
                    strokeDasharray: "4 4",
                  }}
                  content={
                    <ChartTooltipContent className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl p-4 font-bold" />
                  }
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="acceptanceRate"
                  fill="url(#rateGradient)"
                  stroke="hsl(var(--ai-primary))"
                  strokeWidth={3}
                  animationDuration={2000}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="avgAdjustmentGap"
                  stroke="hsl(var(--primary))"
                  strokeWidth={4}
                  dot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </ComposedChart>
            </ChartContainer>
          ) : (
            <NoChartData
              icon={Zap}
              message="No RLHF data available yet. Start grading to see alignment trends."
            />
          )}
        </CardContent>

        {/* Legend / Stats */}
        <div className="px-8 pb-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 rounded-full bg-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Adjustment Gap
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-ai-primary/30 border border-ai-primary/50" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Acceptance Rate
              </span>
            </div>
          </div>

          {hasData && (
            <div className="flex items-center gap-2 text-primary font-black text-xs">
              <TrendingUp className="h-4 w-4" />
              <span>{Math.round(data[data.length - 1].acceptanceRate)}% Confidence</span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
