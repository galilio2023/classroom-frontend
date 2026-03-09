import type { AuthProvider } from "@refinedev/core";
import { User, SignUpPayload } from "@/types";
import { authClient } from "@/lib/auth-client";

/**
 * Sanitizes the payload by converting empty strings to null.
 * This prevents PostgreSQL "invalid input syntax for type date" errors.
 */
const sanitizePayload = (params: any) => {
  const sanitized = { ...params };
  Object.keys(sanitized).forEach((key) => {
    if (sanitized[key] === "") {
      sanitized[key] = null;
    }
  });
  return sanitized;
};

export const authProvider: AuthProvider = {
  register: async (params: any) => {
    try {
      const sanitizedParams = sanitizePayload(params);
      console.log("Attempting registration for:", sanitizedParams.email);
      
      const { data, error } = await authClient.signUp.email(
        sanitizedParams as SignUpPayload,
      );
      
      if (error) {
        console.error("Registration error from Better Auth:", error);
        return {
          success: false,
          error: {
            name: "Registration failed",
            message: error?.message || "Unable to create account.",
          },
        };
      }
      
      console.log("Registration successful for:", sanitizedParams.email);
      return { success: true, redirectTo: "/login" };
    } catch (err: any) {
      console.error("Unexpected registration error:", err);
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
      
      if (data?.user) {
        const user = data.user as any;
        const userWithVerified = {
            ...user,
            isVerified: user.verificationStatus === "verified" || user.role === "admin" || user.role === "student"
        };
        localStorage.setItem("user", JSON.stringify(userWithVerified));
      }
      
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
      const { data: session } = await authClient.getSession();
      
      if (session?.user) {
        const user = session.user as any;
        const userWithVerified = {
            ...user,
            isVerified: user.verificationStatus === "verified" || user.role === "admin" || user.role === "student"
        };
        localStorage.setItem("user", JSON.stringify(userWithVerified));
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
      return null;
    }
  },

  getIdentity: async () => {
    const user = localStorage.getItem("user");
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch (e) {
      return null;
    }
  },
};
