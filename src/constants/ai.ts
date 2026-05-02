/**
 * 🤖 AI MODEL CONFIGURATION
 * Single source of truth for AI model versions across the ecosystem.
 */
export const AI_MODELS = {
  PRIMARY: "gemini-3.1-flash-lite-preview",
  STABLE: "gemini-1.5-flash", // Fallback for specific operations
  EMBEDDING: "text-embedding-004",
};

/**
 * 🛡️ AI GOVERNANCE VERSIONING
 * Naming Convention: v[Major].[Year]-[Month] (e.g., "v1.2026-04")
 * This version must be updated whenever the AI Terms of Service or Law 151 compliance
 * requirements change, forcing users to re-provide consent.
 */
export const AI_CONSENT_VERSION = "v1.2026-04";
