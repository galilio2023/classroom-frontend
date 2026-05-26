import { AccessControlProvider } from "@refinedev/core";
import { authProvider } from "./auth";
import { User, UserRole } from "@/types";
import { resources } from "../config/resources";

/**
 * Access Control Provider
 * Dynamically handles client-side visibility of resources based on UserRole configurations in resources.tsx.
 * Provides logical isolation for multi-tenancy.
 */
export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }) => {
    const user = (await authProvider.getIdentity?.()) as User | null;
    if (!user) return { can: false };

    const role = user.role;
    const resourceName = resource || "";

    // 1. Find the resource definition from the master config
    const resourceDef = resources.find((r) => r.name === resourceName);

    // 🛡️ CANDIDATE ISOLATION: Restricted access until vetted (Audit #3)
    const isCandidate = role === UserRole.STUDENT && user.planType === "candidate";
    if (isCandidate) {
      const allowedCandidateResources = ["dashboard", "settings", "teacher-applications"];
      if (!allowedCandidateResources.includes(resourceName)) {
        return {
          can: false,
          reason:
            "Your educator application is pending. Access to student resources is restricted.",
        };
      }
    }

    // 2. Check Role-based access (Dynamic)
    // If resource is defined, check if user role is in its allowed roles array.
    const allowedRoles = resourceDef?.meta?.roles as UserRole[] | undefined;
    const hasRoleAccess = allowedRoles?.includes(role);

    if (!hasRoleAccess) {
      // Resource is not defined or user role is not allowed
      return {
        can: false,
        reason: `Unauthorized: Role "${role}" cannot access resource "${resourceName}".`,
      };
    }

    // 3. Action-based restrictions for STUDENT and PARENT
    // Students/Parents can view but usually not create/edit/delete academic structures.
    if (role === UserRole.STUDENT || role === UserRole.PARENT) {
      if (["create", "edit", "delete"].includes(action)) {
        // Exception: discussions and submissions (Students need to participate)
        const studentActionExceptions = ["discussions", "submissions"];
        if (role === UserRole.STUDENT && studentActionExceptions.includes(resourceName)) {
          return { can: true };
        }

        return {
          can: false,
          reason: `${role === UserRole.PARENT ? "Parents" : "Students"} are restricted from performing mutations on this resource.`,
        };
      }
    }

    // 🛡️ PARENT SPECIFIC: Parents can only view their linked children's data
    if (role === UserRole.PARENT) {
      const allowedParentResources = [
        "dashboard",
        "guardian-portal",
        "attendance",
        "report-card",
        "progress",
        "announcements",
        "timetable",
        "meetings",
      ];

      if (!allowedParentResources.includes(resourceName)) {
        return {
          can: false,
          reason: "Unauthorized: This resource is not accessible via the Guardian Portal.",
        };
      }
    }

    // 4. DATA ISOLATION (Multi-Tenancy)
    // If a specific record is provided, check department_id alignment to prevent cross-tenant access.
    if (params?.record && "departmentId" in params.record) {
      const record = params.record as { departmentId: number };
      if (record.departmentId !== user.departmentId && role !== UserRole.ADMIN) {
        return {
          can: false,
          reason: `Logical Isolation: This record belongs to Department ${record.departmentId}.`,
        };
      }
    }

    return { can: true };
  },
  options: {
    buttons: {
      hideIfUnauthorized: true,
    },
  },
};
