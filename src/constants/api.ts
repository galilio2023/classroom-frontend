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
  FEEDBACK: "/ai/feedback",
  GOVERNANCE: "/settings/global-settings",
};
