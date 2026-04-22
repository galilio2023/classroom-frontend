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
      // 🛡️ Mandate Review #8: Explicit cast to handle augmented meta field
      const { key, type, message, description, undoableTimeout, cancelMutation, meta } =
        params as any;
      const toastId = key || Date.now().toString();

      // 🛡️ TRACEABILITY: Prefer correlationId from meta (Standard Mandate Review #8)
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
      }

      // 🛡️ Mandate Review #8: Unified Description Renderer with "Support Info" Accordion
      const renderDescription = () => {
        if (type !== "error" || !correlationId) return description;

        return (
          <div className="space-y-2">
            <div className="text-sm">
              {typeof description === "string" ? description : "An unexpected error occurred."}
            </div>
            <details className="text-[10px] opacity-70 cursor-pointer group">
              <summary className="hover:underline font-medium list-none flex items-center gap-1">
                <span className="group-open:rotate-90 transition-transform duration-200">▶</span>
                Support Info
              </summary>
              <div className="mt-1 p-2 bg-muted/50 rounded border border-border font-mono break-all select-all leading-tight">
                ID: {correlationId}
                {meta && Object.keys(meta).length > 1 && (
                  <div className="mt-1 border-t border-border/50 pt-1">
                    Meta:{" "}
                    {JSON.stringify(
                      { ...meta, correlationId: undefined, traceId: undefined },
                      null,
                      2
                    )}
                  </div>
                )}
              </div>
            </details>
          </div>
        );
      };

      const config: ExternalToast = {
        id: toastId,
        description: renderDescription(),
        richColors: true,
        duration: type === "error" ? 10000 : 4000, // 🚀 UX: Longer duration for error analysis
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
