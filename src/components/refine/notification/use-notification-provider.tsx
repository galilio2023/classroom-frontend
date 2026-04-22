import { UndoableNotification } from "@/components/refine/notification/undoable-notification";
import type { NotificationProvider } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { toast, type ExternalToast } from "sonner";
import { MoveRight } from "lucide-react";
import { NotificationMetadata } from "@/types";
import React from "react";

/**
 * 🛡️ TYPE SAFETY: Tablawy Notification Types
 * Extends Refine's base types to support our full feature set.
 */
export type TablawyNotificationType = "success" | "error" | "info" | "warning" | "progress";

/**
 * Refine Notification Provider using Sonner.
 * Optimized for the new Service Layer backend.
 */
export function useNotificationProvider(): NotificationProvider {
  const navigate = useNavigate();

  return {
    open: (params) => {
      const { key, type, message, description, undoableTimeout, cancelMutation, meta } =
        params as any;
      const toastId = key || Date.now().toString();

      // 🛡️ TRACEABILITY: Prefer correlationId from meta, fallback to parsing description
      const correlationId = meta?.correlationId || meta?.traceId;

      let extraAction: ExternalToast["action"] | undefined;

      if (correlationId) {
        extraAction = {
          label: "Copy ID",
          onClick: () => {
            void navigator.clipboard.writeText(correlationId);
            toast.success("ID copied to clipboard", { duration: 2000 });
          },
        };
      } else if (
        typeof description === "string" &&
        (description.includes("Trace ID:") || description.includes("Correlation ID:"))
      ) {
        // Fallback for legacy calls that put ID in description
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
        description,
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
        const notificationMeta = description as unknown as NotificationMetadata;
        if (notificationMeta.link) {
          config.action = {
            label: (
              <div className="flex items-center gap-1">
                Go <MoveRight className="h-3 w-3" />
              </div>
            ),
            onClick: () => {
              navigate(notificationMeta.link!);
            },
          };
          config.description = notificationMeta.message || undefined;
        }
      }

      switch (type) {
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

        // 🛡️ EXTENSION: Handle types not strictly in Refine's base OpenNotificationParams
        case "info" as any:
          toast.info(message, config);
          return;

        case "warning" as any:
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
