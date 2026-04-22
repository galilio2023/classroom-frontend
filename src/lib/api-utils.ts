import { calculateBackoff } from "./utils";

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
