import { createAuthClient } from "better-auth/react";
import { BETTER_AUTH_ROOT } from "@/config";
import { bearer } from "better-auth/plugins";

/**
 * Better Auth Client Configuration
 *
 * To avoid any path resolution errors, we provide the FULL
 * path to the auth root (e.g., https://backend.com/api/auth)
 * as the baseURL, and set basePath to an empty string.
 */
export const authClient = createAuthClient({
  // Better Auth expects the API root for its internal routing
  baseURL: BETTER_AUTH_ROOT,
  // Since we provide the exact path (e.g., .../api/auth) in baseURL, 
  // we must clear basePath to prevent it from appending '/api/auth' again.
  basePath: "",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [bearer()],
  user: {
    additionalFields: {
      role: { type: "string" },
      status: { type: "string" },
      verificationStatus: { type: "string" },
      xp: { type: "number" },
      level: { type: "number" },
    },
  },
});
