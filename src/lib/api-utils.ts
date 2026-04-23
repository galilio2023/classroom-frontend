import { calculateBackoff } from "./jitter";

/**
 * 🛠️ UI UTILITY: calculateETA
 * Mandate Review #13: Standardized ETA calculation for slow connections.
 */
export const calculateETA = (startTime: number, progress: number): string | null => {
  if (progress <= 0 || progress >= 100) return null;
  const elapsed = (Date.now() - startTime) / 1000;
  const totalEstimated = elapsed / (progress / 100);
  const remaining = Math.max(0, totalEstimated - elapsed);

  if (remaining > 60) return `${Math.ceil(remaining / 60)}m left`;
  return `${Math.ceil(remaining)}s left`;
};

/**
 * 🛡️ RESILIENCE: Standard fetch wrapper with exponential backoff and jitter.
 * Mandate Review #8: Prevents 'thundering herds' on unstable rural networks.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
  baseDelay = 1000
): Promise<Response> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Only retry on 5xx errors or network failures
      if (response.ok || response.status < 500) {
        return response;
      }

      lastError = new Error(`Server returned ${response.status}: ${response.statusText}`);
    } catch (err) {
      lastError = err;
    }

    if (attempt < maxRetries) {
      const delay = calculateBackoff(attempt, baseDelay);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * 🚀 RURAL RESILIENCE: XMLHttpRequest wrapper for progress tracking.
 * Standard fetch() does not provide upload progress, which is vital for students
 * on low-bandwidth rural connections.
 *
 * Mandate Review #11: Extracted into reusable helper for cleaner components.
 */
export async function requestWithProgress<T>(options: {
  url: string;
  method?: string;
  body?: Document | XMLHttpRequestBodyInit | null;
  headers?: Record<string, string>;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const { url, method = "POST", body, headers, onProgress, signal } = options;

    xhr.open(method, url);

    // Apply headers
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }

    // 📈 PROGRESS TRACKING
    if (onProgress && xhr.upload) {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      });
    }

    const cleanup = () => {
      xhr.upload.onprogress = null;
      xhr.onload = null;
      xhr.onerror = null;
      xhr.onabort = null;
    };

    xhr.addEventListener("load", () => {
      cleanup();
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (e) {
          reject(new Error("Failed to parse response from server"));
        }
      } else {
        // 🛡️ COMPATIBILITY: Mimic fetch Response interface for handleError
        const duckTypedResponse = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: {
            get: (name: string) => xhr.getResponseHeader(name),
            "x-correlation-id": xhr.getResponseHeader("x-correlation-id"),
          },
          text: async () => xhr.responseText,
          json: async () => {
            try {
              return JSON.parse(xhr.responseText);
            } catch {
              return {};
            }
          },
          data: null,
        };
        reject({ response: duckTypedResponse });
      }
    });

    xhr.addEventListener("error", () => {
      cleanup();
      reject(new Error("Network Error"));
    });

    xhr.addEventListener("abort", () => {
      cleanup();
      reject({ name: "AbortError", message: "AbortError" });
    });

    if (signal) {
      signal.addEventListener("abort", () => {
        xhr.abort();
      });
    }

    xhr.send(body);
  });
}
