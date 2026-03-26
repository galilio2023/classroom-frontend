import { useGetIdentity, usePermissions } from "@refinedev/core";
import { User, UserRole, BasePermissions } from "@/types";
import { useMemo } from "react";

/**
 * Custom hook to centralize role-based logic and staff detection.
 * Adheres to the Tablawy OS - Frontend AI Integration Patterns (Refine v5).
 * 
 * Optimized: Wraps usePermissions to benefit from Refine's centralized caching.
 */
export const useUserRole = () => {
  const { data: identity, isLoading: isIdentityLoading, refetch } = useGetIdentity<User>();
  const { data: permissions, isLoading: isPermissionsLoading } = usePermissions<BasePermissions>();

  const roles = useMemo(() => {
    // Prefer permissions role for cached consistency, fallback to identity
    const role = permissions?.role || identity?.role;

    const isAdmin = role === UserRole.ADMIN;
    const isTeacher = role === UserRole.TEACHER;
    const isStudent = role === UserRole.STUDENT;
    const isParent = role === UserRole.PARENT;

    // TA is an AI Agent, but we keep the enum check here for future service-level checks if needed.
    // For human UI, isStaff is strictly Admin or Teacher.
    const isStaff = isAdmin || isTeacher;

    return {
      isAdmin,
      isTeacher,
      isStudent,
      isParent,
      isStaff,
      role,
    };
  }, [identity?.role, permissions?.role]);

  return {
    identity,
    permissions,
    isLoading: isIdentityLoading || isPermissionsLoading,
    refetch,
    ...roles,
  };
};
