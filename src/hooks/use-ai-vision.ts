import { useAiVision as useAiVisionFeature } from "@/features/ai/hooks/use-ai-vision";

/**
 * @deprecated Use `import { useAiVision } from "@/features/ai/hooks/use-ai-vision"` instead.
 * This shim is maintained for backward compatibility during the feature-scoped migration.
 */
export const useAiVision = useAiVisionFeature;
