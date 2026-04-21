import { useGetIdentity } from "@refinedev/core";
import { User, UserRole } from "@/types";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";

/**
 * 🛡️ CAPABILITY ARCHITECTURE
 * Abstract roles and global config into a flat set of permissions.
 * Instead of: if (user.role === 'teacher')
 * Use: const { canManageCurriculum } = useCapabilities();
 */
export const useCapabilities = () => {
  const { data: identity, isLoading: isIdentityLoading } = useGetIdentity<User>();
  const { coreData, isCoreLoading: isConfigLoading } = useDashboard();

  const role = identity?.role;
  const globalConfig = coreData?.globalConfig;
  const school = coreData?.school;
  const isAiEnabled = globalConfig?.enableAiFeatures !== false;

  // --- MODE PACKAGING (Phase A) ---
  // Default to 'basic' (Private Teacher) if no school or plan specified.
  const planType = school?.planType || "basic";
  const isPrivateTeacherMode = planType === "basic";
  const isFacultyMode = planType === "faculty";
  const isSchoolMode = planType === "school";

  const isTeacher = role === UserRole.TEACHER;
  const isAdmin = role === UserRole.ADMIN;
  const isStudent = role === UserRole.STUDENT;
  const isParent = role === UserRole.PARENT;
  const isStaff = isTeacher || isAdmin;

  return {
    identity,
    isLoading: isIdentityLoading || isConfigLoading,
    school,

    // --- MODE CAPABILITIES ---
    currentMode: isSchoolMode ? "school" : isFacultyMode ? "faculty" : "private",
    isPrivateTeacherMode,
    isFacultyMode,
    isSchoolMode,
    isInstitutional: !isPrivateTeacherMode,
    isPrivate: isPrivateTeacherMode,

    // --- IDENTITY CAPABILITIES ---
    isStudent,
    isTeacher,
    isStaff,
    isAdmin,
    isParent,

    // --- FEATURE CAPABILITIES ---
    canAccessAi: isAiEnabled,
    canInteractWithAiCompanion: isAiEnabled && !isParent,
    canManageClasses: isStaff,
    canManageLiveSession: isStaff,
    canManageCurriculum: isStaff,
    canGradeSubmissions: isStaff,
    canViewAnalytics: isStaff || isAdmin,
    canCreateSubjects: isTeacher || isAdmin,

    // --- INSTITUTIONAL CAPABILITIES (Faculty/School Mode) ---
    canManageDepartments: (isFacultyMode || isSchoolMode) && isAdmin,
    canViewInstitutionalAudit: isSchoolMode && isAdmin,
    canAccessPrincipalDashboard: isSchoolMode && isAdmin,
    canManageSharedCurriculum: isFacultyMode || isSchoolMode,

    // --- PARENTAL CAPABILITIES ---
    canViewChildProgress: isParent || isAdmin || (isSchoolMode && isTeacher),

    // --- STUDENT CAPABILITIES ---
    canSubmitAssignments: isStudent,
    canParticipateInQuizzes: isStudent,
    canEarnXP: isStudent,

    // --- SYSTEM CAPABILITIES ---
    canAccessAdminPanel: isAdmin,
    canManageSettings: isAdmin,
    canConfigureBranding: isSchoolMode && isAdmin,
  };
};
