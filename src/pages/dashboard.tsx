import { useNavigation, useGetIdentity, useCustom } from "@refinedev/core";
import { Loader2, Layout, FileText, Calendar, Users } from "lucide-react";
import { User } from "@/types";
import React, { useState, useEffect } from "react";

import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { EngagementChart } from "@/components/dashboard/engagement-chart";
import { UpcomingAssignmentsList } from "@/components/dashboard/upcoming-assignments-list";
import { PendingGradingList } from "@/components/dashboard/pending-grading-list";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { TodaySchedule } from "@/components/dashboard/today-schedule";
import { PlatformOverview } from "@/components/dashboard/platform-overview";
import { PromoCards } from "@/components/dashboard/promo-cards";

// 1. Define strict TypeScript interfaces for your data
interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
}

interface AttendanceTrend {
  date: string;
  present: number;
}

interface ScheduleItem {
  id: string;
  name: string;
  todaySchedule?: { startTime: string; endTime: string };
}

interface UpcomingAssignment {
  id: string;
  title: string;
  dueDate: string;
  class?: { name: string };
}

interface PendingSubmission {
  id: string;
  assignmentId: string;
  createdAt: string;
  student?: { name: string; image?: string };
  assignment?: { title: string };
}

const Dashboard = () => {
  const { list, show } = useNavigation();
  const { data: identity, isLoading: isIdentityLoading } = useGetIdentity<User>();
  
  const role = identity?.role;
  const isStaff = role === "teacher" || role === "admin";
  const isStudent = role === "student";
  
  const apiUrl = import.meta.env.VITE_API_URL;

  // Manual fetch function for stats to guarantee a callable refresh function
  const [stats, setStats] = useState<DashboardStats | undefined>(undefined);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const fetchDashboardData = async () => {
    if (!isStaff || !identity) return;
    setIsLoadingStats(true);
    try {
        const response = await fetch(`${apiUrl}/stats`, {
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
        });
        if (response.ok) {
            const json = await response.json();
            setStats(json.data || json);
        }
    } catch (error) {
        console.error("Failed to fetch stats:", error);
    } finally {
        setIsLoadingStats(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (isStaff && identity) {
        void fetchDashboardData();
    }
  }, [isStaff, identity]);

  // Use hooks for other data
  const trendQuery = useCustom<AttendanceTrend[]>({
    url: `${apiUrl}/stats/attendance-trend`,
    method: "get",
    queryOptions: { enabled: isStaff && !!identity },
  }) as any;

  const pendingQuery = useCustom<PendingSubmission[]>({
    url: `${apiUrl}/submissions/pending`,
    method: "get",
    queryOptions: { enabled: isStaff && !!identity },
  }) as any;

  const upcomingQuery = useCustom<UpcomingAssignment[]>({
    url: `${apiUrl}/assignments/upcoming`,
    method: "get",
    queryOptions: { enabled: isStudent && !!identity },
  }) as any;

  const scheduleQuery = useCustom<ScheduleItem[]>({
    url: `${apiUrl}/classes/today`,
    method: "get",
    queryOptions: { enabled: !!identity },
  }) as any;

  // Extract data arrays securely
  const attendanceTrend = trendQuery.data?.data || [];
  const pendingSubmissions = pendingQuery.data?.data || [];
  const upcomingAssignments = upcomingQuery.data?.data || [];
  const todaySchedule = scheduleQuery.data?.data || [];
  const isLoadingSchedule = scheduleQuery.isFetching;

  const activeCards = isStudent ? [
    { title: "My Classes", icon: Layout, heading: "Enrolled Classes", description: "Access your active classrooms.", resource: "classes" },
    { title: "Assignments", icon: FileText, heading: "My Tasks", description: "View and submit your work.", resource: "assignments" },
    { title: "Calendar", icon: Calendar, heading: "Schedule", description: "Track your academic deadlines.", resource: "calendar" },
  ] : [
    { title: "Classes", icon: Layout, heading: "Manage Classes", description: "Create and oversee classrooms.", resource: "classes" },
    { title: "Assignments", icon: FileText, heading: "Curriculum", description: "Manage tasks and grading.", resource: "assignments" },
    { title: "Calendar", icon: Calendar, heading: "Schedule", description: "View all academic deadlines.", resource: "calendar" },
    { title: "Users", icon: Users, heading: "Directory", description: "Manage students and staff.", resource: "users" },
  ];

  if (isIdentityLoading || (isLoadingSchedule && todaySchedule.length === 0)) {
    return (
        <div className="flex h-[80vh] items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="container mx-auto py-6 md:py-10 px-4 md:px-6 relative z-0">
      {/* Background Glows */}
      <div className="hidden sm:block absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="hidden sm:block absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -z-10 animate-pulse delay-700" />

      <WelcomeHeader name={identity?.name || "User"} isStudent={isStudent} />

      <div className="grid gap-6 md:gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8 md:space-y-12">
            
            {isStaff && <EngagementChart data={attendanceTrend} />}

            {isStudent && <UpcomingAssignmentsList assignments={upcomingAssignments} list={list} show={show} />}

            {isStaff && <PendingGradingList submissions={pendingSubmissions} show={show} />}

            <QuickActions cards={activeCards} list={list} />
        </div>

        <div className="space-y-8 md:space-y-10">
            <TodaySchedule schedule={todaySchedule} show={show} />

            {isStaff && <PlatformOverview stats={stats} isLoading={isLoadingStats} onRefresh={() => void fetchDashboardData()} />}

            <PromoCards isStaff={isStaff} list={list} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
