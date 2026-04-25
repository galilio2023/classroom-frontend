import { HttpError } from "@refinedev/core";
import { createCorrelationId } from "@/lib/traceability";
import { redactSensitiveData } from "@/lib/security";

/**
 * 🛡️ TRACEABILITY: Extracts X-Correlation-ID from various error formats (Axios, Fetch, etc.)
 */
export const getCorrelationId = (err: unknown): string => {
  if (!err) return createCorrelationId("local");
  const e = err as any;

  const traceId =
    e?.response?.headers?.["x-correlation-id"] ||
    e?.headers?.["x-correlation-id"] ||
    e?.config?.headers?.["x-correlation-id"] ||
    (typeof e?.response?.headers?.get === "function"
      ? e.response.headers.get("x-correlation-id")
      : null);

  return traceId || createCorrelationId("local");
};

/**
 * Helper to handle API errors and return Refine-compatible HttpError
 * 🛡️ RESILIENCE: Now handles both raw Response objects and standard Error/Axios objects.
 */
export const handleError = async (
  errorOrResponse: unknown,
  manualCorrelationId?: string // 🚀 RULE 8 Override
): Promise<HttpError> => {
  const e = errorOrResponse as any;
  // 1. Extract the raw response if possible (handles Axios, Refine, and raw fetch)
  const response = e?.response || (e instanceof Response ? e : null);

  if (!response) {
    return {
      message: e?.message || "An unexpected error occurred.",
      statusCode: e?.status || 500,
      meta: {
        correlationId: manualCorrelationId || e?.correlationId || createCorrelationId("local"),
      },
    };
  }

  let json: Record<string, unknown> = {};
  const correlationId =
    manualCorrelationId ||
    (typeof response.headers?.get === "function"
      ? response.headers.get("x-correlation-id")
      : null) ||
    response.headers?.["x-correlation-id"] ||
    (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `client-${Math.random().toString(36).substring(2, 11)}`); // 🚀 RULE 8 Fallback

  try {
    // 🛡️ RESILIENCE: Check for Axios data first to avoid consuming Fetch streams prematurely
    if (response.data && typeof response.data === "object") {
      json = response.data;
    } else if (typeof response.json === "function") {
      // Prioritize async json() method if available (standard Response or our duck-typed XHR)
      json = await response.json();
    } else if (typeof response.text === "function") {
      const text = await response.text();
      if (text) json = JSON.parse(text);
    }
  } catch {
    // Not JSON or empty
  }

  // 🛡️ SECURITY: Redact sensitive data from the parsed error response before using it in the UI
  json = redactSensitiveData(json) as Record<string, unknown>;

  // 🛡️ SECURITY & UX: Provide meaningful messages for common errors
  if (response.status === 401) {
    return {
      message: "Session expired or unauthorized. Please log in.",
      statusCode: 401,
    };
  }

  if (response.status === 404) {
    return {
      message: "The requested resource was not found.",
      statusCode: 404,
    };
  }

  // 🛡️ SECURITY & UX: Catch database 'restrict' violations or Optimistic Locking conflicts
  if (response.status === 400) {
    const isMissingVersion =
      json.message?.toString().toLowerCase().includes("version") ||
      json.error?.toString().toLowerCase().includes("version");

    if (isMissingVersion) {
      return {
        message: "Update failed: Technical metadata (version) is missing. Please refresh the page.",
        statusCode: 400,
      };
    }
  }

  if (response.status === 409) {
    const isConflict =
      json.message?.toString().toLowerCase().includes("conflict") ||
      json.error?.toString().toLowerCase().includes("conflict");

    return {
      message: isConflict
        ? "Update conflict: This item has been modified by another user. Please refresh and try again."
        : "Cannot delete: This item has active sub-records. Please reassign or delete them first.",
      statusCode: 409,
    };
  }

  if (json.details) {
    return {
      message: (json.error as string) || "Validation failed",
      statusCode: response.status,
      errors: json.details as Record<string, string>,
    };
  }

  if (response.status === 429) {
    const retryAfterRaw =
      (typeof response.headers?.get === "function" ? response.headers.get("Retry-After") : null) ||
      response.headers?.["Retry-After"] ||
      response.headers?.["retry-after"];

    const scope =
      (typeof response.headers?.get === "function"
        ? response.headers.get("X-RateLimit-Scope")
        : null) ||
      response.headers?.["X-RateLimit-Scope"] ||
      response.headers?.["x-ratelimit-scope"];

    const retryAfter = retryAfterRaw ? parseInt(retryAfterRaw, 10) : 30;
    // 🛡️ THUNDERING HERD: Add a randomized jitter (0-5s) to prevent concurrent retries
    const jitter = Math.floor(Math.random() * 5);
    const retryWithJitter = retryAfter + jitter;

    let message =
      (json.message as string) ||
      `Rate limit reached. Please wait ~${retryWithJitter} seconds before retrying.`;

    if (!json.message) {
      if (scope === "school") {
        message = `School-wide limit reached. Please contact your administrator or try again in ~${retryWithJitter}s.`;
      } else if (scope === "global") {
        message = `Platform-wide safety limit active. Please wait ~${retryWithJitter}s before retrying.`;
      } else if (scope === "user") {
        message = `You are personally rate-limited. Please take a small break (~${retryWithJitter}s).`;
      }
    }

    return {
      message,
      statusCode: 429,
      meta: { retryAfter: retryWithJitter, correlationId },
    } as HttpError;
  }

  if (response.status === 503) {
    const retryAfterRaw =
      (typeof response.headers?.get === "function" ? response.headers.get("Retry-After") : null) ||
      response.headers?.["Retry-After"] ||
      response.headers?.["retry-after"];
    const retryAfter = retryAfterRaw ? parseInt(retryAfterRaw, 10) : 60; // Default 60s for 503

    return {
      message: "AI service is currently under maintenance or cooling off. Please try again later.",
      statusCode: 503,
      meta: { retryAfter, correlationId },
    };
  }

  return {
    message:
      (json.error as string) ||
      (json.message as string) ||
      `HTTP error! status: ${response.status}`,
    statusCode: response.status,
    meta: {
      ...json,
      correlationId,
      statusCode: response.status,
    },
  };
};
