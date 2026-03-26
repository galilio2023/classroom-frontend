// This file centralizes all environment-dependent variables for the application.
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    if (defaultValue) return defaultValue;
    throw new Error(
      `Configuration Error: Missing environment variable: ${key}`,
    );
  }
  return value;
};

// Vercel VITE_API_URL = https://classroom-backend-production-6e52.up.railway.app/api
const rawApiUrl = getEnvVar("VITE_API_URL", "http://localhost:8000/api");

// Standard API root (e.g., https://.../api)
export const BACKEND_URL = rawApiUrl.replace(/\/+$/, "");

// Root domain (e.g., https://...)
export const BASE_URL = BACKEND_URL.replace(/\/api\/?$/, "");

// Better Auth specific root (Points exactly to the /api/auth endpoint)
export const BETTER_AUTH_ROOT = `${BACKEND_URL}/auth`;

// Sockets connect to root domain
export const SOCKET_URL = BASE_URL;
