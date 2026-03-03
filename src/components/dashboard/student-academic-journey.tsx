import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { TrendingUp, BookOpen, CheckCircle2, Clock, XCircle, LucideIcon } from "lucide-react";

interface StudentAcademicJourneyProps {
  gradeTrends: any[];
  subjectMastery: any[];
  attendanceSummary: any;
}

const NoChartData = ({ icon: Icon, message }: { icon: LucideIcon, message: string }) => (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
        <Icon className="h-10 w-10 mb-2" />
        <p className="text-sm font-bold uppercase tracking-widest">{message}</p>
    </div>
);

export const StudentAcademicJourney = ({ gradeTrends, subjectMastery, attendanceSummary }: StudentAcademicJourneyProps) => {
  // CSS Variable based colors (Rule 6 compliance)
  const primaryColor = "hsl(var(--primary))";
  const mutedColor = "hsl(var(--muted-foreground))";
  const borderColor = "hsl(var(--border))";

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Grade Trends Line Chart */}
        <Card className="border-none shadow-xl overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl font-black tracking-tight">Grade Progress</CardTitle>
            </div>
            <CardDescription className="font-medium">Your grade performance over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] pt-6">
            {gradeTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={gradeTrends} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={borderColor} opacity={0.5} />
                  <XAxis 
                    dataKey="title" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: mutedColor }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: mutedColor }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: '12px', 
                        fontSize: '12px',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                    itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px', fontWeight: 'bold' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="grade" 
                    stroke={primaryColor} 
                    strokeWidth={4} 
                    dot={{ r: 5, fill: primaryColor, strokeWidth: 2, stroke: "hsl(var(--background))" }} 
                    activeDot={{ r: 7, strokeWidth: 0 }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <NoChartData icon={TrendingUp} message="No grade data yet" />
            )}
          </CardContent>
        </Card>

        {/* Subject Mastery Radar Chart */}
        <Card className="border-none shadow-xl overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl font-black tracking-tight">Subject Mastery</CardTitle>
            </div>
            <CardDescription className="font-medium">Average performance per subject.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center justify-center pt-6">
            {subjectMastery.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectMastery}>
                  <PolarGrid stroke={borderColor} opacity={0.5} />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: mutedColor }} 
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Avg Grade"
                    dataKey="avgGrade"
                    stroke={primaryColor}
                    strokeWidth={3}
                    fill={primaryColor}
                    fillOpacity={0.3}
                    animationDuration={1500}
                  />
                  <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: '12px'
                    }}
                    itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <NoChartData icon={BookOpen} message="No graded work yet" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attendance Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-green-500/30 transition-colors group">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="p-2 bg-green-500/10 rounded-full mb-2 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <span className="text-2xl font-black text-foreground">{attendanceSummary?.present || 0}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Present</span>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-destructive/30 transition-colors group">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="p-2 bg-destructive/10 rounded-full mb-2 group-hover:scale-110 transition-transform">
                <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <span className="text-2xl font-black text-foreground">{attendanceSummary?.absent || 0}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Absent</span>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-orange-500/30 transition-colors group">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="p-2 bg-orange-500/10 rounded-full mb-2 group-hover:scale-110 transition-transform">
                <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <span className="text-2xl font-black text-foreground">{attendanceSummary?.late || 0}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Late</span>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors group">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="p-2 bg-primary/10 rounded-full mb-2 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <span className="text-2xl font-black text-foreground">
              {attendanceSummary?.total > 0 ? Math.round((attendanceSummary.present / attendanceSummary.total) * 100) : 0}%
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Attendance Rate</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
