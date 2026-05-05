import { useGetIdentity, useCustomMutation } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useCallback } from "react";
import { offlineDB as db } from "@/lib/offline-db";
import { useOfflineSync } from "./useOfflineSync";
import { nanoid } from "nanoid";

/**
 * 🛰️ useBehaviorEmitter Hook
 * Emits behavioral signals to the backend for autonomous pattern detection.
 * Part of Phase 6.1 (The Autonomous Nervous System).
 *
 * Mandate: Zero perceptible UI lag. Fire and forget.
 */
export const useBehaviorEmitter = () => {
  const { data: identity } = useGetIdentity<any>();
  const { classId } = useParams<{ classId?: string }>();
  const { mutate } = useCustomMutation();
  const { isOnline } = useOfflineSync();

  // Persist sessionId across the current browser tab session
  const sessionIdRef = useRef<string>(sessionStorage.getItem("behavior_session_id") || "");

  useEffect(() => {
    if (!sessionIdRef.current) {
      const newSessionId = nanoid();
      sessionIdRef.current = newSessionId;
      sessionStorage.setItem("behavior_session_id", newSessionId);
    }
  }, []);

  /**
   * Emits a signal to the backend or queues it offline.
   */
  const emit = useCallback(
    async (signalType: string, metadata: Record<string, any> = {}) => {
      // 🛡️ SECURITY: Don't emit if identity is not yet loaded
      if (!identity?.id || !identity?.tenantId) return;

      const signalData = {
        userId: identity.id,
        tenantId: identity.tenantId,
        classId: classId || metadata.classId || null,
        signalType,
        metadata: {
          ...metadata,
          userAgent: navigator.userAgent,
          url: window.location.href,
        },
        sessionId: sessionIdRef.current,
        correlationId: `sig-${nanoid(10)}`,
        createdAt: Date.now(),
      };

      if (isOnline) {
        // 🔥 FIRE AND FORGET
        // We use mutate but don't strictly await it to keep UI snappy
        mutate(
          {
            url: "/analytics/behavior/emit",
            method: "post",
            values: signalData,
          },
          {
            onError: async () => {
              // If online emit fails (e.g. transient error), fallback to offline DB
              await db.behavior_signals.add(signalData);
            },
          }
        );
      } else {
        // 📶 RURAL HARDENING: Queue locally for later sync
        await db.behavior_signals.add(signalData);
      }
    },
    [identity, classId, isOnline, mutate]
  );

  return { emit };
};
