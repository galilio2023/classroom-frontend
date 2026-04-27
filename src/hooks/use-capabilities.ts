import { useGetIdentity } from "@refinedev/core";
import { User } from "@/types";

/**
 * 🛡️ CAPABILITY-BASED UI HOOK
 * Mandate Gap 5: Centralized Mode-Policy Enforcement
 *
 * Replaces direct role/plan checks with semantic capabilities.
 * Synchronized with 'mode-policy-matrix.md'
 */
export const useCapabilities = () => {
  const { data: identity, isLoading } = useGetIdentity<User>();
  const plan = identity?.planType || "basic";
  const role = identity?.role || "student";

  const isFaculty = plan === "faculty" || plan === "school";
  const isInstitutional = plan === "faculty" || plan === "school";
  const isSchool = plan === "school";
  const isAdmin = role === "admin";
  const isTeacher = role === "teacher";
  const isStudent = role === "student";
  const isParent = role === "parent";
  const isStaff = isAdmin || isTeacher || role === "ta";

  return {
    identity,
    isLoading,
    isStaff,
    isAdmin,
    isTeacher,
    isStudent,
    isParent,
    isPrivate: plan === "basic",
    isInstitutional,

    // Academic Capabilities
    canManageDepartments: isFaculty && (isAdmin || isTeacher),
    canManageTerms: isFaculty && isAdmin,
    canManageCurriculum: isTeacher || isAdmin,

    // Institutional Capabilities
    canAccessInstitutionalStats: isSchool && isAdmin,
    canAccessCompliance: isSchool && isAdmin,
    canBulkImport: isFaculty && isAdmin,

    // Engagement Capabilities
    canViewParentalMonitoring: isSchool && (isAdmin || isTeacher),
    canInteractWithAiCompanion: true,

    // Branding
    canCustomBrand: isSchool,

    // Plan Info
    plan,
    isPrivateMode: plan === "basic",
    isFacultyMode: plan === "faculty",
    isSchoolMode: plan === "school",
  };
};
