import { EngagementChart } from "./engagement-chart";
import { PendingGradingList } from "./pending-grading-list";
import { AtRiskStudents } from "./at-risk-students";
import { PlatformOverview } from "./platform-overview";
import { RecentActivity } from "./recent-activity";
import { ErrorBoundary } from "@/components/error-boundary";
import { DashboardData } from "@/types/dashboard";
import { TeacherOnboarding } from "./teacher-onboarding";
import { motion } from "framer-motion";
import { BarChart3, AlertCircle, LayoutDashboard, History } from "lucide-react";
import { useTranslation } from "react-i18next";

interface StaffDashboardProps {
  data: DashboardData;
  isLoading: boolean;
  onRefresh: () => void;
  show: (resource: string, id: string | number) => void;
}

export const StaffDashboard = ({ data, isLoading, onRefresh, show }: StaffDashboardProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-16">
      {/* Onboarding / Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <TeacherOnboarding stats={data.stats} />
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
                <h2 className="text-2xl font-black tracking-tight">{t("dashboard.staff.engagementAnalytics")}</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
              </div>
              <EngagementChart 
                attendanceData={data.attendanceTrend ?? []} 
                gradeData={data.gradeDistribution ?? []} 
              />
            </motion.div>
          </ErrorBoundary>
          
          <ErrorBoundary>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <PendingGradingList 
                submissions={data.pendingSubmissions ?? []} 
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
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-8 px-2">
                <div className="p-2 rounded-xl bg-destructive/10 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-black tracking-tight">{t("dashboard.staff.atRiskStudents.title")}</h2>
              </div>
              <AtRiskStudents students={data.atRiskStudents ?? []} />
            </motion.div>
          </ErrorBoundary>
          
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
                <h2 className="text-xl font-black tracking-tight">{t("dashboard.staff.platformOverview")}</h2>
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
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-8 px-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <History className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-black tracking-tight">{t("dashboard.staff.recentActivity")}</h2>
              </div>
              <RecentActivity limit={5} />
            </motion.div>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};
