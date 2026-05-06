import { useState, useEffect, useRef } from "react";
import { offlineDB as db } from "@/lib/offline-db";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useCustomMutation, useLog } from "@refinedev/core";
import { BACKEND_URL } from "@/config";

/**
 * 📶 useOfflineSync Hook
 * Handles the "Rural Hardening" logic: downloading lessons and syncing offline quiz attempts.
 *
 * Mandate: Centralized in engagement feature for global platform resilience.
 */
export const useOfflineSync = () => {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { mutate: submitQuiz } = useCustomMutation();
  const { log } = useLog();

  const logEvent = (params: any) => {
    if (typeof log === "function") {
      (log as any)(params);
    } else if (log && typeof (log as any).mutate === "function") {
      (log as any).mutate(params);
    }
  };

  /**
   * 💓 HEARTBEAT: Checks for true internet connectivity beyond just the OS signal.
   * Review #4: Crucial for detecting "captive portals" or high-latency rural drops.
   */
  const checkConnectivity = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(`${BACKEND_URL}/health`, {
        method: "HEAD",
        mode: "no-cors", // Lightweight check
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return true; // If fetch completes (even no-cors opaque), server is reachable
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "SYNC_OFFLINE_DATA") {
        syncPendingData();
      }
    };

    const handleOnline = async () => {
      const realOnline = await checkConnectivity();
      if (realOnline) {
        setIsOnline(true);
        syncPendingData();
      }
    };
    const handleOffline = () => setIsOnline(false);

    // 🛡️ Periodic Heartbeat (every 30s)
    const interval = setInterval(async () => {
      const onlineStatus = await checkConnectivity();
      setIsOnline(onlineStatus);
    }, 30000);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    navigator.serviceWorker?.addEventListener("message", handleMessage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
    };
  }, []);

  /**
   * Caches a lesson and its attachments for offline study.
   */
  const downloadLesson = async (lesson: any) => {
    try {
      // 1. Save lesson metadata
      await db.lessons.put({
        id: String(lesson.id),
        classId: String(lesson.classId),
        title: lesson.title,
        content: lesson.content || "",
        attachments: lesson.attachments || [],
        cachedAt: Date.now(),
      });

      // 2. Fetch and save attachment blobs (High-Fidelity)
      if (lesson.attachments && Array.isArray(lesson.attachments)) {
        for (const attachment of lesson.attachments) {
          if (attachment.url && (attachment.type === "file" || attachment.type === "image")) {
            try {
              const response = await fetch(attachment.url);
              const blob = await response.blob();
              await db.attachment_blobs.put({
                resourceId: String(attachment.id),
                blob,
                fileName: attachment.title || "attachment",
                contentType: blob.type,
              });
            } catch (err) {
              console.warn(`Failed to cache attachment ${attachment.id}:`, err);
            }
          }
        }
      }

      toast.success(t("offline.downloadSuccess", { title: lesson.title }));
    } catch (error) {
      console.error("Failed to download lesson:", error);
      toast.error(t("offline.downloadError"));
    }
  };

  /**
   * Stores a quiz attempt in IndexedDB when offline.
   * 🛡️ REMEDIATION: Now uses central outbox for consistent reconciliation.
   */
  const saveQuizOffline = async (quizId: string, userId: string, answers: any) => {
    try {
      await db.queue({
        resource: "custom",
        action: "custom",
        variables: {
          url: `/quizzes/${quizId}/submit`,
          method: "post",
          payload: { answers, userId },
        },
      });
      toast.info(t("offline.quizSavedOffline"));
    } catch (error) {
      console.error("Failed to save quiz offline:", error);
    }
  };

  /**
   * Flushes all pending data to the server when connection is restored.
   * 🛡️ REMEDIATION: Consolidated into central outbox for unified reconciliation.
   */
  const syncPendingData = async () => {
    // 1. Sync Central Outbox (Mutations/CRUD)
    const { flushOutbox } = await import("@/providers/data");
    await flushOutbox();

    // 2. Specialized Syncs (Remaining legacy or high-volume background streams)
    await syncPendingQuizzes();
    await syncBehavioralSignals();
  };

  const syncPendingQuizzes = async () => {
    // 🛡️ DEPRECATED: Quizzes are now routed through central outbox.
    // This maintains backward compatibility for legacy items still in IndexedDB.
    const pendingQuizzes = await db.quizzes.toArray();

    if (pendingQuizzes.length > 0) {
      toast.info(t("offline.syncing", { count: pendingQuizzes.length }));

      // 📡 TELEMETRY: Log network resilience event
      logEvent({
        resource: "telemetry",
        action: "reconcile_offline_data",
        data: {
          itemCount: pendingQuizzes.length,
          type: "quizzes",
          timestamp: Date.now(),
        },
      });

      for (const quiz of pendingQuizzes) {
        // 🛡️ BATTERY SAFETY: Limit retries for failed syncs
        const retryCount = (quiz as any).retryCount || 0;
        if (retryCount >= 5) {
          console.error(`Sync failed for quiz ${quiz.quizId} after 5 attempts. Pruning.`);
          if (quiz.id) await db.quizzes.delete(quiz.id);
          continue;
        }

        submitQuiz(
          {
            url: `/quizzes/${quiz.quizId}/submit`,
            method: "post",
            values: { answers: quiz.answers, userId: quiz.userId },
          },
          {
            onSuccess: async () => {
              if (quiz.id) await db.quizzes.delete(quiz.id);
            },
            onError: async () => {
              if (quiz.id) {
                await db.quizzes.put({ ...quiz, retryCount: retryCount + 1 });
              }
            },
          }
        );
      }
    }
  };

  /**
   * 🛰️ BEHAVIOR SYNC: Reconciles offline behavioral signals.
   * 🛡️ REMEDIATION: Now uses central outbox for consistent reconciliation.
   */
  const syncBehavioralSignals = async () => {
    // 🛡️ DEPRECATED: Behavioral signals are now routed through central outbox.
    const pendingSignals = await db.behavior_signals.toArray();
    if (pendingSignals.length === 0) return;

    // 📡 TELEMETRY: Log signal reconciliation
    logEvent({
      resource: "telemetry",
      action: "reconcile_behavior_signals",
      data: { count: pendingSignals.length },
    });

    for (const signal of pendingSignals) {
      await db.queue({
        resource: "custom",
        action: "custom",
        variables: {
          url: "/analytics/behavior/emit",
          method: "post",
          payload: signal,
        },
      });
      if (signal.id) await db.behavior_signals.delete(signal.id);
    }
  };

  /**
   * 🧠 OFFLINE INTELLIGENCE: Computes the next mission using local Dexie data.
   * Mandate: Part of the "Human Layer" (Phase 1.1) to remove friction in low-bandwidth pockets.
   */
  const getNextOfflineMission = async () => {
    try {
      const planRecord = await db.study_plans.get("current");
      if (planRecord && planRecord.plan && Array.isArray(planRecord.plan)) {
        const nextBlock = planRecord.plan.find(
          (b: any) => !planRecord.completedBlocks?.[`${b.day}-${b.timeSlot}`]
        ) as any;
        if (nextBlock) {
          return {
            type: "study_block",
            id: `${nextBlock.day}-${nextBlock.timeSlot}`,
            title: nextBlock.task || t("dashboard.student.nextMission.offlineTitle" as any),
            context: t("dashboard.student.nextMission.offlineContext" as any),
            urgency: "medium",
            link: nextBlock.link || "/ai-study-lab",
            source: "offline_cache",
          };
        }
      }

      // Fallback: Return first cached lesson
      const cachedLessons = await db.lessons.toArray();
      if (cachedLessons.length > 0) {
        return {
          type: "lesson",
          id: cachedLessons[0].id,
          title: cachedLessons[0].title,
          context: t("dashboard.student.nextMission.offlineLessonContext" as any),
          urgency: "low",
          link: `/classes/${cachedLessons[0].classId}/lessons/${cachedLessons[0].id}`,
          source: "offline_cache",
        };
      }

      return null;
    } catch (err) {
      console.error("Failed to compute offline mission:", err);
      return null;
    }
  };

  /**
   * 🛡️ SECURITY Gap Fix: Clear study plan data on logout to prevent cross-session leakage.
   */
  const clearOfflineStudyPlan = async () => {
    try {
      await db.study_plans.clear();
      console.log("Offline study plan cleared for security.");
    } catch (err) {
      console.error("Failed to clear offline study plan:", err);
    }
  };

  return {
    isOnline,
    downloadLesson,
    saveQuizOffline,
    syncPendingData,
    getNextOfflineMission,
    clearOfflineStudyPlan, // 🚀 Exposed for logout logic
  };
};

