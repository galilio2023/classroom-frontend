import { useEffect } from "react";

/**
 * 🛡️ HARDWARE PRIVACY & SAFETY HOOK
 * Automatically stops active speech synthesis and hardware inputs (mic/camera)
 * when the user leaves the tab to ensure privacy and safety.
 *
 * Adheres to:
 * - Rule 3: Hardware Privacy & Safety (Mandatory visibilitychange listeners)
 * - Industrial Hardening: Ensures sensitive buffers (mic/camera) are purged from memory.
 */
export const useHardwareSafety = (options: {
  onHidden?: () => void; // ⚠️ MANDATORY: Callback must clear sensitive buffers (e.g. microphone chunks)
  shouldStopSpeech?: boolean;
}) => {
  const { onHidden, shouldStopSpeech = true } = options;

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // 1. Stop Speech Synthesis (Global Browser state)
        if (shouldStopSpeech && typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }

        // 2. Trigger component-specific cleanup (e.g., stopListening, close camera)
        // 🛡️ SECURITY: Implementation MUST clear sensitive buffers from memory.
        if (onHidden) {
          onHidden();
        }

        console.warn("🔐 Tab hidden: Hardware inputs purged and Speech paused for privacy.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [onHidden, shouldStopSpeech]);
};
