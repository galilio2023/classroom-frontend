import { StudentAcademicJourney } from "./student-academic-journey";
import { UpcomingAssignmentsList } from "./upcoming-assignments-list";
import {} from "./recent-activity";
import { ErrorBoundary } from "@/components/error-boundary";
import { DashboardData } from "@/types/dashboard";
import { StatsSkeleton } from "./dashboard-skeletons";
import { useGetIdentity } from "@refinedev/core";
import { User } from "@/types";
import { TrendingUp } from "lucide-react";
import { getLevelProgress } from "@/lib/xp";
import { StudentOnboarding } from "./student-onboarding";
import { ActionCenter, ActionItem } from "./action-center";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { usePWAInstall } from "@/hooks/use-pwa-install";

// Sub-components
import { MissionControlHero } from "./student/MissionControlHero";

interface StudentDashboardProps {
  data: DashboardData;
  isLoading?: boolean;
  list: (resource: string) => void;
  show: (resource: string, id: string | number) => void;
}

export const StudentDashboard = ({ data, isLoading, list, show }: StudentDashboardProps) => {
  const { t } = useTranslation();
  const { data: identity } = useGetIdentity<User>();
  const { isInstallable, isStandalone, handleInstallClick } = usePWAInstall();

  const currentXP = identity?.xp || 0;
  const { currentLevel, xpRequiredForNextLevel, xpInCurrentLevel } = getLevelProgress(currentXP);
  const xpNeeded = xpRequiredForNextLevel - xpInCurrentLevel;

  const hasClasses = (identity?.enrollments?.length || 0) > 0;
  const currentStreak = identity?.currentStreak || 0;

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

  if (data.upcomingAssignments && data.upcomingAssignments.length > 0) {
    const nextAssignment = data.upcomingAssignments[0];
    actions.push({
      id: "upcoming-task",
      title: t("dashboard.student.actions.upcoming.title"),
      description: t("dashboard.student.actions.upcoming.description", {
        title: nextAssignment.title,
      }),
      priority: "normal",
      actionText: t("dashboard.student.actions.upcoming.action"),
      onClick: () => show("assignments", nextAssignment.id),
    });
  }

  // 🚀 ACTION REQUIRED: Resubmissions
  if (data.resubmissions && data.resubmissions.length > 0) {
    data.resubmissions.forEach((sub: any) => {
      actions.push({
        id: `resubmit-${sub.id}`,
        title: t("dashboard.student.actions.resubmit.title", { defaultValue: "Action Required" }),
        description: t("dashboard.student.actions.resubmit.description", {
          defaultValue: "Resubmission requested for: {{title}}",
          title: sub.assignment?.title || "Assignment",
        }),
        priority: "urgent",
        actionText: t("dashboard.student.actions.resubmit.action", {
          defaultValue: "Edit Submission",
        }),
        onClick: () => show("submissions", sub.id),
      });
    });
  }

  // Suggest AI Study Lab if no urgent tasks
  if (actions.length === 0 && hasClasses) {
    actions.push({
      id: "ai-study",
      title: t("dashboard.student.actions.aiStudy.title"),
      description: t("dashboard.student.actions.aiStudy.description"),
      priority: "ai",
      actionText: t("dashboard.student.actions.aiStudy.action"),
      onClick: () => list("ai-study-lab"),
    });
  }

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
    <div className="space-y-16 md:space-y-24 lg:space-y-32">
      {!hasClasses && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <StudentOnboarding />
        </motion.div>
      )}

      {/* Premium Gamification Banner */}
      <MissionControlHero
        name={identity?.name || "Student"}
        currentXP={currentXP}
        currentLevel={currentLevel}
        xpInCurrentLevel={xpInCurrentLevel}
        xpRequiredForNextLevel={xpRequiredForNextLevel}
        xpNeeded={xpNeeded}
        currentStreak={currentStreak}
      />

      {/* The What's Next / Action Center */}
      {hasClasses && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ActionCenter
            title={t("dashboard.student.actions.header")}
            actions={actions}
            emptyMessage={t("dashboard.student.actions.empty")}
            emptyDescription={t("dashboard.student.actions.emptyDesc")}
            onEmptyAction={() => list("ai-study-lab")}
            emptyActionText={t("dashboard.student.actions.emptyBtn")}
          />
        </motion.div>
      )}

      <div className="grid gap-12 md:gap-16 lg:gap-24 lg:grid-cols-12 items-start">
        {/* Main Content Column */}
        <div className="lg:col-span-12 space-y-16 md:space-y-24 lg:space-y-32">
          <ErrorBoundary>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-4 mb-8 lg:mb-12 px-2 text-start">
                <div className="p-3 lg:p-4 rounded-2xl lg:rounded-3xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8" />
                </div>
                <div className="flex flex-col text-start">
                  <h2 className="text-xl md:text-3xl lg:text-4xl font-black tracking-tight leading-none">
                    {t("dashboard.student.academicJourney")}
                  </h2>
                  <span className="text-[10px] lg:text-xs font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mt-1.5 lg:mt-2">
                    Performance & Growth
                  </span>
                </div>
                <div className="hidden sm:block h-px flex-1 bg-linear-to-r from-primary/10 to-transparent ms-6 lg:ms-10" />
              </div>
              <StudentAcademicJourney
                gradeTrends={data.gradeTrends ?? []}
                subjectMastery={data.subjectMastery ?? []}
                attendanceSummary={
                  data.attendanceSummary ?? {
                    present: 0,
                    absent: 0,
                    late: 0,
                    total: 0,
                  }
                }
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
      </div>
    </div>
  );
};
