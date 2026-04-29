import { describe, it, expect } from "vitest";
import { normalizeHex, withAlpha } from "../colors";

describe("Color Utilities", () => {
  describe("normalizeHex", () => {
    it("should normalize 6-digit hex", () => {
      expect(normalizeHex("#FFFFFF")).toBe("#ffffff");
      expect(normalizeHex("000000")).toBe("#000000");
    });

    it("should expand 3-digit shorthand", () => {
      expect(normalizeHex("#f00")).toBe("#ff0000");
      expect(normalizeHex("abc")).toBe("#aabbcc");
    });

    it("should return null for invalid hex", () => {
      expect(normalizeHex("invalid")).toBeNull();
      expect(normalizeHex("#1234")).toBeNull();
      expect(normalizeHex(null)).toBeNull();
    });
  });

  describe("withAlpha", () => {
    it("should append alpha to 6-digit hex", () => {
      expect(withAlpha("#ffffff", "22")).toBe("#ffffff22");
    });

    it("should handle missing hash in base color", () => {
      expect(withAlpha("ffffff", "22")).toBe("#ffffff22");
    });

    it("should return original color if not 6-digit hex", () => {
      expect(withAlpha("#f00", "22")).toBe("#f00");
      expect(withAlpha("red", "22")).toBe("red");
    });

    it("should use default alpha if not provided", () => {
      expect(withAlpha("#ffffff")).toBe("#ffffff22");
    });
  });
});
