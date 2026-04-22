import { UndoableNotification } from "@/components/refine/notification/undoable-notification";
import type { NotificationProvider } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { toast, type ExternalToast } from "sonner";
import { MoveRight, Copy, Check } from "lucide-react";
import { NotificationMetadata } from "@/types";
import React from "react";

/**
 * Refine Notification Provider using Sonner.
 * Optimized for the new Service Layer backend.
 */
export function useNotificationProvider(): NotificationProvider {
  const navigate = useNavigate();

  return {
    open: ({ key, type, message, description, undoableTimeout, cancelMutation }) => {
      const toastId = key || Date.now().toString();

      // 🛡️ TRACEABILITY: If description contains Trace ID, add a copy button (Mandate Review #8)
      const finalDescription = description;
      let extraAction: ExternalToast["action"] | undefined;

      if (
        typeof description === "string" &&
        (description.includes("Trace ID:") || description.includes("Correlation ID:"))
      ) {
        const idMatch = description.match(/(?:Trace ID|Correlation ID): ([\w-]+)/);
        if (idMatch && idMatch[1]) {
          const id = idMatch[1];
          extraAction = {
            label: "Copy ID",
            onClick: () => {
              void navigator.clipboard.writeText(id);
              toast.success("ID copied to clipboard", { duration: 2000 });
            },
          };
        }
      }

      const config: ExternalToast = {
        id: toastId,
        description: finalDescription,
        richColors: true,
        duration: type === "error" ? 8000 : 4000,
        action: extraAction,
      };

      // 🚀 ACTIONABLE REDIRECTS: If there's a link, add a button
      if (
        typeof description === "object" &&
        description !== null &&
        !React.isValidElement(description)
      ) {
        const meta = description as unknown as NotificationMetadata;
        if (meta.link) {
          config.action = {
            label: (
              <div className="flex items-center gap-1">
                Go <MoveRight className="h-3 w-3" />
              </div>
            ),
            onClick: () => {
              navigate(meta.link!);
            },
          };
          config.description = meta.message || undefined;
        }
      }

      switch (type as string) {
        case "success":
          toast.success(message, config);
          return;

        case "error": {
          // 🛡️ SECURITY: Ensure description is safe for rendering (Mandate Review #8)
          if (!config.description) {
            config.description = "An unexpected error occurred. Please try again.";
          }

          toast.error(message, {
            ...config,
            action: config.action || {
              label: "Dismiss",
              onClick: () => toast.dismiss(toastId),
            },
          });
          return;
        }

        case "info":
          toast.info(message, config);
          return;

        case "warning":
          toast.warning(message, config);
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
