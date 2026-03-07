import { AccessControlProvider } from "@refinedev/core";
import { authProvider } from "./auth";
import { User } from "@/types";

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }) => {
    const identity = (await authProvider.getIdentity?.()) as User | null;
    const role = identity?.role;
    
    const resourceName = resource || "";

    // 1. Admins have full access
    if (role === "admin") {
      return { can: true };
    }

    // 2. Teacher Permissions
    if (role === "teacher") {
      const teacherSidebarResources = [
        "dashboard", 
        "ai-assistant", 
        "discussions", 
        "calendar", 
        "subjects", 
        "attendance", 
        "submissions",
        "quizzes", 
        "resources",
        "users",
        "classes",
        "modules",
        "notifications",
        "progress",
        "enrollments",
        "classes/enrollments"
      ];
      
      // Basic list/show access for sidebar items
      if (teacherSidebarResources.includes(resourceName)) {
        if (action === "list" || action === "show") return { can: true };
      }

      // Teachers can edit their OWN profile
      if (resourceName === "users" && action === "edit" && params?.id === identity?.id) {
          return { can: true };
      }

      // CRUD access for teaching materials and enrollments
      if ([
        "classes", 
        "assignments", 
        "quizzes", 
        "resources", 
        "modules", 
        "announcements", 
        "enrollments", 
        "classes/enrollments"
      ].includes(resourceName)) {
        if (action === "list" || action === "create") return { can: true };

        // For show/edit/delete, we allow it in the UI and let the backend enforce ownership
        if (["show", "edit", "delete"].includes(action)) {
            return { can: true };
        }
      }
      
      // Explicitly deny other administrative resources for teachers
      if (["departments", "profile-requests", "ai-study-lab", "study-planner", "activity-log"].includes(resourceName)) {
          return { can: false, reason: "Access denied." };
      }

      // Default for other teacher actions
      return { can: true };
    }

    // 3. Student Permissions
    if (role === "student") {
      const allowedResources = [
        "subjects", 
        "classes", 
        "assignments", 
        "discussions", 
        "calendar", 
        "dashboard", 
        "attendance", 
        "submissions",
        "quizzes", 
        "resources",
        "ai-study-lab",
        "study-planner",
        "notifications",
        "progress"
      ];
      const allowedActions = ["list", "show"];

      if (allowedResources.includes(resourceName) && allowedActions.includes(action)) {
        return { can: true };
      }

      // Special case: Students can 'show' users (to see teacher profiles)
      if (resourceName === "users" && action === "show") {
          return { can: true };
      }
      // Special case: Students can 'edit' their own profile
      if (resourceName === "users" && action === "edit" && params?.id === identity?.id) {
          return { can: true };
      }

      if (resourceName === "submissions" && action === "create") {
          return { can: true };
      }

      // Students can SUBMIT quiz attempts
      if (resourceName === "quizzes" && action === "create") {
          return { can: true };
      }

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
