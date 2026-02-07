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
    // Do not store user here, let login handle it.
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
    // On successful login, store the user object in localStorage.
    localStorage.setItem("user", JSON.stringify(data.user));
    return { success: true, redirectTo: "/" };
  },

  logout: async () => {
    await authClient.signOut();
    localStorage.removeItem("user");
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    // For the initial check, we prefer a fast, client-side check.
    // The onError handler will catch any stale sessions on the next API call.
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

  // This is the final, robust implementation of getIdentity.
  getIdentity: async () => {
    // 1. Try to get the user from localStorage first for speed.
    const user = localStorage.getItem("user");
    if (user) {
      try {
        return JSON.parse(user);
      } catch (e) {
        // If localStorage is corrupted, clear it and proceed to fetch from the API.
        localStorage.removeItem("user");
      }
    }

    // 2. If not in localStorage, fetch the session from the backend.
    try {
      const session = await authClient.getSession();
      if (session?.user) {
        // 3. Store the fresh user data in localStorage for the next time.
        localStorage.setItem("user", JSON.stringify(session.user));
        return session.user;
      }
    } catch (error) {
      // This can happen if the session cookie is invalid.
      console.error("Error fetching session in getIdentity:", error);
    }

    // 4. If all else fails, return null.
    return null;
  },
};
