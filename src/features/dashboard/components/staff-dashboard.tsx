import { EngagementChart } from "./engagement-chart";
import { PendingGradingList } from "./pending-grading-list";
import { AtRiskStudents } from "./at-risk-students";
import { PlatformOverview } from "./platform-overview";
import {} from "./recent-activity";
import { RLHFAlignmentChart } from "./rlhf-alignment-chart";
import { ErrorBoundary } from "@/components/error-boundary";
import { DashboardData } from "@/types/dashboard";
import { TeacherOnboarding } from "./teacher-onboarding";
import { ActionCenter, ActionItem } from "./action-center";
import { MarketplaceOverview } from "./marketplace-overview";
import { motion } from "framer-motion";
import { BarChart3, AlertCircle, LayoutDashboard, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@refinedev/core";
import { usePWAInstall } from "@/hooks/use-pwa-install";

// Sub-components
import { TeacherTvStats } from "./staff/TeacherTvStats";

interface StaffDashboardProps {
  data: DashboardData;
  isLoading: boolean;
  onRefresh: () => void;
  show: (resource: string, id: string | number) => void;
}

export const StaffDashboard = ({ data, isLoading, onRefresh, show }: StaffDashboardProps) => {
  const { t } = useTranslation();
  const { list } = useNavigation();
  const { isInstallable, isStandalone, handleInstallClick } = usePWAInstall();

  // Generate Action Items dynamically based on data
  const actions: ActionItem[] = [];

  // PWA Install Prompt - Higher priority if not installed
  if (isInstallable && !isStandalone) {
    actions.push({
      id: "pwa-install",
      title: t("common.installAppTitle", "Tablawy OS on Mobile"),
      description: t(
        "common.installAppDesc",
        "Install Tablawy on your home screen for a better experience and offline access."
      ),
      priority: "urgent",
      actionText: t("common.installApp", "Install Now"),
      onClick: handleInstallClick,
    });
  }

  if (data.atRiskStudents && data.atRiskStudents.length > 0) {
    actions.push({
      id: "at-risk",
      title: t("dashboard.staff.actions.atRisk.title", {
        count: data.atRiskStudents.length,
      }),
      description: t("dashboard.staff.actions.atRisk.description"),
      priority: "urgent",
      actionText: t("dashboard.staff.actions.atRisk.action"),
      onClick: () => {
        const element = document.getElementById("at-risk-students-section");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          element.classList.add("ring-2", "ring-destructive", "ring-offset-8", "rounded-4xl");
          setTimeout(
            () => element.classList.remove("ring-2", "ring-destructive", "ring-offset-8"),
            3000
          );
        }
      },
    });
  }

  if (data.pendingSubmissions && data.pendingSubmissions.length > 0) {
    actions.push({
      id: "grading",
      title: t("dashboard.staff.actions.grading.title", {
        count: data.pendingSubmissions.length,
      }),
      description: t("dashboard.staff.actions.grading.description"),
      priority: "normal",
      actionText: t("dashboard.staff.actions.grading.action"),
      onClick: () => {
        if (data.pendingSubmissions && data.pendingSubmissions[0]) {
          show("submissions", data.pendingSubmissions[0].id);
        }
      },
    });
  }

  if (actions.length === 0) {
    actions.push({
      id: "create-quiz",
      title: t("dashboard.staff.actions.aiQuiz.title"),
      description: t("dashboard.staff.actions.aiQuiz.description"),
      priority: "ai",
      actionText: t("dashboard.staff.actions.aiQuiz.action"),
      onClick: () => list("ai-assistant"),
    });
  }

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

      {/* The What's Next / Action Center */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ActionCenter
          title={t("dashboard.staff.actions.header")}
          actions={actions}
          emptyMessage={t("dashboard.staff.actions.empty")}
        />
      </motion.div>

      {/* Marketplace & Earnings Overview */}
      {(data.marketplaceEarnings ||
        (data.recentTransactions && data.recentTransactions.length > 0)) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <MarketplaceOverview
            earnings={data.marketplaceEarnings}
            transactions={data.recentTransactions}
          />
        </motion.div>
      )}

      {/* Teacher TV Stats Row */}
      {data.channelStats && (
        <TeacherTvStats stats={data.channelStats} onManageClick={() => show("channels", "me")} />
      )}

      <div className="grid gap-12 lg:grid-cols-12 items-start">
        {/* Main Analytics Column */}
        <div className="lg:col-span-8 space-y-16">
          <ErrorBoundary>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-8 px-2 text-start">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">
                  {t("dashboard.staff.engagementAnalytics")}
                </h2>
                <div className="h-px flex-1 bg-linear-to-r from-primary/20 to-transparent" />
              </div>
              <EngagementChart
                attendanceData={data.attendanceTrend ?? []}
                gradeData={data.gradeDistribution ?? []}
              />
            </motion.div>
          </ErrorBoundary>

          <ErrorBoundary>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center gap-3 mb-8 px-2 text-start">
                <div className="p-2 rounded-xl bg-ai-primary/10 text-ai-primary">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">
                  {t("dashboard.staff.aiAlignment")}
                </h2>
                <div className="h-px flex-1 bg-linear-to-r from-ai-primary/20 to-transparent" />
              </div>
              <RLHFAlignmentChart data={data.rlhf ?? []} />
            </motion.div>
          </ErrorBoundary>

          <ErrorBoundary>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <PendingGradingList submissions={data.pendingSubmissions ?? []} show={show} />
            </motion.div>
          </ErrorBoundary>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-16">
          <ErrorBoundary>
            <motion.div
              id="at-risk-students-section"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-8 px-2 text-start">
                <div className="p-2 rounded-xl bg-destructive/10 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-black tracking-tight">
                  {t("dashboard.staff.atRiskStudents.title")}
                </h2>
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
              <div className="flex items-center gap-3 mb-8 px-2 text-start">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-black tracking-tight">
                  {t("dashboard.staff.platformOverview")}
                </h2>
              </div>
              <PlatformOverview stats={data.stats} isLoading={isLoading} onRefresh={onRefresh} />
            </motion.div>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};
