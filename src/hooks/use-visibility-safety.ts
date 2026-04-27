import { useEffect } from "react";

/**
 * 🚀 HARDENING HOOK: useVisibilitySafety (Rule #6)
 *
 * Implements the "Tab Visibility Safety" mandate by listening for `visibilitychange` events.
 * If the user leaves the tab, it automatically cancels any active speech synthesis
 * to preserve resources and prevent audio from playing in the background.
 *
 * This hook should be used in any component that utilizes browser speech/media APIs.
 */
export const useVisibilitySafety = () => {
  useEffect(() => {
    const handleSafetyTrigger = (event: Event) => {
      // 🛡️ UNMOUNT/HIDDEN Hardening: Ensure audio stops (Rule #6)
      // If it's a visibilitychange, only fire if hidden. If it's pagehide, always fire.
      const shouldTrigger = event.type === "pagehide" || document.hidden;

      if (shouldTrigger) {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          console.log(`useVisibilitySafety: Halted speech synthesis via ${event.type} (Rule #6).`);
        }
      }
    };

    document.addEventListener("visibilitychange", handleSafetyTrigger);
    window.addEventListener("pagehide", handleSafetyTrigger); // 📱 Mobile compatibility

    return () => {
      document.removeEventListener("visibilitychange", handleSafetyTrigger);
      window.removeEventListener("pagehide", handleSafetyTrigger);

      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
};
