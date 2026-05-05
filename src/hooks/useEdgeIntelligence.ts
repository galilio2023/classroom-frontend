import { useEffect, useRef } from "react";
import { offlineDB as db, BehavioralSignal } from "@/lib/offline-db";
import { toast } from "sonner";
import { useCustom, useGetIdentity } from "@refinedev/core";

/**
 * 🧠 useEdgeIntelligence Hook
 * Performs real-time, logic-based pattern detection in the browser.
 * Phase 7.3: The Rural Brain (Zero-latency & Offline support).
 */
export const useEdgeIntelligence = () => {
  const { data: identity } = useGetIdentity<any>();

  // 1. Sync Patterns from Backend
  const { data: patternsData } = useCustom<any[]>({
    url: "/analytics/behavior/patterns",
    method: "get",
    queryOptions: {
      enabled: !!identity?.id,
    },
  });

  // Sync to local Dexie for offline use
  useEffect(() => {
    if (patternsData?.data) {
      const syncPatterns = async () => {
        for (const p of patternsData.data) {
          await db.cached_patterns.put({
            ...p,
            updatedAt: Date.now(),
          });
        }
      };
      syncPatterns();
    }
  }, [patternsData]);

  // 2. Monitor Local Signal Stream
  const lastProcessedId = useRef<number>(0);

  useEffect(() => {
    if (!identity?.id) return;

    const interval = setInterval(async () => {
      // Fetch new signals since last pass
      const newSignals = await db.behavior_signals
        .where("id")
        .above(lastProcessedId.current)
        .toArray();

      if (newSignals.length === 0) return;

      // Update pointer
      lastProcessedId.current = Math.max(...newSignals.map((s) => s.id || 0));

      // Fetch active patterns
      const patterns = await db.cached_patterns.toArray();
      if (patterns.length === 0) return;

      // Run detection logic (Ported from Backend)
      for (const pattern of patterns) {
        const isDetected = await checkPatternLocal(pattern, identity.id);
        if (isDetected) {
          triggerEdgeIntervention(pattern);
        }
      }
    }, 5000); // Pass every 5 seconds for edge efficiency

    return () => clearInterval(interval);
  }, [identity]);

  /**
   * Logic for matching a specific pattern against local Dexie history.
   */
  const checkPatternLocal = async (pattern: any, userId: string): Promise<boolean> => {
    const now = Date.now();
    const windowStart = now - pattern.timeWindowHours * 60 * 60 * 1000;

    // Fetch last 50 signals for this user from Dexie
    const signals = await db.behavior_signals
      .where("userId")
      .equals(userId)
      .and((s) => s.createdAt >= windowStart)
      .reverse()
      .limit(50)
      .toArray();

    const matchingSignals = signals.filter((s) => pattern.requiredSignals.includes(s.signalType));

    return matchingSignals.length >= pattern.occurrenceThreshold;
  };

  /**
   * Triggers a zero-latency, local-only UI nudge.
   */
  const triggerEdgeIntervention = (pattern: any) => {
    // 🛡️ DEBOUNCE: Use sessionStorage to prevent spamming toasts in the same browser session
    const lastTriggered = sessionStorage.getItem(`edge_trigger_${pattern.id}`);
    if (lastTriggered && Date.now() - parseInt(lastTriggered) < 600000) return; // 10 min local cooldown

    console.log(`🧠 [EDGE] Pattern detected locally: ${pattern.id}`);

    // Phase 7.3 Mandate: Zero-latency nudge
    if (pattern.id === "FRUSTRATION_PULSE") {
      toast("Brain Booster: Take a Breath! 🧘", {
        description:
          "You're working hard! If you're feeling stuck, try one of our hints or take a 2-minute stretch.",
        duration: 10000,
      });
    } else if (pattern.id === "CONCEPT_STRUGGLE") {
      toast.info("Need a quick hint? 💡", {
        description: "We noticed you're reviewing this part often. Click here for a summary!",
      });
    }

    sessionStorage.setItem(`edge_trigger_${pattern.id}`, Date.now().toString());
  };
};
