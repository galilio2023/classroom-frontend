import { GAMIFICATION_CONFIG } from "@/config/gamification";

/**
 * 🛡️ GAMIFICATION HELPER
 * Mandate Gap Fix: Centralized XP dispatch to prevent string-based logic errors.
 */
export const dispatchXpGain = (amount: number, reason: string) => {
  window.dispatchEvent(
    new CustomEvent("xp_gained_local", {
      detail: {
        amount,
        reason,
      },
    })
  );
};

export const dispatchStudyBlockXp = () => {
  dispatchXpGain(GAMIFICATION_CONFIG.XP_STUDY_BLOCK, "Study Task Completed");
};
