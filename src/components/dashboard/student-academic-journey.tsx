import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, BookOpen, CheckCircle2, Clock, XCircle } from "lucide-react";

interface StudentAcademicJourneyProps {
  gradeTrends: any[];
  subjectMastery: any[];
  attendanceSummary: any;
}

export const StudentAcademicJourney = ({ gradeTrends, subjectMastery, attendanceSummary }: StudentAcademicJourneyProps) => {
  const COLORS = ["#10b981", "#f43f5e", "#f59e0b"];
  
  const attendanceData = [
    { name: "Present", value: attendanceSummary?.present || 0 },
    { name: "Absent", value: attendanceSummary?.absent || 0 },
    { name: "Late", value: attendanceSummary?.late || 0 },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Grade Trends Line Chart */}
        <Card className="border-primary/10 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Grade Progress</CardTitle>
            </div>
            <CardDescription>Your performance over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gradeTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="title" hide />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "hsl(var(--background))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                  itemStyle={{ color: "hsl(var(--primary))" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="grade" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: "hsl(var(--primary))" }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Mastery Radar Chart */}
        <Card className="border-primary/10 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Subject Mastery</CardTitle>
            </div>
            <CardDescription>Average performance per subject.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center justify-center">
            {subjectMastery.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectMastery}>
                  <PolarGrid stroke="rgba(0,0,0,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Avg Grade"
                    dataKey="avgGrade"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">No graded work yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attendance Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 mb-2" />
            <span className="text-2xl font-black text-emerald-600">{attendanceSummary?.present || 0}</span>
            <span className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest">Present</span>
          </CardContent>
        </Card>
        <Card className="bg-rose-500/5 border-rose-500/20">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <XCircle className="h-5 w-5 text-rose-500 mb-2" />
            <span className="text-2xl font-black text-rose-600">{attendanceSummary?.absent || 0}</span>
            <span className="text-[10px] font-bold text-rose-600/70 uppercase tracking-widest">Absent</span>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Clock className="h-5 w-5 text-amber-500 mb-2" />
            <span className="text-2xl font-black text-amber-600">{attendanceSummary?.late || 0}</span>
            <span className="text-[10px] font-bold text-amber-600/70 uppercase tracking-widest">Late</span>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <TrendingUp className="h-5 w-5 text-primary mb-2" />
            <span className="text-2xl font-black text-primary">
              {attendanceSummary?.total > 0 ? Math.round((attendanceSummary.present / attendanceSummary.total) * 100) : 0}%
            </span>
            <span className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">Attendance Rate</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
