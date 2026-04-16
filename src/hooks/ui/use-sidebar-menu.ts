import { useMemo } from "react";
import { useMenu, useGetIdentity, type TreeMenuItem } from "@refinedev/core";
import { User, UserRole } from "@/types";

const ROLE_GROUP_PERMISSIONS: Record<string, UserRole[]> = {
  "groups.admin": [UserRole.ADMIN],
  "groups.ai-hub": [UserRole.TEACHER, UserRole.STUDENT, UserRole.ADMIN],
  "groups.academic": [UserRole.TEACHER, UserRole.STUDENT, UserRole.ADMIN, UserRole.PARENT],
  "groups.curriculum": [UserRole.TEACHER, UserRole.STUDENT, UserRole.ADMIN],
  "groups.progress": [UserRole.TEACHER, UserRole.STUDENT, UserRole.ADMIN, UserRole.PARENT],
  "groups.teacher-hub": [UserRole.TEACHER, UserRole.ADMIN],
  "groups.student-hub": [UserRole.STUDENT, UserRole.ADMIN],
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

      // 2. Explicit Role Filter (Refined)
      if (userRole === UserRole.STUDENT) {
        if (
          ["ai-assistant", "ai-approvals", "teacher-channel", "teacher-applications"].includes(
            item.name
          )
        )
          return;
      }

      if (userRole === UserRole.TEACHER) {
        if (["ai-study-lab", "study-planner", "report-card", "portfolio"].includes(item.name))
          return;
      }

      if (userRole === UserRole.PARENT) {
        // Parents ONLY see Dashboard, Guardian Portal, Calendar, Meetings, Attendance, and Announcements
        if (
          ![
            "dashboard",
            "guardian-portal",
            "calendar",
            "meetings",
            "attendance",
            "announcements",
            "report-card",
          ].includes(item.name)
        )
          return;
      }

      if (userRole === UserRole.ADMIN) {
        // Admins see everything relevant to administration + oversight
      }

      // 3. Meta Role Check (Secondary hard-gate)
      if (item.meta?.roles && userRole && !item.meta.roles.includes(userRole)) return;

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
