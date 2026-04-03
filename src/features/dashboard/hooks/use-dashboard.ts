import { useEffect } from "react";
import { useList, useNavigation, useCustom } from "@refinedev/core";
import { User, Class } from "@/types";
import { DashboardData } from "@/types/dashboard";
import { useTerm } from "@/contexts/term-context";
import { socket, connectSocket } from "@/lib/socket";
import { useUserRole } from "@/hooks/use-user-role";

export const useDashboard = () => {
  const { list, show } = useNavigation();
  const { selectedTerm } = useTerm();
  const {
    identity,
    isLoading: isIdentityLoading,
    refetch: refetchIdentity,
    isStaff,
    isAdmin,
    isTeacher,
    isStudent,
    isParent,
  } = useUserRole();

  // Unified Dashboard Query (Merged Core + Analytics for better performance)
  const { query: dashboardQuery } = useCustom<DashboardData>({
    url: `/dashboard`,
    method: "get",
    queryOptions: {
      enabled: !!identity && !isParent,
      staleTime: 30000, // 30 seconds cache
    },
    config: {
      query: {
        sections: isStaff
          ? `schedule,stats,attendanceTrend,gradeDistribution,pendingSubmissions,atRiskStudents,rlhf,notifications,myClasses${isTeacher ? ",channelStats" : ""}`
          : "schedule,upcomingAssignments,gradeTrends,subjectMastery,attendanceSummary,resubmissions,notifications,myClasses",
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
      { field: "my", operator: "eq" as const, value: "true" },
      ...(selectedTerm
        ? [{ field: "termId", operator: "eq" as const, value: selectedTerm.id }]
        : []),
    ],
    queryOptions: { enabled: isStudent && !!selectedTerm, staleTime: 60000 },
  });

  // This makes the 'Pending Verifications' list load instantly for admins
  useList<User>({
    resource: "users",
    filters: [
      {
        field: "verificationStatus",
        operator: "eq" as const,
        value: "pending",
      },
    ],
    queryOptions: { enabled: isAdmin, staleTime: 60000 },
  });

  const { refetch: refetchDashboard } = dashboardQuery;

  const dashboardData: DashboardData = dashboardQuery.data?.data || {
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
    rlhf: [],
  };

  // 🛡️ ADAPTIVE UI: Global AI Cache Cleanup
  // Rule: Clear local persistence if AI features are disabled platform-wide
  useEffect(() => {
    const isAiEnabled = dashboardData.globalConfig?.enableAiFeatures;
    if (isAiEnabled === false) {
      console.warn("🛡️ AI Features disabled platform-wide. Purging local AI cache...");

      // 1. Clear LocalStorage Drafts
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("draft:ai-")) {
          localStorage.removeItem(key);
        }
      });

      // 2. Clear Dexie Cache (If implemented for AI)
      // Note: dexie is imported via src/lib/offline-db
      import("@/lib/offline-db").then(({ offlineDB }) => {
        // If we had an ai_history table in Dexie, we could clear it here
        // For now, dexie only has 'outbox'
        if ((offlineDB as any).ai_history) {
          (offlineDB as any).ai_history.clear();
        }
      });
    }
  }, [dashboardData.globalConfig?.enableAiFeatures]);

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
    navigation: {
      list,
      show,
      refetchCore: refetchDashboard,
      refetchAnalytics: refetchDashboard,
    },
  };
};
