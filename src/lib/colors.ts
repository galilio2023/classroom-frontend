/**
 * 🎨 COLOR UTILITIES
 * Mandate Review #15: Safe manipulation of institutional branding colors.
 */

/**
 * Ensures a color string is a valid 6-digit hex.
 * Handles shorthand (#f00 -> #ff0000) and strips whitespace.
 */
export const normalizeHex = (color: string | null | undefined): string | null => {
  if (!color || typeof color !== "string") return null;

  let hex = color.trim();
  if (hex.startsWith("#")) {
    hex = hex.slice(1);
  }

  // Handle 3-digit shorthand (#f00 -> ff0000)
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  // Validate 6-digit hex
  const isValidHex = /^[0-9A-Fa-f]{6}$/i.test(hex);
  return isValidHex ? `#${hex.toLowerCase()}` : null;
};

/**
 * Appends alpha transparency to a hex color.
 * 💡 FUTURE: Consider migrating to HSL/RGB variables for native CSS opacity support.
 * @param hex Normalized hex string (supports shorthand or full hex)
 * @param alpha Hex alpha value (e.g., 22 for ~13%)
 */
export const withAlpha = (hex: string | null | undefined, alpha: string = "22"): string | null => {
  const base = normalizeHex(hex);
  if (!base) return hex || null;

  return `${base}${alpha}`;
};
