import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AttendanceTrend {
  date: string;
  present: number;
}

interface EngagementChartProps {
  data: AttendanceTrend[];
}

export const EngagementChart = ({ data }: EngagementChartProps) => (
    <Card className="border-none shadow-xl overflow-hidden bg-white/50 dark:bg-black/20 backdrop-blur-xl">
        <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl font-black">
                <TrendingUp className="h-5 w-5 text-primary" />
                Engagement Overview
            </CardTitle>
            <CardDescription>Class attendance trends for the last 7 days.</CardDescription>
        </CardHeader>
        <CardContent className="h-62.5 md:h-75 pt-6">
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 'bold' }}
                            tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { weekday: 'short' })}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="present" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorPresent)" />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                    <TrendingUp className="h-10 w-10 mb-2" />
                    <p className="text-sm font-bold">No attendance data yet</p>
                </div>
            )}
        </CardContent>
    </Card>
);
