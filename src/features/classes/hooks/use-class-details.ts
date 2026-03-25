import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  useShow, 
  useOne, 
  useUpdate, 
  useList, 
  useDelete, 
  useCreate,
  useInvalidate
} from "@refinedev/core";
import { Class, Announcement, Enrollment } from "@/types";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import debounce from "lodash/debounce";
import { useQueryClient } from "@tanstack/react-query";
import { useUserRole } from "@/hooks/use-user-role";

export const useClassDetails = (classId: string) => {
  const { t } = useTranslation();
  const { identity, isAdmin, isTeacher, isStaff } = useUserRole();
  const queryClient = useQueryClient();
  const invalidate = useInvalidate();

  // --- Data Fetching ---
  const { query } = useShow<Class>({
    resource: "classes",
    id: classId,
    meta: { syncWithLocation: false },
  });

  const aClass = query?.data?.data;
  
  const isModerator = useMemo(() => {
    if (isAdmin) return false; // Admins are Registrars, not Instructors
    return !!aClass?.teachers?.some((t: any) => t.teacher.id === identity?.id);
  }, [identity, aClass, isAdmin]);

  const isOwner = useMemo(() => {
    return isAdmin || aClass?.teachers?.find((t: any) => t.teacher.id === identity?.id)?.isPrimary;
  }, [identity, aClass, isAdmin]);

  // --- Announcements Logic ---
  const { query: { data: announcementsResult } } = useList<Announcement>({
    resource: "announcements",
    filters: [{ field: "classId", operator: "eq", value: classId }],
    sorters: [{ field: "isPinned", order: "desc" }],
    queryOptions: { enabled: !!classId },
  });
  const announcements = announcementsResult?.data ?? [];

  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<number[]>([]);
  useEffect(() => {
    if (identity?.id) {
      const dismissed = localStorage.getItem(`dismissed_announcements_${identity.id}`);
      if (dismissed) setDismissedAnnouncements(JSON.parse(dismissed));
    }
  }, [identity?.id]);

  const handleDismissAnnouncement = (id: number) => {
    const updated = [...dismissedAnnouncements, id];
    setDismissedAnnouncements(updated);
    localStorage.setItem(`dismissed_announcements_${identity?.id}`, JSON.stringify(updated));
  };

  // --- Teacher Notes Logic ---
  const [teacherNotes, setTeacherNotes] = useState("");
  const { query: notesQuery } = useOne({
    resource: `classes/${classId}/notes`,
    id: "current",
    queryOptions: { enabled: !!classId && isStaff },
  });
  const { mutate: updateNote } = useUpdate();

  useEffect(() => {
    if ((notesQuery?.data as any)?.content !== undefined) {
      setTeacherNotes((notesQuery?.data as any).content);
    }
  }, [notesQuery?.data]);

  const debouncedSaveNotes = useCallback(
    debounce((content: string) => {
      updateNote({
        resource: `classes/${classId}/notes`,
        id: "current",
        values: { content },
      });
    }, 1000),
    [classId, updateNote],
  );

  const handleNoteChange = (val: string) => {
    setTeacherNotes(val);
    debouncedSaveNotes(val);
  };

  // --- Enrollment & Staff Actions Logic ---
  const { mutate: deleteMutation, mutation: deleteMutationObj } = useDelete();
  const { mutate: updateEnrollment } = useUpdate();
  const { mutate: createMutation, mutation: createMutationObj } = useCreate();
  const { mutate: updateClass } = useUpdate();

  const handleEnrollmentAction = async (id: number, status: "approved" | "rejected") => {
    // Optimistic Update
    const queryKey = ["classes", "show", classId];
    await queryClient.cancelQueries({ queryKey });
    const previousClass = queryClient.getQueryData(queryKey);

    if (previousClass) {
        queryClient.setQueryData(queryKey, (old: any) => {
            if (!old?.data) return old;
            return {
                ...old,
                data: {
                    ...old.data,
                    enrollments: old.data.enrollments.map((e: Enrollment) => 
                        e.id === id ? { ...e, status } : e
                    )
                }
            };
        });
    }

    updateEnrollment({
      resource: "enrollments",
      id: `${id}/status`,
      values: { status },
    }, {
      onSuccess: () => {
        toast.success(t("classes.show.toast.enrollmentStatus", {
          status: status === "approved" ? t("profileRequests.toasts.approved") : t("profileRequests.toasts.rejected"),
        }));
      },
      onError: () => {
          // Rollback if error
          if (previousClass) queryClient.setQueryData(queryKey, previousClass);
          toast.error(t("classes.show.toast.enrollmentError"));
      },
      onSettled: () => {
          void query?.refetch();
      }
    });
  };

  const handleToggleLive = async () => {
      if (!aClass) return;
      const newLiveStatus = !aClass.isLive;

      // Optimistic Update
      const queryKey = ["classes", "show", classId];
      await queryClient.cancelQueries({ queryKey });
      const previousClass = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => {
          if (!old?.data) return old;
          return { ...old, data: { ...old.data, isLive: newLiveStatus } };
      });

      updateClass({
          resource: "classes",
          id: classId,
          values: { isLive: newLiveStatus },
      }, {
          onError: () => {
              if (previousClass) queryClient.setQueryData(queryKey, previousClass);
              toast.error(t("classes.show.toast.liveToggleError", "Failed to update live status"));
          },
          onSettled: () => {
              void query?.refetch();
          }
      });
  };

  const handleConfirmUnenroll = (unenrollTarget: number | null, callback: () => void) => {
    if (unenrollTarget) {
      deleteMutation({ resource: "enrollments", id: unenrollTarget }, {
        onSuccess: () => {
          callback();
          void query?.refetch();
        }
      });
    }
  };

  return {
    identity,
    aClass,
    isLoading: query?.isPending,
    isError: query?.isError,
    isStaff,
    isAdmin,
    isTeacher,
    isModerator,
    isOwner,
    announcements,
    dismissedAnnouncements,
    handleDismissAnnouncement,
    teacherNotes,
    isLoadingNotes: notesQuery?.isPending,
    handleNoteChange,
    handleEnrollmentAction,
    handleToggleLive,
    handleConfirmUnenroll,
    isDeleting: deleteMutationObj.isPending,
    createMutation,
    isMessaging: createMutationObj.isPending,
    refetch: query?.refetch
  };
};
