import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, Users, RefreshCw, LayoutGrid, FileText, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardStats } from "@/types/dashboard";
import { StatCard } from "./stat-card";
import { useNavigation } from "@refinedev/core";

interface PlatformOverviewProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
  onRefresh: () => void;
}

export const PlatformOverview = ({ stats, isLoading, onRefresh }: PlatformOverviewProps) => {
    const { list } = useNavigation();
    // Show skeletons if loading and no data yet
    const showSkeletons = isLoading && !stats;

    return (
        <div className="grid gap-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Platform Overview</h3>
                <Button variant="ghost" size="icon" className="h-4 w-4 text-muted-foreground" onClick={onRefresh} disabled={isLoading}>
                    <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
                </Button>
            </div>
            
            {!showSkeletons && stats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                    {stats.pendingVerifications !== undefined && stats.pendingVerifications > 0 && (
                        <div 
                            className="cursor-pointer group"
                            onClick={() => list("users", { filters: [{ field: "role", operator: "eq", value: "teacher" }, { field: "isVerified", operator: "eq", value: false }] })}
                        >
                            <StatCard 
                                label="Pending Verifications" 
                                value={stats.pendingVerifications} 
                                icon={ShieldAlert} 
                                color="text-amber-500" 
                                className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 group-hover:border-amber-400 transition-colors"
                            />
                        </div>
                    )}
                    <StatCard 
                        label="Total Students" 
                        value={stats.totalStudents} 
                        icon={GraduationCap} 
                        color="text-blue-500" 
                    />
                    <StatCard 
                        label="Total Teachers" 
                        value={stats.totalTeachers} 
                        icon={Users} 
                        color="text-green-500" 
                    />
                    <StatCard 
                        label="Total Classes" 
                        value={stats.totalClasses} 
                        icon={LayoutGrid} 
                        color="text-purple-500" 
                    />
                    <StatCard 
                        label="Total Assignments" 
                        value={stats.totalAssignments} 
                        icon={FileText} 
                        color="text-orange-500" 
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                </div>
            )}
        </div>
    );
};
