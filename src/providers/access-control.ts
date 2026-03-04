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
          
          // Helper to check if user is a teacher of the class
          const isTeacherOfClass = (classData: any) => {
            if (!classData) return false;
            // Check if teachers array exists (many-to-many)
            if (Array.isArray(classData.teachers)) {
                return classData.teachers.some((t: any) => t.teacherId === identity?.id);
            }
            // Fallback if backend returns a flattened structure (unlikely but safe)
            return classData.teacherId === identity?.id;
          };

          try {
            // If we have the data already (e.g. from a list view), use it
            if (params?.userData) {
                const data = params.userData;
                if (resourceName === "classes" && isTeacherOfClass(data)) return { can: true };
                if (resourceName === "assignments" && isTeacherOfClass(data.class)) return { can: true };
                if (resourceName === "quizzes" && isTeacherOfClass(data.class)) return { can: true };
                if (resourceName === "resources" && isTeacherOfClass(data.class)) return { can: true };
            }

            // Otherwise, fetch it
            const { data } = await dataProvider.getOne({ resource: resourceName, id: params.id });
            
            if (resourceName === "classes") {
                if (isTeacherOfClass(data)) return { can: true };
            } else {
                // For related resources, we need the class data.
                // Ensure the backend returns 'class' relation with 'teachers'.
                if (data?.class && isTeacherOfClass(data.class)) return { can: true };
            }

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
