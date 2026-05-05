import { useCustomMutation } from "@refinedev/core";

export interface CourseModuleDraft {
  title: string;
  description: string;
  learningObjectives: string[];
}

export interface CourseDraft {
  id: string | number;
  content: CourseModuleDraft[];
}

export const useCourseBuilder = () => {
  const { mutate: generateDraft, mutation: genMutation } = useCustomMutation<{
    data: CourseDraft;
  }>();
  const { mutate: commitDraft, mutation: commitMutation } = useCustomMutation<{
    data: unknown;
  }>();

  const isGenerating = genMutation.isPending;
  const isCommitting = commitMutation.isPending;

  const startDrafting = (resourceId: string, onSuccess?: (draft: CourseDraft) => void) => {
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
        onSuccess: (data) => onSuccess?.(data.data.data),
      }
    );
  };

  const publishCourse = (draftId: string, onSuccess?: (modules: unknown) => void) => {
    commitDraft(
      {
        url: `/ai/course-builder/commit`,
        method: "post",
        values: { draftId },
      },
      {
        onSuccess: (data) => onSuccess?.(data.data.data),
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
