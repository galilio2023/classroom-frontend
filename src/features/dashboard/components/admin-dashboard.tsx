import { EngagementChart } from "./engagement-chart";
import { PlatformOverview } from "./platform-overview";
import { SystemHealthCard } from "./system-health-card";
import { SystemVitalsCard } from "./system-vitals-card";
import { RecentActivity } from "./recent-activity";
import { ErrorBoundary } from "@/components/guards/error-boundary";
import { DashboardData } from "@/types/dashboard";
import { motion } from "framer-motion";
import {
  BarChart3,
  LayoutDashboard,
  History,
  ShieldCheck,
  Users,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminDashboardProps {
  data: DashboardData;
  isLoading: boolean;
  onRefresh: () => void;
  show: (resource: string, id: string | number) => void;
}

export const AdminDashboard = ({ data, isLoading, onRefresh }: AdminDashboardProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-16 md:space-y-24 lg:space-y-32">
      {/* Admin Stat Overview - Responsive Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 md:gap-6 lg:gap-8 xl:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Card className="rounded-4xl border-border/40 bg-card/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 md:p-8 lg:p-10 pb-2 md:pb-4">
            <CardTitle className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              {t("dashboard.stats.totalStudents")}
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 group-hover:rotate-3 transition-all">
              <Users className="h-5 w-5 md:h-6 md:w-6" />
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8 lg:p-10 pt-0 md:pt-0 lg:pt-0">
            <div className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter">
              {data.stats?.totalStudents?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-4xl border-border/40 bg-card/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 md:p-8 lg:p-10 pb-2 md:pb-4">
            <CardTitle className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              {t("dashboard.stats.totalTeachers")}
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:scale-110 group-hover:rotate-3 transition-all">
              <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" />
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8 lg:p-10 pt-0 md:pt-0 lg:pt-0">
            <div className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter">
              {data.stats?.totalTeachers?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-4xl border-border/40 bg-card/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 md:p-8 lg:p-10 pb-2 md:pb-4">
            <CardTitle className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              {t("dashboard.stats.pendingVerifications")}
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 group-hover:scale-110 group-hover:rotate-3 transition-all">
              <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" />
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8 lg:p-10 pt-0 md:pt-0 lg:pt-0">
            <div className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-amber-600">
              {data.stats?.pendingVerifications || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-4xl border-border/40 bg-card/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 md:p-8 lg:p-10 pb-2 md:pb-4">
            <CardTitle className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              {t("dashboard.stats.activeClasses")}
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-ai-primary/10 text-ai-primary group-hover:scale-110 group-hover:rotate-3 transition-all">
              <GraduationCap className="h-5 w-5 md:h-6 md:w-6" />
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8 lg:p-10 pt-0 md:pt-0 lg:pt-0">
            <div className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter">
              {data.stats?.totalClasses?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-12 lg:gap-16 xl:gap-24 lg:grid-cols-12 items-start">
        {/* Main Analytics Column */}
        <div className="lg:col-span-8 space-y-16 md:space-y-24 lg:space-y-32">
          <ErrorBoundary>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-4 mb-8 lg:mb-12 px-2">
                <div className="p-3 lg:p-4 rounded-2xl lg:rounded-3xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
                  <BarChart3 className="h-6 w-6 lg:h-8 lg:w-8" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-xl md:text-3xl lg:text-4xl font-black tracking-tight leading-none">
                    {t("dashboard.staff.engagementAnalytics")}
                  </h2>
                  <span className="text-[10px] lg:text-xs font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mt-1.5 lg:mt-2">
                    Overview
                  </span>
                </div>
                <div className="hidden sm:block h-px flex-1 bg-linear-to-r from-primary/10 to-transparent ms-6 lg:ms-10" />
              </div>
              <EngagementChart
                attendanceData={data.attendanceTrend ?? []}
                gradeData={data.gradeDistribution ?? []}
              />
            </motion.div>
          </ErrorBoundary>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-16 md:space-y-24 lg:space-y-32">
          <ErrorBoundary>
            <div className="space-y-8">
              <div className="flex items-center gap-4 px-2">
                <div className="p-3 rounded-2xl bg-ai-primary/10 text-ai-primary border border-ai-primary/5 shadow-sm">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="flex flex-col text-start">
                  <h2 className="text-xl md:text-2xl font-black tracking-tight leading-none">
                    System Self-Reflection
                  </h2>
                  <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mt-1.5">
                    Agentic Evolution
                  </span>
                </div>
              </div>
              <SystemHealthCard report={data.systemHealth} isLoading={isLoading} />
              <SystemVitalsCard />
            </div>
          </ErrorBoundary>

          <ErrorBoundary>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-4 mb-8 lg:mb-12 px-2">
                <div className="p-3 lg:p-4 rounded-2xl lg:rounded-3xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
                  <LayoutDashboard className="h-6 w-6 lg:h-8 lg:w-8" />
                </div>
                <div className="flex flex-col text-start">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight leading-none">
                    {t("dashboard.staff.platformOverview")}
                  </h2>
                  <span className="text-[10px] lg:text-xs font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mt-1.5 lg:mt-2">
                    Infrastructure
                  </span>
                </div>
              </div>
              <PlatformOverview stats={data.stats} isLoading={isLoading} onRefresh={onRefresh} />
            </motion.div>
          </ErrorBoundary>

          <ErrorBoundary>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-4 mb-8 lg:mb-12 px-2">
                <div className="p-3 lg:p-4 rounded-2xl lg:rounded-3xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
                  <History className="h-6 w-6 lg:h-8 lg:w-8" />
                </div>
                <div className="flex flex-col text-start">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight leading-none">
                    {t("dashboard.staff.recentActivity")}
                  </h2>
                  <span className="text-[10px] lg:text-xs font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mt-1.5 lg:mt-2">
                    Logs
                  </span>
                </div>
              </div>
              <RecentActivity limit={5} />
            </motion.div>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};