/**
 * 🔄 useStudyPlanSync Hook
 * Specialized for the Study Planner feature (Mandate Review Hardening V1.7)
 * Implements Rule 4 timestamp-based reconciliation.
 */
export const useStudyPlanSync = <T = any>(initialData: any, isFetching: boolean) => {
  const [plan, setPlan] = useState<T[]>([]);
  const [completedBlocks, setCompletedBlocks] = useState<Record<string, boolean>>({});
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    const loadAndSync = async () => {
      if (isSyncingRef.current || isFetching) return;
      isSyncingRef.current = true;

      try {
        const record = await db.study_plans.get("current");

        // If network data is available and newer, synchronize
        if (initialData?.data) {
          const netUpdate = initialData.data.updatedAt || Date.now();
          const localUpdate = record?.updatedAt || 0;

          if (netUpdate >= localUpdate) {
            setPlan((initialData.data.plan as T[]) || []);
            setCompletedBlocks(initialData.data.completedBlocks || {});
            setLastUpdated(netUpdate);
            // Sync to local
            await db.study_plans.put({
              id: "current",
              plan: initialData.data.plan || [],
              completedBlocks: initialData.data.completedBlocks || {},
              updatedAt: netUpdate,
            });
          } else if (record) {
            // Local is newer (offline changes pending or faster local update)
            setPlan(record.plan as T[]);
            setCompletedBlocks(record.completedBlocks);
            setLastUpdated(record.updatedAt);
          }
        } else if (record) {
          // Fallback to local
          setPlan(record.plan as T[]);
          setCompletedBlocks(record.completedBlocks);
          setLastUpdated(record.updatedAt);
        }
      } finally {
        isSyncingRef.current = false;
      }
    };

    loadAndSync();
  }, [initialData, isFetching]);

  return { plan, completedBlocks, lastUpdated, setPlan, setCompletedBlocks, isSyncingRef };
};
