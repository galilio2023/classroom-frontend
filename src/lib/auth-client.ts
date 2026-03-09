import { createAuthClient } from "better-auth/react";
import { BACKEND_URL } from "@/config";

/**
 * Better Auth Client Configuration
 * This client is used to interact with the backend auth endpoints.
 * It is configured to handle the custom fields (role, status) we added.
 */
export const authClient = createAuthClient({
  baseURL: `${BACKEND_URL}/auth`,
  fetchOptions: {
    credentials: "include",
  },
  // Define the custom fields to ensure TypeScript knows about them
  user: {
    additionalFields: {
      role: {
        type: "string",
      },
      status: {
        type: "string",
      },
      verificationStatus: {
        type: "string",
      },
      xp: {
        type: "number",
      },
      level: {
        type: "number",
      }
    }
  }
});
