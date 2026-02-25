import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, Users, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardStats } from "@/types/dashboard";

interface PlatformOverviewProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
  onRefresh: () => void;
}

export const PlatformOverview = ({ stats, isLoading, onRefresh }: PlatformOverviewProps) => {
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
                    {[
                        { label: "Total Students", value: stats.totalStudents, icon: GraduationCap, color: "text-blue-500" },
                        { label: "Total Teachers", value: stats.totalTeachers, icon: Users, color: "text-green-500" },
                    ].map((stat) => (
                    <Card key={stat.label} className="border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden group bg-white/50 dark:bg-black/20 backdrop-blur-xl">
                        <CardContent className="flex items-center p-6 gap-4 relative">
                            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                <stat.icon className="h-12 w-12" />
                            </div>
                            <div className={cn("p-3 rounded-2xl bg-muted transition-colors group-hover:bg-primary/10", stat.color)}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div className="z-10">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                                <h3 className="text-2xl font-black tracking-tight">{stat.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                </div>
            )}
        </div>
    );
};
