import { useCustomMutation } from "@refinedev/core";

export interface AnalysisResponse {
  analysis: string;
  followUpQuestions: string[];
}

export interface VisionVariables {
  image: string; // Base64
}

/**
 * 🛡️ AI HOOK ISOLATION: WHITEBOARD VISION
 * Abstraction for Gemini vision analysis logic.
 */
export const useAiVision = () => {
  const { mutate, mutation } = useCustomMutation<AnalysisResponse>();

  const isPending = mutation.isPending;

  const analyzeWhiteboard = (
    base64Image: string,
    options?: {
      onSuccess?: (data: AnalysisResponse) => void;
      onError?: (error: unknown) => void;
    }
  ) => {
    mutate(
      {
        url: "/ai/whiteboard-analyze",
        method: "post",
        values: { image: base64Image },
      },
      {
        onSuccess: (response) => {
          // 🛡️ ROBUSTNESS: Normalize Refine/Axios response structure
          // Some providers wrap data in .data.data, others in .data
          const r = response as { data?: { data?: AnalysisResponse } };
          const normalizedData =
            r.data?.data || (response as { data?: AnalysisResponse }).data || response;
          options?.onSuccess?.(normalizedData as AnalysisResponse);
        },
        onError: (error) => {
          options?.onError?.(error);
        },
      }
    );
  };

  return {
    analyzeWhiteboard,
    isLoading: isPending,
  };
};
