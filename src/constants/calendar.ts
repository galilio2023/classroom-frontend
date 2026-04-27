/**
 * 📅 Calendar Constants
 * Single source of truth for calendar-related data structures to ensure i18n consistency.
 */

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type DayName = (typeof DAYS)[number];
