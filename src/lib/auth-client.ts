import { createAuthClient } from "better-auth/react";
import { BETTER_AUTH_ROOT } from "@/config";

/**
 * Better Auth Client Configuration
 * 
 * To avoid any path resolution errors, we provide the FULL 
 * path to the auth root (e.g., https://backend.com/api/auth)
 * as the baseURL, and set basePath to an empty string.
 */
export const authClient = createAuthClient({
  baseURL: BETTER_AUTH_ROOT,
  // We provide the full path in baseURL, so we clear the default /api/auth path
  basePath: "",
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
