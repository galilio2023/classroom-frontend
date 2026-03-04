import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, BarChart } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from 'recharts';
import { AttendanceTrend } from "@/types/dashboard";
import { NoChartData } from "./no-chart-data";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartConfig 
} from "@/components/ui/chart";

interface GradeDistribution {
  range: string;
  count: number;
}

interface EngagementChartProps {
  attendanceData: AttendanceTrend[];
  gradeData?: GradeDistribution[];
}

const attendanceConfig = {
  present: {
    label: "Present Students",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const gradeConfig = {
  count: {
    label: "Student Count",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const ChartCard = ({ 
  title, 
  description, 
  icon: Icon, 
  children, 
  hasData 
}: { 
  title: string; 
  description: string; 
  icon: any; 
  children: React.ReactNode; 
  hasData: boolean;
}) => (
  <Card className="border shadow-xl overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
    <CardHeader className="pb-2">
      <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {title}
      </CardTitle>
      <CardDescription className="font-medium">{description}</CardDescription>
    </CardHeader>
    <CardContent className="h-62.5 md:h-75 pt-6">
      {hasData ? children : <NoChartData icon={Icon} message={`No ${title.toLowerCase()} data yet`} />}
    </CardContent>
  </Card>
);

export const EngagementChart = ({ attendanceData, gradeData }: EngagementChartProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard 
                title="Engagement Overview" 
                description="Class attendance trends for the last 7 days." 
                icon={TrendingUp}
                hasData={attendanceData.length > 0}
            >
                <ChartContainer config={attendanceConfig} className="h-full w-full">
                    <AreaChart data={attendanceData} margin={{ left: -20, right: 10 }}>
                        <defs>
                            <linearGradient id="fillPresent" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tickMargin={8}
                            className="fill-muted-foreground font-semibold"
                            tickFormatter={(str) => {
                                try {
                                    return new Date(str).toLocaleDateString('en-US', { weekday: 'short' });
                                } catch {
                                    return str;
                                }
                            }}
                        />
                        <YAxis axisLine={false} tickLine={false} tickMargin={8} className="fill-muted-foreground font-semibold" />
                        <ChartTooltip cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }} content={<ChartTooltipContent />} />
                        <Area 
                            type="monotone" 
                            dataKey="present" 
                            className="stroke-primary fill-primary"
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#fillPresent)" 
                        />
                    </AreaChart>
                </ChartContainer>
            </ChartCard>

            {gradeData && (
                <ChartCard 
                    title="Grade Distribution" 
                    description="Overview of student performance across assignments." 
                    icon={BarChart}
                    hasData={gradeData.length > 0}
                >
                    <ChartContainer config={gradeConfig} className="h-full w-full">
                        <RechartsBarChart data={gradeData} margin={{ left: -20, right: 10 }}>
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
                        </RechartsBarChart>
                    </ChartContainer>
                </ChartCard>
            )}
        </div>
    );
};
