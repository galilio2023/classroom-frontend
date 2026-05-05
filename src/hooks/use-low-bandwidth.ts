import { useEffect, useState } from "react";

/**
 * 📡 REACH HOOK: useLowBandwidth
 * Simple reactive hook to detect if the system is in Low Bandwidth mode.
 * Components can use this to conditionally render high-res media or disable auto-play.
 */
export const useLowBandwidth = () => {
  const [isLowBandwidth, setIsLowBandwidth] = useState(
    document.documentElement.getAttribute("data-low-bandwidth") === "true"
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLowBandwidth(document.documentElement.getAttribute("data-low-bandwidth") === "true");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-low-bandwidth"],
    });

    return () => observer.disconnect();
  }, []);

  return isLowBandwidth;
};
