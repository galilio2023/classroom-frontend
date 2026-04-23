import { UndoableNotification } from "@/components/refine/notification/undoable-notification";
import { ErrorNotificationContent } from "@/components/refine/notification/error-notification-content";
import {
  useTranslate,
  type NotificationProvider,
  type OpenNotificationParams,
} from "@refinedev/core";
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
 * 🛡️ TYPE SAFETY: Augmented parameters for Tablawy notifications.
 * Mandate Review #9: Explicitly defines all fields to bypass library-level type conflicts.
 */
export interface TablawyOpenNotificationParams {
  key?: string;
  message: string;
  type: TablawyNotificationType;
  description?: React.ReactNode;
  undoableTimeout?: number;
  cancelMutation?: () => void;
  meta?: {
    correlationId?: string;
    traceId?: string;
    retryAfter?: number;
    icon?: React.ReactNode;
    link?: string;
    [key: string]: any;
  };
}

const NOTIFICATION_DURATIONS = {
  DEFAULT: 4000,
  ERROR: 10000,
  SUCCESS: 4000,
  INFO: 4000,
  WARNING: 6000,
};

/**
 * Refine Notification Provider using Sonner.
 * Optimized for the new Service Layer backend.
 */
export function useNotificationProvider(): NotificationProvider {
  const navigate = useNavigate();
  const t = useTranslate();

  return {
    open: (params: OpenNotificationParams & Partial<TablawyOpenNotificationParams>) => {
      // 🛡️ Mandate Review #8: Map params to our internal strict type
      const { key, type, message, description, undoableTimeout, cancelMutation, meta } =
        params as TablawyOpenNotificationParams;
      const toastId = key || Date.now().toString();

      // 🛡️ TRACEABILITY: Prefer correlationId from meta (Standard Mandate Review #8)
      const correlationId = meta?.correlationId || meta?.traceId;

      let extraAction: ExternalToast["action"] | undefined;

      if (correlationId) {
        extraAction = {
          label: "Copy ID",
          onClick: () => {
            void navigator.clipboard.writeText(correlationId);
            // 🛡️ UX: Silent feedback for copying (Mandate Review #9)
            toast.info(t("common.notifications.idCopied", "Correlation ID copied to clipboard"), {
              duration: 2000,
            });
          },
        };
      }

      const config: ExternalToast = {
        id: toastId,
        description:
          type === "error" ? (
            <ErrorNotificationContent
              description={description}
              correlationId={correlationId}
              meta={meta}
            />
          ) : (
            description
          ),
        richColors: true,
        duration: type === "error" ? NOTIFICATION_DURATIONS.ERROR : NOTIFICATION_DURATIONS.DEFAULT, // 🚀 UX: Longer duration for error analysis
        action: extraAction,
        icon: meta?.icon,
      };

      // 🚀 ACTIONABLE REDIRECTS: Prefer meta.link (Mandate Review #9)
      if (meta?.link) {
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
      } else if (
        typeof description === "object" &&
        description !== null &&
        !React.isValidElement(description)
      ) {
        // Fallback for legacy NotificationMetadata objects in description
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
