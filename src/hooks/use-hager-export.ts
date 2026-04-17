import { useHagerExport as useHagerExportFeature } from "@/features/ai/hooks/use-hager-export";

/**
 * @deprecated Use `import { useHagerExport } from "@/features/ai/hooks/use-hager-export"` instead.
 * This shim is maintained for backward compatibility during the feature-scoped migration.
 */
export const useHagerExport = useHagerExportFeature;
