// This file centralizes all environment-dependent variables for the application.
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    if (defaultValue) return defaultValue;
    throw new Error(`Configuration Error: Missing environment variable: ${key}`);
  }
  return value;
};

// Vercel VITE_API_URL = https://classroom-backend-production-6e52.up.railway.app/api
const rawApiUrl = getEnvVar("VITE_API_URL", "http://localhost:8000/api");

// 🚀 RUNTIME CONFIG: Better Auth REQUIRES absolute URLs.
// We prioritize VITE_API_URL if it's absolute, otherwise fallback to runtime origin.
export const BACKEND_URL = rawApiUrl.startsWith("http")
  ? rawApiUrl.replace(/\/+$/, "")
  : `${window.location.origin}/api`;

// Root domain (e.g., https://...)
export const BASE_URL = BACKEND_URL.replace(/\/api\/?$/, "");

// Better Auth specific root (Points exactly to the /api/auth endpoint)
export const BETTER_AUTH_ROOT = `${BACKEND_URL}/auth`;

// Sockets connect to root domain
export const SOCKET_URL = import.meta.env.PROD ? window.location.origin : BASE_URL;
