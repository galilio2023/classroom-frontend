import { AccessControlProvider } from "@refinedev/core";
import { authProvider } from "./auth";
import { User, UserRole } from "@/types";

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }) => {
    const identity = (await authProvider.getIdentity?.()) as User | null;
    if (!identity) return { can: false, reason: "Unauthorized." };

    const role = identity.role?.toLowerCase();
    const resourceName = resource || "";

    // 1. Admins have full access
    if (role === UserRole.ADMIN) {
      return { can: true };
    }

    // 2. Teacher Permissions
    if (role === UserRole.TEACHER) {
      if (resourceName === "teacher-applications") {
        if (["list", "create", "show"].includes(action)) return { can: true };
        return { can: false, reason: "You cannot edit or delete applications." };
      }

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
        "classes",
        "modules",
        "notifications",
        "progress",
        "enrollments",
        "classes/enrollments"
      ];
      
      if (teacherSidebarResources.includes(resourceName)) {
        if (action === "list" || action === "show") return { can: true };
      }

      // Neutralize phantom show/edit for specific resources
      if (["enrollments", "attendance"].includes(resourceName)) {
          if (["show", "edit"].includes(action)) return { can: false, reason: "View via Class dashboard." };
      }

      if (resourceName === "users" && action === "show") return { can: true };
      if (resourceName === "users" && action === "edit" && params?.id === identity?.id) return { can: true };

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
        if (["show", "edit", "delete"].includes(action)) return { can: true };
      }
      
      if (["departments", "profile-requests", "ai-study-lab", "study-planner", "activity-log"].includes(resourceName)) {
          return { can: false, reason: "Access denied." };
      }

      return { can: true };
    }

    // 3. Student Permissions
    if (role === UserRole.STUDENT) {
      const allowedResources = [
        "subjects", "classes", "assignments", "discussions", "calendar", 
        "dashboard", "attendance", "submissions", "quizzes", "resources", 
        "modules", "ai-study-lab", "study-planner", "notifications", "progress",
        "report-card", "portfolio"
      ];

      if (allowedResources.includes(resourceName) && ["list", "show"].includes(action)) return { can: true };
      
      // Neutralize phantom show/edit for specific resources
      if (["enrollments", "attendance"].includes(resourceName)) {
          if (["show", "edit"].includes(action)) return { can: false, reason: "Access denied." };
      }

      if (resourceName === "users" && action === "show") return { can: true };
      if (resourceName === "users" && action === "edit" && params?.id === identity?.id) return { can: true };
      if (resourceName === "submissions" && action === "create") return { can: true };
      
      // FIXED: Students should NOT be able to 'create' official quizzes. 
      // They can 'list' and 'show' them to take them.
      if (resourceName === "quizzes" && action === "create") return { can: false, reason: "Students cannot create official quizzes." };

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
