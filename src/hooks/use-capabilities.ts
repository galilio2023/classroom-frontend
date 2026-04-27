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

  // 🛡️ HUB SUITE IDENTITY
  const suiteType = identity?.suiteType || (plan === "basic" ? "private" : (plan as any));
  const isPrivateSuite = suiteType === "private";
  const isSchoolSuite = suiteType === "school";
  const isFacultySuite = suiteType === "faculty";
  const isCorporateSuite = suiteType === "corporate";

  const isFaculty = isFacultySuite || isSchoolSuite;
  const isInstitutional = isFacultySuite || isSchoolSuite;
  const isSchool = isSchoolSuite;
  const isAdmin = role === "admin";
  const isTeacher = role === "teacher";
  const isStudent = role === "student";
  const isParent = role === "parent";
  const isStaff = isAdmin || isTeacher || role === "ta";

  // 🛡️ SCHOOL OWNERSHIP (Admin role in their own school)
  const isOwner = isAdmin;
  const suiteOnboardingComplete = identity?.suiteOnboardingComplete ?? true;

  return {
    identity,
    isLoading,
    isStaff,
    isAdmin,
    isTeacher,
    isStudent,
    isParent,
    isOwner,
    suiteOnboardingComplete,
    isPrivate: isPrivateSuite,
    isInstitutional,

    // Hub Suite Identity
    suiteType,
    isPrivateSuite,
    isSchoolSuite,
    isFacultySuite,
    isCorporateSuite,

    // Hub Navigation
    canUpgradeSuite: !isCorporateSuite,
    canSeeSuiteHome: true,

    // Scheduling Capabilities
    bellTimetable: isSchoolSuite,
    lectureSchedule: isFacultySuite,

    // Assessment Capabilities
    gpaPreview: isFacultySuite,
    examMode: true, // Available in all suites

    // Academic Capabilities
    canManageDepartments: isInstitutional && (isAdmin || isTeacher),
    canManageTerms: isInstitutional && isAdmin,
    canManageCurriculum: isTeacher || isAdmin,

    // Institutional Capabilities
    canAccessInstitutionalStats: isSchool && isAdmin,
    canAccessCompliance: isSchool && isAdmin,
    canBulkImport: isInstitutional && isAdmin,

    // Engagement Capabilities
    canViewParentalMonitoring: isSchool && (isAdmin || isTeacher),
    canInteractWithAiCompanion: true,

    // Branding
    canCustomBrand: isSchool,

    // Plan Info (Legacy Support)
    plan,
    isPrivateMode: isPrivateSuite,
    isFacultyMode: isFacultySuite,
    isSchoolMode: isSchoolSuite,
  };
};
