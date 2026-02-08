import { AccessControlProvider } from "@refinedev/core";
import { authProvider } from "./auth";
import { dataProvider } from "./data";

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }) => {
    const identity = await authProvider.getIdentity?.();
    const role = identity?.role;

    if (role === "admin") {
      return { can: true };
    }

    if (role === "teacher") {
      // Teachers should have full access to manage departments and subjects
      if (resource === "departments" || resource === "subjects") {
        return { can: true };
      }

      if (resource === "classes") {
        // Teachers can view the list, create new classes, and view details of ANY class.
        if (action === "list" || action === "create" || action === "show") {
          return { can: true };
        }
        // For editing or deleting, we must check for ownership.
        if (action === "edit" || action === "delete") {
          if (!params?.id) return { can: false };
          try {
            const { data: classData } = await dataProvider.getOne({
              resource: "classes",
              id: params.id,
            });
            // Allow if the logged-in user's ID matches the class's teacherId.
            if (classData && classData.teacherId === identity?.id) {
              return { can: true };
            }
          } catch (error) {
            console.error("Error checking access for class:", error);
            return { can: false };
          }
        }
      }
      // Deny all other actions for teachers
      return { can: false };
    }

    if (role === "student") {
      if (
        (resource === "subjects" || resource === "classes") &&
        (action === "list" || action === "show")
      ) {
        return { can: true };
      }
      if (resource === "dashboard") {
        return { can: true };
      }
    }

    return { can: false };
  },
  options: {
    buttons: {
      hideIfUnauthorized: true,
    },
  },
};
