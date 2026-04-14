import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart as BarChartIcon, Sparkles, TrendingUp } from "lucide-react";
import { CartesianGrid, XAxis, YAxis, BarChart, Bar, Cell } from "recharts";
import { GradeDistribution } from "@/types/dashboard";
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

interface GradeDistributionChartProps {
  data: GradeDistribution[];
  title?: string;
  description?: string;
}

const gradeConfig = {
  count: {
    label: "Students",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export const GradeDistributionChart = ({
  data,
  title = "Grade Distribution",
  description = "Overview of student performance across assignments.",
}: GradeDistributionChartProps) => {
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
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500">
                  <BarChartIcon className="h-6 w-6" />
                </div>
                {title}
              </CardTitle>
              <CardDescription className="font-medium text-muted-foreground/60">
                {description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-full px-3 py-1 font-black text-[10px] uppercase tracking-widest bg-primary/5 text-primary border-none"
              >
                <TrendingUp className="h-3 w-3 me-1.5" />
                Live Data
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="h-[350px] p-8 pt-6">
          {hasData ? (
            <ChartContainer config={gradeConfig} className="h-full w-full">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  className="fill-muted-foreground/60 text-[10px] font-black uppercase tracking-widest"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                  className="fill-muted-foreground/60 text-[10px] font-black uppercase tracking-widest"
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
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <NoChartData icon={BarChartIcon} message="No grade distribution data yet" />
          )}
        </CardContent>

        {/* Footer Stats */}
        <div className="px-8 pb-8 flex items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              Student Performance
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-ai-primary opacity-40" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              AI Analyzed
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
