import { HttpError } from "@refinedev/core";

/**
 * 🛡️ TRACEABILITY: Extracts X-Correlation-ID from various error formats (Axios, Fetch, etc.)
 */
export const getCorrelationId = (err: any): string => {
  return (
    err?.response?.headers?.["x-correlation-id"] ||
    err?.headers?.["x-correlation-id"] ||
    err?.config?.headers?.["x-correlation-id"] ||
    "N/A"
  );
};

/**
 * Helper to handle API errors and return Refine-compatible HttpError
 * 🛡️ RESILIENCE: Now handles both raw Response objects and standard Error/Axios objects.
 */
export const handleError = async (errorOrResponse: any): Promise<HttpError> => {
  // 1. Extract the raw response if possible (handles Axios, Refine, and raw fetch)
  const response = errorOrResponse?.response || (errorOrResponse instanceof Response ? errorOrResponse : null);

  if (!response) {
    return {
      message: errorOrResponse?.message || "An unexpected error occurred.",
      statusCode: errorOrResponse?.status || 500,
    };
  }

  let json: Record<string, unknown> = {};
  const correlationId =
    (typeof response.headers?.get === "function" ? response.headers.get("x-correlation-id") : null) ||
    response.headers?.["x-correlation-id"] ||
    "N/A";

  try {
    // Check if it's a fetch Response (has .text()) or an Axios response (has .data)
    if (typeof response.text === "function") {
      const text = await response.text();
      if (text) json = JSON.parse(text);
    } else if (response.data) {
      json = response.data;
    }
  } catch {
    // Not JSON or empty
  }

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
    const retryAfter = response.headers.get("Retry-After");
    return {
      message: (json.message as string) || "Too many requests. Please slow down.",
      statusCode: 429,
      retryAfter: retryAfter ? parseInt(retryAfter, 10) : undefined,
    } as HttpError;
  }

  if (response.status === 503) {
    return {
      message: "AI service is currently under maintenance or cooling off. Please try again later.",
      statusCode: 503,
    };
  }

  return {
    message:
      (json.error as string) ||
      (json.message as string) ||
      `HTTP error! status: ${response.status} (Trace: ${correlationId})`,
    statusCode: response.status,
  };
};
