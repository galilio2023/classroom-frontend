// This file centralizes all environment-dependent variables for the application.
// It reads from Vite's `import.meta.env` object and provides validated,
// reusable constants for the rest of the application.

/**
 * A helper function to safely get environment variables.
 * Throws an error if a required variable is missing.
 * @param key The name of the environment variable.
 */
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    if (defaultValue) return defaultValue;
    throw new Error(`Configuration Error: Missing environment variable: ${key}`);
  }
  return value;
};

// VITE_API_URL is set to: https://classroom-backend-production-6e52.up.railway.app/api
const rawApiUrl = getEnvVar("VITE_API_URL", "http://localhost:8000/api");

// Standard API endpoint URL (as provided by Vercel)
export const BACKEND_URL = rawApiUrl.replace(/\/+$/, "");

// Base URL for the domain (removes /api)
// Example: https://classroom-backend-production-6e52.up.railway.app
export const BASE_URL = BACKEND_URL.replace(/\/api\/?$/, "");

// --- Socket Configuration ---
// Sockets should connect to the root domain
export const SOCKET_URL = BASE_URL;

// --- Auth Configuration ---
// AUTH_BASE_URL should be the root domain (better-auth adds /api/auth internally)
export const AUTH_BASE_URL = BASE_URL;
