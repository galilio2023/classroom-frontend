import { offlineDB } from "@/lib/offline-db";

type RollbackParams = {
  blockId: string;
  previousStatus: boolean;
  previousUpdatedAt: number;
};

/**
 * 🛡️ Utility: Atomic Rollback for Study Plan
 * Encapsulates the logic to revert both React state and Dexie to a previous state,
 * ensuring consistency during optimistic update failures.
 * This uses a transaction to guarantee atomicity in the database operation.
 */
export const performStudyPlanRollback = async (
  setCompletedBlocks: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  { blockId, previousStatus, previousUpdatedAt }: RollbackParams
) => {
  // 1. Revert React state using a functional update to avoid stale closures
  setCompletedBlocks((prev) => ({ ...prev, [blockId]: previousStatus }));

  // 2. Use a Dexie transaction to atomically revert the offline database state
  try {
    await offlineDB.transaction("rw", offlineDB.study_plans, async () => {
      const latest = await offlineDB.study_plans.get("current");
      if (latest) {
        await offlineDB.study_plans.update("current", {
          completedBlocks: { ...latest.completedBlocks, [blockId]: previousStatus },
          updatedAt: previousUpdatedAt,
        });
      }
    });
  } catch (err) {
    console.error("Critical failure during Dexie rollback transaction:", err);
  }
};

/**
 * 🛡️ Utility: Compare Refine Identity with Socket/DB IDs
 * Prevents type mismatch bugs (e.g., 123 === "123" is false)
 */
export const compareIds = (
  refineId: string | number | undefined,
  externalId: string | number | undefined
): boolean => {
  if (refineId === undefined || externalId === undefined) return false;
  return String(refineId) === String(externalId);
};
