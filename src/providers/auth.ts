import type { AuthProvider } from "@refinedev/core";
import { User, SignUpPayload } from "@/types";
import { authClient } from "@/lib/auth-client";

export const authProvider: AuthProvider = {
  register: async (params) => {
    const { data, error } = await authClient.signUp.email(params as SignUpPayload);
    if (error) {
      return {
        success: false,
        error: {
          name: "Registration failed",
          message: error?.message || "Unable to create account.",
        },
      };
    }
    if (data?.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return { success: true, redirectTo: "/login" };
  },

  login: async ({ email, password }) => {
    const { data, error } = await authClient.signIn.email({ email, password });
    if (error) {
      return {
        success: false,
        error: {
          name: "Login failed",
          message: error?.message || "Invalid credentials.",
        },
      };
    }
    localStorage.setItem("user", JSON.stringify(data.user));
    return { success: true, redirectTo: "/" };
  },

  logout: async () => {
    await authClient.signOut();
    localStorage.removeItem("user");
    return { success: true, redirectTo: "/login" };
  },

  // This is a fast, client-side check that improves performance.
  // It comes with a trade-off: if a user's session is revoked on the server,
  // the client won't know until the next API call fails.
  // The `onError` handler is our security net for this scenario.
  check: async () => {
    const user = localStorage.getItem("user");
    if (user) {
      return { authenticated: true };
    }
    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },

  onError: async (error) => {
    if (error?.response?.status === 401) {
      return {
        logout: true,
        redirectTo: "/login",
      };
    }
    return {};
  },

  getPermissions: async () => {
    const user = localStorage.getItem("user");
    if (!user) return null;
    try {
      const parsedUser: User = JSON.parse(user);
      return { role: parsedUser.role };
    } catch (e) {
      localStorage.removeItem("user");
      return null;
    }
  },

  getIdentity: async () => {
    const user = localStorage.getItem("user");
    if (!user) return null;
    try {
      const parsedUser: User = JSON.parse(user);
      return parsedUser;
    } catch (e) {
      localStorage.removeItem("user");
      return null;
    }
  },
};
