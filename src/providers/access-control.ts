import { AccessControlProvider } from "@refinedev/core";
import { authProvider } from "./auth";
import { dataProvider } from "./data";
import { User } from "@/types"; // Import the User type

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }) => {
    const identity = (await authProvider.getIdentity?.()) as User | null;
    const role = identity?.role;

    if (role === "admin") {
      return { can: true };
    }

    if (role === "teacher") {
      if (resource === "dashboard" || resource === "ai-assistant" || resource === "discussions" || resource === "calendar") {
        return { can: true };
      }

      if (
        resource === "departments" ||
        resource === "subjects" ||
        resource === "assignments"
      ) {
        return { can: true };
      }

      if (resource === "classes") {
        if (action === "list" || action === "create") {
          return { can: true };
        }
        if (action === "show" || action === "edit" || action === "delete") {
          if (!params?.id) {
            return {
              can: false,
              reason: "No record ID specified for authorization check.",
            };
          }
          try {
            const { data: classData } = await dataProvider.getOne({
              resource: "classes",
              id: params.id,
            });
            if (classData && classData.teacherId === identity?.id) {
              return { can: true };
            }
            return {
              can: false,
              reason: "You can only manage classes that you own.",
            };
          } catch (error) {
            console.error("Error checking access for class:", error);
            return {
              can: false,
              reason: "An error occurred while checking permissions.",
            };
          }
        }
      }
      return {
        can: false,
        reason: "This page or action is not available for the Teacher role.",
      };
    }

    if (role === "student") {
      if (
        (resource === "subjects" ||
          resource === "classes" ||
          resource === "assignments" ||
          resource === "discussions" ||
          resource === "calendar") &&
        (action === "list" || action === "show")
      ) {
        return { can: true };
      }
      if (resource === "dashboard") {
        return { can: true };
      }
      return {
        can: false,
        reason: "This page or action is not available for the Student role.",
      };
    }

    return {
      can: false,
      reason:
        "You are not authorized to perform this action. Please contact an administrator if you believe this is an error.",
    };
  },
  options: {
    buttons: {
      hideIfUnauthorized: true,
    },
  },
};
