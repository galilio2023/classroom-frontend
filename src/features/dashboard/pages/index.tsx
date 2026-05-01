import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useNavigation } from "@refinedev/core";
import { Layout, FileText, Calendar, Users, Zap, Plus, Search, GraduationCap } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Hooks
import { useDashboard } from "../hooks/use-dashboard";
import { useCapabilities } from "@/hooks/use-capabilities";
import usePageTitle from "@/hooks/use-page-title";

// Components
import { DashboardHeader } from "../components/dashboard-header";
import { PendingEnrollmentBanner } from "../components/PendingEnrollmentBanner";
import { PendingVerificationBanner } from "../components/PendingVerificationBanner";
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

  const { isStudent } = useCapabilities();
  const enrollments = (identity as any)?.enrollments || [];
  const hasApprovedEnrollments = enrollments.some((e: any) => e.status === "approved");
  const showStudentEmptyState = isStudent && enrollments.length === 0;
  const showStudentPendingState = isStudent && enrollments.length > 0 && !hasApprovedEnrollments;
  const showStandardDashboard = !isStudent || hasApprovedEnrollments;

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
      <div className="container mx-auto py-8 md:py-12 px-4 space-y-12 max-w-[1600px]">
        <div className="flex justify-between items-end mb-12">
          <div className="space-y-4">
            <Skeleton className="h-4 w-32 rounded-full opacity-50" />
            <Skeleton className="h-12 w-80 rounded-2xl" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-14 w-40 rounded-2xl" />
            <Skeleton className="h-14 w-14 rounded-2xl" />
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-8 rounded-[2.5rem] bg-card/40 border border-border/40 space-y-6"
            >
              <div className="flex justify-between items-start">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-2/3 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">
            <Skeleton className="h-[500px] rounded-[3rem]" />
          </div>
          <div className="space-y-10">
            <Skeleton className="h-80 rounded-[3rem]" />
            <Skeleton className="h-64 rounded-[3rem]" />
          </div>
        </div>
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

          {roles.isStudent && <PendingEnrollmentBanner enrollments={enrollments} />}
          {roles.isStaff && identity?.verificationStatus !== "verified" && (
            <PendingVerificationBanner status={identity?.verificationStatus} />
          )}

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

            {/* 🛡️ STUDENT DASHBOARD LOGIC: Empty/Pending/Standard States */}
            {roles.isStudent && showStandardDashboard && (
              <StudentDashboard
                identity={identity}
                data={analyticsData}
                isLoading={isAnalyticsLoading}
                list={navigation.list}
                show={navigation.show}
              />
            )}

            {showStudentEmptyState && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="p-10 rounded-[3rem] bg-primary/5 border-2 border-dashed border-primary/20 shadow-2xl shadow-primary/5 group">
                  <GraduationCap className="h-24 w-24 text-primary/20 group-hover:scale-110 group-hover:text-primary/30 transition-all duration-500" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">
                    {t("dashboard.student.noClasses", "You have no classes yet")}
                  </h2>
                  <p className="text-muted-foreground text-lg font-medium max-w-sm mx-auto leading-relaxed">
                    {t(
                      "dashboard.student.noClassesDesc",
                      "Join a classroom to start your learning journey with Egypt's best educators."
                    )}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-5">
                  <Button
                    size="lg"
                    className="rounded-2xl h-16 px-10 font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                    onClick={() => push("/classes")}
                  >
                    <Plus className="h-4 w-4" />
                    {t("dashboard.student.enterInviteCode", "Enter Invite Code")}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-2xl h-16 px-10 font-black uppercase tracking-widest text-[10px] gap-3 border-border/60 bg-background/50 backdrop-blur-xl transition-all hover:scale-105 active:scale-95"
                    onClick={() => push("/discovery")}
                  >
                    <Search className="h-4 w-4" />
                    {t("dashboard.student.browseClasses", "Browse Classes")}
                  </Button>
                </div>
              </div>
            )}

            {showStudentPendingState && (
              <div className="space-y-12 animate-in fade-in duration-700">
                <div className="text-start space-y-3 border-s-4 border-amber-500 ps-6">
                  <h2 className="text-2xl md:text-4xl font-black tracking-tight uppercase">
                    {t("dashboard.student.awaitingApproval", "Awaiting Approval")}
                  </h2>
                  <p className="text-muted-foreground text-lg font-medium">
                    {t(
                      "dashboard.student.pendingNotice",
                      "Your teacher will approve your enrollment soon."
                    )}
                  </p>
                </div>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {enrollments.map((enrollment: any) => {
                    const classItem = enrollment.class;
                    const teacher =
                      classItem?.teachers?.find((t: any) => t.isPrimary)?.teacher ||
                      classItem?.teacher;

                    return (
                      <Card
                        key={enrollment.id}
                        className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-card/40 backdrop-blur-3xl group hover:shadow-primary/10 transition-all duration-500 border border-border/40"
                      >
                        <CardContent className="p-10 space-y-8">
                          <div className="flex justify-between items-start">
                            <div className="p-4 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/5">
                              <Layout className="h-6 w-6" />
                            </div>
                            <Badge className="bg-amber-500/10 text-amber-600 border-none rounded-full px-5 py-2 font-black uppercase tracking-[0.15em] text-[10px] shadow-sm">
                              {t("common:status.pending", "Pending")}
                            </Badge>
                          </div>
                          <div className="space-y-3 text-start">
                            <h3 className="text-2xl font-black tracking-tight leading-[1.1] group-hover:text-primary transition-colors line-clamp-2">
                              {classItem?.name || "Class"}
                            </h3>
                            <div className="flex items-center gap-3 text-muted-foreground">
                              <div className="p-1.5 rounded-lg bg-muted/50 border border-border/40">
                                <Users className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-[11px] font-bold uppercase tracking-widest">
                                {teacher?.name || "Teacher"}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {roles.isParent && (
              <ParentDashboard
                data={analyticsData}
                isLoading={isAnalyticsLoading}
                show={navigation.show}
              />
            )}

            {/* Footer Grid: Quick Actions & Today's Agenda (Only for non-students as StudentDashboard handles it) */}
            {showStandardDashboard && !roles.isStudent && (
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
