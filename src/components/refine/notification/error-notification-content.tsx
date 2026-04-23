import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { SENSITIVE_DATA_KEYS } from "@/lib/security";

interface ErrorNotificationContentProps {
  description?: React.ReactNode;
  correlationId?: string;
  meta?: Record<string, any>;
}

/**
 * 🛡️ TRACEABILITY COMPONENT: Standardized Error Renderer
 * Mandate Review #8: Unified Description Renderer with "Support Info" Accordion.
 * Extracted for maintainability and to keep the NotificationProvider clean.
 */
export const ErrorNotificationContent: React.FC<ErrorNotificationContentProps> = ({
  description,
  correlationId,
  meta,
}) => {
  const { t } = useTranslation();

  if (!correlationId) return <>{description}</>;

  return (
    <div className="space-y-2">
      <div className="text-sm">
        {description || t("common.errors.unexpected", "An unexpected error occurred.")}
      </div>
      <details className="text-[10px] opacity-70 cursor-pointer group">
        <summary
          className="hover:underline font-medium list-none flex items-center gap-1"
          onClick={(e) => {
            // Prevent toast from dismissing when interacting with accordion
            e.stopPropagation();
          }}
        >
          <span className="group-open:rotate-90 transition-transform duration-200">▶</span>
          {t("common.labels.supportInfo", "Support Info")}
        </summary>
        <div
          className="mt-1 p-2 bg-muted/50 rounded border border-border font-mono break-all select-all leading-tight"
          onClick={(e) => e.stopPropagation()}
        >
          ID: {correlationId}
          {meta && Object.keys(meta).length > 1 && (
            <div className="mt-1 border-t border-border/50 pt-1">
              Meta:{" "}
              {JSON.stringify(
                {
                  ...meta,
                  correlationId: undefined,
                  traceId: undefined,
                  // 🛡️ Mandate Review #11: Use centralized redaction list
                  ...Object.fromEntries(SENSITIVE_DATA_KEYS.map((k) => [k, undefined])),
                },
                null,
                2
              )}
            </div>
          )}
          <div className="mt-2 flex justify-end">
            <button
              className="px-2 py-1 bg-primary/10 hover:bg-primary/20 rounded transition-colors text-[9px]"
              aria-label={t(
                "common.notifications.copyCorrelationId",
                "Copy correlation ID for support"
              )}
              onClick={(e) => {
                e.stopPropagation();
                void navigator.clipboard.writeText(correlationId);
                toast.info(t("common.notifications.idCopied", "ID copied"), { duration: 1500 });
              }}
            >
              Copy ID
            </button>
          </div>
        </div>
      </details>
    </div>
  );
};
