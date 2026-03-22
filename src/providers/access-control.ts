import { AccessControlProvider } from "@refinedev/core";
import { authProvider } from "./auth";
import { User, UserRole } from "@/types";

/**
 * Access Control Provider
 * Handles client-side visibility of resources and actions.
 * Note: Backend still enforces strict ownership and scoping.
 */
export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }) => {
    const identity = (await authProvider.getIdentity?.()) as User | null;
    if (!identity) return { can: false, reason: "Unauthorized." };

    const role = identity.role?.toLowerCase();
    const resourceName = resource || "";

    // 1. ADMISSION: Admins have specific access
    if (role === UserRole.ADMIN) {
      const adminAllowedResources = [
        "dashboard", "departments", "users", "activity-log", "settings",
        "profile-requests", "ai-study-lab", "study-planner", "ai-assistant",
      ];
      const academicResources = [
        "classes", "assignments", "quizzes", "modules", "resources", "academic-terms",
        "subjects", "attendance", "submissions", "enrollments", "announcements",
        "teacher-subscriptions", "teacher-applications", "discussions", "calendar",
        "notifications", "progress", "report-card", "portfolio", "messages", "my-teachers"
      ];

      if (adminAllowedResources.includes(resourceName)) {
        // Admins can do anything on their allowed resources
        return { can: true };
      }

      if (academicResources.includes(resourceName)) {
        // Admins can OBSERVE (list/show) but NOT MODIFY academic data
        if (["list", "show"].includes(action)) return { can: true };
        return { can: false, reason: "Admins are not allowed to modify academic resources." };
      }

      // Default for any other resource not explicitly listed
      return { can: false, reason: "Access denied for this resource." };
    }

    // 2. TEACHER PERMISSIONS
    if (role === UserRole.TEACHER) {
      // Teachers can manage their own classes
      if (resourceName === "classes") {
        // Teachers can create classes
        if (action === "create") return { can: true };
        
        // Teachers can list and show all classes
        if (["list", "show"].includes(action)) return { can: true };
        
        // Ownership check for sensitive actions
        if (["edit", "delete"].includes(action)) {
          // If we have the record, check if this teacher is the owner
          const record = (params as any)?.record;
          if (record && record.teacherId) {
            return { can: record.teacherId === identity.id };
          }
          // Fallback: allow it if no record is provided (backend will still block)
          return { can: true };
        }
      }

      // Teachers can view individual profiles but cannot access global users list
      if (resourceName === "users") {
        if (["show"].includes(action)) return { can: true };
        if (action === "edit" && params?.id === identity?.id) return { can: true };
        return { can: false, reason: "Teachers cannot access the global users directory or edit other user profiles." };
      }

      // Teachers can view their subscribers (new resource/action)
      if (resourceName === "teacher-subscriptions" && ["list", "show"].includes(action)) {
        return { can: true };
      }

      // Specific restriction for applications
      if (resourceName === "teacher-applications") {
        return { can: ["list", "create", "show"].includes(action) };
      }

      // Sidebar & Core Resources (removed "users" to enforce isolation)
      const allowedResources = [
        "dashboard", "ai-assistant", "discussions", "calendar", "subjects",
        "attendance", "submissions", "quizzes", "resources", "classes",
        "modules", "notifications", "progress", "enrollments",
        "classes/enrollments", "announcements", "messages",
        "teacher-channel", "teacher-subscriptions", "academic-terms" // Added academic-terms
      ];

      if (allowedResources.includes(resourceName)) {
        // Teachers can't delete subjects
        if (resourceName === "subjects" && action === "delete") return { can: false };

        return { can: true };
      }

      // Forbidden for Teachers
      const forbidden = ["departments", "profile-requests", "ai-study-lab", "study-planner", "activity-log", "settings"]; // Removed academic-terms
      if (forbidden.includes(resourceName)) return { can: false };

      return { can: false, reason: "Access denied for this resource." };
    }

    // 3. STUDENT PERMISSIONS
    if (role === UserRole.STUDENT) {
      const studentAllowed = [
        "dashboard", "subjects", "classes", "assignments", "discussions", "calendar",
        "attendance", "submissions", "quizzes", "resources",
        "modules", "ai-study-lab", "study-planner", "notifications", "progress",
        "report-card", "portfolio", "messages", "users",
        "teacher-subscriptions", "my-teachers", "teacher-channels", "project-groups", "library", "enrollments"
      ];

      if (!studentAllowed.includes(resourceName)) return { can: false };

      // Read-only for most things
      if (["list", "show"].includes(action)) return { can: true };

      // Specific Write Actions for Students
      if (resourceName === "submissions" && action === "create") return { can: true };
      if (resourceName === "messages" && action === "create") return { can: true };
      if (resourceName === "discussions" && action === "create") return { can: true };

      // Students can enroll in classes
      if (resourceName === "classes" && action === "enroll") return { can: true };

      // Profiles: Can only edit their own
      if (resourceName === "users" && action === "edit" && params?.id === identity?.id) return { can: true };

      return { can: false, reason: "Access denied." };
    }

    return { can: false, reason: "Unauthorized." };
  },
  options: {
    buttons: {
      hideIfUnauthorized: true,
    },
  },
};
