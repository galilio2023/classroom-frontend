import Big from "big.js";

/**
 * 🛡️ PRECISION UTILITY: Tablawy OS Numeric Hardening
 * Ensures all financial and academic displays use big.js for robust decimal handling.
 * Prevents floating point errors (e.g., 0.30000000000000004).
 */

/**
 * Formats a grade percentage with consistent precision.
 */
export function formatGrade(value: number | string | null | undefined, precision = 1): string {
  if (value === null || value === undefined || value === "") return "--";
  try {
    // 🛡️ SANITIZATION: Remove % and other common non-numeric chars before parsing
    const cleanValue = typeof value === "string" ? value.replace(/[%\s,]/g, "") : value;
    if (isNaN(Number(cleanValue))) return String(value); // Return original if not a number (e.g. "Low Grades")
    return `${new Big(cleanValue).toFixed(precision)}%`;
  } catch (e) {
    return String(value);
  }
}

/**
 * Formats a currency amount with consistent precision.
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string = "EGP",
  precision = 2
): string {
  if (amount === null || amount === undefined || amount === "") return "0.00";
  try {
    const formatted = new Big(amount).toFixed(precision);
    return `${formatted} ${currency.toUpperCase()}`;
  } catch (e) {
    return "0.00";
  }
}

/**
 * Robust equality check for decimals.
 */
export function areDecimalsEqual(a: string | number, b: string | number): boolean {
  try {
    return new Big(a).eq(new Big(b));
  } catch (e) {
    return false;
  }
}
