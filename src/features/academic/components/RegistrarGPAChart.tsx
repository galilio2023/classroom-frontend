import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface RegistrarGPAChartProps {
  data: Array<{ range: string; count: number }>;
}

const chartConfig = {
  count: {
    label: "Students",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export const RegistrarGPAChart: React.FC<RegistrarGPAChartProps> = ({ data }) => {
  const hasData = data && data.length > 0;

  return (
    <Card className="md:col-span-2 rounded-[2.5rem] border-border/40 shadow-2xl p-8">
      <CardHeader className="px-0 pt-0 pb-8">
        <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-primary" />
          GPA Distribution (Bell Curve)
        </CardTitle>
        <CardDescription className="font-medium italic">
          Student density across 4.0 academic scale.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {hasData ? (
          <div className="h-[350px] w-full">
            <ChartContainer config={chartConfig}>
              <BarChart data={data}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis
                  dataKey="range"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 900, fill: "rgba(0,0,0,0.4)" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 900, fill: "rgba(0,0,0,0.4)" }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} fill="var(--color-count)">
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.count > 10 ? "hsl(var(--ai-primary))" : "hsl(var(--primary) / 0.1)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        ) : (
          <div className="h-[350px] w-full flex flex-col items-center justify-center text-muted-foreground/20">
            <BarChart3 className="h-16 w-16 mb-4" />
            <p className="font-black uppercase tracking-[0.2em] text-[10px]">
              Waiting for GPA Data
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
