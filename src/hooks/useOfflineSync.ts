import { useOfflineSync as useOfflineSyncFeature } from "@/features/engagement/hooks/use-offline-sync";

/**
 * @deprecated Use `import { useOfflineSync } from "@/features/engagement/hooks/use-offline-sync"` instead.
 * This shim is maintained for backward compatibility during the feature-scoped migration.
 */
export const useOfflineSync = useOfflineSyncFeature;
