import type { AuthProvider } from "@refinedev/core";
import { User, SignUpPayload } from "@/types";
import { authClient } from "@/lib/auth-client";
import { dataProvider } from "./data"; // We need this for the check method

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
    // On successful registration, better-auth automatically logs the user in
    // and the client library stores the session. We'll store the user for getIdentity.
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

  // This is the robust check method. It verifies the session with the backend.
  check: async () => {
    try {
      // We use the dataProvider here because it's already configured with axios
      // to handle cookies and errors, but we call the better-auth endpoint.
      await dataProvider.custom!({
        url: `${authClient.options.baseURL}/session`,
        method: "get",
      });
      return { authenticated: true };
    } catch (error) {
      return {
        authenticated: false,
        logout: true,
        redirectTo: "/login",
      };
    }
  },

  getPermissions: async () => {
    const user = localStorage.getItem("user");
    if (!user) return null;

    try {
      const parsedUser: User = JSON.parse(user);
      return { role: parsedUser.role };
    } catch (error) {
      // If localStorage is corrupted, return null and log the error
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
    // This handles the case where an API call fails with a 401
    if ((error as any)?.response?.status === 401) {
      return {
        logout: true,
        redirectTo: "/login",
      };
    }
    return { error };
  },
};
