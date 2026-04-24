import { useState, useEffect } from "react";
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
   * Caches a lesson for offline study.
   */
  const downloadLesson = async (lesson: any) => {
    try {
      await db.lessons.put({
        id: lesson.id,
        classId: lesson.classId,
        title: lesson.title,
        content: lesson.content,
        attachments: lesson.attachments || [],
        cachedAt: Date.now(),
      });
      toast.success(t("offline.downloadSuccess", { title: lesson.title }));
    } catch (error) {
      console.error("Failed to download lesson:", error);
      toast.error(t("offline.downloadError"));
    }
  };

  /**
   * Stores a quiz attempt in IndexedDB when offline.
   */
  const saveQuizOffline = async (quizId: string, userId: string, answers: any) => {
    try {
      await db.quizzes.add({
        quizId,
        userId,
        answers,
        submittedAt: Date.now(),
      });
      toast.info(t("offline.quizSavedOffline"));
    } catch (error) {
      console.error("Failed to save quiz offline:", error);
    }
  };

  /**
   * Flushes all pending data to the server when connection is restored.
   */
  const syncPendingData = async () => {
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

  return { isOnline, downloadLesson, saveQuizOffline, syncPendingData };
};
