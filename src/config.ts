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

// --- API Configuration ---
export const BACKEND_URL = getEnvVar("VITE_API_URL", "http://localhost:8000/api");

// --- Socket Configuration ---
export const SOCKET_URL = getEnvVar("VITE_SOCKET_URL", BACKEND_URL.replace("/api", ""));
