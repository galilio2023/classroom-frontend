import { AuthProvider } from "@refinedev/core";
import { dataProvider } from "./data"; // We'll use the same axios instance

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      // Call our custom /api/login endpoint
      await dataProvider.custom!({
        url: `${dataProvider.getApiUrl()}/login`,
        method: "post",
        data: { email, password },
      });
      return { success: true, redirectTo: "/" };
    } catch (error: any) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: error.message || "Invalid credentials",
        },
      };
    }
  },

  logout: async () => {
    try {
      // Call our custom /api/logout endpoint
      await dataProvider.custom!({
        url: `${dataProvider.getApiUrl()}/logout`,
        method: "post",
      });
      return { success: true, redirectTo: "/login" };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  },

  check: async () => {
    try {
      // Call our custom /api/me endpoint to check the session
      await dataProvider.custom!({
        url: `${dataProvider.getApiUrl()}/me`,
        method: "get",
      });
      return { authenticated: true };
    } catch (error) {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }
  },

  getIdentity: async () => {
    try {
      // Call our custom /api/me endpoint to get user info
      const { data } = await dataProvider.custom!({
        url: `${dataProvider.getApiUrl()}/me`,
        method: "get",
      });
      return data;
    } catch (error) {
      return null;
    }
  },

  register: async ({ name, email, password }) => {
    try {
      // Call our custom /api/register endpoint
      await dataProvider.custom!({
        url: `${dataProvider.getApiUrl()}/register`,
        method: "post",
        data: { name, email, password },
      });
      return { success: true, redirectTo: "/login" };
    } catch (error: any) {
      return {
        success: false,
        error: {
          name: "RegisterError",
          message: error.message || "Registration failed",
        },
      };
    }
  },

  onError: async (error) => {
    if (error.statusCode === 401 || error.statusCode === 403) {
      return {
        logout: true,
        redirectTo: "/login",
        error,
      };
    }
    return {};
  },
};
