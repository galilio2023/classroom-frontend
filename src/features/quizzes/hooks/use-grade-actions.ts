import { useCustomMutation } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { handleError } from "@/providers/utils/api-errors";

/**
 * 🛠️ SHARED GRADE ACTIONS HOOK
 * Centralizes Submission and Finalization logic with Standardized Error Handling.
 * Mandate Rules 5 & 8: Traceability and Error UX.
 */
export const useGradeActions = (
  resource: "submissions" | "quizzes",
  queriesToRefetch: any[] = []
) => {
  const { t } = useTranslation();
  const { mutate, mutation } = useCustomMutation();

  /**
   * Performs a grade-related action (submit or finalize).
   * @param type The action type.
   * @param parentId The ID of the target resource.
   * @param customPayloadKey Optional override for the payload key (e.g., 'studentId' vs 'assignmentId').
   */
  const handleAction = (
    type: "submit" | "finalize",
    parentId: string | number,
    customPayloadKey?: string
  ) => {
    const endpoint = type === "submit" ? "submit-grades" : "finalize-grades";
    const defaultKey = resource === "quizzes" ? "quizId" : "assignmentId";
    const payloadKey = customPayloadKey || defaultKey;

    mutate(
      {
        url: `${import.meta.env.VITE_API_URL}/${resource}/${endpoint}`,
        method: "post",
        values: { [payloadKey]: parentId },
      },
      {
        onSuccess: () => {
          toast.success(
            t(`classes.gradebook.toasts.${type}Success`, {
              defaultValue: `Grades ${type}d successfully!`,
            })
          );
          queriesToRefetch.forEach((q) => {
            if (q.refetch) q.refetch();
            else if (q.query?.refetch) q.query.refetch();
          });
        },
        onError: async (err) => {
          const httpError = await handleError(err);
          toast.error(httpError.message, {
            description: httpError.meta?.correlationId
              ? `Trace ID: ${httpError.meta.correlationId}`
              : undefined,
          });
        },
      }
    );
  };

  return {
    handleAction,
    isPending: mutation.isPending,
  };
};
