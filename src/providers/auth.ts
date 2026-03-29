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

let cachedSessionData: any = null;
let lastFetchTime = 0;
const CACHE_TTL = 30000; // 30 seconds

// 🛡️ MOBILE STABILITY: Helper to ensure authClient uses the stored token
const syncToken = (token?: string | null) => {
  const finalToken = token || localStorage.getItem("tablawy_auth_token");
  if (finalToken) {
    authClient.setHeaders({
      Authorization: `Bearer ${finalToken}`,
    });
  }
};

export const getFreshSession = async () => {
  const now = Date.now();
  if (cachedSessionData && now - lastFetchTime < CACHE_TTL) {
    return { data: cachedSessionData, error: null };
  }

  // Ensure token is attached before fetching
  syncToken();

  const result = await authClient.getSession();
  if (result.data) {
    cachedSessionData = result.data;
    lastFetchTime = now;
    
    // Refresh token in storage if present
    const sessionToken = result.data.session?.token;
    if (sessionToken) {
      localStorage.setItem("tablawy_auth_token", sessionToken);
      syncToken(sessionToken);
    }
  } else {
    cachedSessionData = null;
  }
  return result;
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
        cachedSessionData = data;
        lastFetchTime = Date.now();
        
        // 🛡️ MOBILE STABILITY: Explicitly store and sync token
        const sessionToken = data.session?.token;
        if (sessionToken) {
          localStorage.setItem("tablawy_auth_token", sessionToken);
          syncToken(sessionToken);
        }

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
      cachedSessionData = null;
      lastFetchTime = 0;
      localStorage.removeItem("user");
      localStorage.removeItem("tablawy_auth_token");
      localStorage.removeItem("tablawy-live-session");
      return { success: true, redirectTo: "/login" };
    } catch {
      cachedSessionData = null;
      lastFetchTime = 0;
      localStorage.removeItem("user");
      localStorage.removeItem("tablawy_auth_token");
      localStorage.removeItem("tablawy-live-session");
      return { success: true, redirectTo: "/login" };
    }
  },

  check: async () => {
    try {
      const { data: session, error } = await getFreshSession();

      if (error || !session?.user) {
        // ... dev fallback ...
        if (import.meta.env.DEV) {
          const localUser = localStorage.getItem("user");
          if (localUser) return { authenticated: true };
        }
        
        // In production, if session check failed, try to clear potential stale token
        localStorage.removeItem("tablawy_auth_token");
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
      cachedSessionData = null;
      lastFetchTime = 0;
      localStorage.removeItem("user");
      localStorage.removeItem("tablawy_auth_token");
      return {
        logout: true,
        redirectTo: "/login",
      };
    }
    return {};
  },

  getPermissions: async () => {
    // 🛡️ SECURITY: Prefer session over localStorage if possible
    const { data: session } = await getFreshSession();
    const role =
      (session?.user as unknown as User)?.role ||
      JSON.parse(localStorage.getItem("user") || "{}")?.role;
    return { role };
  },

  getIdentity: async () => {
    // 🛡️ SECURITY: Fetch fresh session to prevent local spoofing
    const { data: session } = await getFreshSession();
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
