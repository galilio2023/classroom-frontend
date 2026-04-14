/**
 * 🗺️ RESOURCE TO PATH MAPPING
 * Centralized mapping of Refine resource names to Backend API paths.
 */
export const resourceToPath: Record<string, string> = {
  "teacher-channels": "channels",
  "teacher-subscriptions": "enrollments",
  "student-subscriptions": "enrollments",
  "my-classes": "enrollments",
  portfolio: "users",
  "ai-activity-logs": "ai/logs",
  "ai-health-reports": "ai/health-reports",
  "academic-terms": "terms",
  "guardian-portal": "parent/dashboard",
  "child-risk-reports": "parent/child",
  "public-classes": "public/classes",
};

/**
 * Helper to get the API path for a given Refine resource name.
 */
export const getResourcePath = (resource: string) => resourceToPath[resource] || resource;
