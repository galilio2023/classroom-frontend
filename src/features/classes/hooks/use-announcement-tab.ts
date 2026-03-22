import { useState } from "react";
import {
  useList,
  useCreate,
  useGetIdentity,
  useUpdate,
  useDelete,
  useCustomMutation,
} from "@refinedev/core";
import { Announcement, User, UserRole } from "@/types";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const useAnnouncementTab = (classId: string) => {
  const { t } = useTranslation();
  const { data: identity } = useGetIdentity<User>();
  const isStaff = identity?.role === UserRole.TEACHER || identity?.role === UserRole.ADMIN;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    isPinned: false,
    fileUrl: null as string | null,
    fileCldPubId: null as string | null,
  });

  const { query } = useList<Announcement>({
    resource: "announcements",
    filters: [{ field: "classId", operator: "eq", value: classId }],
    sorters: [{ field: "isPinned", order: "desc" }, { field: "createdAt", order: "desc" }],
  });

  const { mutate: createAnnouncement, mutation: createMutation } = useCreate();
  const { mutate: updateAnnouncement } = useUpdate();
  const { mutate: deleteAnnouncement } = useDelete();
  const { mutate: markAsRead } = useCustomMutation();

  const handleMarkAsRead = (id: number) => {
    markAsRead({ url: `announcements/${id}/read`, method: "post", values: {} }, {
      onSuccess: () => query.refetch(),
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const sigRes = await fetch(`${import.meta.env.VITE_API_URL}/upload/signature?folder=announcements`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("refine-auth")}` },
      });
      const { data: sigData } = await sigRes.json();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sigData.apiKey);
      formData.append("timestamp", sigData.timestamp);
      formData.append("signature", sigData.signature);
      formData.append("folder", sigData.folder);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`, {
        method: "POST",
        body: formData,
      });
      const result = await cloudRes.json();
      if (result.secure_url) {
        setNewAnnouncement(prev => ({ ...prev, fileUrl: result.secure_url, fileCldPubId: result.public_id }));
        toast.success(t("common.upload.success"));
      }
    } catch (err) {
      toast.error(t("common.upload.error"));
    } finally { setIsUploading(false); }
  };

  const handleCreate = () => {
    createAnnouncement({
      resource: "announcements",
      values: { ...newAnnouncement, classId: Number(classId), authorId: identity?.id },
    }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setNewAnnouncement({ title: "", content: "", isPinned: false, fileUrl: null, fileCldPubId: null });
        query.refetch();
      },
    });
  };

  const togglePin = (announcement: Announcement) => {
    updateAnnouncement({
      resource: "announcements", id: announcement.id,
      values: { isPinned: !announcement.isPinned },
    }, { onSuccess: () => query.refetch() });
  };

  const handleDelete = (id: number) => {
    deleteAnnouncement({ resource: "announcements", id }, { onSuccess: () => query.refetch() });
  };

  return {
    announcements: query.data?.data || [],
    isLoading: query.isLoading,
    isCreating: createMutation.isPending,
    isUploading,
    isStaff,
    identity,
    state: { isCreateOpen, setIsCreateOpen, newAnnouncement, setNewAnnouncement },
    actions: { handleMarkAsRead, handleFileUpload, handleCreate, togglePin, handleDelete }
  };
};
