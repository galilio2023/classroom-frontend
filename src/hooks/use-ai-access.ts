import { useAiAccess as useAiAccessFeature } from "@/features/ai/hooks/use-ai-access";

/**
 * @deprecated Use `import { useAiAccess } from "@/features/ai/hooks/use-ai-access"` instead.
 * This shim is maintained for backward compatibility during the feature-scoped migration.
 */
export const useAiAccess = useAiAccessFeature;
