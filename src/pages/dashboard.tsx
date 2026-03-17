import { useNavigation, useGetIdentity, useCustom } from "@refinedev/core";
import {
  Layout,
  FileText,
  Calendar,
  Users,
  AlertCircle,
  Sparkles,
  LayoutDashboard,
  Clock,
  Bell,
  Info,
  Heart,
  ShieldCheck,
  ChevronRight,
  Zap,
} from "lucide-react";
import { User, UserRole } from "@/types";
import React, { useEffect } from "react";
import { io } from "socket.io-client";

import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { TodaySchedule } from "@/components/dashboard/today-schedule";
import { PromoCards } from "@/components/dashboard/promo-cards";
import { StaffDashboard } from "@/components/dashboard/staff-dashboard";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
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
  StatsSkeleton,
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
  const {
    data: identity,
    isLoading: isIdentityLoading,
    refetch: refetchIdentity,
  } = useGetIdentity<User>();
  const { selectedTerm } = useTerm();

  const isStaff =
    identity?.role === UserRole.TEACHER || identity?.role === UserRole.ADMIN;
  const isAdmin = identity?.role === UserRole.ADMIN;
  const isTeacher = identity?.role === UserRole.TEACHER;
  const isStudent = identity?.role === UserRole.STUDENT;
  const isParent = identity?.role === UserRole.PARENT;

  const { query: coreQuery } = useCustom<DashboardData>({
    url: `/dashboard`,
    method: "get",
    queryOptions: {
      enabled: !!identity && !!selectedTerm && !isParent, 
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    },
    config: {
      query: {
        sections: "schedule",
        termId: selectedTerm?.id,
      },
    },
  });

  const { query: analyticsQuery } = useCustom<DashboardData>({
    url: `/dashboard`,
    method: "get",
    queryOptions: {
      enabled: !!identity && !!selectedTerm && !isParent,
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    },
    config: {
      query: {
        sections: isStaff
          ? `stats,attendanceTrend,gradeDistribution,pendingSubmissions,atRiskStudents${isTeacher ? ",channelStats" : ""}`
          : "upcomingAssignments,gradeTrends,subjectMastery,attendanceSummary",
        termId: selectedTerm?.id,
      },
    },
  });

  const {
    data: coreResponse,
    isLoading: isCoreLoading,
    refetch: refetchCore,
  } = coreQuery;
  const {
    data: analyticsResponse,
    isLoading: isAnalyticsLoading,
    isError,
    refetch: refetchAnalytics,
  } = analyticsQuery;

  const coreData = coreResponse?.data;
  const analyticsData: DashboardData = analyticsResponse?.data || {
    todaySchedule: [],
    stats: {
      totalUsers: 0,
      totalStudents: 0,
      totalTeachers: 0,
      totalClasses: 0,
      totalAssignments: 0,
      pendingVerifications: 0,
    },
    attendanceTrend: [],
    gradeDistribution: [],
    pendingSubmissions: [],
    atRiskStudents: [],
    upcomingAssignments: [],
    gradeTrends: [],
    subjectMastery: [],
  };

  useEffect(() => {
    if (identity && selectedTerm && !isParent) {
      void refetchCore();
      void refetchAnalytics();
    }
  }, [identity, selectedTerm, isParent, refetchCore, refetchAnalytics]);

  useEffect(() => {
    if (!identity?.id) return;
    const socket = io(SOCKET_URL, {
      query: { userId: identity.id },
      withCredentials: true,
    });

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

  const activeCards = isStudent
    ? [
        {
          title: t("dashboard.cards.myClasses"),
          icon: Layout,
          heading: t("dashboard.cards.enrolledClasses"),
          description: t("dashboard.cards.accessActiveClassrooms"),
          resource: "classes",
        },
        {
          title: t("dashboard.cards.assignments"),
          icon: FileText,
          heading: t("dashboard.cards.myTasks"),
          description: t("dashboard.cards.submitYourWork"),
          resource: "assignments",
        },
        {
          title: t("dashboard.cards.calendar"),
          icon: Calendar,
          heading: t("dashboard.cards.schedule"),
          description: t("dashboard.cards.deadlinesEvents"),
          resource: "calendar",
        },
      ]
    : isParent
      ? [
          {
            title: t("dashboard.cards.family"),
            icon: Heart,
            heading: t("dashboard.cards.myChildren"),
            description: t("dashboard.cards.monitorProgress"),
            resource: "users",
          },
          {
            title: t("dashboard.cards.calendar"),
            icon: Calendar,
            heading: t("dashboard.cards.schoolEvents"),
            description: t("dashboard.cards.importantDates"),
            resource: "calendar",
          },
          {
            title: t("dashboard.cards.messages"),
            icon: Bell,
            heading: t("dashboard.cards.notifications"),
            description: t("dashboard.cards.teacherUpdates"),
            resource: "notifications",
          },
        ]
      : isAdmin
        ? [
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
            {
              title: t("dashboard.verification.required"),
              icon: ShieldCheck,
              heading: t("dashboard.stats.pendingVerifications"),
              description: t("dashboard.stats.pendingVerifications"),
              resource: "users",
              params: {
                filters: [
                  {
                    field: "verificationStatus",
                    operator: "eq",
                    value: "pending",
                  },
                ],
              },
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
              title: t("dashboard.cards.curriculum"),
              icon: FileText,
              heading: t("dashboard.cards.tasksGrading"),
              description: t("dashboard.cards.viewAllDeadlines"),
              resource: "assignments",
            },
            {
              title: t("dashboard.cards.calendar"),
              icon: Calendar,
              heading: t("dashboard.cards.schedule"),
              description: t("dashboard.cards.deadlinesEvents"),
              resource: "calendar",
            },
            {
              title: t("dashboard.cards.users"),
              icon: Users,
              heading: t("dashboard.cards.directory"),
              description: t("dashboard.cards.studentsStaff"),
              resource: "users",
            },
          ];

  if (isError) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-8 p-4">
        <div className="p-8 rounded-full bg-destructive/5 text-destructive border border-destructive/10">
          <AlertCircle className="h-16 w-16" />
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            {t("dashboard.failedToLoad")}
          </h2>
          <p className="text-muted-foreground font-medium max-w-sm mx-auto">
            {t("dashboard.failedToLoadDescription")}
          </p>
        </div>
        <Button
          onClick={() => {
            void refetchCore();
            void refetchAnalytics();
          }}
          size="lg"
          className="rounded-2xl font-black uppercase tracking-widest h-14 px-10 shadow-xl shadow-primary/20 w-full xs:w-auto"
        >
          {t("buttons.tryAgain")}
        </Button>
      </div>
    );
  }

  if (isIdentityLoading || (isCoreLoading && !coreData && !isParent)) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-8 lg:px-12 xl:px-20 max-w-[1600px] space-y-16">
        <WelcomeHeaderSkeleton />
        <div className="grid gap-8 md:gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-12">
            <ChartSkeleton />
            <ListSkeleton />
          </div>
          <div className="space-y-10">
            <ScheduleSkeleton />
            <StatsSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 md:py-10 lg:py-12 px-4 md:px-6 lg:px-8 relative max-w-[1600px] overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="hidden sm:block absolute top-[-10%] start-[-5%] w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-primary/5 rounded-full blur-[100px] md:blur-[160px] -z-10 animate-pulse" />
      <div className="hidden sm:block absolute bottom-[-5%] end-[-5%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-ai-primary/5 rounded-full blur-[100px] md:blur-[160px] -z-10 animate-pulse delay-1000" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12 md:space-y-16"
      >
        <div className="relative group">
          <WelcomeHeader
            name={identity?.name || "User"}
            isStudent={isStudent}
            user={identity}
            data={analyticsData}
          />
          <div className="absolute top-0 end-0 hidden lg:flex items-center gap-4">
            <Badge
              className="rounded-full px-5 py-2 font-black text-[10px] uppercase tracking-[0.2em] bg-background/60 backdrop-blur-3xl border-border/40 text-muted-foreground shadow-sm group-hover:shadow-md transition-all duration-300"
            >
              <Clock className="h-3.5 w-3.5 me-2 text-primary" />
              {new Date().toLocaleDateString(
                i18n.language === "ar" ? "ar-EG" : "en-US",
                { weekday: "long", month: "short", day: "numeric" },
              )}
            </Badge>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-background/60 backdrop-blur-3xl border-border/40 shadow-sm h-11 w-11 hover:scale-110 active:scale-95 transition-all"
            >
              <Bell className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>

        {/* Archive View Banner */}
        <AnimatePresence>
          {selectedTerm?.status === "archived" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-6 md:p-8 rounded-[2rem] shadow-xl shadow-amber-500/5 backdrop-blur-3xl flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6 text-center sm:text-start"
            >
              <div className="p-3.5 rounded-[1.25rem] bg-amber-500/20 shrink-0">
                <Info className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <div className="space-y-1.5">
                <p className="font-black uppercase tracking-[0.2em] text-[10px] opacity-80">
                  {t("dashboard.archiveViewActive")}
                </p>
                <p className="text-base md:text-xl font-black">
                  {t("dashboard.archiveViewDescription", {
                    termName: selectedTerm.name,
                  })}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-16 md:space-y-24">
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <AdminDashboard
                data={analyticsData}
                isLoading={isAnalyticsLoading}
                onRefresh={() => void refetchAnalytics()}
                show={show}
              />
            </motion.div>
          )}

          {isTeacher && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
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
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
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
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <ParentDashboard
                data={analyticsData}
                isLoading={isAnalyticsLoading}
                show={show}
              />
            </motion.div>
          )}

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
                        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mt-1.5">Shortcuts</span>
                    </div>
                    <div className="hidden sm:block h-px flex-1 bg-gradient-to-r from-primary/10 to-transparent ms-6" />
                  </div>
                  <QuickActions cards={activeCards} list={list} />
                </motion.div>
              </ErrorBoundary>
            </div>

            <div className="space-y-10 md:space-y-16">
              <ErrorBoundary>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-4 mb-6 md:mb-8 px-2 justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/5">
                        <Calendar className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col text-start">
                            <h2 className="text-xl md:text-2xl font-black tracking-tight leading-none">
                                {t("dashboard.todaySchedule")}
                            </h2>
                            <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mt-1.5">Agenda</span>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="hidden xs:flex rounded-full text-[10px] font-black uppercase tracking-widest gap-2 bg-muted/20 hover:bg-muted/40 transition-all px-4 py-2 h-auto">
                        {t("buttons.viewAll")}
                        <ChevronRight className="h-3 w-3 rtl:-scale-x-100" />
                    </Button>
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
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
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
