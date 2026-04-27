import dayjs from "dayjs";

/**
 * 🕒 TIME FORMATTING UTILITY
 * 🚀 Resilience: Handles both HH:mm:ss strings and full ISO 8601 strings.
 */
export const formatTime = (timeStr: string | null | undefined): string => {
  if (!timeStr) return "N/A";
  
  // If it's already a full ISO string (contains 'T'), dayjs handles it natively.
  // Otherwise, we assume HH:mm:ss and prepend a dummy date.
  return dayjs(timeStr.includes("T") ? timeStr : `2020-01-01T${timeStr}`).format("HH:mm");
};
