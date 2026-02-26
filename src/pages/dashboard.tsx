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
import { AtRiskStudents } from "@/components/dashboard/at-risk-students";
import { StudentAcademicJourney } from "@/components/dashboard/student-academic-journey";
import { DashboardStats, AttendanceTrend, PendingSubmission, UpcomingAssignment, ScheduleItem } from "@/types/dashboard";

interface GradeDistribution {
  range: string;
  count: number;
}

interface AtRiskStudent {
  id: string;
  name: string;
  image?: string;
  reason: string;
  value: string;
}

interface DashboardData {
  todaySchedule: ScheduleItem[];
  stats?: DashboardStats;
  attendanceTrend?: AttendanceTrend[];
  gradeDistribution?: GradeDistribution[];
  pendingSubmissions?: PendingSubmission[];
  upcomingAssignments?: UpcomingAssignment[];
  atRiskStudents?: AtRiskStudent[];
  gradeTrends?: any[];
  subjectMastery?: any[];
  attendanceSummary?: any;
}

const Dashboard = () => {
  const { list, show } = useNavigation();
  const { data: identity, isLoading: isIdentityLoading } = useGetIdentity<User>();
  
  const isStaff = identity?.role === "teacher" || identity?.role === "admin";
  const isStudent = identity?.role === "student";
  
  // UNIFIED DASHBOARD FETCH
  const { query: dashboardQuery } = useCustom<DashboardData>({
    url: `/dashboard`,
    method: "get",
    queryOptions: { enabled: !!identity },
  });

  // Safe data extraction
  const data = dashboardQuery.data?.data;
  
  const stats = data?.stats;
  const attendanceTrend = data?.attendanceTrend ?? [];
  const gradeDistribution = data?.gradeDistribution ?? [];
  const pendingSubmissions = data?.pendingSubmissions ?? [];
  const upcomingAssignments = data?.upcomingAssignments ?? [];
  const todaySchedule = data?.todaySchedule ?? [];
  const atRiskStudents = data?.atRiskStudents ?? [];
  
  const gradeTrends = data?.gradeTrends ?? [];
  const subjectMastery = data?.subjectMastery ?? [];
  const attendanceSummary = data?.attendanceSummary ?? { present: 0, absent: 0, late: 0, total: 0 };
  
  const isLoading = dashboardQuery.isLoading || dashboardQuery.isFetching;

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

  if (isIdentityLoading || (isLoading && todaySchedule.length === 0)) {
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
            {isStaff && <EngagementChart attendanceData={attendanceTrend} gradeData={gradeDistribution} />}
            {isStudent && (
              <StudentAcademicJourney 
                gradeTrends={gradeTrends} 
                subjectMastery={subjectMastery} 
                attendanceSummary={attendanceSummary} 
              />
            )}
            {isStudent && <UpcomingAssignmentsList assignments={upcomingAssignments} list={list} show={show} />}
            {isStaff && <PendingGradingList submissions={pendingSubmissions} show={show} />}
            <QuickActions cards={activeCards} list={list} />
        </div>

        <div className="space-y-10">
            <TodaySchedule schedule={todaySchedule} show={show} />
            {isStaff && <AtRiskStudents students={atRiskStudents} />}
            {isStaff && (
              <PlatformOverview 
                stats={stats} 
                isLoading={isLoading} 
                onRefresh={() => void dashboardQuery.refetch()}
              />
            )}
            <PromoCards isStaff={isStaff} list={list} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
