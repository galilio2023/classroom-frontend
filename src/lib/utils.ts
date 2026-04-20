import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
 * Uses crypto.randomUUID if available, with a safe fallback for older browsers.
 */
export function getUUID(): string {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
