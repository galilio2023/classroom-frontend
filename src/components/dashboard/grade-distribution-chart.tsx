import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart as BarChartIcon } from "lucide-react";
import { CartesianGrid, XAxis, YAxis, BarChart, Bar } from 'recharts';
import { GradeDistribution } from "@/types/dashboard";
import { NoChartData } from "./no-chart-data";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartConfig 
} from "@/components/ui/chart";

interface GradeDistributionChartProps {
  data: GradeDistribution[];
  title?: string;
  description?: string;
}

const gradeConfig = {
  count: {
    label: "Student Count",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export const GradeDistributionChart = ({ 
  data, 
  title = "Grade Distribution", 
  description = "Overview of student performance across assignments." 
}: GradeDistributionChartProps) => {
  const hasData = data && data.length > 0;

  return (
    <Card className="border shadow-xl overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChartIcon className="h-5 w-5 text-primary" />
          </div>
          {title}
        </CardTitle>
        <CardDescription className="font-medium">{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-62.5 md:h-75 pt-6">
        {hasData ? (
          <ChartContainer config={gradeConfig} className="h-full w-full">
            <BarChart data={data} margin={{ left: -20, right: 10 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis 
                dataKey="range" 
                axisLine={false} 
                tickLine={false} 
                tickMargin={8}
                className="fill-muted-foreground font-semibold"
              />
              <YAxis axisLine={false} tickLine={false} tickMargin={8} className="fill-muted-foreground font-semibold" />
              <ChartTooltip cursor={{ fill: 'hsl(var(--primary))', opacity: 0.1 }} content={<ChartTooltipContent />} />
              <Bar 
                dataKey="count" 
                className="fill-primary"
                radius={[4, 4, 0, 0]} 
                barSize={32} 
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <NoChartData icon={BarChartIcon} message="No grade distribution data yet" />
        )}
      </CardContent>
    </Card>
  );
};
