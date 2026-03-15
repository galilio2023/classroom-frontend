import { createAuthClient } from "better-auth/react";
import { BASE_URL } from "@/config";

/**
 * Better Auth Client Configuration
 * 
 * We use BASE_URL (the domain) and explicitly set the basePath to /api/auth.
 * This ensures requests go to https://your-backend.com/api/auth/...
 */
export const authClient = createAuthClient({
  baseURL: BASE_URL,
  // basePath defaults to /api/auth, but we'll be explicit to ensure consistency
  // as the backend mounts auth at app.all(/\/api\/auth\/.*/, ...)
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include",
  },
  user: {
    additionalFields: {
      role: { type: "string" },
      status: { type: "string" },
      verificationStatus: { type: "string" },
      xp: { type: "number" },
      level: { type: "number" }
    }
  }
});
