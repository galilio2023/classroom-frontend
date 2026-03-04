import { useNavigation, useGetIdentity, useCustom } from "@refinedev/core";
import { Layout, FileText, Calendar, Users, AlertCircle } from "lucide-react";
import { User } from "@/types";
import React, { useEffect } from "react";
import { io } from "socket.io-client";

import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { TodaySchedule } from "@/components/dashboard/today-schedule";
import { PromoCards } from "@/components/dashboard/promo-cards";
import { StaffDashboard } from "@/components/dashboard/staff-dashboard";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
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

const Dashboard = () => {
  const { list, show } = useNavigation();
  const { data: identity, isLoading: isIdentityLoading } = useGetIdentity<User>();
  
  const isStaff = identity?.role === "teacher" || identity?.role === "admin";
  const isStudent = identity?.role === "student";
  
  const { query: dashboardQuery } = useCustom<DashboardData>({
    url: `/dashboard`,
    method: "get",
    queryOptions: { 
      enabled: !!identity,
      staleTime: 5 * 60 * 1000,
    },
  });

  const { data: dashboardResponse, isLoading: isDashboardLoading, isFetching, isError, refetch } = dashboardQuery;
  const data = dashboardResponse?.data;
  const isLoading = isDashboardLoading || isFetching;

  // --- REAL-TIME UPDATES ---
  useEffect(() => {
    if (!identity?.id) return;
    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL.replace("/api", "");
    const socket = io(socketUrl, { query: { userId: identity.id }, withCredentials: true });
    const handleRefresh = () => void refetch();
    socket.on("notification", handleRefresh);
    socket.on("new_discussion", handleRefresh);
    return () => {
      socket.off("notification", handleRefresh);
      socket.off("new_discussion", handleRefresh);
      socket.disconnect();
    };
  }, [identity?.id, refetch]);

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

  if (isError) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Failed to load dashboard</h2>
        <Button onClick={() => void refetch()}>Try Again</Button>
      </div>
    );
  }

  if (isIdentityLoading || (isLoading && !data)) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
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
      <div className="hidden sm:block absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      
      <WelcomeHeader name={identity?.name || "User"} isStudent={isStudent} />

      <div className="space-y-12">
        {isStaff && data && (
          <StaffDashboard data={data} isLoading={isLoading} onRefresh={() => void refetch()} show={show} />
        )}
        
        {isStudent && data && (
          <StudentDashboard data={data} list={list} show={show} />
        )}

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ErrorBoundary>
              <QuickActions cards={activeCards} list={list} />
            </ErrorBoundary>
          </div>
          <div className="space-y-10">
            <ErrorBoundary>
              <TodaySchedule schedule={data?.todaySchedule ?? []} show={show} />
            </ErrorBoundary>
            <ErrorBoundary>
              <PromoCards isStaff={isStaff} list={list} />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
