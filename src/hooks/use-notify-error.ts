import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { handleError } from "@/providers/utils/api-errors";

/**
 * 🛡️ RULE 8: Standardized Error Notification Hook
 * Ensures consistent surfacing of Correlation IDs (Trace IDs) and user-friendly messages.
 * Mandate Review #15: Reduces code duplication and enforces SRE visibility standards.
 * 🚀 RESILIENCE: Includes built-in deduplication to prevent "Toast Storms".
 */
export const useNotifyError = () => {
  const { t } = useTranslation();
  const lastErrorRef = useRef<string | null>(null);

  const notifyError = useCallback(
    async (err: unknown, overrideMessage?: string) => {
      if (!err) {
        lastErrorRef.current = null;
        return;
      }

      const httpError = await handleError(err);

      // 🛡️ DEDUPLICATION: Prevent identical toasts within the same component lifecycle
      const errorKey = `${httpError.statusCode}-${httpError.message}-${httpError.meta?.correlationId}`;
      if (lastErrorRef.current === errorKey) return httpError;

      lastErrorRef.current = errorKey;

      const message = overrideMessage || httpError.message;
      const correlationId = httpError.meta?.correlationId || "N/A";

      toast.error(message, {
        description: t("errors.trace_id", {
          defaultValue: `Trace ID: ${correlationId}`,
          id: correlationId,
        }),
      });

      return httpError;
    },
    [t]
  );

  return { notifyError };
};
