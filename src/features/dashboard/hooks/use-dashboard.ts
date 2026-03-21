import { useEffect } from "react";
import { useList, useNavigation, useGetIdentity, useCustom } from "@refinedev/core";
import { User, UserRole, Class } from "@/types";
import { DashboardData } from "@/types/dashboard";
import { useTerm } from "@/contexts/term-context";
import { socket, connectSocket } from "@/lib/socket";

export const useDashboard = () => {
  const { list, show } = useNavigation();
  const { selectedTerm } = useTerm();
  const {
    data: identity,
    isLoading: isIdentityLoading,
    refetch: refetchIdentity,
  } = useGetIdentity<User>();

  const isStaff = identity?.role === UserRole.TEACHER || identity?.role === UserRole.ADMIN;
  const isAdmin = identity?.role === UserRole.ADMIN;
  const isTeacher = identity?.role === UserRole.TEACHER;
  const isStudent = identity?.role === UserRole.STUDENT;
  const isParent = identity?.role === UserRole.PARENT;

  // Unified Dashboard Query (Merged Core + Analytics for better performance)
  const { query: dashboardQuery } = useCustom<DashboardData>({
    url: `/dashboard`,
    method: "get",
    queryOptions: {
      enabled: !!identity && !!selectedTerm && !isParent, 
      staleTime: 30000, // 30 seconds cache
    },
    config: {
      query: {
        sections: isStaff
          ? `schedule,stats,attendanceTrend,gradeDistribution,pendingSubmissions,atRiskStudents${isTeacher ? ",channelStats" : ""}`
          : "schedule,upcomingAssignments,gradeTrends,subjectMastery,attendanceSummary",
        termId: selectedTerm?.id,
        ...(isTeacher ? { teacherId: identity?.id } : {}),
      },
    },
  });

  // BRAVE: Role-Based Strategic Pre-fetching
  // This makes navigation to Classes feel instant for students
  useList<Class>({
    resource: "classes",
    filters: [
        { field: "my", operator: "eq" as "eq", value: "true" },
        ...(selectedTerm ? [{ field: "termId", operator: "eq" as "eq", value: selectedTerm.id }] : [])
    ],
    queryOptions: { enabled: isStudent && !!selectedTerm, staleTime: 60000 }
  });

  // This makes the 'Pending Verifications' list load instantly for admins
  useList<User>({
    resource: "users",
    filters: [{ field: "verificationStatus", operator: "eq" as "eq", value: "pending" }],
    queryOptions: { enabled: isAdmin, staleTime: 60000 }
  });

  const { refetch: refetchDashboard } = dashboardQuery;

  // Socket Logic
  useEffect(() => {
    if (!identity?.id) return;
    
    const handleRefresh = () => {
      void refetchDashboard();
      void refetchIdentity();
    };

    void connectSocket().then(() => {
        socket.on("notification", handleRefresh);
        socket.on("new_discussion", handleRefresh);
    });

    return () => {
      socket.off("notification", handleRefresh);
      socket.off("new_discussion", handleRefresh);
    };
  }, [identity?.id, refetchDashboard, refetchIdentity]);

  const dashboardData: DashboardData = dashboardQuery.data?.data || {
    todaySchedule: [],
    stats: { totalUsers: 0, totalStudents: 0, totalTeachers: 0, totalClasses: 0, totalAssignments: 0, pendingVerifications: 0 },
    attendanceTrend: [],
    gradeDistribution: [],
    pendingSubmissions: [],
    atRiskStudents: [],
    upcomingAssignments: [],
    gradeTrends: [],
    subjectMastery: [],
  };

  return {
    identity,
    isIdentityLoading,
    isCoreLoading: dashboardQuery.isLoading,
    isAnalyticsLoading: dashboardQuery.isLoading,
    isError: dashboardQuery.isError,
    coreData: dashboardData,
    analyticsData: dashboardData,
    selectedTerm,
    roles: { isStaff, isAdmin, isTeacher, isStudent, isParent },
    navigation: { list, show, refetchCore: refetchDashboard, refetchAnalytics: refetchDashboard }
  };
};
