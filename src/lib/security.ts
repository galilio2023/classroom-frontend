/**
 * 🛡️ SECURITY UTILITY: getSafeUrl
 * Strictly validates and sanitizes URLs to prevent XSS and malicious redirects.
 * Only allows http:, https:, and relative protocols.
 */
export const getSafeUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;

  try {
    const parsed = new URL(url.startsWith("//") ? `https:${url}` : url);
    if (["http:", "https:"].includes(parsed.protocol)) {
      return parsed.toString();
    }
  } catch (e) {
    // Fallback for relative or malformed URLs
    // Allow root-relative paths but explicitly block double-slash protocol-relative
    // unless they passed the URL constructor check above.
    if (url.startsWith("/") && !url.startsWith("//")) return url;
  }
  return null;
};

/**
 * 🛡️ SECURITY: Standardized denylist for PII and sensitive credentials.
 * Mandate Review #11: Centralized for consistent redaction across logs and UI.
 */
export const SENSITIVE_DATA_KEYS = [
  "token",
  "password",
  "secret",
  "key",
  "ssn",
  "creditCard",
  "auth",
  "cvv",
  "cvc",
  "api_key",
  "private_key",
  "secret_key",
  "apiKey",
  "privateKey",
  "secretKey",
  "session",
  "totp",
  "mfa_token",
];

/**
 * 🛡️ SECURITY: Recursive redaction utility for nested objects.
 * Mandate Review #8: Ensures sensitive keys are removed even in deeply nested structures.
 */
export const redactSensitiveData = (data: any): any => {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item));
  }

  const redacted: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_DATA_KEYS.some((k) => key.toLowerCase().includes(k.toLowerCase()))) {
      redacted[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      redacted[key] = redactSensitiveData(value);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
};
