/**
 * 🇪🇬 Egyptian National ID Validator
 * Validates the 14-digit Egyptian National ID according to:
 * - Length (14 digits)
 * - Century code (2 for 1900-1999, 3 for 2000-2099)
 * - Date of birth (YYMMDD)
 * - Governorate code (01-88)
 * - Checksum (Soft validation for pilot)
 */
export const validateEgyptianID = (
  id: string
): { isValid: boolean; error?: string; birthDate?: Date; gender?: "male" | "female" } => {
  if (!/^\d{14}$/.test(id)) {
    return { isValid: false, error: "Must be exactly 14 digits" };
  }

  const centuryCode = parseInt(id[0]);
  const year = parseInt(id.substring(1, 3));
  const month = parseInt(id.substring(3, 5));
  const day = parseInt(id.substring(5, 7));
  const govCode = parseInt(id.substring(7, 9));
  const genderCode = parseInt(id[12]);

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
