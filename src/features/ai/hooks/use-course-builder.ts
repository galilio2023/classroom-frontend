import { useCustomMutation } from "@refinedev/core";

export const useCourseBuilder = () => {
  const { mutate: generateDraft, overtimeLoading: isGenerating } = useCustomMutation<any>();
  const { mutate: commitDraft, overtimeLoading: isCommitting } = useCustomMutation<any>();

  const startDrafting = (resourceId: string, onSuccess?: (draft: any) => void) => {
    generateDraft(
      {
        url: `/ai/course-builder/draft`,
        method: "post",
        values: { resourceId },
        config: {
          headers: {
            "Content-Type": "application/json",
          },
        },
      },
      {
        onSuccess: (data) => onSuccess?.(data.data),
      }
    );
  };

  const publishCourse = (draftId: string, onSuccess?: (modules: any) => void) => {
    commitDraft(
      {
        url: `/ai/course-builder/commit`,
        method: "post",
        values: { draftId },
      },
      {
        onSuccess: (data) => onSuccess?.(data.data),
      }
    );
  };

  return {
    startDrafting,
    publishCourse,
    isGenerating,
    isCommitting,
  };
};
