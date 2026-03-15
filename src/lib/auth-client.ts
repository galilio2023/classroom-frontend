import { createAuthClient } from "better-auth/react";
import { BASE_URL } from "@/config";

/**
 * Better Auth Client Configuration
 * 
 * We must use the BASE_URL (the domain root) and explicitly 
 * set the basePath to /api/auth.
 * 
 * Requests will now go correctly to:
 * https://your-backend.com/api/auth/sign-in/email
 * instead of missing the /auth prefix.
 */
export const authClient = createAuthClient({
  baseURL: BASE_URL,
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
