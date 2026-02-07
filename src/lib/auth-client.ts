import { createAuthClient } from "better-auth/react";

// This creates the client-side instance of Better Auth.
// It is ONLY used by the authProvider to make API calls.
// It should NOT be used directly in any components.
export const authClient = createAuthClient({
  baseURL: `${import.meta.env.VITE_API_URL}/auth`,
});
