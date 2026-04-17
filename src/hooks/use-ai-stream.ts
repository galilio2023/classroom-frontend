import { useAiStream as useAiStreamFeature } from "@/features/ai/hooks/use-ai-stream";

/**
 * @deprecated Use `import { useAiStream } from "@/features/ai/hooks/use-ai-stream"` instead.
 * This shim is maintained for backward compatibility during the feature-scoped migration.
 */
export const useAiStream = useAiStreamFeature;
