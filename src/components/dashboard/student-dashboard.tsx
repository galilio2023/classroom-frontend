import { StudentAcademicJourney } from "./student-academic-journey";
import { UpcomingAssignmentsList } from "./upcoming-assignments-list";
import { RecentActivity } from "./recent-activity";
import { ErrorBoundary } from "@/components/error-boundary";
import { DashboardData } from "@/types/dashboard";
import { StatsSkeleton } from "./dashboard-skeletons";
import { useGetIdentity } from "@refinedev/core";
import { User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Zap } from "lucide-react";

interface StudentDashboardProps {
  data: DashboardData;
  isLoading?: boolean;
  list: (resource: string) => void;
  show: (resource: string, id: string | number) => void;
}

export const StudentDashboard = ({ data, isLoading, list, show }: StudentDashboardProps) => {
  const { data: identity } = useGetIdentity<User>();

  // Calculate Level Progress
  // Formula inverse: XP needed for next level = ((Level)^2) * 100
  const currentLevel = identity?.level || 1;
  const currentXP = identity?.xp || 0;
  
  const xpForCurrentLevel = Math.pow(currentLevel - 1, 2) * 100;
  const xpForNextLevel = Math.pow(currentLevel, 2) * 100;
  
  const xpProgress = currentXP - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = Math.min(100, Math.max(0, (xpProgress / xpNeeded) * 100));

  // Use isLoading to show a skeleton while analytics are fetching in the background
  if (isLoading && (!data.gradeTrends || data.gradeTrends.length === 0)) {
    return (
      <div className="space-y-12">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-12">
            <StatsSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Gamification Banner */}
      <Card className="border-none bg-gradient-to-r from-ai-primary to-ai-secondary text-ai-primary-foreground shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <CardContent className="p-6 sm:p-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                <Trophy className="h-10 w-10 text-gold-primary drop-shadow-md" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gold-primary text-white font-black text-xs px-2 py-1 rounded-full border-2 border-white shadow-sm">
                LVL {currentLevel}
              </div>
            </div>
            
            <div className="flex-1 w-full space-y-3 text-center sm:text-left">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Keep it up, {identity?.name?.split(' ')[0]}!</h2>
                <p className="text-white/80 text-sm font-medium flex items-center justify-center sm:justify-start gap-2">
                  <Zap className="h-4 w-4 text-gold-primary" />
                  You are {Math.round(xpNeeded - xpProgress)} XP away from Level {currentLevel + 1}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/60">
                  <span>Level {currentLevel}</span>
                  <span>{currentXP} / {xpForNextLevel} XP</span>
                </div>
                <Progress value={progressPercentage} className="h-3 bg-black/20" indicatorClassName="bg-gradient-to-r from-gold-primary to-gold-secondary" />
              </div>
            </div>

            <div className="hidden md:flex flex-col gap-2">
               <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center gap-3">
                  <div className="p-2 bg-success/20 rounded-lg">
                    <Star className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Next Reward</p>
                    <p className="text-[10px] text-white/80">Profile Badge</p>
                  </div>
               </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-12">
          <ErrorBoundary>
            <StudentAcademicJourney 
              gradeTrends={data.gradeTrends ?? []} 
              subjectMastery={data.subjectMastery ?? []} 
              attendanceSummary={data.attendanceSummary ?? { present: 0, absent: 0, late: 0, total: 0 }} 
            />
          </ErrorBoundary>

          <ErrorBoundary>
            <UpcomingAssignmentsList 
              assignments={data.upcomingAssignments ?? []} 
              list={list} 
              show={show} 
            />
          </ErrorBoundary>
        </div>

        <div className="space-y-10">
          <ErrorBoundary>
            <RecentActivity limit={5} />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};
