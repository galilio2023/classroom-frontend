import {
  Layout,
  FileText,
  Calendar,
  Users,
  AlertCircle,
  Clock,
  Heart,
  ShieldCheck,
  ChevronRight,
  Zap,
  Bell
} from "lucide-react";
import { UserRole } from "@/types";
import React, { useEffect } from "react";
import { QuickActions } from "../components/quick-actions";
import { TodaySchedule } from "../components/today-schedule";
import { PromoCards } from "../components/promo-cards";
import { StaffDashboard } from "../components/staff-dashboard";
import { AdminDashboard } from "../components/admin-dashboard";
import { StudentDashboard } from "../components/student-dashboard";
import { ParentDashboard } from "../components/parent-dashboard";
import { DashboardHeader } from "../components/dashboard-header";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import {
  WelcomeHeaderSkeleton,
  ChartSkeleton,
  ListSkeleton,
  ScheduleSkeleton,
  StatsSkeleton,
} from "../components/dashboard-skeletons";
import usePageTitle from "@/hooks/use-page-title";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useDashboard } from "../hooks/use-dashboard";
import { useLocation } from "react-router-dom";

const Dashboard = () => {
  const { t } = useTranslation();
  const { hash } = useLocation();
  const { 
    identity, isIdentityLoading, isCoreLoading, isAnalyticsLoading, isError, 
    coreData, analyticsData, selectedTerm, roles, navigation 
  } = useDashboard();

  useEffect(() => {
    if (hash === "#atRisk" && !isCoreLoading) {
      const element = document.getElementById("at-risk-students-section");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        element.classList.add("highlight-section");
        setTimeout(() => {
          element.classList.remove("highlight-section");
        }, 3000);
      }
    }
  }, [hash, isCoreLoading]);

  usePageTitle(t("dashboard.title"));

  const activeCards = roles.isStudent
    ? [
        { title: t("dashboard.cards.myClasses"), icon: Layout, heading: t("dashboard.cards.enrolledClasses"), description: t("dashboard.cards.accessActiveClassrooms"), resource: "classes" },
        { title: t("dashboard.cards.assignments"), icon: FileText, heading: t("dashboard.cards.myTasks"), description: t("dashboard.cards.submitYourWork"), resource: "assignments" },
        { title: t("dashboard.cards.calendar"), icon: Calendar, heading: t("dashboard.cards.schedule"), description: t("dashboard.cards.deadlinesEvents"), resource: "calendar" },
      ]
    : roles.isParent
      ? [
          { title: t("dashboard.cards.family"), icon: Heart, heading: t("dashboard.cards.myChildren"), description: t("dashboard.cards.monitorProgress"), resource: "users" },
          { title: t("dashboard.cards.calendar"), icon: Calendar, heading: t("dashboard.cards.schoolEvents"), description: t("dashboard.cards.importantDates"), resource: "calendar" },
          { title: t("dashboard.cards.messages"), icon: Bell, heading: t("dashboard.cards.notifications"), description: t("dashboard.cards.teacherUpdates"), resource: "notifications" },
        ]
      : roles.isAdmin
        ? [
            { title: t("dashboard.cards.manageClasses"), icon: Layout, heading: t("dashboard.cards.overseeClassrooms"), description: t("dashboard.cards.accessActiveClassrooms"), resource: "classes" },
            { title: t("dashboard.cards.users"), icon: Users, heading: t("dashboard.cards.directory"), description: t("dashboard.cards.studentsStaff"), resource: "users" },
            { title: t("dashboard.verification.required"), icon: ShieldCheck, heading: t("dashboard.stats.pendingVerifications"), description: t("dashboard.stats.pendingVerifications"), resource: "users", params: { filters: [{ field: "verificationStatus", operator: "eq", value: "pending" }] } },
          ]
        : [
            { title: t("dashboard.cards.manageClasses"), icon: Layout, heading: t("dashboard.cards.overseeClassrooms"), description: t("dashboard.cards.accessActiveClassrooms"), resource: "classes" },
            { title: t("dashboard.cards.curriculum"), icon: FileText, heading: t("dashboard.cards.tasksGrading"), description: t("dashboard.cards.viewAllDeadlines"), resource: "assignments" },
            { title: t("dashboard.cards.calendar"), icon: Calendar, heading: t("dashboard.cards.schedule"), description: t("dashboard.cards.deadlinesEvents"), resource: "calendar" },
          ];

  if (isError) return (
    <div className="flex h-[80vh] flex-col items-center justify-center space-y-8 p-4">
      <div className="p-8 rounded-full bg-destructive/5 text-destructive border border-destructive/10"><AlertCircle className="h-16 w-16" /></div>
      <div className="text-center space-y-3"><h2 className="text-2xl md:text-3xl font-black tracking-tight">{t("dashboard.failedToLoad")}</h2><p className="text-muted-foreground font-medium max-w-sm mx-auto">{t("dashboard.failedToLoadDescription")}</p></div>
      <Button onClick={() => { void navigation.refetchCore(); void navigation.refetchAnalytics(); }} size="lg" className="rounded-2xl font-black uppercase tracking-widest h-14 px-10 shadow-xl shadow-primary/20 w-full xs:w-auto">{t("buttons.tryAgain")}</Button>
    </div>
  );

  if (isIdentityLoading || (isCoreLoading && !coreData && !roles.isParent)) return (
    <div className="container mx-auto py-10 px-4 md:px-8 lg:px-12 xl:px-20 max-w-[1600px] space-y-16">
      <WelcomeHeaderSkeleton />
      <div className="grid gap-8 md:gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-12"><ChartSkeleton /><ListSkeleton /></div>
        <div className="space-y-10"><ScheduleSkeleton /><StatsSkeleton /></div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="dashboard-glow" />
      
      <div className="container mx-auto py-8 md:py-10 lg:py-12 px-4 md:px-6 lg:px-8 relative max-w-[1600px] z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 md:space-y-16">
        <DashboardHeader identity={identity} isStudent={roles.isStudent} analyticsData={analyticsData} />

        <div className="space-y-16 md:space-y-24">
          {roles.isAdmin && <AdminDashboard data={analyticsData} isLoading={isAnalyticsLoading} onRefresh={() => void navigation.refetchAnalytics()} show={navigation.show} />}
          {roles.isTeacher && <StaffDashboard data={analyticsData} isLoading={isAnalyticsLoading} onRefresh={() => void navigation.refetchAnalytics()} show={navigation.show} />}
          {roles.isStudent && <StudentDashboard data={analyticsData} isLoading={isAnalyticsLoading} list={navigation.list} show={navigation.show} />}
          {roles.isParent && <ParentDashboard data={analyticsData} isLoading={isAnalyticsLoading} show={navigation.show} />}

          <div className="grid gap-10 md:gap-12 lg:grid-cols-3 items-start">
            <div className="lg:col-span-2 space-y-10 md:space-y-16">
              <ErrorBoundary>
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                  <div className="flex items-center gap-4 mb-6 md:mb-8 px-2">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/5"><Zap className="h-5 w-5" /></div>
                    <div className="flex flex-col text-start"><h2 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight leading-none">{t("dashboard.quickActions")}</h2><span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mt-1.5">Shortcuts</span></div>
                  </div>
                  <QuickActions cards={activeCards} list={navigation.list} />
                </motion.div>
              </ErrorBoundary>
            </div>

            <div className="space-y-10 md:space-y-16 text-start">
              <ErrorBoundary>
                <div className="flex items-center gap-4 mb-6 md:mb-8 px-2 justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/5"><Calendar className="h-5 w-5" /></div>
                        <div className="flex flex-col"><h2 className="text-xl md:text-2xl font-black tracking-tight leading-none">{t("dashboard.todaySchedule")}</h2><span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mt-1.5">Agenda</span></div>
                    </div>
                </div>
                <TodaySchedule schedule={coreData?.todaySchedule ?? []} show={navigation.show} />
              </ErrorBoundary>
              {!roles.isStudent && <PromoCards isStaff={roles.isStaff} list={navigation.list} />}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
);
};

export default Dashboard;
