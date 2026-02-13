import { createAuthClient } from "better-auth/react";
import { BACKEND_URL } from "@/config";

// This creates the client-side instance of Better Auth.
// It is ONLY used by the authProvider to make API calls.
// It should NOT be used directly in any components.
export const authClient = createAuthClient({
  baseURL: `${BACKEND_URL}/auth`,
  fetchOptions: {
    credentials: "include",
  },
});
