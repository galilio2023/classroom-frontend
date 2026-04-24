import { describe, it, expect } from "vitest";
import { calculateBackoff, getJitteredDelay } from "./jitter";

describe("Jitter Utilities (Mandate Review #8)", () => {
  describe("calculateBackoff", () => {
    it("should stay within bounds (0 to maxDelay)", () => {
      const maxDelay = 30000;
      for (let i = 0; i < 100; i++) {
        const delay = calculateBackoff(i, 1000, maxDelay);
        expect(delay).toBeGreaterThanOrEqual(0);
        expect(delay).toBeLessThanOrEqual(maxDelay);
      }
    });

    it("should apply exponential increase to the UPPER bound", () => {
      // With attempt 0, max possible is 5000
      const delays0 = Array.from({ length: 50 }, () => calculateBackoff(0, 5000));
      expect(Math.max(...delays0)).toBeLessThanOrEqual(5000);

      // With attempt 2, max possible is 5000 * 2^2 = 20000
      const delays2 = Array.from({ length: 50 }, () => calculateBackoff(2, 5000));
      expect(Math.max(...delays2)).toBeGreaterThan(5000);
      expect(Math.max(...delays2)).toBeLessThanOrEqual(20000);
    });

    it("should respect the maxDelay cap", () => {
      const maxDelay = 10000;
      const delays = Array.from({ length: 100 }, () => calculateBackoff(10, 1000, maxDelay));
      expect(Math.max(...delays)).toBeLessThanOrEqual(maxDelay);
    });

    it("should provide entropy (randomness)", () => {
      const delay1 = calculateBackoff(5);
      const delay2 = calculateBackoff(5);
      // It's statistically improbable (1/30000) for these to be identical
      expect(delay1).not.toBe(delay2);
    });
  });

  describe("getJitteredDelay", () => {
    it("should return a value between 0 and base", () => {
      const base = 1000;
      for (let i = 0; i < 100; i++) {
        const delay = getJitteredDelay(base);
        expect(delay).toBeGreaterThanOrEqual(0);
        expect(delay).toBeLessThanOrEqual(base);
      }
    });
  });
});
