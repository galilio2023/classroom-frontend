import { GAMIFICATION_CONFIG } from "@/config/gamification";
import { offlineDB } from "./offline-db";

/**
 * 🛡️ GAMIFICATION HELPER
 * Mandate Gap Fix: Centralized XP dispatch to prevent string-based logic errors.
 * 🚀 RULE 4 Hardening: Persists to offlineDB to ensure XP is never lost.
 */
export const dispatchXpGain = async (amount: number, reason: string) => {
  // 1. Dispatch local event for immediate UI feedback (Celebration)
  window.dispatchEvent(
    new CustomEvent("xp_gained_local", {
      detail: {
        amount,
        reason,
      },
    })
  );

  // 2. Persist to Offline DB (Rule 4)
  // This ensures that even if the network is down or the tab closes,
  // the XP will be synced eventually.
  try {
    await offlineDB.pending_xp.add({
      amount,
      reason,
      createdAt: Date.now(),
    });
  } catch (err) {
    console.error("Failed to persist offline XP:", err);
  }
};

export const dispatchStudyBlockXp = () => {
  dispatchXpGain(GAMIFICATION_CONFIG.XP_STUDY_BLOCK, "Study Task Completed");
};
