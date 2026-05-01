import { useEffect } from "react";
import { useNotification } from "@refinedev/core";
import { socket, connectSocket } from "@/lib/socket";
import { useTranslation } from "react-i18next";
import { useUserRole } from "@/features/users/hooks/use-user-role";

/**
 * 🚀 REAL-TIME PULSE: usePulseNotifications
 * Listens for system-wide "Pulse" events and displays them as actionable toasts.
 * Bridges the gap between Socket.io and Refine's Notification Provider.
 */
export const usePulseNotifications = () => {
  const { open } = useNotification();
  const { t } = useTranslation();
  const { identity } = useUserRole();

  useEffect(() => {
    if (!identity?.id) return;

    const setupPulse = async () => {
      await connectSocket();

      const handlePulse = (pulse: any) => {
        const { event, _entityType: _entityType, data } = pulse;

        // 🛡️ Filter for the current user's specific events if targeted
        // Pulse can be global or targeted. Targeted pulses often come through 'notification' event.
        // But 'lifecycle:pulse' is for class-wide or context-aware updates.

        if (event === "submission:graded") {
          open?.({
            type: "success",
            message: t("notifications.submissionGraded.title", {
              defaultValue: "Assignment Graded!",
            }),
            description: {
              message: t("notifications.submissionGraded.desc", {
                defaultValue: "Your work has been reviewed. Click to see feedback.",
                title: data.assignment?.title,
              }),
              link: `/submissions/show/${data.id}`,
            } as any,
          });
        }

        if (
          event === "submission:action_required" ||
          (event === "submission:graded" && data.requiresResubmission)
        ) {
          open?.({
            type: "error",
            message: t("notifications.resubmissionRequested.title", {
              defaultValue: "Action Required",
            }),
            description: {
              message: t("notifications.resubmissionRequested.desc", {
                defaultValue: "A resubmission has been requested for your assignment.",
              }),
              link: `/submissions/show/${data.id}`,
            } as any,
          });
        }

        if (event === "content:published" || event === "content:updated") {
          open?.({
            type: "success",
            message: t("notifications.contentUpdate.title", { defaultValue: "Course Updated" }),
            description: {
              message: t("notifications.contentUpdate.desc", {
                defaultValue: "New material is available in your class.",
                name: data.name,
              }),
              link: `/classes/show/${data.classId}`,
            } as any,
          });
        }
      };

      socket.on("lifecycle:pulse", handlePulse);

      // 🚀 LIVE GLOBAL PULSE: "JOIN NOW" TOAST
      socket.on(
        "live_session_started",
        (data: { classId: string; className: string; teacherName: string }) => {
          open?.({
            type: "success",
            message: t("notifications.liveStarted.title", { defaultValue: "Class is LIVE!" }),
            description: {
              message: t("notifications.liveStarted.desc", {
                defaultValue: "{{teacherName}} has started a live session for {{className}}.",
                teacherName: data.teacherName,
                className: data.className,
              }),
              link: `/classes/${data.classId}?tab=live`,
            } as any,
          });
        }
      );

      // 🚀 GRADING GLOBAL PULSE: Instant Feedback
      // 🛡️ SECURITY FIX: Enforce identity guard to prevent grade leaks
      socket.on(
        "submission:graded",
        (data: {
          id: number;
          studentId?: string;
          assignmentTitle?: string;
          requiresResubmission?: boolean;
        }) => {
          if (data.studentId && data.studentId !== identity?.id) return;

          open?.({
            type: data.requiresResubmission ? "error" : "success",
            message: data.requiresResubmission
              ? t("notifications.resubmissionRequested.title", { defaultValue: "Action Required" })
              : t("notifications.submissionGraded.title", { defaultValue: "Assignment Graded!" }),
            description: {
              message: data.requiresResubmission
                ? t("notifications.resubmissionRequested.desc", {
                    defaultValue: "A resubmission has been requested.",
                  })
                : t("notifications.submissionGraded.desc", {
                    defaultValue: "Your work for {{title}} has been reviewed.",
                    title: data.assignmentTitle,
                  }),
              link: `/submissions/show/${data.id}`,
            } as any,
          });
        }
      );

      // Also listen to targeted 'notification' events from the backend (Task 2.1)
      socket.on("notification", (notif: any) => {
        // If it's a persistent notification, we might want to show it differently
        // or rely on the user seeing the Bell icon.
        // For UX urgency, we show a toast for new notifications while online.
        open?.({
          type: notif.type === "action_required" ? "error" : "success",
          message: notif.title,
          description: {
            message: notif.message,
            link: notif.link,
          } as any,
        });
      });

      // 🛡️ GUARDIAN PULSE: "AGENT ALERT" TOAST (Risk assessments, etc.)
      socket.on("agent_alert", (notif: any) => {
        open?.({
          type: "error",
          message: notif.title,
          description: {
            message: notif.message,
            link: notif.link || "/parent/dashboard",
          } as any,
        });
      });

      return () => {
        socket.off("lifecycle:pulse");
        socket.off("live_session_started");
        socket.off("submission:graded");
        socket.off("notification");
        socket.off("agent_alert");
      };
    };

    const cleanup = setupPulse();
    return () => {
      cleanup.then((unsub) => unsub?.());
    };
  }, [identity?.id, open, t]);
};
