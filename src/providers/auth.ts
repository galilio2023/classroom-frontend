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
let lastFailedFetchTime = 0;
let pendingPromise: Promise<any> | null = null;

const CACHE_TTL = 30000; // 30 seconds for success
const FAILED_TTL = 5000; // 5 seconds for failures

// 🛡️ MOBILE STABILITY: Helper to ensure authClient has the token
const syncToken = (token?: string | null) => {
  const finalToken = token || localStorage.getItem("tablawy_auth_token");
  if (finalToken) {
    localStorage.setItem("tablawy_auth_token", finalToken);
  }
};

export const getFreshSession = async () => {
  const now = Date.now();

  // 1. Return success cache
  if (cachedSessionData && now - lastFetchTime < CACHE_TTL) {
    return { data: cachedSessionData, error: null };
  }

  // 2. Throttle repeat attempts after a failure
  if (!cachedSessionData && now - lastFailedFetchTime < FAILED_TTL) {
    return { data: null, error: { message: "Throttled" } };
  }

  // 3. Deduplicate concurrent requests
  if (pendingPromise) {
    return pendingPromise;
  }

  pendingPromise = (async () => {
    try {
      const result = await authClient.getSession();
      if (result.data) {
        cachedSessionData = result.data;
        lastFetchTime = Date.now();
        lastFailedFetchTime = 0;

        const sessionToken = (result.data as any).session?.token;
        if (sessionToken) {
          syncToken(sessionToken);
        }
      } else {
        cachedSessionData = null;
        lastFailedFetchTime = Date.now();
      }
      return result;
    } catch (err) {
      lastFailedFetchTime = Date.now();
      return { data: null, error: err };
    } finally {
      pendingPromise = null;
    }
  })();

  return pendingPromise;
};

export const authProvider: AuthProvider = {
  register: async (params: Record<string, unknown>) => {
    try {
      const sanitizedParams = sanitizePayload(params);

      // 🚀 SESSION STITCHING: Include telemetry ID if available
      const telemetryId = localStorage.getItem("tablawy_telemetry_id");
      if (telemetryId) {
        (sanitizedParams as any).telemetrySessionId = telemetryId;
      }

      console.log("Attempting registration for:", sanitizedParams.email);

      const { correlationId, ...payload } = sanitizedParams as any;

      const { error } = await authClient.signUp.email(payload as SignUpPayload, {
        headers: {
          "x-correlation-id": correlationId || `client-auth-${crypto.randomUUID()}`,
        },
      });

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

      // 🚀 AUTO-LOGIN: remove friction by logging the user in immediately
      const { data: loginData, error: loginError } = await authClient.signIn.email({
        email: sanitizedParams.email as string,
        password: sanitizedParams.password as string,
      });

      if (!loginError && loginData?.user) {
        cachedSessionData = loginData;
        lastFetchTime = Date.now();
        const sessionToken = (loginData as any).token;
        if (sessionToken) syncToken(sessionToken);

        return { success: true, redirectTo: "/dashboard" };
      }

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

        // 🛡️ MOBILE STABILITY: Explicitly store token
        // In signIn result, token is at the top level
        const sessionToken = (data as any).token;
        if (sessionToken) {
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
      localStorage.removeItem("tablawy_telemetry_id"); // 🛡️ SECURITY: Clear telemetry on logout
      return { success: true, redirectTo: "/login" };
    } catch {
      cachedSessionData = null;
      lastFetchTime = 0;
      localStorage.removeItem("user");
      localStorage.removeItem("tablawy_auth_token");
      localStorage.removeItem("tablawy-live-session");
      localStorage.removeItem("tablawy_telemetry_id");
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
