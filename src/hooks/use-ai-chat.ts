import { useAIChat as useAIChatFeature } from "@/features/ai/hooks/use-ai-chat";

/**
 * @deprecated Use `import { useAIChat } from "@/features/ai/hooks/use-ai-chat"` instead.
 * This shim is maintained for backward compatibility during the feature-scoped migration.
 */
export const useAIChat = useAIChatFeature;
