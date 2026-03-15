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

    // 1. ADMISSION: Admins have full access
    if (role === UserRole.ADMIN) {
      return { can: true };
    }

    // 2. TEACHER PERMISSIONS
    if (role === UserRole.TEACHER) {
      // Specific restriction for applications
      if (resourceName === "teacher-applications") {
        return { can: ["list", "create", "show"].includes(action) };
      }

      // Sidebar & Core Resources
      const allowedResources = [
        "dashboard", "ai-assistant", "discussions", "calendar", "subjects", 
        "attendance", "submissions", "quizzes", "resources", "classes", 
        "modules", "notifications", "progress", "enrollments", 
        "classes/enrollments", "announcements", "messages", "users"
      ];

      if (allowedResources.includes(resourceName)) {
        // Teachers can't delete users or subjects
        if (["users", "subjects"].includes(resourceName) && action === "delete") return { can: false };
        
        // Profiles: Can only edit their own
        if (resourceName === "users" && action === "edit" && params?.id !== identity?.id) return { can: false };

        return { can: true };
      }

      // Forbidden for Teachers
      const forbidden = ["departments", "profile-requests", "ai-study-lab", "study-planner", "activity-log"];
      if (forbidden.includes(resourceName)) return { can: false };

      return { can: true };
    }

    // 3. STUDENT PERMISSIONS
    if (role === UserRole.STUDENT) {
      const studentAllowed = [
        "subjects", "classes", "assignments", "discussions", "calendar", 
        "dashboard", "attendance", "submissions", "quizzes", "resources", 
        "modules", "ai-study-lab", "study-planner", "notifications", "progress",
        "report-card", "portfolio", "messages", "users"
      ];

      if (!studentAllowed.includes(resourceName)) return { can: false };

      // Read-only for most things
      if (["list", "show"].includes(action)) return { can: true };

      // Specific Write Actions for Students
      if (resourceName === "submissions" && action === "create") return { can: true };
      if (resourceName === "messages" && action === "create") return { can: true };
      if (resourceName === "discussions" && action === "create") return { can: true };
      
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
