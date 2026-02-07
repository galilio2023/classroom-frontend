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
    localStorage.setItem("user", JSON.stringify(data.user));
    return { success: true, redirectTo: "/" };
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

  // This is the final, correct implementation of the `check` method.
  // It uses the authClient's own getSession method, which is designed for this purpose.
  check: async () => {
    const session = await authClient.getSession();
    if (session) {
      return { authenticated: true };
    }
    return {
      authenticated: false,
      logout: true,
      redirectTo: "/login",
    };
  },

  getPermissions: async () => {
    const user = localStorage.getItem("user");
    if (!user) return null;

    try {
      const parsedUser: User = JSON.parse(user);
      return { role: parsedUser.role };
    } catch (error) {
      console.error("Error parsing user from localStorage in getPermissions:", error);
      return null;
    }
  },

  getIdentity: async () => {
    const user = localStorage.getItem("user");
    if (!user) return null;

    try {
      const parsedUser: User = JSON.parse(user);
      return {
        id: parsedUser.id,
        name: parsedUser.name,
        email: parsedUser.email,
        image: parsedUser.image,
        role: parsedUser.role,
        imageCldPubId: parsedUser.imageCldPubId,
      };
    } catch (error) {
      console.error("Error parsing user from localStorage in getIdentity:", error);
      return null;
    }
  },

  onError: async (error) => {
    if ((error as any)?.response?.status === 401) {
      return {
        logout: true,
        redirectTo: "/login",
      };
    }
    return { error };
  },
};
