import { EngagementChart } from "./engagement-chart";
import { PlatformOverview } from "./platform-overview";
import { RecentActivity } from "./recent-activity";
import { ErrorBoundary } from "@/components/error-boundary";
import { DashboardData } from "@/types/dashboard";
import { motion } from "framer-motion";
import {
  BarChart3,
  LayoutDashboard,
  History,
  ShieldCheck,
  Users,
  GraduationCap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminDashboardProps {
  data: DashboardData;
  isLoading: boolean;
  onRefresh: () => void;
  show: (resource: string, id: string | number) => void;
}

export const AdminDashboard = ({
  data,
  isLoading,
  onRefresh,
}: AdminDashboardProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-16">
      {/* Admin Stat Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 md:grid-cols-4"
      >
        <Card className="rounded-[2rem] border-black/[0.05] dark:border-white/[0.05] bg-card/50 backdrop-blur-xl shadow-2xl shadow-black/5 overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">
              {t("dashboard.stats.totalStudents")}
            </CardTitle>
            <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">
              {data.stats?.totalStudents?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-black/[0.05] dark:border-white/[0.05] bg-card/50 backdrop-blur-xl shadow-2xl shadow-black/5 overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">
              {t("dashboard.stats.totalTeachers")}
            </CardTitle>
            <div className="p-2 rounded-xl bg-success/10 text-success group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">
              {data.stats?.totalTeachers?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-black/[0.05] dark:border-white/[0.05] bg-card/50 backdrop-blur-xl shadow-2xl shadow-black/5 overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">
              {t("dashboard.stats.pendingVerifications")}
            </CardTitle>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">
              {data.stats?.pendingVerifications || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-black/[0.05] dark:border-white/[0.05] bg-card/50 backdrop-blur-xl shadow-2xl shadow-black/5 overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">
              {t("dashboard.stats.activeClasses")}
            </CardTitle>
            <div className="p-2 rounded-xl bg-ai-primary/10 text-ai-primary group-hover:scale-110 transition-transform">
              <GraduationCap className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">
              {data.stats?.totalClasses?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-12 lg:grid-cols-12 items-start">
        {/* Main Analytics Column */}
        <div className="lg:col-span-8 space-y-16">
          <ErrorBoundary>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-8 px-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">
                  {t("dashboard.staff.engagementAnalytics")}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
              </div>
              <EngagementChart
                attendanceData={data.attendanceTrend ?? []}
                gradeData={data.gradeDistribution ?? []}
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
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-black tracking-tight">
                  {t("dashboard.staff.platformOverview")}
                </h2>
              </div>
              <PlatformOverview
                stats={data.stats}
                isLoading={isLoading}
                onRefresh={onRefresh}
              />
            </motion.div>
          </ErrorBoundary>

          <ErrorBoundary>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-8 px-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <History className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-black tracking-tight">
                  {t("dashboard.staff.recentActivity")}
                </h2>
              </div>
              <RecentActivity limit={5} />
            </motion.div>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};
