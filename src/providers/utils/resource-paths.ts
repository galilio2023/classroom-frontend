/**
 * 🗺️ RESOURCE TO PATH MAPPING
 * Centralized mapping of Refine resource names to Backend API paths.
 */
export const resourceToPath: Record<string, string> = {
  // Identity Module
  portfolio: "identity/users",
  users: "identity/users",
  schools: "identity/schools",
  "teacher-applications": "identity/teacher-applications",
  "guardian-portal": "identity/parents/dashboard",
  "child-risk-reports": "identity/parents/child",

  // Academic Module
  enrollments: "academic/enrollments",
  subjects: "academic/subjects",
  classes: "academic/classes",
  departments: "academic/departments",
  modules: "academic/modules",
  "academic-terms": "academic/terms",

  // Assessment Module
  quizzes: "assessment/quizzes",
  assignments: "assessment/assignments",
  submissions: "assessment/submissions",
  "peer-reviews": "assessment/peer-reviews",

  // Core / Other
  "teacher-channels": "channels",
  "teacher-subscriptions": "enrollments",
  "student-subscriptions": "enrollments",
  "ai-activity-logs": "ai-activity-logs",
  "ai-health-reports": "ai-health-reports",
  "public-classes": "public/classes",
};

/**
 * Helper to get the API path for a given Refine resource name.
 * 🚀 MODULAR: Handles sub-resources by matching the first segment (e.g., "quizzes/123/submit" -> "assessment/quizzes/123/submit").
 */
export const getResourcePath = (resource: string) => {
  const segments = resource.split("/");
  const baseResource = segments[0];
  const mappedPath = resourceToPath[baseResource];

  if (mappedPath) {
    segments[0] = mappedPath;
    return segments.join("/");
  }

  return resource;
};
