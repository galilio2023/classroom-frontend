import { useState, useEffect } from "react";
import { useList, useCreate, useUpdate, useDelete, useCustomMutation } from "@refinedev/core";
import { Announcement } from "@/types";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useUserRole } from "@/features/users/hooks/use-user-role";
import { STORAGE_KEYS } from "@/config";

import { useTusUpload } from "@/hooks/use-tus-upload";
import { getAuthToken } from "@/lib/auth-helper";

export const useAnnouncementTab = (classId: string) => {
  const { t } = useTranslation();
  const { identity, isStaff } = useUserRole();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    isPinned: false,
    fileUrl: null as string | null,
    fileCldPubId: null as string | null,
  });

  const {
    startUpload: startTusUpload,
    status: uploadStatus,
    uploadUrl: tusUrl,
    tusPublicId,
  } = useTusUpload();

  const isUploading = uploadStatus === "uploading";

  // Handle successful TUS upload
  useEffect(() => {
    if (uploadStatus === "success" && tusPublicId) {
      setNewAnnouncement((prev) => ({
        ...prev,
        fileUrl: tusUrl || null,
        fileCldPubId: tusPublicId,
      }));
      toast.success(t("common.upload.success"));
    }
  }, [uploadStatus, tusPublicId, tusUrl, t]);

  const { query } = useList<Announcement>({
    resource: "announcements",
    filters: [{ field: "classId", operator: "eq", value: classId }],
    sorters: [
      { field: "isPinned", order: "desc" },
      { field: "createdAt", order: "desc" },
    ],
  });

  const { mutate: createAnnouncement, mutation: createMutation } = useCreate();
  const { mutate: updateAnnouncement } = useUpdate();
  const { mutate: deleteAnnouncement } = useDelete();
  const { mutate: markAsRead } = useCustomMutation();

  const handleMarkAsRead = (id: string | number) => {
    markAsRead(
      { url: `announcements/${id}/read`, method: "post", values: {} },
      {
        onSuccess: () => query.refetch(),
      }
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = getAuthToken();
    startTusUpload(file, token, {
      folder: "announcements",
      classId,
    });
  };

  const handleCreate = () => {
    createAnnouncement(
      {
        resource: "announcements",
        values: {
          ...newAnnouncement,
          classId: Number(classId),
          authorId: identity?.id,
        },
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          setNewAnnouncement({
            title: "",
            content: "",
            isPinned: false,
            fileUrl: null,
            fileCldPubId: null,
          });
          query.refetch();
        },
      }
    );
  };

  const togglePin = (announcement: Announcement) => {
    updateAnnouncement(
      {
        resource: "announcements",
        id: announcement.id,
        values: { isPinned: !announcement.isPinned },
      },
      { onSuccess: () => query.refetch() }
    );
  };

  const handleDelete = (id: string | number) => {
    deleteAnnouncement({ resource: "announcements", id }, { onSuccess: () => query.refetch() });
  };

  return {
    announcements: query.data?.data || [],
    isLoading: query.isLoading,
    isCreating: createMutation.isPending,
    isUploading,
    isStaff,
    identity,
    state: {
      isCreateOpen,
      setIsCreateOpen,
      newAnnouncement,
      setNewAnnouncement,
    },
    actions: {
      handleMarkAsRead,
      handleFileUpload,
      handleCreate,
      togglePin,
      handleDelete,
    },
  };
};
