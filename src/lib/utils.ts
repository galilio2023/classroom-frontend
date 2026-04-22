import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 🛠️ Standard conversion utilities for file sizes.
 */
export const mbToBytes = (mb: number) => mb * 1024 * 1024;
export const bytesToMb = (bytes: number) => bytes / (1024 * 1024);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 🛡️ SANITIZATION: Strips HTML tags and common markdown syntax to ensure
 * clean, spoken language for speech synthesis engines.
 */
export function stripMarkdown(text: string): string {
  if (!text) return "";
  return text
    .replace(/<[^>]*>?/gm, "") // Remove HTML tags
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // Bold
    .replace(/(\*|_)(.*?)\1/g, "$2") // Italic
    .replace(/`{1,3}.*?`{1,3}/g, "") // Code blocks
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Links
    .replace(/[#*>-]/g, "") // List markers and headers
    .trim();
}

/**
 * 🛠️ TRACEABILITY UTILITY: Generates a unique correlation ID.
 * Mandate #8: Ensures every critical request is traceable across the stack.
 */
export function createCorrelationId(prefix: string): string {
  return `${prefix}-${getUUID()}`;
}

/**
 * 🛡️ PII NORMALIZATION (Mirroring SQL Trigger):
 * Ensures Egyptian numerals and non-numeric characters are sanitized
 * before being sent to the API, preventing indexing/audit mismatches.
 */
export function normalizeEgyNumerals(value: string, isPhone = false): string {
  if (!value) return "";

  // 1. Translate Eastern Arabic to Western
  const normalized = value.replace(/[٠١٢٣٤٥٦٧٨٩]/g, (d) => (d.charCodeAt(0) - 1632).toString());

  // 2. Strip non-numeric (Preserve '+' for phone if requested)
  if (isPhone) {
    return normalized.replace(/[^0-9+]/g, "");
  }
  return normalized.replace(/[^0-9]/g, "");
}

/**
 * Uses crypto.randomUUID if available, with a safe fallback for older browsers.
 */
export function getUUID(): string {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
