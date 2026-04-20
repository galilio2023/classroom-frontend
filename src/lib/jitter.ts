/**
 * 🛠️ RESILIENCE UTILITY: Jittered Exponential Backoff
 * Calculates a jittered delay to prevent "thundering herd" issues.
 * Mandate M-008: Rural Hardening & Infrastructure Stability.
 *
 * @param base - The base delay in milliseconds.
 * @param factor - The jitter factor (default 0.1 for 10%).
 * @returns The jittered delay in milliseconds.
 */
export const getJitteredDelay = (base: number, factor = 0.1): number => {
  const jitter = Math.random() * (base * factor);
  return base + jitter;
};
