import { mbToBytes } from "@/lib/utils";

/**
 * 🛰️ UPLOAD CONSTANTS
 * Mandate Review #13: Standardized limits for rural resilience.
 */
export const UPLOAD_CONSTANTS = {
  DEFAULT_MAX_FILE_SIZE: mbToBytes(10),
  TUS_RESUMABLE_THRESHOLD_MB: 5,
};
