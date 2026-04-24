import { STORAGE_KEYS } from "@/config";

/**
 * 🛡️ AUTH HELPER: Standardized token retrieval.
 * Mandate Review #9: Centralizes token access to ensure consistency across providers and contexts.
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};
