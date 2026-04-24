import { mbToBytes } from "@/lib/utils";
import { MAX_SYNC_UPLOAD_SIZE_MB } from "@/config";

/**
 * 🛰️ UPLOAD CONSTANTS
 * Mandate Review #13: Standardized limits for rural resilience.
 * Ensure TUS threshold matches the global sync upload limit to trigger
 * resumability exactly when standard XHR becomes unreliable.
 */
export const UPLOAD_CONSTANTS = {
  DEFAULT_MAX_FILE_SIZE: mbToBytes(10),
  TUS_RESUMABLE_THRESHOLD_MB: MAX_SYNC_UPLOAD_SIZE_MB,
};
