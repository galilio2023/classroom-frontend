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
        "classes"
      ];
      
      if (teacherSidebarResources.includes(resourceName)) {
        if (action === "list" || action === "show") return { can: true };
      }

      // Teachers can edit their OWN profile
      if (resourceName === "users" && action === "edit" && params?.id === identity?.id) {
          return { can: true };
      }

      if (["classes", "assignments", "quizzes", "resources"].includes(resourceName)) {
        if (action === "list" || action === "create") return { can: true };

        if (["show", "edit", "delete"].includes(action)) {
          if (!params?.id) return { can: false, reason: "No record ID provided." };
          
          if (params?.userData) {
              const data = params.userData;
              if (resourceName === "classes" && data.teacherId === identity?.id) return { can: true };
              if (resourceName === "assignments" && data.class?.teacherId === identity?.id) return { can: true };
              if (resourceName === "quizzes" && data.class?.teacherId === identity?.id) return { can: true };
              if (resourceName === "resources" && data.class?.teacherId === identity?.id) return { can: true };
          }

          try {
            const { data } = await dataProvider.getOne({ resource: resourceName, id: params.id });
            if (resourceName === "classes" && data?.teacherId === identity?.id) return { can: true };
            if (resourceName === "assignments" && data?.class?.teacherId === identity?.id) return { can: true };
            if (resourceName === "quizzes" && data?.class?.teacherId === identity?.id) return { can: true };
            if (resourceName === "resources" && data?.class?.teacherId === identity?.id) return { can: true };
          } catch (error) {
            return { can: false, reason: "Access denied." };
          }
        }
      }
      
      // Explicitly deny other administrative resources for teachers
      if (["departments", "enrollments", "profile-requests", "ai-study-lab"].includes(resourceName)) {
          return { can: false, reason: "Access denied." };
      }

      return { can: false, reason: "Access denied." };
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
        "ai-study-lab"
      ];
      const allowedActions = ["list", "show"];

      // Deny administrative resources for students
      if (["users", "departments", "enrollments", "profile-requests", "ai-assistant"].includes(resourceName)) {
        // Special case: Students can 'show' users (to see teacher profiles)
        if (resourceName === "users" && action === "show") {
            return { can: true };
        }
        // Special case: Students can 'edit' their own profile
        if (resourceName === "users" && action === "edit" && params?.id === identity?.id) {
            return { can: true };
        }
        
        return { can: false, reason: "Access denied." };
      }

      if (allowedResources.includes(resourceName) && allowedActions.includes(action)) {
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
