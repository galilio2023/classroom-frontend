import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, BarChart } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from 'recharts';
import { AttendanceTrend } from "@/types/dashboard";

interface GradeDistribution {
  range: string;
  count: number;
}

interface EngagementChartProps {
  attendanceData: AttendanceTrend[];
  gradeData?: GradeDistribution[];
}

export const EngagementChart = ({ attendanceData, gradeData }: EngagementChartProps) => {
    // Robust color handling for Recharts
    const primaryColor = "#6366f1"; // Indigo-500 (Standard Primary)
    const gridColor = "rgba(156, 163, 175, 0.2)"; // Muted gray with opacity

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-xl overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                        Engagement Overview
                    </CardTitle>
                    <CardDescription className="font-medium">Class attendance trends for the last 7 days.</CardDescription>
                </CardHeader>
                <CardContent className="h-62.5 md:h-75 pt-6">
                    {attendanceData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={attendanceData}>
                                <defs>
                                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#888888' }}
                                    tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { weekday: 'short' })}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#888888' }} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                                        border: 'none', 
                                        borderRadius: '12px', 
                                        fontSize: '12px',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)'
                                    }}
                                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                    labelStyle={{ color: '#aaa', marginBottom: '4px', fontWeight: 'bold' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="present" 
                                    stroke={primaryColor} 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#colorPresent)" 
                                    animationDuration={1500}
                                />
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
                <Card className="border-none shadow-xl overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <BarChart className="h-5 w-5 text-primary" />
                            </div>
                            Grade Distribution
                        </CardTitle>
                        <CardDescription className="font-medium">Overview of student performance across assignments.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-62.5 md:h-75 pt-6">
                        {gradeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart data={gradeData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                    <XAxis 
                                        dataKey="range" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#888888' }}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#888888' }} />
                                    <Tooltip 
                                        cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                                        contentStyle={{ 
                                            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                                            border: 'none', 
                                            borderRadius: '12px', 
                                            fontSize: '12px',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)'
                                        }}
                                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                        labelStyle={{ color: '#aaa', marginBottom: '4px', fontWeight: 'bold' }}
                                    />
                                    <Bar 
                                        dataKey="count" 
                                        fill={primaryColor} 
                                        radius={[6, 6, 0, 0]} 
                                        barSize={40} 
                                        animationDuration={1500}
                                    />
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
};
