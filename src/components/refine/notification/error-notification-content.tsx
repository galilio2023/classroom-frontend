import React from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Copy, Check, WifiOff } from "lucide-react";
import { redactSensitiveData } from "@/lib/security";
import { cn } from "@/lib/utils";
import { useOfflineSync } from "@/hooks/useOfflineSync";

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
  const { isOnline } = useOfflineSync();
  const [copied, setCopied] = React.useState(false);

  const [isOpen, setIsOpen] = React.useState(false);

  // 🛡️ TRACEABILITY: Always provide a fallback for support (Mandate Review #8)
  const displayId = correlationId || "N/A";

  // 🛡️ PERFORMANCE: Memoize redacted meta to prevent expensive processing on re-renders
  const redactedMeta = React.useMemo(() => {
    if (!meta) return null;
    const redacted = redactSensitiveData({
      ...meta,
      correlationId: undefined,
      traceId: undefined,
    }) as Record<string, any>;

    return Object.keys(redacted).length > 0 ? redacted : null;
  }, [meta]);

  return (
    <div className="space-y-2">
      <div className="text-sm">
        {description || t("common.errors.unexpected", "An unexpected error occurred.")}
      </div>
      <details
        className="text-[10px] opacity-70 cursor-pointer group"
        open={isOpen}
        onToggle={(e) => setIsOpen(e.currentTarget.open)}
      >
        <summary
          className="hover:underline font-medium list-none flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-primary rounded-sm outline-none"
          aria-expanded={isOpen}
          aria-controls="support-info-content"
          aria-label={t("labels.toggleSupportInfo", "Toggle technical support details")}
        >
          <ChevronDown
            className={cn("h-3 w-3 transition-transform duration-200", isOpen ? "rotate-180" : "")}
          />
          {t("labels.supportInfo", "Support Info")}
        </summary>
        <div
          id="support-info-content"
          className="mt-1 p-2 bg-muted/50 rounded border border-border font-mono break-all select-all leading-tight max-h-48 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          role="region"
          aria-label={t("labels.technicalDetails", "Technical support details")}
        >
          {!isOnline ? (
            <div className="text-destructive font-bold flex items-center gap-1.5 uppercase tracking-widest text-[8px]">
              <WifiOff className="h-3 w-3" />
              {t("common.notifications.checkConnection", "Please check your network connection")}
            </div>
          ) : (
            <>
              ID: {displayId}
              {redactedMeta && (
                <div className="mt-1 border-t border-border/50 pt-1">
                  Meta: {JSON.stringify(redactedMeta, null, 2)}
                </div>
              )}
              <div className="mt-2 flex justify-end">
                {typeof window !== "undefined" && !window.isSecureContext && displayId !== "N/A" ? (
                  <input
                    type="text"
                    readOnly
                    value={displayId}
                    className="px-2 py-1 bg-primary/10 rounded transition-colors text-[9px] border border-primary/20 font-mono w-full outline-none focus:ring-1 focus:ring-primary cursor-text"
                    onClick={(e) => {
                      e.stopPropagation();
                      (e.target as HTMLInputElement).select();
                    }}
                    title={t(
                      "common.notifications.manualCopy",
                      "Manual copy required in non-secure contexts"
                    )}
                  />
                ) : (
                  <button
                    className="px-2 py-1 bg-primary/10 hover:bg-primary/20 rounded transition-colors text-[9px] border border-primary/20 font-sans flex items-center gap-1.5"
                    aria-label={t(
                      "common.notifications.copyCorrelationId",
                      "Copy correlation ID for support"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (displayId === "N/A") return;

                      const performCopy = async () => {
                        try {
                          if (window.isSecureContext && navigator.clipboard) {
                            await navigator.clipboard.writeText(displayId);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }
                        } catch (err) {
                          console.error("Failed to copy ID", err);
                        }
                      };

                      void performCopy();
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
                )}
              </div>
            </>
          )}
        </div>
      </details>
    </div>
  );
};
