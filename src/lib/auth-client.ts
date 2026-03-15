import { createAuthClient } from "better-auth/react";
import { AUTH_API_URL } from "@/config";

/**
 * Better Auth Client Configuration
 * 
 * In production:
 * AUTH_API_URL = https://classroom-backend-production-6e52.up.railway.app/api
 * better-auth adds /auth/ to its requests, resulting in:
 * https://classroom-backend-production-6e52.up.railway.app/api/auth/sign-in/email
 */
export const authClient = createAuthClient({
  baseURL: AUTH_API_URL,
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
