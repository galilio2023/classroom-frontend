// This file centralizes all environment-dependent variables for the application.
// It reads from Vite's `import.meta.env` object and provides validated,
// reusable constants for the rest of the application.

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    if (defaultValue) return defaultValue;
    throw new Error(`Configuration Error: Missing environment variable: ${key}`);
  }
  return value;
};

// Vercel VITE_API_URL: https://classroom-backend-production-6e52.up.railway.app/api
export const BACKEND_URL = getEnvVar("VITE_API_URL", "http://localhost:8000/api").replace(/\/+$/, "");

// Base domain without /api
export const BASE_URL = BACKEND_URL.replace(/\/api\/?$/, "");

// Socket connects to root
export const SOCKET_URL = BASE_URL;

// Better Auth Client configuration needs the API root
export const AUTH_API_URL = BACKEND_URL;
