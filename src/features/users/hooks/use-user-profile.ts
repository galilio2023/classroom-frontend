import { useShow, useGetIdentity, useList } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { useMemo } from "react";
import { User, UserRole, Class } from "@/types";
import { Trophy, Target } from "lucide-react";
import { useTranslation } from "react-i18next";

export const useUserProfile = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { id: paramsId } = useParams();
  const { data: identity } = useGetIdentity<User>();
  const id = paramsId || identity?.id;

  const { query: userQuery } = useShow<User & { userBadges?: any[] }>({
    resource: "users",
    id,
    queryOptions: { enabled: !!id },
    meta: {
        populate: ["department", "userBadges", "userBadges.badge", "teacherChannel"]
    }
  });

  const { query: badgesQuery } = useList<any>({
    resource: "badges",
    pagination: { mode: "off" },
    queryOptions: { enabled: !!userQuery.data?.data }
  });

  const { query: teacherClassesQuery } = useList<Class>({
    resource: "classes",
    filters: [{ field: "teacherUid", operator: "eq", value: id }],
    queryOptions: {
        enabled: !!userQuery.data?.data && userQuery.data.data.role === UserRole.TEACHER
    }
  });

  const user = userQuery.data?.data;

  const displayBadges = useMemo(() => {
    if (!user || !badgesQuery.data?.data) return [];
    const earnedBadgeIds = new Set(user.userBadges?.map((ub: any) => ub.badgeId));
    
    const earned = (user.userBadges || []).map((ub: any) => ({
        id: ub.badge.id.toString(),
        name: ub.badge.name,
        description: ub.badge.description || "",
        icon: Trophy,
        color: "bg-gold-primary text-white",
        unlocked: true,
    }));

    const unearned = (badgesQuery.data?.data || [])
        .filter((b: any) => !earnedBadgeIds.has(b.id))
        .map((b: any) => ({
            id: b.id.toString(),
            name: b.name,
            description: b.description || "", 
            icon: Target,
            color: "bg-muted text-muted-foreground",
            unlocked: false,
        }));

    return [...earned, ...unearned];
  }, [user, badgesQuery.data?.data]);

  return {
    user,
    teacherClasses: teacherClassesQuery.data?.data || [],
    displayBadges,
    identity,
    isAr,
    isLoading: userQuery.isLoading || badgesQuery.isLoading || teacherClassesQuery.isLoading,
    isError: userQuery.isError,
    isSelf: identity?.id === user?.id,
    isAdmin: identity?.role === UserRole.ADMIN,
    isStudent: user?.role === UserRole.STUDENT,
    isTeacher: user?.role === UserRole.TEACHER
  };
};
