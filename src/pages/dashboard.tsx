import { useNavigation, useGetIdentity, useCustom } from "@refinedev/core";
import { Layout, FileText, Calendar, Users, AlertCircle, Sparkles, LayoutDashboard, ArrowRight, Clock, Bell, Info, Heart } from "lucide-react";
import { User, UserRole } from "@/types";
import React, { useEffect } from "react";
import { io } from "socket.io-client";

import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { TodaySchedule } from "@/components/dashboard/today-schedule";
import { PromoCards } from "@/components/dashboard/promo-cards";
import { StaffDashboard } from "@/components/dashboard/staff-dashboard";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { ParentDashboard } from "@/components/dashboard/parent-dashboard";
import { DashboardData } from "@/types/dashboard";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { 
  WelcomeHeaderSkeleton, 
  ChartSkeleton, 
  ListSkeleton, 
  ScheduleSkeleton, 
  StatsSkeleton 
} from "@/components/dashboard/dashboard-skeletons";
import { SOCKET_URL } from "@/config";
import usePageTitle from "@/hooks/use-page-title";
import { useTerm } from "@/contexts/term-context";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  usePageTitle(t("dashboard.title"));
  const { list, show } = useNavigation();
  const { data: identity, isLoading: isIdentityLoading, refetch: refetchIdentity } = useGetIdentity<User>();
  const { selectedTerm } = useTerm();
  
  const isStaff = identity?.role === UserRole.TEACHER || identity?.role === UserRole.ADMIN;
  const isTeacher = identity?.role === UserRole.TEACHER;
  const isStudent = identity?.role === UserRole.STUDENT;
  const isParent = identity?.role === UserRole.PARENT;
  
  const { query: coreQuery } = useCustom<DashboardData>({
    url: `/dashboard`,
    method: "get",
    queryOptions: { 
      enabled: !!identity && !!selectedTerm && !isParent, // Parents have a different data flow
      staleTime: 5 * 60 * 1000,
    },
    config: {
      query: { 
          sections: "schedule",
          termId: selectedTerm?.id
      }
    }
  });

  const { query: analyticsQuery } = useCustom<DashboardData>({
    url: `/dashboard`,
    method: "get",
    queryOptions: { 
      enabled: !!identity && !!selectedTerm && !isParent,
      staleTime: 5 * 60 * 1000,
    },
    config: {
      query: { 
        sections: isStaff 
          ? `stats,attendanceTrend,gradeDistribution,pendingSubmissions,atRiskStudents${isTeacher ? ',channelStats' : ''}`
          : "upcomingAssignments,gradeTrends,subjectMastery,attendanceSummary",
        termId: selectedTerm?.id
      }
    }
  });

  const { data: coreResponse, isLoading: isCoreLoading, refetch: refetchCore } = coreQuery;
  const { data: analyticsResponse, isLoading: isAnalyticsLoading, isError, refetch: refetchAnalytics } = analyticsQuery;

  const coreData = coreResponse?.data;
  const analyticsData: DashboardData = analyticsResponse?.data || { todaySchedule: [] };

  useEffect(() => {
    if (!identity?.id) return;
    const socket = io(SOCKET_URL, { query: { userId: identity.id }, withCredentials: true });
    
    const handleRefresh = () => {
      void refetchCore();
      void refetchAnalytics();
      void refetchIdentity();
    };

    socket.on("notification", handleRefresh);
    socket.on("new_discussion", handleRefresh);
    
    return () => {
      socket.off("notification", handleRefresh);
      socket.off("new_discussion", handleRefresh);
      socket.disconnect();
    };
  }, [identity?.id, refetchCore, refetchAnalytics, refetchIdentity]);

  const activeCards = isStudent ? [
    { title: t("dashboard.cards.myClasses"), icon: Layout, heading: t("dashboard.cards.enrolledClasses"), description: t("dashboard.cards.accessActiveClassrooms"), resource: "classes" },
    { title: t("dashboard.cards.assignments"), icon: FileText, heading: t("dashboard.cards.myTasks"), description: t("dashboard.cards.submitYourWork"), resource: "assignments" },
    { title: t("dashboard.cards.calendar"), icon: Calendar, heading: t("dashboard.cards.schedule"), description: t("dashboard.cards.deadlinesEvents"), resource: "calendar" },
  ] : isParent ? [
    { title: t("dashboard.cards.family"), icon: Heart, heading: t("dashboard.cards.myChildren"), description: t("dashboard.cards.monitorProgress"), resource: "users" },
    { title: t("dashboard.cards.calendar"), icon: Calendar, heading: t("dashboard.cards.schoolEvents"), description: t("dashboard.cards.importantDates"), resource: "calendar" },
    { title: t("dashboard.cards.messages"), icon: Bell, heading: t("dashboard.cards.notifications"), description: t("dashboard.cards.teacherUpdates"), resource: "notifications" },
  ] : [
    { title: t("dashboard.cards.manageClasses"), icon: Layout, heading: t("dashboard.cards.overseeClassrooms"), description: t("dashboard.cards.accessActiveClassrooms"), resource: "classes" },
    { title: t("dashboard.cards.curriculum"), icon: FileText, heading: t("dashboard.cards.tasksGrading"), description: t("dashboard.cards.viewAllDeadlines"), resource: "assignments" },
    { title: t("dashboard.cards.calendar"), icon: Calendar, heading: t("dashboard.cards.schedule"), description: t("dashboard.cards.deadlinesEvents"), resource: "calendar" },
    { title: t("dashboard.cards.users"), icon: Users, heading: t("dashboard.cards.directory"), description: t("dashboard.cards.studentsStaff"), resource: "users" },
  ];

  if (isError) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-6">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-12 w-12" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black tracking-tight">{t("dashboard.failedToLoad")}</h2>
          <p className="text-muted-foreground font-medium">{t("dashboard.failedToLoadDescription")}</p>
        </div>
        <Button 
          onClick={() => { void refetchCore(); void refetchAnalytics(); }}
          className="rounded-xl font-black uppercase tracking-widest h-12 px-8 shadow-lg shadow-primary/20"
        >
          {t("buttons.tryAgain")}
        </Button>
      </div>
    );
  }

  if (isIdentityLoading || (isCoreLoading && !coreData && !isParent)) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6 space-y-12">
        <WelcomeHeaderSkeleton />
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-12"><ChartSkeleton /><ListSkeleton /></div>
          <div className="space-y-10"><ScheduleSkeleton /><StatsSkeleton /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6 relative z-0">
      {/* Premium Background Effects */}
      <div className="hidden sm:block absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="hidden sm:block absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-ai-primary/5 rounded-full blur-[120px] -z-10 animate-pulse delay-1000" />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="relative">
          <WelcomeHeader name={identity?.name || "User"} isStudent={isStudent} user={identity} />
          <div className="absolute top-0 ltr:right-0 rtl:left-0 hidden md:flex items-center gap-3">
            <Badge variant="secondary" className="rounded-full px-4 py-1.5 font-black text-[10px] uppercase tracking-widest bg-card/50 backdrop-blur-xl border-black/[0.05] dark:border-white/[0.05] shadow-sm">
              <Clock className="h-3 w-3 mr-2 rtl:mr-0 rtl:ml-2 text-primary" />
              {new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </Badge>
            <Button variant="ghost" size="icon" className="rounded-full bg-card/50 backdrop-blur-xl border-black/[0.05] dark:border-white/[0.05] shadow-sm h-10 w-10">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Archive View Banner */}
        <AnimatePresence>
          {selectedTerm?.status === "archived" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-amber-500/10 border border-amber-500/20 text-amber-700 p-6 rounded-[2rem] shadow-xl shadow-amber-500/5 backdrop-blur-xl flex items-start gap-4"
            >
              <div className="p-3 rounded-2xl bg-amber-500/20">
                <Info className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="font-black uppercase tracking-widest text-xs">{t("dashboard.archiveViewActive")}</p>
                <p className="text-sm font-medium">{t("dashboard.archiveViewDescription", { termName: selectedTerm.name })}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-16">
          {isStaff && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <StaffDashboard 
                data={analyticsData} 
                isLoading={isAnalyticsLoading} 
                onRefresh={() => void refetchAnalytics()} 
                show={show} 
              />
            </motion.div>
          )}
          
          {isStudent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <StudentDashboard 
                data={analyticsData} 
                isLoading={isAnalyticsLoading}
                list={list} 
                show={show} 
              />
            </motion.div>
          )}

          {isParent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ParentDashboard 
                data={analyticsData} 
                isLoading={isAnalyticsLoading}
                show={show} 
              />
            </motion.div>
          )}

          <div className="grid gap-12 lg:grid-cols-3 items-start">
            <div className="lg:col-span-2 space-y-12">
              <ErrorBoundary>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-6 px-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{t("dashboard.quickActions")}</h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
                  </div>
                  <QuickActions cards={activeCards} list={list} />
                </motion.div>
              </ErrorBoundary>
            </div>
            
            <div className="space-y-12">
              <ErrorBoundary>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-6 px-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{t("dashboard.todaySchedule")}</h2>
                  </div>
                  <TodaySchedule 
                    schedule={coreData?.todaySchedule ?? []} 
                    show={show} 
                  />
                </motion.div>
              </ErrorBoundary>
              
              <ErrorBoundary>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <PromoCards isStaff={isStaff} list={list} />
                </motion.div>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
