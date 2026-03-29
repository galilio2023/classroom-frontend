import type { AuthProvider, HttpError } from "@refinedev/core";
import { User, SignUpPayload } from "@/types";
import { authClient } from "@/lib/auth-client";

/**
 * Sanitizes the payload by converting empty strings to null.
 * This prevents PostgreSQL "invalid input syntax for type date" errors.
 */
const sanitizePayload = (params: Record<string, unknown>) => {
  const sanitized = { ...params };
  Object.keys(sanitized).forEach((key) => {
    if (sanitized[key] === "") {
      sanitized[key] = null;
    }
  });
  return sanitized;
};

export const authProvider: AuthProvider = {
  register: async (params: Record<string, unknown>) => {
    try {
      const sanitizedParams = sanitizePayload(params);
      console.log("Attempting registration for:", sanitizedParams.email);

      const { error } = await authClient.signUp.email(sanitizedParams as unknown as SignUpPayload);

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
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Unexpected registration error:", error);
      return {
        success: false,
        error: {
          name: "Registration Error",
          message: error.message || "Network error. Please check your connection.",
        },
      };
    }
  },

  login: async (params: Record<string, unknown>) => {
    try {
      const { data, error } = await authClient.signIn.email({
        email: params.email as string,
        password: params.password as string,
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
        const user = data.user as unknown as User;
        const userWithVerified = {
          ...user,
          isVerified:
            user.verificationStatus === "verified" ||
            user.role === "admin" ||
            user.role === "student",
        };
        localStorage.setItem("user", JSON.stringify(userWithVerified));
      }

      // Fixed: Redirect to dashboard instead of landing page
      return { success: true, redirectTo: "/dashboard" };
    } catch (err: unknown) {
      const error = err as Error;
      return {
        success: false,
        error: {
          name: "Login Error",
          message: error.message || "Network error. Please check your connection.",
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
    } catch {
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
        const user = session.user as unknown as User;
        const userWithVerified = {
          ...user,
          isVerified:
            user.verificationStatus === "verified" ||
            user.role === "admin" ||
            user.role === "student",
        };
        localStorage.setItem("user", JSON.stringify(userWithVerified));
        return { authenticated: true };
      }

      localStorage.removeItem("user");
      return {
        authenticated: false,
      };
    } catch {
      localStorage.removeItem("user");
      return {
        authenticated: false,
      };
    }
  },

  onError: async (error: HttpError | null) => {
    if (error?.status === 401) {
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
    const role =
      (session?.user as unknown as User)?.role ||
      JSON.parse(localStorage.getItem("user") || "{}")?.role;
    return { role };
  },

  getIdentity: async () => {
    // 🛡️ SECURITY: Fetch fresh session to prevent local spoofing
    const { data: session } = await authClient.getSession();
    if (session?.user) {
      return session.user as unknown as User;
    }

    const user = localStorage.getItem("user");
    if (!user) return null;
    try {
      return JSON.parse(user) as User;
    } catch {
      return null;
    }
  },
};
