import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { TrendingUp, BookOpen, CheckCircle2, Clock, XCircle, Target, Trophy, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PracticeModal } from "@/components/practice/practice-modal";
import { NoChartData } from "./no-chart-data";
import { AttendanceStatCard } from "./attendance-stat-card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartConfig 
} from "@/components/ui/chart";
import { useNavigation } from "@refinedev/core";

interface StudentAcademicJourneyProps {
  gradeTrends: any[];
  subjectMastery: any[];
  attendanceSummary: any;
}

const gradeConfig = {
  grade: {
    label: "Grade",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const masteryConfig = {
  avgGrade: {
    label: "Average Grade",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export const StudentAcademicJourney = ({ gradeTrends, subjectMastery, attendanceSummary }: StudentAcademicJourneyProps) => {
  const [practiceTopic, setPracticeTopic] = useState<string | null>(null);
  const [practiceSubjectId, setPracticeSubjectId] = useState<number | null>(null);
  const { list } = useNavigation();

  const weakSubjects = subjectMastery.filter(s => s.avgGrade < 70);
  const hasData = gradeTrends.length > 0 || subjectMastery.length > 0 || (attendanceSummary?.total || 0) > 0;

  // Attendance Rate: (Present + Late) / Total
  const attendedCount = (attendanceSummary?.present || 0) + (attendanceSummary?.late || 0);
  const attendanceRate = attendanceSummary?.total > 0 
    ? Math.round((attendedCount / attendanceSummary.total) * 100) 
    : 0;

  return (
    <div className="space-y-8">
      {/* 1. Onboarding / Welcome State for New Students */}
      {!hasData && (
        <Card className="border-2 border-dashed border-primary/20 bg-primary/5 shadow-none">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-4">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to Your Learning Journey!</CardTitle>
            <CardDescription className="text-base max-w-md mx-auto">
              You haven't started any classes or assignments yet. Your academic progress, 
              subject mastery, and attendance will appear here once you begin.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button 
              onClick={() => list("classes")}
              className="gap-2"
              size="lg"
            >
              Explore Your Classes
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 2. AI Intervention / Practice Suggestion */}
      {weakSubjects.length > 0 && (
        <Card className="border-l-4 border-l-orange-500 bg-orange-500/5 shadow-md animate-in fade-in slide-in-from-top-4 duration-500">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg font-bold text-orange-700">Focus Area Identified</CardTitle>
            </div>
            <CardDescription className="text-orange-600/80">
              We noticed you might be struggling with <strong>{weakSubjects[0].subject}</strong>. 
              Practice now to earn a mastery badge and boost your grade!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => {
                setPracticeTopic(weakSubjects[0].subject);
                setPracticeSubjectId(weakSubjects[0].subjectId); 
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
            >
              <Trophy className="h-4 w-4" />
              Practice & Level Up
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 3. Performance Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border shadow-xl overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
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
              <ChartContainer config={gradeConfig} className="h-full w-full">
                <LineChart data={gradeTrends} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis 
                    dataKey="title" 
                    axisLine={false} 
                    tickLine={false} 
                    tickMargin={8}
                    className="fill-muted-foreground font-semibold"
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    axisLine={false} 
                    tickLine={false} 
                    tickMargin={8}
                    className="fill-muted-foreground font-semibold"
                  />
                  <ChartTooltip cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }} content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="grade" 
                    className="stroke-primary"
                    strokeWidth={3} 
                    dot={{ r: 4, className: "fill-primary stroke-background", strokeWidth: 2 }} 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <NoChartData icon={TrendingUp} message="No grade data yet. Complete assignments to see your progress!" />
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-xl overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
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
              <ChartContainer config={masteryConfig} className="h-full w-full">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectMastery}>
                  <PolarGrid className="stroke-border/50" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    className="fill-muted-foreground font-semibold text-[10px]"
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Avg Grade"
                    dataKey="avgGrade"
                    className="stroke-primary fill-primary"
                    strokeWidth={2}
                    fillOpacity={0.2}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RadarChart>
              </ChartContainer>
            ) : (
              <NoChartData icon={BookOpen} message="No subject data yet. Your mastery radar will appear here." />
            )}
          </CardContent>
        </Card>
      </div>

      {/* 4. Attendance Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <AttendanceStatCard 
          icon={CheckCircle2} 
          value={attendanceSummary?.present || 0} 
          label="Present" 
          colorClass="bg-green-500/10 text-green-500" 
          hoverBorderClass="hover:border-green-500/30" 
        />
        <AttendanceStatCard 
          icon={XCircle} 
          value={attendanceSummary?.absent || 0} 
          label="Absent" 
          colorClass="bg-destructive/10 text-destructive" 
          hoverBorderClass="hover:border-destructive/30" 
        />
        <AttendanceStatCard 
          icon={Clock} 
          value={attendanceSummary?.late || 0} 
          label="Late" 
          colorClass="bg-orange-500/10 text-orange-500" 
          hoverBorderClass="hover:border-orange-500/30" 
        />
        <AttendanceStatCard 
          icon={TrendingUp} 
          value={`${attendanceRate}%`}
          label="Attendance Rate" 
          colorClass="bg-primary/10 text-primary" 
          hoverBorderClass="hover:border-primary/30" 
        />
      </div>

      {practiceTopic && (
        <PracticeModal 
          topic={practiceTopic} 
          subjectId={practiceSubjectId}
          onClose={() => setPracticeTopic(null)} 
        />
      )}
    </div>
  );
};
