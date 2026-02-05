// This file centralizes all environment-dependent variables for the application.
// It reads from Vite's `import.meta.env` object and provides validated,
// reusable constants for the rest of the application.

/**
 * A helper function to safely get environment variables.
 * Throws an error if a required variable is missing.
 * @param key The name of the environment variable.
 */
const getEnvVar = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Configuration Error: Missing environment variable: ${key}`);
  }
  return value;
};

// --- API Configuration ---
export const BACKEND_URL = getEnvVar("VITE_API_URL");
export const ACCESS_TOKEN_KEY = getEnvVar("VITE_ACCESS_TOKEN_KEY");
export const REFRESH_TOKEN_KEY = getEnvVar("VITE_REFRESH_TOKEN_KEY");
export const REFRESH_TOKEN_URL = `${BACKEND_URL}/refresh-token`;

// --- Cloudinary Configuration ---
export const CLOUDINARY_UPLOAD_URL = getEnvVar("VITE_CLOUDINARY_UPLOAD_URL");
export const CLOUDINARY_CLOUD_NAME = getEnvVar("VITE_CLOUDINARY_CLOUD_NAME");
export const CLOUDINARY_UPLOAD_PRESET = getEnvVar(
  "VITE_CLOUDINARY_UPLOAD_PRESET",
);
