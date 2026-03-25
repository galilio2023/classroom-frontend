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
      
      // Fixed: Redirect to dashboard instead of landing page
      return { success: true, redirectTo: "/dashboard" };
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
      localStorage.removeItem("tablawy-live-session");
      return { success: true, redirectTo: "/login" };
    } catch (error) {
      localStorage.removeItem("user");
      localStorage.removeItem("tablawy-live-session");
      return { success: true, redirectTo: "/login" };
    }
  },

  check: async () => {
    try {
      const { data: session, error } = await authClient.getSession();
      
      if (error || !session?.user) {
        if (import.meta.env.DEV) {
          console.warn("Better-Auth session missing or failed:", error);
        }
        
        // TEMPORARY DEV FALLBACK: Only trust local storage in development mode (npm run dev)
        // In production, this block is ignored to prevent UI-level spoofing.
        if (import.meta.env.DEV) {
          const localUser = localStorage.getItem("user");
          if (localUser) {
             return { authenticated: true };
          }
        }
      }
      
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
      };
    } catch (error) {
      console.error("Session check error:", error);
      localStorage.removeItem("user");
      return {
        authenticated: false,
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
    // 🛡️ SECURITY: Prefer session over localStorage if possible
    const { data: session } = await authClient.getSession();
    const role = (session?.user as any)?.role || JSON.parse(localStorage.getItem("user") || "{}")?.role;
    return { role };
  },

  getIdentity: async () => {
    // 🛡️ SECURITY: Fetch fresh session to prevent local spoofing
    const { data: session } = await authClient.getSession();
    if (session?.user) {
        return session.user;
    }
    
    const user = localStorage.getItem("user");
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch (e) {
      return null;
    }
  },
};
