import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useNavigation } from "@refinedev/core";
import { Layout, FileText, Calendar, Users, Zap } from "lucide-react";
import React, { useState, useEffect } from "react";

// Hooks
import { useDashboard } from "../hooks/use-dashboard";
import { useCapabilities } from "@/hooks/use-capabilities";
import usePageTitle from "@/hooks/use-page-title";

// Components
import { DashboardHeader } from "../components/dashboard-header";
import { MissionControlHero } from "../components/mission-control-hero";
import { AdminDashboard } from "../components/admin-dashboard";
import SchoolAdminDashboard from "@/features/schools/pages/dashboard";
import { StaffDashboard } from "../components/staff-dashboard";
import { StudentDashboard } from "../components/student-dashboard";
import { ParentDashboard } from "../components/parent-dashboard";
import { QuickActions } from "../components/quick-actions";
import { TodaySchedule } from "../components/today-schedule";
import { PromoCards } from "../components/promo-cards";
import { SchoolSetupWizard } from "@/features/schools/components/SchoolSetupWizard";
import { ErrorBoundary } from "@/components/guards/error-boundary";
import { TodayLessonsWidget } from "../components/TodayLessonsWidget";
import { TodayLecturesWidget } from "../components/TodayLecturesWidget";
import { GpaPreviewWidget } from "../components/GpaPreviewWidget";
import { SuiteHomeShell } from "../components/SuiteHomeShell";

