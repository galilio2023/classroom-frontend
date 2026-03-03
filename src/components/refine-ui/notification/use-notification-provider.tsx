import { UndoableNotification } from "@/components/refine-ui/notification/undoable-notification";
import type { NotificationProvider } from "@refinedev/core";
import { toast } from "sonner";

/**
 * Refine Notification Provider using Sonner.
 * Optimized for the new Service Layer backend.
 */
export function useNotificationProvider(): NotificationProvider {
  return {
    open: ({
      key,
      type,
      message,
      description,
      undoableTimeout,
      cancelMutation,
    }) => {
      const toastId = key || Date.now().toString();

      switch (type) {
        case "success":
          toast.success(message, {
            id: toastId,
            description,
            richColors: true,
            duration: 4000,
          });
          return;

        case "error":
          // Fixed: Changed syntax error '|' to '??' for fallback description
          toast.error(message, {
            id: toastId,
            description: description ?? "An unexpected error occurred. Please try again.",
            richColors: true,
            duration: 6000, // Errors stay longer
            action: {
              label: "Dismiss",
              onClick: () => toast.dismiss(toastId),
            },
          });
          return;

        case "progress": {
          toast(
            () => (
              <UndoableNotification
                message={message}
                description={description}
                undoableTimeout={undoableTimeout}
                cancelMutation={cancelMutation}
                onClose={() => toast.dismiss(toastId)}
              />
            ),
            {
              id: toastId,
              duration: (undoableTimeout || 5) * 1000,
              unstyled: true,
            }
          );
          return;
        }

        default:
          toast(message, {
            id: toastId,
            description,
            richColors: true,
          });
          return;
      }
    },
    close: (id) => {
      toast.dismiss(id);
    },
  };
}
