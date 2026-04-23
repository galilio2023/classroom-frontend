import React from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Copy, Check } from "lucide-react";
import { redactSensitiveData } from "@/lib/security";
import { cn } from "@/lib/utils";

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
  const [copied, setCopied] = React.useState(false);

  const [isOpen, setIsOpen] = React.useState(false);

  // 🛡️ TRACEABILITY: Always provide a fallback for support (Mandate Review #8)
  const displayId = correlationId || "N/A";

  return (
    <div className="space-y-2">
      <div className="text-sm">
        {description || t("common.errors.unexpected", "An unexpected error occurred.")}
      </div>
      <details
        className="text-[10px] opacity-70 cursor-pointer group"
        onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary
          className="hover:underline font-medium list-none flex items-center gap-1"
          aria-expanded={isOpen}
          aria-controls="support-info-content"
          role="button"
          onClick={(e) => {
            // Prevent toast from dismissing when interacting with accordion
            e.stopPropagation();
          }}
        >
          <ChevronDown
            className={cn("h-3 w-3 transition-transform duration-200", isOpen ? "rotate-180" : "")}
          />
          {t("common.labels.supportInfo", "Support Info")}
        </summary>
        <div
          id="support-info-content"
          className="mt-1 p-2 bg-muted/50 rounded border border-border font-mono break-all select-all leading-tight"
          onClick={(e) => e.stopPropagation()}
          role="region"
          aria-label={t("common.labels.technicalDetails", "Technical support details")}
        >
          ID: {displayId}
          {meta && Object.keys(meta).length > 1 && (
            <div className="mt-1 border-t border-border/50 pt-1">
              Meta:{" "}
              {JSON.stringify(
                redactSensitiveData({
                  ...meta,
                  correlationId: undefined,
                  traceId: undefined,
                }),
                null,
                2
              )}
            </div>
          )}
          <div className="mt-2 flex justify-end">
            <button
              className="px-2 py-1 bg-primary/10 hover:bg-primary/20 rounded transition-colors text-[9px] border border-primary/20 font-sans flex items-center gap-1.5"
              aria-label={t(
                "common.notifications.copyCorrelationId",
                "Copy correlation ID for support"
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (displayId === "N/A") return;
                void navigator.clipboard.writeText(displayId);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? (
                <>
                  <Check className="h-2.5 w-2.5" />
                  {t("common.notifications.copied", "Copied")}
                </>
              ) : (
                <>
                  <Copy className="h-2.5 w-2.5" />
                  {t("common.notifications.copyId", "Copy ID")}
                </>
              )}
            </button>
          </div>
        </div>
      </details>
    </div>
  );
};