const Dashboard = () => {
  const { t } = useTranslation();
  const { hash } = useLocation();
  const { isSchoolSuite, isFacultySuite } = useCapabilities();
  const { push } = useNavigation() as any;

  const {
    identity,
    isIdentityLoading,
    isCoreLoading,
    isAnalyticsLoading,
    isMissionLoading,
    coreData,
    analyticsData,
    mission,
    roles,
    navigation,
  } = useDashboard() as any;

  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    if (roles.isSchoolAdmin && coreData?.school && !coreData.school.suiteOnboardingComplete) {
      // Redirect handled by OnboardingGuard
    }
  }, [roles.isSchoolAdmin, coreData]);

  usePageTitle(t("dashboard.title"));

  // 🛡️ HUB SUITE HOME (For Owners/Admins)
  if (roles.isOwner && !roles.isParent) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="dashboard-glow" />
        <div className="container mx-auto py-8 md:py-10 lg:py-12 px-4 md:px-6 lg:px-8 relative max-w-[1600px] z-10">
          <SuiteHomeShell />
        </div>
      </div>
    );
  }

  const activeCards = roles.isStudent
    ? [
        {
          title: t("dashboard.cards.myClasses" as any),
          icon: Layout,
          heading: t("dashboard.cards.enrolledSubjects" as any),
          description: t("dashboard.cards.accessActiveClasses" as any),
          resource: "classes",
        },
        {
          title: t("dashboard.cards.studyLab" as any),
          icon: Zap,
          heading: t("dashboard.cards.aiBuddy" as any),
          description: t("dashboard.cards.adaptivePractice" as any),
          resource: "ai-study-lab",
          variant: "ai" as const,
        },
        {
          title: t("dashboard.cards.library" as any),
          icon: FileText,
          heading: t("dashboard.cards.globalResources" as any),
          description: t("dashboard.cards.courseMaterials" as any),
          resource: "library",
        },
      ]
    : roles.isTeacher
      ? [
          {
            title: t("dashboard.cards.manageClasses"),
            icon: Layout,
            heading: t("dashboard.cards.overseeClassrooms"),
            description: t("dashboard.cards.accessActiveClassrooms"),
            resource: "classes",
          },
          {
            title: isFacultySuite
              ? t("dashboard.teacher.weeklySchedule", "My Weekly Schedule")
              : t("dashboard.teacher.schedule", "My Schedule"),
            icon: Calendar,
            heading: t("dashboard.teacher.weeklyAgenda", "Weekly Agenda"),
            description: isFacultySuite
              ? t(
                  "dashboard.teacher.weeklyScheduleDesc",
                  "View your lecture sections across the week."
                )
              : t("dashboard.teacher.scheduleDesc", "View and start your scheduled lessons."),
            action: isSchoolSuite
              ? () => push("/timetable/teacher")
              : isFacultySuite
                ? () => push("/timetable/lecturer-weekly")
                : undefined,
            resource: isSchoolSuite || isFacultySuite ? undefined : "calendar",
          },
          {
            title: t("dashboard.cards.curriculum"),
            icon: FileText,
            heading: t("dashboard.cards.tasksGrading"),
            description: t("dashboard.cards.viewAllDeadlines"),
            resource: "assignments",
          },
        ]
      : [
          {
            title: t("dashboard.cards.manageClasses"),
            icon: Layout,
            heading: t("dashboard.cards.overseeClassrooms"),
            description: t("dashboard.cards.accessActiveClassrooms"),
            resource: "classes",
          },
          {
            title: t("dashboard.cards.users"),
            icon: Users,
            heading: t("dashboard.cards.directory"),
            description: t("dashboard.cards.studentsStaff"),
            resource: "users",
          },
        ];

  if (isCoreLoading || isIdentityLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="h-12 w-12 rounded-2xl bg-primary/20 animate-pulse" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="dashboard-glow" />

      {showSetup && coreData?.school && (
        <SchoolSetupWizard
          school={coreData.school}
          onComplete={() => {
            setShowSetup(false);
            void navigation.refetchCore();
          }}
        />
      )}

      <div className="container mx-auto py-8 md:py-10 lg:py-12 px-4 md:px-6 lg:px-8 relative max-w-[1600px] z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12 md:space-y-16"
        >
          <DashboardHeader
            identity={identity}
            isStudent={roles.isStudent}
            analyticsData={analyticsData}
          />

          <div className="space-y-16 md:space-y-24">
            {roles.isPlatformAdmin && (
              <AdminDashboard
                data={analyticsData}
                isLoading={isAnalyticsLoading}
                onRefresh={() => void navigation.refetchAnalytics()}
                show={navigation.show}
              />
            )}
            {roles.isSchoolAdmin && <SchoolAdminDashboard />}
            {roles.isTeacher && (
              <StaffDashboard
                data={analyticsData}
                isLoading={isAnalyticsLoading}
                onRefresh={() => void navigation.refetchAnalytics()}
                show={navigation.show}
              />
            )}
            {roles.isStudent && (
              <StudentDashboard
                identity={identity}
                data={analyticsData}
                isLoading={isAnalyticsLoading}
                list={navigation.list}
                show={navigation.show}
              />
            )}
            {roles.isParent && (
              <ParentDashboard
                data={analyticsData}
                isLoading={isAnalyticsLoading}
                show={navigation.show}
              />
            )}

            {/* Footer Grid: Quick Actions & Today's Agenda (Only for non-students as StudentDashboard handles it) */}
            {!roles.isStudent && (
              <div className="grid gap-10 md:gap-12 lg:grid-cols-3 items-start">
                <div className="lg:col-span-2 space-y-10 md:space-y-16">
                  <ErrorBoundary>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                    >
                      <div className="flex items-center gap-4 mb-6 md:mb-8 px-2">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/5">
                          <Zap className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col text-start">
                          <h2 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight leading-none">
                            {t("dashboard.quickActions")}
                          </h2>
                          <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mt-1.5">
                            Shortcuts
                          </span>
                        </div>
                      </div>
                      <QuickActions cards={activeCards as any} list={navigation.list} />
                    </motion.div>
                  </ErrorBoundary>
                </div>

                <div className="space-y-10 md:space-y-16 text-start">
                  <ErrorBoundary>
                    <div className="flex items-center gap-4 mb-6 md:mb-8 px-2 justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/5">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <h2 className="text-xl md:text-2xl font-black tracking-tight leading-none">
                            {t("dashboard.todaySchedule")}
                          </h2>
                          <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mt-1.5">
                            Agenda
                          </span>
                        </div>
                      </div>
                    </div>
                    <TodaySchedule
                      schedule={coreData?.todaySchedule ?? []}
                      show={navigation.show}
                    />
                  </ErrorBoundary>
                  <PromoCards isStaff={roles.isStaff} list={navigation.list} />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
