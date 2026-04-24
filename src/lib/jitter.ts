/**
 * 🛠️ RESILIENCE UTILITY: Full Jitter Exponential Backoff
 * Calculates a jittered delay to prevent "thundering herd" issues.
 * Mandate M-008: Rural Hardening & Infrastructure Stability.
 *
 * 🚀 FULL JITTER (Mandate Review #8):
 * Instead of adding a small jitter to a base delay, we pick a random value
 * between 0 and the full exponential delay. This provides better entropy
 * and spreading of requests across clients after a network flap.
 */

/**
 * 🛡️ RESILIENCE: Calculates a 'Full Jitter' exponential backoff delay.
 * Mandate Review #8: Prevents 'thundering herds' by spreading retries across the window.
 *
 * sleep = random_between(0, min(maxDelay, baseDelay * 2^attempt))
 *
 * @param attempt - The current retry attempt number.
 * @param baseDelay - The starting delay in milliseconds (default: 5000).
 * @param maxDelay - The maximum allowed delay (default: 30000).
 */
export function calculateBackoff(attempt: number, baseDelay = 5000, maxDelay = 30000): number {
  const cappedAttempt = Math.min(attempt, 6); // 🛡️ CAP: Optimized for unstable networks (Mandate Review #8)
  const backoff = Math.min(maxDelay, baseDelay * Math.pow(2, cappedAttempt));
  return Math.floor(Math.random() * backoff);
}

/**
 * Calculates a random jittered delay between 0 and the provided base.
 * Convenience wrapper for simple jitter.
 *
 * sleep = random(0, base)
 *
 * @param base - The current exponential limit in milliseconds.
 * @returns The jittered delay in milliseconds.
 */
export const getJitteredDelay = (base: number): number => {
  return Math.floor(Math.random() * base);
};
