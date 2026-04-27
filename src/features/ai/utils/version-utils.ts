/**
 * 🛡️ VERSION COMPARISON: Hardened semver-like comparison for consent versions.
 * Prevents lexicographical bugs (v1.10 < v1.2) and handles non-numeric segments safely.
 * Adheres to Law 151 compliance gating.
 *
 * @param current The version string from the client (e.g., "v1.2026-04")
 * @param latest The version string from the user profile (e.g., "v1.2025.01")
 * @returns true if the latest version is strictly greater than current
 */
export const isNewerVersion = (current: string, latest: string): boolean => {
  if (!current) return true;
  if (!latest) return false;

  const parse = (v: string) =>
    v
      .replace(/^v/, "")
      .split(/[-.]/)
      .map((seg) => {
        const num = parseInt(seg, 10);
        return isNaN(num) ? 0 : num; // 🛡️ BUG FIX: Handle non-numeric segments (Review #25)
      });

  const v1 = parse(current);
  const v2 = parse(latest);
  const len = Math.max(v1.length, v2.length);

  for (let i = 0; i < len; i++) {
    const a = v1[i] || 0;
    const b = v2[i] || 0;
    if (a > b) return false;
    if (b > a) return true;
  }
  return false;
};
