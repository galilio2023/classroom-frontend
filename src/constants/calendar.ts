/**
 * 📅 CALENDAR CONSTANTS
 * Mandate: Single Source of Truth for time/date representations.
 */

export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday", // 🕋 Vacation Day
  "Saturday", // 🏥 Optional Weekend
];

export const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type DayName = (typeof DAYS)[number];

/**
 * 🏖️ LOCALIZATION: Egypt & Gulf (GCC)
 * Friday (5) is the primary day off.
 * Saturday (6) is often a weekend or half-day.
 */
export const WEEKEND_INDICES = [5, 6];
export const VACATION_INDEX = 5;
