/**
 * 🛡️ SECURITY: Centralized API Endpoints for AI Interactions.
 * Following Refine v5 best practices for service-oriented architecture.
 */
export const AI_API = {
  INTERACT: (classId: string | number) => `/live-session/${classId}/interact`,
  STUDY_BUDDY: "/ai/study-buddy",
  MAGIC_BUILDER: (type: string) => `/ai/generate-${type}`,
  FEEDBACK: "/ai/feedback",
  GOVERNANCE: "/settings/global-settings",
};
