import { useNavigation, useGetIdentity, useCustom } from "@refinedev/core";
import { Loader2, Layout, FileText, Calendar, Users } from "lucide-react";
import { User } from "@/types";
import React from "react";

import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { EngagementChart } from "@/components/dashboard/engagement-chart";
import { UpcomingAssignmentsList } from "@/components/dashboard/upcoming-assignments-list";
import { PendingGradingList } from "@/components/dashboard/pending-grading-list";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { TodaySchedule } from "@/components/dashboard/today-schedule";
import { PlatformOverview } from "@/components/dashboard/platform-overview";
import { PromoCards } from "@/components/dashboard/promo-cards";
import { DashboardStats, AttendanceTrend, PendingSubmission, UpcomingAssignment, ScheduleItem } from "@/types/dashboard";

const Dashboard = () => {
  const { list, show } = useNavigation();
  const { data: identity, isLoading: isIdentityLoading } = useGetIdentity<User>();
  
  const isStaff = identity?.role === "teacher" || identity?.role === "admin";
  const isStudent = identity?.role === "student";
  
  // UNIFIED REFINE V5 HOOKS
  const { query: statsQuery } = useCustom<DashboardStats>({
    url: `/stats`,
    method: "get",
    queryOptions: { enabled: isStaff && !!identity },
  });

  const { query: trendQuery } = useCustom<AttendanceTrend[]>({
    url: `/stats/attendance-trend`,
    method: "get",
    queryOptions: { enabled: isStaff && !!identity },
  });

  const { query: pendingQuery } = useCustom<PendingSubmission[]>({
    url: `/submissions/pending`,
    method: "get",
    queryOptions: { enabled: isStaff && !!identity },
  });

  const { query: upcomingQuery } = useCustom<UpcomingAssignment[]>({
    url: `/assignments/upcoming`,
    method: "get",
    queryOptions: { enabled: isStudent && !!identity },
  });

  const { query: scheduleQuery } = useCustom<ScheduleItem[]>({
    url: `/classes/today`,
    method: "get",
    queryOptions: { enabled: !!identity },
  });

  // Safe data extraction
  const stats = statsQuery.data?.data;
  const attendanceTrend = trendQuery.data?.data ?? [];
  const pendingSubmissions = pendingQuery.data?.data ?? [];
  const upcomingAssignments = upcomingQuery.data?.data ?? [];
  const todaySchedule = scheduleQuery.data?.data ?? [];
  
  const isLoadingStats = statsQuery.isLoading || statsQuery.isFetching;
  const isLoadingSchedule = scheduleQuery.isLoading;

  const activeCards = isStudent ? [
    { title: "My Classes", icon: Layout, heading: "Enrolled Classes", description: "Access active classrooms.", resource: "classes" },
    { title: "Assignments", icon: FileText, heading: "My Tasks", description: "Submit your work.", resource: "assignments" },
    { title: "Calendar", icon: Calendar, heading: "Schedule", description: "Deadlines & events.", resource: "calendar" },
  ] : [
    { title: "Classes", icon: Layout, heading: "Manage Classes", description: "Oversee classrooms.", resource: "classes" },
    { title: "Assignments", icon: FileText, heading: "Curriculum", description: "Tasks and grading.", resource: "assignments" },
    { title: "Calendar", icon: Calendar, heading: "Schedule", description: "View all academic deadlines.", resource: "calendar" },
    { title: "Users", icon: Users, heading: "Directory", description: "Students and staff.", resource: "users" },
  ];

  if (isIdentityLoading || (isLoadingSchedule && todaySchedule.length === 0)) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6 relative z-0">
      {/* Background Glows */}
      <div className="hidden sm:block absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      
      <WelcomeHeader name={identity?.name || "User"} isStudent={isStudent} />

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-12">
            {isStaff && <EngagementChart data={attendanceTrend} />}
            {isStudent && <UpcomingAssignmentsList assignments={upcomingAssignments} list={list} show={show} />}
            {isStaff && <PendingGradingList submissions={pendingSubmissions} show={show} />}
            <QuickActions cards={activeCards} list={list} />
        </div>

        <div className="space-y-10">
            <TodaySchedule schedule={todaySchedule} show={show} />
            {isStaff && (
              <PlatformOverview 
                stats={stats} 
                isLoading={isLoadingStats} 
                onRefresh={() => void statsQuery.refetch()} 
              />
            )}
            <PromoCards isStaff={isStaff} list={list} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
