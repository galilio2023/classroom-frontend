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

/**
 * 🛡️ SECURITY: Validates a file against an 'accept' attribute string.
 * Supports extensions (.pdf), MIME types (image/png), and wildcards (video/*).
 * Mandate Review #13: Enhanced with magic number validation for core academic types.
 */
export async function isFileTypeAllowed(file: File, acceptString: string): Promise<boolean> {
  if (!acceptString) return true;

  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.split(".").pop() || "";
  const allowedPatterns = acceptString.split(",").map((p) => p.trim().toLowerCase());

  // 1. Basic Extension/MIME check
  const isPatternMatch = allowedPatterns.some((pattern) => {
    if (pattern.startsWith(".")) {
      return fileExtension === pattern.replace(".", "");
    }
    if (pattern.endsWith("/*")) {
      const mainType = pattern.split("/")[0];
      return file.type.startsWith(`${mainType}/`);
    }
    return file.type === pattern;
  });

  if (!isPatternMatch) return false;

  // 2. 🛡️ DEEP CHECK: Magic Number Validation (Mandate Review #13)
  // Prevents extension-spoofing for common academic formats.
  try {
    const header = await readFileHeader(file, 4);

    // PDF: %PDF (25 50 44 46)
    if (fileExtension === "pdf" || file.type === "application/pdf") {
      return header === "25504446";
    }
    // PNG: 89 50 4E 47
    if (fileExtension === "png" || file.type === "image/png") {
      return header === "89504e47";
    }
    // JPG/JPEG: FF D8 FF
    if (["jpg", "jpeg"].includes(fileExtension) || file.type === "image/jpeg") {
      return header.startsWith("ffd8ff");
    }
  } catch (err) {
    console.error("File header check failed:", err);
    return false; // Fail-closed on read error
  }

  return true;
}

/**
 * Reads the first N bytes of a file and returns them as a hex string.
 */
async function readFileHeader(file: File, bytes: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);
      let header = "";
      for (let i = 0; i < uint8Array.length; i++) {
        header += uint8Array[i].toString(16).padStart(2, "0");
      }
      resolve(header);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file.slice(0, bytes));
  });
}
