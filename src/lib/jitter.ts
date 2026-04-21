/**
 * 🛠️ RESILIENCE UTILITY: Full Jitter Exponential Backoff
 * Calculates a jittered delay to prevent "thundering herd" issues.
 * Mandate M-008: Rural Hardening & Infrastructure Stability.
 *
 * 🚀 FULL JITTER (Mandate Review #8):
 * Instead of adding a small jitter to a base delay, we pick a random value
 * between 0 and the full exponential delay. This provides better entropy
 * and spreading of requests across clients after a network flap.
 *
 * sleep = random(0, base)
 *
 * @param base - The current exponential limit in milliseconds.
 * @returns The jittered delay in milliseconds.
 */
export const getJitteredDelay = (base: number): number => {
  return Math.floor(Math.random() * base);
};
