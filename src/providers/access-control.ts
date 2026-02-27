import { AccessControlProvider } from "@refinedev/core";
import { authProvider } from "./auth";
import { dataProvider } from "./data";
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
      // Sidebar resources for teachers (Removed "users" from here)
      const teacherSidebarResources = ["dashboard", "ai-assistant", "discussions", "calendar", "departments", "subjects", "attendance", "submissions"];
      
      if (teacherSidebarResources.includes(resourceName)) {
        return { can: true };
      }

      // Teachers can view user profiles (e.g., clicking a student's name)
      if (resourceName === "users" && action === "show") {
          return { can: true };
      }

      if (resourceName === "classes" || resourceName === "assignments") {
        if (action === "list" || action === "create") {
          return { can: true };
        }

        if (["show", "edit", "delete"].includes(action)) {
          if (!params?.id) return { can: false, reason: "No record ID provided." };

          if (params?.userData) {
              const data = params.userData;
              if (resourceName === "classes" && data.teacherId === identity?.id) return { can: true };
              if (resourceName === "assignments" && data.class?.teacherId === identity?.id) return { can: true };
          }

          try {
            const { data } = await dataProvider.getOne({ resource: resourceName, id: params.id });
            if (resourceName === "classes" && data?.teacherId === identity?.id) return { can: true };
            if (resourceName === "assignments" && data?.class?.teacherId === identity?.id) return { can: true };
            return { can: false, reason: "You do not own this resource." }; 
          } catch (error) {
            return { can: false, reason: "Access denied or resource not found." };
          }
        }
      }

      return { can: false, reason: "Access denied for Teacher role." };
    }

    // 3. Student Permissions
    if (role === "student") {
      const allowedResources = ["subjects", "classes", "assignments", "discussions", "calendar", "dashboard", "attendance", "submissions"];
      const allowedActions = ["list", "show"];

      if (allowedResources.includes(resourceName) && allowedActions.includes(action)) {
        return { can: true };
      }
      
      if (resourceName === "submissions" && action === "create") {
          return { can: true };
      }

      return { can: false, reason: "Access denied for Student role." };
    }

    return { can: false, reason: "Unauthorized." };
  },
  options: {
    buttons: {
      hideIfUnauthorized: true,
    },
  },
};
