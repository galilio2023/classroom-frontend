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
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Cancel active speech synthesis if the tab becomes hidden
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          console.log("useVisibilitySafety: Halted speech synthesis due to tab change (Rule #6).");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
};
