import { useEffect } from "react";

interface HardwareSafetyOptions {
  onHidden?: () => void;
  onVisible?: () => void;
  shouldStopSpeech?: boolean;
}

/**
 * 🛡️ HARDWARE PRIVACY & SAFETY HOOK
 * Automatically stops active speech synthesis and hardware inputs (mic/camera)
 * when the user leaves the tab to ensure privacy and safety.
 *
 * Mandate Rule 6: Components using microphone or camera MUST implement "Tab Visibility Safety".
 */
export const useHardwareSafety = ({
  onHidden,
  onVisible,
  shouldStopSpeech = true,
}: HardwareSafetyOptions = {}) => {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // 1. Stop active speech synthesis
        if (shouldStopSpeech && typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }

        // 2. Trigger optional hardware muting callback
        onHidden?.();
      } else if (document.visibilityState === "visible") {
        // 🚀 Notification for user return (UX Refinement)
        onVisible?.();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [onHidden, onVisible, shouldStopSpeech]);
};
