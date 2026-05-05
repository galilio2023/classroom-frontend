import { useEffect, useRef } from "react";
import { useBehaviorEmitter } from "./useBehaviorEmitter";

/**
 * ⚡ useRageClick Hook
 * Detects rapid, repetitive clicking which indicates student frustration.
 * Part of Phase 7.1 (Emotional Pulse).
 *
 * Mandate: Invisible monitoring, zero UI impact.
 */
export const useRageClick = (threshold: number = 5, windowMs: number = 2000) => {
  const { emit } = useBehaviorEmitter();
  const clickHistory = useRef<number[]>([]);

  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      const now = Date.now();

      // 1. Add current click timestamp
      clickHistory.current.push(now);

      // 2. Filter out clicks older than the window
      clickHistory.current = clickHistory.current.filter((ts) => now - ts <= windowMs);

      // 3. Check if threshold exceeded
      if (clickHistory.current.length >= threshold) {
        // Get target element info for context (without PII)
        const target = event.target as HTMLElement;
        const targetInfo = {
          tagName: target.tagName,
          className: target.className,
          text: target.innerText?.substring(0, 20),
          x: event.clientX,
          y: event.clientY,
        };

        // 🚀 EMIT: High-priority frustration signal
        emit("frustration_detected", {
          subtype: "rage_click",
          clickCount: clickHistory.current.length,
          target: targetInfo,
        });

        // Clear history to prevent multiple emissions for the same "burst"
        clickHistory.current = [];
      }
    };

    // Attach to window for global monitoring
    window.addEventListener("click", handleGlobalClick, true);

    return () => {
      window.removeEventListener("click", handleGlobalClick, true);
    };
  }, [emit, threshold, windowMs]);
};
