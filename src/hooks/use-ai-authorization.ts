import { usePermissions } from "@refinedev/core";
import { BasePermissions, UserRole } from "@/types";

export const useAIAuthorization = () => {
  const { data: permissions, isLoading } = usePermissions<BasePermissions>({});

  const role = permissions?.role;

  const isStudent = role === UserRole.STUDENT;
  const isTeacher = role === UserRole.TEACHER;
  const isAdmin = role === UserRole.ADMIN;
  const isTA = role === UserRole.TA;
  const isParent = role === UserRole.PARENT;

  // Staff includes anyone with management capabilities
  const isStaff = isTeacher || isAdmin || isTA;

  // Helper for AI interaction gating (Usually students-only)
  const canInteract = isStudent || isAdmin;

  return {
    role,
    isStudent,
    isTeacher,
    isAdmin,
    isTA,
    isParent,
    isStaff,
    canInteract,
    isLoading,
  };
};
