import { useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { handleError } from "@/providers/utils/api-errors";

/**
 * 🛡️ RULE 8: Standardized Error Notification Hook
 * Ensures consistent surfacing of Correlation IDs (Trace IDs) and user-friendly messages.
 * Mandate Review #15: Reduces code duplication and enforces SRE visibility standards.
 */
export const useNotifyError = () => {
  const { t } = useTranslation();

  const notifyError = useCallback(
    async (err: unknown, overrideMessage?: string) => {
      const httpError = await handleError(err);

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
