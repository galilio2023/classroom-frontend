// 🚀 RUNTIME CONFIG: Better Auth REQUIRES absolute URLs.
// We prioritize VITE_API_URL if it's absolute, otherwise fallback to runtime origin.
const rawApiUrl = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000/api";

export const BACKEND_URL = rawApiUrl.startsWith("http")
  ? rawApiUrl.replace(/\/+$/, "")
  : `${window.location.origin}/api`;

// Root domain (e.g., https://...)
export const BASE_URL = BACKEND_URL.replace(/\/api\/?$/, "");

// Better Auth specific root (Points exactly to the /api/identity endpoint)
export const BETTER_AUTH_ROOT = `${BACKEND_URL}/identity`;

// Sockets connect to root domain (Railway backend)
export const SOCKET_URL = BASE_URL;

// 🛡️ STORAGE & UPLOADS (Mandate Review #8)
export const MAX_SYNC_UPLOAD_SIZE_MB = Number(import.meta.env.VITE_MAX_SYNC_UPLOAD_SIZE_MB) || 5;

// 🛡️ SECURITY: Standardized Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "tablawy_auth_token",
  USER: "user",
  LIVE_SESSION: "tablawy-live-session",
  TELEMETRY_ID: "tablawy_telemetry_id",
};
