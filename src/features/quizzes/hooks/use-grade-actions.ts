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
  refetchCallbacks: (() => void)[]
) => {
  const { t } = useTranslation();
  const { mutate, mutation } = useCustomMutation();

  const handleAction = (type: "submit" | "finalize", parentId: string) => {
    const endpoint = type === "submit" ? "submit-grades" : "finalize-grades";
    const payloadKey = resource === "quizzes" ? "quizId" : "assignmentId";

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
          refetchCallbacks.forEach((cb) => cb());
        },
        onError: async (err) => {
          const httpError = await handleError(err);
          toast.error(httpError.message);
        },
      }
    );
  };

  return {
    handleAction,
    isPending: mutation.isPending,
  };
};
