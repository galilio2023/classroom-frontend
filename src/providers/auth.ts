import type { AuthProvider } from "@refinedev/core";
import { User, SignUpPayload } from "@/types";
import { authClient } from "@/lib/auth-client";

export const authProvider: AuthProvider = {
  register: async (params: any) => {
    try {
      const { data, error } = await authClient.signUp.email(
        params as SignUpPayload,
      );
      if (error) {
        return {
          success: false,
          error: {
            name: "Registration failed",
            message: error?.message || "Unable to create account.",
          },
        };
      }
      // Note: Better Auth handles session state, but we sync to localStorage for Refine's getIdentity
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      return { success: true, redirectTo: "/login" };
    } catch (err: any) {
      return {
        success: false,
        error: {
          name: "Registration Error",
          message: err.message || "Network error. Please check your connection.",
        },
      };
    }
  },

  login: async (params: any) => {
    try {
      const { data, error } = await authClient.signIn.email({
        email: params.email,
        password: params.password,
      });
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
    } catch (err: any) {
      return {
        success: false,
        error: {
          name: "Login Error",
          message: err.message || "Network error. Please check your connection.",
        },
      };
    }
  },

  logout: async () => {
    try {
      await authClient.signOut();
      localStorage.removeItem("user");
      return { success: true, redirectTo: "/login" };
    } catch (error) {
      localStorage.removeItem("user");
      return { success: true, redirectTo: "/login" };
    }
  },

  check: async () => {
    try {
      // Verify session with Better Auth client (checks cookies/tokens)
      const { data: session } = await authClient.getSession();
      
      if (session?.user) {
        // Sync localStorage with the latest user data from the server (handles role changes)
        localStorage.setItem("user", JSON.stringify(session.user));
        return { authenticated: true };
      }
      
      localStorage.removeItem("user");
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    } catch (error) {
      localStorage.removeItem("user");
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }
  },

  onError: async (error: any) => {
    if (error?.response?.status === 401 || error?.status === 401) {
      localStorage.removeItem("user");
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
