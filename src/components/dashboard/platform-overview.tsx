import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, Users, RefreshCw, LayoutGrid, FileText, ShieldAlert, LayoutDashboard, Sparkles, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardStats } from "@/types/dashboard";
import { StatCard } from "./stat-card";
import { useNavigation } from "@refinedev/core";
import { motion, AnimatePresence } from "framer-motion";

interface PlatformOverviewProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
  onRefresh: () => void;
}

export const PlatformOverview = ({ stats, isLoading, onRefresh }: PlatformOverviewProps) => {
    const { list } = useNavigation();
    const showSkeletons = isLoading && !stats;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <LayoutDashboard className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Platform Overview</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-xl hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all" 
                  onClick={onRefresh} 
                  disabled={isLoading}
                >
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                </Button>
            </div>
            
            {!showSkeletons && stats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                    <AnimatePresence mode="popLayout">
                      {stats.pendingVerifications !== undefined && stats.pendingVerifications > 0 && (
                          <motion.div 
                              key="pending"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="cursor-pointer group"
                              onClick={() => list("users")}
                          >
                              <StatCard 
                                  label="Pending Verifications" 
                                  value={stats.pendingVerifications} 
                                  icon={ShieldAlert} 
                                  color="text-amber-500" 
                                  className="border-2 border-amber-500/20 bg-amber-500/[0.02] shadow-amber-500/5"
                                  trend={{ value: 100, isUp: true }}
                              />
                          </motion.div>
                      )}
                      
                      <motion.div
                        key="total-users"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                      >
                        <StatCard 
                            label="Total Users" 
                            value={stats.totalUsers} 
                            icon={UserCheck} 
                            color="text-primary" 
                        />
                      </motion.div>

                      <motion.div
                        key="students"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <StatCard 
                            label="Total Students" 
                            value={stats.totalStudents} 
                            icon={GraduationCap} 
                            color="text-blue-500" 
                        />
                      </motion.div>

                      <motion.div
                        key="teachers"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <StatCard 
                            label="Total Teachers" 
                            value={stats.totalTeachers} 
                            icon={Users} 
                            color="text-green-500" 
                        />
                      </motion.div>

                      <motion.div
                        key="classes"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <StatCard 
                            label="Total Classes" 
                            value={stats.totalClasses} 
                            icon={LayoutGrid} 
                            color="text-purple-500" 
                        />
                      </motion.div>

                      <motion.div
                        key="assignments"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <StatCard 
                            label="Total Assignments" 
                            value={stats.totalAssignments} 
                            icon={FileText} 
                            color="text-orange-500" 
                        />
                      </motion.div>
                    </AnimatePresence>
                </div>
            ) : (
                <div className="space-y-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="p-8 rounded-[2rem] bg-muted/20 border border-black/[0.03] dark:border-white/[0.03] space-y-4">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-12 w-12 rounded-2xl" />
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-24 rounded-full" />
                          <Skeleton className="h-8 w-16 rounded-full" />
                        </div>
                      </div>
                    ))}
                </div>
            )}
        </div>
    );
};
