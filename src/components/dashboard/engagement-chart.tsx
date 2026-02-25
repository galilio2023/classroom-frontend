import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, BarChart } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, Legend } from 'recharts';
import { AttendanceTrend } from "@/types/dashboard";

interface GradeDistribution {
  range: string;
  count: number;
}

interface EngagementChartProps {
  attendanceData: AttendanceTrend[];
  gradeData?: GradeDistribution[];
}

export const EngagementChart = ({ attendanceData, gradeData }: EngagementChartProps) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-xl overflow-hidden bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl font-black">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Engagement Overview
                </CardTitle>
                <CardDescription>Class attendance trends for the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent className="h-62.5 md:h-75 pt-6">
                {attendanceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={attendanceData}>
                            <defs>
                                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fontWeight: 'bold', fill: 'currentColor' }}
                                tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { weekday: 'short' })}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: 'currentColor' }} />
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

        {gradeData && (
            <Card className="border-none shadow-xl overflow-hidden bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-xl font-black">
                        <BarChart className="h-5 w-5 text-primary" />
                        Grade Distribution
                    </CardTitle>
                    <CardDescription>Overview of student performance across assignments.</CardDescription>
                </CardHeader>
                <CardContent className="h-62.5 md:h-75 pt-6">
                    {gradeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={gradeData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis 
                                    dataKey="range" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fontWeight: 'bold', fill: 'currentColor' }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: 'currentColor' }} />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                            <BarChart className="h-10 w-10 mb-2" />
                            <p className="text-sm font-bold">No grade data yet</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        )}
    </div>
);
