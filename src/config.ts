// 🚀 RUNTIME CONFIG: Better Auth REQUIRES absolute URLs.
// We prioritize VITE_API_URL if it's absolute, otherwise fallback to runtime origin.
const rawApiUrl = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000/api";

export const BACKEND_URL = rawApiUrl.startsWith("http")
  ? rawApiUrl.replace(/\/+$/, "")
  : `${window.location.origin}/api`;

// Root domain (e.g., https://...)
export const BASE_URL = BACKEND_URL.replace(/\/api\/?$/, "");

// Better Auth specific root (Points exactly to the /api/auth endpoint)
export const BETTER_AUTH_ROOT = `${BACKEND_URL}/auth`;

// Sockets connect to root domain (Railway backend)
export const SOCKET_URL = BASE_URL;
