import { UndoableNotification } from "@/components/refine-ui/notification/undoable-notification";
import type { NotificationProvider } from "@refinedev/core";
import { useGo } from "@refinedev/core";
import { toast } from "sonner";
import { MoveRight } from "lucide-react";
import { NotificationMetadata } from "@/types";

/**
 * Refine Notification Provider using Sonner.
 * Optimized for the new Service Layer backend.
 */
export function useNotificationProvider(): NotificationProvider {
  const go = useGo();

  return {
    open: ({ key, type, message, description, undoableTimeout, cancelMutation }) => {
      const toastId = key || Date.now().toString();

      const config: any = {
        id: toastId,
        description,
        richColors: true,
        duration: type === "error" ? 6000 : 4000,
      };

      // 🚀 ACTIONABLE REDIRECTS: If there's a link, add a button
      const meta = description as unknown as NotificationMetadata;
      if (meta?.link) {
        config.action = {
          label: (
            <div className="flex items-center gap-1">
              Go <MoveRight className="h-3 w-3" />
            </div>
          ),
          onClick: () => {
            go({ to: meta.link! });
          },
        };
        config.description = meta.message || description;
      }

      switch (type) {
        case "success":
          toast.success(message, config);
          return;

        case "error":
          toast.error(message, {
            ...config,
            description: config.description ?? "An unexpected error occurred. Please try again.",
            action: config.action || {
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
          toast(message, config);
          return;
      }
    },
    close: (id) => {
      toast.dismiss(id);
    },
  };
}
