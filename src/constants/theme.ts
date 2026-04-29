import { SuiteType } from "@/types";

/**
 * 🎨 SUITE BRANDING DEFAULTS
 * Mandate Review #14: Centralized source of truth for suite-specific UI.
 * These align with CSS variables for dynamic theme switching.
 */
export const SUITE_COLORS: Record<SuiteType, string> = {
  private: "#6366f1", // Indigo-500
  school: "#3b82f6", // Blue-500
  faculty: "#8b5cf6", // Purple-500
  corporate: "#10b981", // Emerald-500
};
