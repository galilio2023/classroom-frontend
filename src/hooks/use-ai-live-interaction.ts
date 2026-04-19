import { useAILiveInteraction as useAiLiveInteractionFeature } from "@/features/ai/hooks/use-ai-live-interaction";

/**
 * @deprecated Use `import { useAiLiveInteraction } from "@/features/ai/hooks/use-ai-live-interaction"` instead.
 * This shim is maintained for backward compatibility during the feature-scoped migration.
 */
export const useAiLiveInteraction = useAiLiveInteractionFeature;
