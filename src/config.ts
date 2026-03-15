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

// Base URL for the backend server (without the /api prefix)
// Example: https://backend.railway.app
export const BASE_URL = getEnvVar("VITE_API_URL", "http://localhost:8000").replace(/\/api\/?$/, "");

// Standard API endpoint URL (with /api prefix)
// Example: https://backend.railway.app/api
export const BACKEND_URL = `${BASE_URL}/api`;

// --- Socket Configuration ---
// Sockets should connect to the root domain
export const SOCKET_URL = BASE_URL;

// --- Auth Configuration ---
// Better Auth handles its own /auth prefix, so it needs the API root
// Example: https://backend.railway.app/api
export const AUTH_BASE_URL = BACKEND_URL;
