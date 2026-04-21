import { useState, useMemo } from "react";
import { useNavigation, useDelete, useGetIdentity, useUpdate, useList } from "@refinedev/core";
import { User, UserRole, UserStatus, VerificationStatus } from "@/types";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const useUserList = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { data: identity } = useGetIdentity<User>();
  const isAdmin = identity?.role === UserRole.ADMIN;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [verificationTarget, setVerificationTarget] = useState<User | null>(null);

  const { show, create } = useNavigation();
  const { mutate: deleteMutation } = useDelete();
  const { mutate: updateMutation, mutation } = useUpdate();

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery)
      f.push({
        field: "search",
        operator: "contains" as const,
        value: searchQuery,
      });
    if (selectedRole && selectedRole !== "all")
      f.push({ field: "role", operator: "eq" as const, value: selectedRole });
    if (selectedStatus && selectedStatus !== "all")
      f.push({
        field: "status",
        operator: "eq" as const,
        value: selectedStatus,
      });
    if (verificationFilter === "pending") {
      f.push({
        field: "role",
        operator: "eq" as const,
        value: UserRole.TEACHER,
      });
      f.push({
        field: "verificationStatus",
        operator: "eq" as const,
        value: VerificationStatus.PENDING,
      });
    }
    return f;
  }, [searchQuery, selectedRole, selectedStatus, verificationFilter]);

  const { query: usersQuery } = useList<User>({
    resource: "users",
    pagination: { pageSize: 50, mode: "server" },
    filters,
    sorters: [{ field: "createdAt", order: "desc" }],
    meta: { populate: ["department"] },
  });

  const users = usersQuery.data?.data ?? [];

  const stats = useMemo(
    () => ({
      total: users.length,
      pending: users.filter(
        (u: any) =>
          u.role === UserRole.TEACHER &&
          (u.verificationStatus === VerificationStatus.PENDING ||
            u.verificationStatus === VerificationStatus.UNVERIFIED)
      ).length,
      active: users.filter((u: any) => u.status === UserStatus.ACTIVE).length,
    }),
    [users]
  );

  const handleVerify = (id: string, isVerified: boolean, reason?: string) => {
    updateMutation(
      {
        resource: "users",
        id,
        values: {
          verificationStatus: isVerified
            ? VerificationStatus.VERIFIED
            : VerificationStatus.REJECTED,
          metadata: !isVerified ? { rejectionReason: reason, rejectedAt: new Date().toISOString() } : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            isVerified
              ? t("users.governance.toasts.verified")
              : t("users.governance.toasts.rejected")
          );
          setVerificationTarget(null);
        },
      }
    );
  };

  const handleStatusChange = (id: string, newStatus: UserStatus) => {
    updateMutation(
      {
        resource: "users",
        id,
        values: { status: newStatus },
      },
      {
        onSuccess: () =>
          toast.success(
            t("users.governance.toasts.statusUpdated", {
              status: t(`status.${newStatus.toLowerCase()}` as any),
            })
          ),
      }
    );
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation({
        resource: "users",
        id: deleteTarget,
        mutationMode: "pessimistic",
      });
      setDeleteTarget(null);
    }
  };

  return {
    data: { users, stats, identity, isAdmin, isAr },
    status: { isLoading: usersQuery.isPending, isUpdating: mutation.isPending },
    filters: {
      searchQuery,
      setSearchQuery,
      selectedRole,
      setSelectedRole,
      selectedStatus,
      setSelectedStatus,
      verificationFilter,
      setVerificationFilter,
    },
    state: {
      deleteTarget,
      setDeleteTarget,
      verificationTarget,
      setVerificationTarget,
    },
    actions: {
      show,
      create,
      handleVerify,
      handleStatusChange,
      handleConfirmDelete,
    },
  };
};
