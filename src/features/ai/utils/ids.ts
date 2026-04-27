import { DayName } from "@/constants/calendar";

/**
 * 🛡️ Utility: Standardized Block ID Generator
 * Prevents key-mismatch bugs between UI and Mutation URLs (Review #19)
 * Used by Study Planner and potentially by Analytics for cross-referencing.
 *
 * @param day The name of the day (e.g., "Monday")
 * @param slot The time slot (e.g., "Morning")
 * @returns A slugified string used as a unique identifier for a study block.
 */
export const getBlockId = (day: DayName, slot: string): string =>
  `${day.toLowerCase()}-${slot.toLowerCase()}`;
