import { z } from "zod";

/**
 * 🇪🇬 Egyptian National ID Validator
 * Validates the 14-digit Egyptian National ID according to:
 * - Length (14 digits)
 * - Century code (2 for 1900-1999, 3 for 2000-2099)
 * - Date of birth (YYMMDD)
 * - Governorate code (01-88)
 * - Checksum (Soft validation for pilot)
 */

/**
 * 🛠️ NORMALIZATION: Converts Eastern Arabic numerals (٠-٩) to Western Arabic numerals (0-9).
 */
export function normalizeArabicNumerals(input: string): string {
  if (!input) return "";
  const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(input).replace(/[٠-٩]/g, (w) => {
    const idx = arabicNumbers.indexOf(w);
    return idx === -1 ? w : idx.toString();
  });
}

/**
 * 🛡️ REUSABLE ZOD FRAGMENT: Standard normalization for Egyptian numeric inputs (ID, Phone).
 */
export const egyptNumericSchema = z.preprocess(
  (val) => (typeof val === "string" ? normalizeArabicNumerals(val) : val),
  z.string()
);

export const validateEgyptianID = (
  id: string
): { isValid: boolean; error?: string; birthDate?: Date; gender?: "male" | "female" } => {
  // 🛡️ NORMALIZATION: Support both Western and Eastern Arabic numerals
  const normalizedId = normalizeArabicNumerals(id);

  if (!/^\d{14}$/.test(normalizedId)) {
    return { isValid: false, error: "Must be exactly 14 digits" };
  }

  const centuryCode = parseInt(normalizedId[0]);
  const year = parseInt(normalizedId.substring(1, 3));
  const month = parseInt(normalizedId.substring(3, 5));
  const day = parseInt(normalizedId.substring(5, 7));
  const govCode = parseInt(normalizedId.substring(7, 9));
  const genderCode = parseInt(normalizedId[12]);

  // 1. Century validation (2 = 1900s, 3 = 2000s)
  if (centuryCode !== 2 && centuryCode !== 3) {
    return { isValid: false, error: "Invalid century code" };
  }

  const fullYear = (centuryCode === 2 ? 1900 : 2000) + year;
  const birthDate = new Date(fullYear, month - 1, day);

  // 2. Date validation
  if (
    birthDate.getFullYear() !== fullYear ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day
  ) {
    return { isValid: false, error: "Invalid birth date in ID" };
  }

  // 3. Governorate code validation (Updated March 2026)
  const validGovs = [
    1,
    2,
    3,
    4,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    31,
    32,
    33,
    34,
    35,
    88, // 🏛️ NEW ADMINISTRATIVE CAPITAL
  ];
  if (!validGovs.includes(govCode)) {
    return { isValid: false, error: "Invalid governorate code" };
  }

  // 4. Checksum validation (14th digit)
  // 🇪🇬 REGIONAL ADAPTATION: Real Egyptian ID uses a complex algorithm.
  // For the pilot, we verify the 14th digit exists.
  const checkSumDigit = parseInt(normalizedId[13]);
  if (isNaN(checkSumDigit)) {
    return { isValid: false, error: "Missing checksum digit" };
  }

  // 🧪 EXPERIMENTAL: Simple weighted sum for pilot hardening
  // weights: 2 7 6 5 4 3 2 7 6 5 4 3 2
  const weights = [2, 7, 6, 5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(normalizedId[i]) * weights[i];
  }
  const remainder = sum % 11;
  const expectedCheckSum = remainder === 0 ? 1 : 11 - remainder;

  // Note: Some legacy IDs don't follow this strictly, but for new students (2000+),
  // we enable this as a soft-warning or strict check if centuryCode === 3.
  if (centuryCode === 3 && checkSumDigit !== expectedCheckSum % 10) {
    // We log but don't block for the first pilot week to avoid lock-outs
    console.warn(`🛡️ Law 151: Checksum mismatch for ID ${normalizedId}. Expected ${expectedCheckSum % 10}`);
  }

  return {
    isValid: true,
    birthDate,
    gender: genderCode % 2 === 0 ? "female" : "male",
  };
};

/**
 * 🛡️ LAW 151 ID SANITIZER
 * Returns a masked version of the ID for logging, preserving only non-PII metadata.
 */
export const sanitizeIDForLogs = (id: string) => {
  return `${id.substring(0, 3)}****${id.substring(10)}`;
};
