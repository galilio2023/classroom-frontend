/**
 * 🛡️ SECURITY: Centralized API Endpoints for AI Interactions.
 * Following Refine v5 best practices for service-oriented architecture.
 */
const isProd = import.meta.env.PROD;
const envUrl = import.meta.env.VITE_API_URL;

if (isProd && !envUrl) {
  console.warn("⚠️  VITE_API_URL is missing in production environment. API calls may fail.");
}

export const BASE_URL = envUrl || (isProd ? "" : "http://localhost:3000/api");

export const AI_API = {
  INTERACT: (classId: string | number) => `/live-session/${classId}/interact`,
  STUDY_BUDDY: "/ai/study-buddy",
  MAGIC_BUILDER: (type: string) => `/ai/generate-${type}`,
  BIO: "/ai/generate-bio",
  FEEDBACK: "/ai/feedback",
  GOVERNANCE: "/settings/global-settings",
  HAGER_EXPORT: "/ai/hager-export",
};

export const OTP_API = {
  SEND: "/auth/otp/send",
  VERIFY: "/auth/otp/verify",
};

/**
 * ⚡ PERFORMANCE: Centralized Query/Mutation Settings
 * Mandate Review #15: Single Source of Truth for caching and stale times.
 */
export const QUERY_SETTINGS = {
  STALE_TIME_HIGH_STAKES: 5 * 60 * 1000, // 5 mins (e.g. Dept Planner)
  STALE_TIME_DEFAULT: 10 * 60 * 1000, // 10 mins (e.g. Section Picker)
  CACHE_TIME_PERSISTENT: 24 * 60 * 60 * 1000, // 24 hours for offline datasets
};
