import { StudentAcademicJourney } from "./student-academic-journey";
import { UpcomingAssignmentsList } from "./upcoming-assignments-list";
import { RecentActivity } from "./recent-activity";
import { ErrorBoundary } from "@/components/error-boundary";
import { DashboardData } from "@/types/dashboard";
import { StatsSkeleton } from "./dashboard-skeletons";
import { useGetIdentity } from "@refinedev/core";
import { User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Star, Zap, Sparkles, History, TrendingUp, Flame } from "lucide-react";
import { XPProgressBar } from "@/components/xp-progress-bar";
import { getLevelProgress } from "@/lib/xp";
import { StudentOnboarding } from "./student-onboarding";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface StudentDashboardProps {
  data: DashboardData;
  isLoading?: boolean;
  list: (resource: string) => void;
  show: (resource: string, id: string | number) => void;
}

export const StudentDashboard = ({ data, isLoading, list, show }: StudentDashboardProps) => {
  const { data: identity } = useGetIdentity<User>();

  const currentXP = identity?.xp || 0;
  const { currentLevel, xpRequiredForNextLevel, xpInCurrentLevel } = getLevelProgress(currentXP);
  const xpNeeded = xpRequiredForNextLevel - xpInCurrentLevel;

  const hasClasses = (identity?.enrollments?.length || 0) > 0;
  const currentStreak = identity?.currentStreak || 0;

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
    <div className="space-y-16">
      {!hasClasses && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <StudentOnboarding />
        </motion.div>
      )}

      {/* Premium Gamification Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <Card className="border-none bg-gradient-to-br from-primary via-ai-primary to-ai-secondary text-white shadow-2xl overflow-hidden relative rounded-[2.5rem] group">
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-[80px] -ml-16 -mb-16 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shine_3s_infinite] pointer-events-none" />
          
          <CardContent className="p-8 md:p-12 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl animate-pulse" />
                <div className="w-28 h-24 md:w-32 md:h-32 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-xl border-2 border-white/30 shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-500">
                  <Trophy className="h-12 w-12 md:h-16 md:w-16 text-gold-primary drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                </div>
                <motion.div 
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute -bottom-2 -right-2 bg-gold-primary text-white font-black text-xs md:text-sm px-3 py-1.5 rounded-full border-4 border-white shadow-xl z-20"
                >
                  LVL {currentLevel}
                </motion.div>
              </div>
              
              <div className="flex-1 w-full space-y-6 text-center md:text-left">
                <div className="space-y-2">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <Badge variant="secondary" className="bg-white/20 text-white border-none backdrop-blur-md font-black text-[10px] uppercase tracking-widest px-3 py-1">
                      Academic Journey
                    </Badge>
                    {currentStreak >= 3 && (
                      <div className="flex items-center gap-1 text-orange-400 animate-bounce">
                        <Flame className="h-3 w-3 fill-orange-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">On Fire!</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-gold-primary animate-pulse">
                      <Sparkles className="h-3 w-3 fill-gold-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Elite Student</span>
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-none">Keep it up, {identity?.name?.split(' ')[0] || "Student"}!</h2>
                  <p className="text-white/70 text-sm md:text-lg font-medium flex items-center justify-center md:justify-start gap-2">
                    <Zap className="h-5 w-5 text-gold-primary fill-gold-primary" />
                    You are <span className="text-white font-black">{Math.round(xpNeeded)} XP</span> away from Level {currentLevel + 1}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <XPProgressBar 
                    xp={currentXP} 
                    showLabel={false}
                    className="h-4 rounded-full bg-white/10 border border-white/10 p-1" 
                    indicatorClassName="bg-gradient-to-r from-gold-primary via-yellow-400 to-gold-secondary shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                  />
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                    <span>Level {currentLevel}</span>
                    <span className="text-white/60">{Math.floor(xpInCurrentLevel)} / {xpRequiredForNextLevel} XP</span>
                    <span>Level {currentLevel + 1}</span>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex flex-col gap-4">
                 <motion.div 
                   whileHover={{ x: -5 }}
                   className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/10 flex items-center gap-4 shadow-xl"
                 >
                    <div className="p-3 rounded-xl bg-orange-500/20 text-orange-400 shadow-inner">
                      <Flame className="h-6 w-6 fill-orange-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Daily Streak</p>
                      <p className="text-xl font-black text-white">{currentStreak} Days</p>
                    </div>
                 </motion.div>
                 <motion.div 
                   whileHover={{ x: -5 }}
                   className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/10 flex items-center gap-4 shadow-xl"
                 >
                    <div className="p-3 rounded-2xl bg-success/20 text-success shadow-inner">
                      <Star className="h-6 w-6 fill-success" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Next Reward</p>
                      <p className="text-sm font-black text-white">Profile Badge</p>
                    </div>
                 </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-12 lg:grid-cols-12 items-start">
        {/* Main Content Column */}
        <div className="lg:col-span-8 space-y-16">
          <ErrorBoundary>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-8 px-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Academic Journey</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
              </div>
              <StudentAcademicJourney 
                gradeTrends={data.gradeTrends ?? []} 
                subjectMastery={data.subjectMastery ?? []} 
                attendanceSummary={data.attendanceSummary ?? { present: 0, absent: 0, late: 0, total: 0 }} 
              />
            </motion.div>
          </ErrorBoundary>

          <ErrorBoundary>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <UpcomingAssignmentsList 
                assignments={data.upcomingAssignments ?? []} 
                list={list} 
                show={show} 
              />
            </motion.div>
          </ErrorBoundary>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-16">
          <ErrorBoundary>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-8 px-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <History className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-black tracking-tight">Recent Activity</h2>
              </div>
              <RecentActivity limit={5} />
            </motion.div>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};
