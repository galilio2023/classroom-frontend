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
      if ((resource === "subjects" || resource === "departments") && (action === "list" || action === "show")) {
        return { can: true };
      }

      if (resource === "classes") {
        if (action === "list" || action === "create") {
          return { can: true };
        }
        if (action === "edit" || action === "show" || action === "delete") {
          if (!params?.id) return { can: false };
          try {
            const { data: classData } = await dataProvider.getOne({
              resource: "classes",
              id: params.id,
            });
            if (classData && classData.teacherId === identity?.id) {
              return { can: true };
            }
          } catch (error) {
            console.error("Error checking access for class:", error);
            return { can: false };
          }
        }
      }
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
  // Add this options block to hide unauthorized buttons
  options: {
    buttons: {
      hideIfUnauthorized: true,
    },
  },
};
