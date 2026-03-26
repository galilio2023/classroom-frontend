import { useMemo } from "react";
import { useMenu, useGetIdentity, type TreeMenuItem } from "@refinedev/core";
import { User, UserRole } from "@/types";

const ROLE_GROUP_PERMISSIONS: Record<string, UserRole[]> = {
  "groups.admin": [UserRole.ADMIN],
  "groups.ai-lab": [UserRole.TEACHER, UserRole.STUDENT],
  "groups.academic": [UserRole.TEACHER, UserRole.STUDENT],
  "groups.curriculum": [UserRole.TEACHER, UserRole.STUDENT],
  "groups.progress": [UserRole.TEACHER, UserRole.STUDENT],
  "groups.teacher-hub": [UserRole.TEACHER],
  "groups.student-hub": [UserRole.STUDENT],
};

type GroupedMenuItems = Record<string, TreeMenuItem[]>;

export const useSidebarMenu = () => {
  const { menuItems, selectedKey } = useMenu();
  const { data: identity, isLoading: identityLoading } = useGetIdentity<User>();

  const userRole = identity?.role;
  const isSidebarLoading = identityLoading && !identity;

  const groupedItems = useMemo<GroupedMenuItems>(() => {
    if (isSidebarLoading) return { default: [] };

    const groups: GroupedMenuItems = { default: [] };

    menuItems.forEach((item) => {
      const groupName = item.meta?.group as string | undefined;

      // 1. RBAC Group Check
      if (groupName && userRole) {
        const allowedRoles = ROLE_GROUP_PERMISSIONS[groupName];
        if (allowedRoles && !allowedRoles.includes(userRole)) return;
      }

      // 2. Explicit Exclusions
      if (userRole === UserRole.STUDENT) {
        if (
          ["ai-assistant", "teacher-channel", "teacher-applications"].includes(
            item.name,
          )
        )
          return;
        if (
          [
            "departments",
            "profile-requests",
            "academic-terms",
            "activity-log",
            "users",
            "settings",
          ].includes(item.name)
        )
          return;
      }

      if (userRole === UserRole.TEACHER) {
        if (
          [
            "departments",
            "profile-requests",
            "activity-log",
            "users",
            "settings",
          ].includes(item.name)
        )
          return;
        if (
          [
            "ai-study-lab",
            "study-planner",
            "report-card",
            "portfolio",
          ].includes(item.name)
        )
          return;
      }

      if (userRole === UserRole.ADMIN) {
        if (
          ![
            "dashboard",
            "users",
            "departments",
            "settings",
            "activity-log",
            "profile-requests",
          ].includes(item.name)
        )
          return;
      }

      // 3. Meta Role Check
      if (item.meta?.roles && userRole && !item.meta.roles.includes(userRole))
        return;

      if (groupName) {
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push(item);
      } else {
        groups.default.push(item);
      }
    });

    return groups;
  }, [menuItems, userRole, isSidebarLoading]);

  return { groupedItems, selectedKey, isSidebarLoading };
};
