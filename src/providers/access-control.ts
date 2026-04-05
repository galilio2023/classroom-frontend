import { AccessControlProvider } from "@refinedev/core";
import { authProvider } from "./auth";
import { User, UserRole } from "@/types";

/**
 * Access Control Provider
 * Handles client-side visibility of resources and actions based on user roles and department isolation.
 */
export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }) => {
    const user = (await authProvider.getIdentity?.()) as User | null;
    if (!user) return { can: false };

    const role = user.role;
    const resourceName = resource || "";

    // 🛡️ ADMIN: Superuser access
    if (role === UserRole.ADMIN) {
      const adminAllowedResources = [
        "dashboard",
        "users",
        "departments",
        "academic-terms",
        "subjects",
        "attendance",
        "submissions",
        "enrollments",
        "student-subscriptions",
        "announcements",
        "teacher-applications",
        "discussions",
        "calendar",
        "notifications",
        "profile-requests",
        "activity-log",
        "ai-health-reports",
        "ai-metrics",
        "badges",
        "settings",
        "monetization",
        "portfolio",
        "messages",
        "my-teachers",
        "channels",
      ];

      if (adminAllowedResources.includes(resourceName)) {
        // Admins can do anything on their allowed resources
        return { can: true };
      }
    }

    // 🛡️ TEACHER: Content and Class Management
    if (role === UserRole.TEACHER) {
      const teacherAllowed = [
        "dashboard",
        "calendar",
        "notifications",
        "messages",
        "meetings",
        "classes",
        "subjects",
        "academic-terms",
        "modules",
        "resources",
        "assignments",
        "quizzes",
        "submissions",
        "enrollments",
        "attendance",
        "announcements",
        "project-groups",
        "discussions",
        "library",
        "badges",
        "monetization",
        "teacher-channel",
        "ai-activity-logs",
        "ai_features",
      ];

      if (!teacherAllowed.includes(resourceName)) return { can: false };
      return { can: true };
    }

    // 🛡️ STUDENT: Learning Hub
    if (role === UserRole.STUDENT) {
      const studentAllowed = [
        "dashboard",
        "calendar",
        "notifications",
        "messages",
        "classes",
        "enrollments",
        "attendance",
        "announcements",
        "project-groups",
        "library",
        "student-subscriptions",
        "ai-activity-logs",
        "badges",
        "ai_features",
      ];

      if (!studentAllowed.includes(resourceName)) return { can: false };

      // Students can't create or edit academic structures
      if (["create", "edit", "delete"].includes(action)) {
        // Exception: discussions and submissions
        if (["discussions", "submissions"].includes(resourceName)) {
          return { can: true };
        }
        return { can: false, reason: "Students cannot perform this action." };
      }

      return { can: true };
    }

    // 🛡️ PARENT: Monitoring Portal
    if (role === UserRole.PARENT) {
      const parentAllowed = [
        "dashboard",
        "guardian-portal",
        "meetings",
        "messages",
        "notifications",
        "badges",
      ];
      if (!parentAllowed.includes(resourceName)) return { can: false };
      return { can: true };
    }

    // 🛡️ DATA ISOLATION (Multi-Tenancy)
    // If a specific record is provided, check department_id alignment
    if (params?.record && "departmentId" in params.record) {
      const record = params.record as { departmentId: number };
      if (record.departmentId !== user.departmentId && role !== UserRole.ADMIN) {
        return {
          can: false,
          reason: `Logical Isolation: This record belongs to Department ${record.departmentId}.`,
        };
      }
    }

    return { can: false, reason: "Unauthorized." };
  },
  options: {
    buttons: {
      hideIfUnauthorized: true,
    },
  },
};
