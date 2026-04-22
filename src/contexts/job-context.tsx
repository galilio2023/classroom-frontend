import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useNotification } from "@refinedev/core";
import { handleError, getCorrelationId } from "@/providers/utils/api-errors";
import { socket } from "@/lib/socket";
import { useTranslation } from "react-i18next";
import { getJitteredDelay, calculateBackoff } from "@/lib/jitter";
import { BACKEND_URL, STORAGE_KEYS } from "@/config";
import { createCorrelationId } from "@/lib/traceability";
import { pruneExpiredJobs } from "@/providers/utils/job-manager";
import { offlineDB, BackgroundJobRecord } from "@/lib/offline-db";

export type BackgroundJob = BackgroundJobRecord;

interface JobContextType {
  jobs: BackgroundJob[];
  addJob: (job: Omit<BackgroundJob, "status" | "createdAt">) => void;
  updateJob: (id: string, updates: Partial<BackgroundJob>) => void;
  removeJob: (id: string) => void;
  clearCompleted: () => void;
  syncJobs: () => Promise<void>;
  isSafeMode: boolean; // 🛡️ Mandate Review #8: Inform UI of high system load
}

const JobContext = createContext<JobContextType | undefined>(undefined);

const POLLING_CONFIG = {
  INITIAL_DELAY: 1000, // 🚀 UX: Faster initial feedback (Mandate Review #8)
  MAX_DELAY: 30000, // 30s (🚀 UX: More aggressive cap for active jobs)
  RETRY_INTERVAL: 15000, // 15s (🚀 RESILIENCE: Standard retry delay)
  IDLE_POLL_INTERVAL: 60000, // 1m when tab is hidden
};

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [syncDelay, setSyncDelay] = useState(POLLING_CONFIG.INITIAL_DELAY);
  const [isVisible, setIsVisible] = useState(true);
  const [isSafeMode, setIsSafeMode] = useState(false);

  const jobsRef = useRef<BackgroundJob[]>([]);
  const syncDelayRef = useRef(syncDelay);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const isSyncingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { open } = useNotification();
  const { t } = useTranslation();

  // 🛡️ MONITORING: Poll AI Health for Safe Mode status (Mandate Review #8)
  useEffect(() => {
    const checkAiHealth = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/ai/health`);
        if (response.ok) {
          const { data } = await response.json();
          setIsSafeMode(!!data.isSafeMode);
        }
      } catch (err) {
        console.warn("Failed to check AI health", err);
      }
    };

    void checkAiHealth();
    const interval = setInterval(checkAiHealth, 120000); // Check every 2 mins
    return () => clearInterval(interval);
  }, []);

  // 🛡️ INITIALIZATION: Restore jobs from Dexie (Mandate #4 - Rural Hardening)
  useEffect(() => {
    const initJobs = async () => {
      try {
        const savedJobs = await offlineDB.background_jobs.toArray();
        const validJobs = pruneExpiredJobs(savedJobs);
        setJobs(validJobs);
        jobsRef.current = validJobs;
      } catch (err) {
        console.error("Failed to initialize jobs from Dexie:", err);
      }
    };
    void initJobs();
  }, []);

  // 🛡️ PERSISTENCE: Sync memory state to Dexie (Mandate #4 - Rural Hardening)
  useEffect(() => {
    const syncToIndexedDB = async () => {
      try {
        // Source of truth in memory -> Persist to DB
        await offlineDB.background_jobs.bulkPut(jobs);

        // Cleanup jobs that were removed from memory but still exist in IndexedDB
        const allIds = jobs.map((j) => j.id);
        await offlineDB.background_jobs
          .toCollection()
          .filter((j) => !allIds.includes(j.id))
          .delete();
      } catch (err) {
        console.error("Failed to sync jobs to Dexie:", err);
      }
    };

    if (jobs.length > 0) {
      void syncToIndexedDB();
    }
  }, [jobs]);

  // Keep jobsRef in sync for interval closures
  useEffect(() => {
    jobsRef.current = jobs;
  }, [jobs]);

  useEffect(() => {
    syncDelayRef.current = syncDelay;
  }, [syncDelay]);

  // 🛡️ MAINTENANCE: Prune old jobs from in-memory state every hour
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setJobs((prev) => pruneExpiredJobs(prev));
    }, 3600000);
    return () => clearInterval(cleanupInterval);
  }, []);

  // Handle Tab Visibility to save mobile battery
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const updateJob = useCallback((id: string, updates: Partial<BackgroundJob>) => {
    setJobs((prev) => {
      const next = prev.map((job) => (job.id === id ? { ...job, ...updates } : job));
      jobsRef.current = next;
      return next;
    });
  }, []);

  const removeJob = useCallback((id: string) => {
    setJobs((prev) => {
      const next = prev.filter((job) => job.id !== id);
      jobsRef.current = next;
      return next;
    });
  }, []);

  const clearCompleted = useCallback(() => {
    setJobs((prev) => prev.filter((job) => job.status === "processing"));
  }, []);

  // 🛡️ SYNC CORE: Fetches current status of processing jobs from backend
  const syncJobs = useCallback(async () => {
    if (isSyncingRef.current) return;

    const processingJobs = jobsRef.current.filter((j) => j.status === "processing");
    if (processingJobs.length === 0) return;

    // 🛡️ SECURITY: Cancel previous request if still pending to prevent race conditions
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const correlationId = createCorrelationId("poll");

    try {
      isSyncingRef.current = true;
      const minCreatedAt = Math.min(...processingJobs.map((j) => j.createdAt));

      // Get token for auth
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      const response = await fetch(
        `${BACKEND_URL}/ai/jobs/sync?since=${new Date(minCreatedAt).toISOString()}`,
        {
          signal: controller.signal,
          headers: {
            "X-Correlation-ID": correlationId,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) {
        throw await handleError(response);
      }

      const { data: updatedJobs } = (await response.json()) as { data: BackgroundJob[] };

      // 🛡️ UX: Batch notifications if multiple jobs completed (Mandate Review #8)
      const newlyFinished = updatedJobs.filter((u) => u.status !== "processing");
      if (newlyFinished.length > 1) {
        open?.({
          type: "info" as any,
          message: t("ai.jobs.multiple_completed" as any, { count: newlyFinished.length }),
          description: t("ai.jobs.check_dashboard" as any),
        });
      }

      setJobs((prev) => {
        const next = prev.map((job) => {
          // 🛡️ MATCHING: Check for direct ID match OR correlationId (outbox ID)
          const update = updatedJobs.find((u) => u.id === job.id || u.correlationId === job.id);
          if (update) {
            // If status changed to completed/failed, notify user (if not already batched)
            if (
              job.status === "processing" &&
              update.status !== "processing" &&
              newlyFinished.length <= 1
            ) {
              const translationKey = `ai.jobs.${job.type}.${update.status}`;
              open?.({
                type: update.status === "completed" ? "success" : "error",
                message: t(translationKey as any),
                description: job.title,
              });
            }
            return { ...job, ...update };
          }
          return job;
        });
        jobsRef.current = next;
        return next;
      });
    } catch (error: unknown) {
      if ((error as Error).name === "AbortError") return;

      console.error("Job Sync Failed:", error);

      // 🛡️ TRACEABILITY: Show Correlation ID in error toast per Mandate #8
      open?.({
        type: "error",
        message: t("ai.jobs.syncError" as any),
        meta: { correlationId },
      } as any);

      // Increment retries on failure to trigger backoff
      setJobs((prev) => {
        const next = prev.map((j) =>
          j.status === "processing" ? { ...j, retryCount: (j.retryCount || 0) + 1 } : j
        );
        jobsRef.current = next;
        return next;
      });
    } finally {
      // 🛡️ RACE GUARD: Only reset if this was the current active controller
      if (abortControllerRef.current === controller) {
        isSyncingRef.current = false;
      }
    }
  }, [open, t]);

  // 🛡️ SCHEDULER: Manages the polling loop with backoff and battery safety
  const scheduleNext = useCallback(
    async (delayOverride?: number) => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (isSyncingRef.current) return; // 🛡️ RACE GUARD: Wait for current sync to finish

      let nextDelay = delayOverride ?? POLLING_CONFIG.INITIAL_DELAY;
      let shouldSchedule = false;

      if (isVisible) {
        const activeAiJobs = jobsRef.current.filter((j) => j.status === "processing");
        if (activeAiJobs.length > 0) {
          if (delayOverride === undefined) {
            await syncJobs();
          }

          // 🛡️ RESILIENCE: Full Jitter Exponential backoff
          const maxRetries = activeAiJobs.reduce(
            (max, job) => Math.max(max, job.retryCount || 0),
            0
          );

          nextDelay = Math.max(
            nextDelay,
            calculateBackoff(maxRetries, POLLING_CONFIG.INITIAL_DELAY, POLLING_CONFIG.MAX_DELAY)
          );
          setSyncDelay(nextDelay);
          shouldSchedule = true;
        } else {
          // Stop the loop if no more processing jobs
          setSyncDelay(POLLING_CONFIG.INITIAL_DELAY);
          shouldSchedule = false;
          return;
        }
      } else {
        // Tab backgrounded: Switch to idle poll
        nextDelay = POLLING_CONFIG.IDLE_POLL_INTERVAL;
        shouldSchedule = true;
      }

      if (shouldSchedule) {
        timeoutIdRef.current = setTimeout(() => {
          // 🛡️ SAFETY: Wrap the async execution to prevent unhandled rejections (Mandate Review #8)
          scheduleNext().catch((err) => {
            console.error("Critical error in job sync loop:", err);
            // 🚀 RESILIENCE: Attempt to recover by scheduling a retry after the maximum delay
            timeoutIdRef.current = setTimeout(() => void scheduleNext(), POLLING_CONFIG.MAX_DELAY);
          });
        }, nextDelay);
      }
    },
    [isVisible, syncJobs]
  );

  const addJob = useCallback(
    (job: Omit<BackgroundJob, "status" | "createdAt">) => {
      const newJob: BackgroundJob = {
        ...job,
        status: "processing",
        createdAt: Date.now(),
        retryCount: 0,
      };
      setJobs((prev) => {
        const next = [newJob, ...prev];
        jobsRef.current = next;
        return next;
      });

      // 🚀 UX: Wake up the polling loop immediately if it was idle
      void scheduleNext(0);

      // 🛡️ UX: Inform user about background processing and potential load delays (Mandate Review #8)
      open?.({
        type: "info" as any,
        message: t("ai.jobs.queued_title" as any, { defaultValue: "Processing in background" }),
        description: isSafeMode
          ? t("ai.jobs.queued_safe_mode_desc" as any, {
              defaultValue: "System load is high. This may take longer than usual.",
            })
          : t("ai.jobs.queued_desc" as any, { defaultValue: "We'll notify you when it's ready." }),
      } as any);
    },
    [isSafeMode, open, t, scheduleNext]
  );

  useEffect(() => {
    scheduleNext();
    return () => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    };
  }, [scheduleNext]);

  // Socket Listeners for Real-time completion
  useEffect(() => {
    const handleJobCompleted = (data: {
      jobId: string;
      status: string;
      result?: any;
      correlationId?: string;
    }) => {
      // 🛡️ MATCHING: Find job by ID OR correlationId
      const targetJob = jobsRef.current.find(
        (j) => j.id === data.jobId || (data.correlationId && j.id === data.correlationId)
      );

      if (targetJob) {
        updateJob(targetJob.id, {
          status: data.status as any,
          metadata: { ...data.result },
        });

        open?.({
          type: data.status === "completed" ? "success" : "error",
          message: t(`ai.jobs.${targetJob.type}.${data.status}` as any),
          description: targetJob.title,
        });
      }
    };

    socket.on("ai:job_completed", handleJobCompleted);
    return () => {
      socket.off("ai:job_completed", handleJobCompleted);
    };
  }, [open, t, updateJob]);

  // 🛡️ PERFORMANCE: Memoize context value to prevent unnecessary re-renders (Mandate Review #8)
  const contextValue = React.useMemo(
    () => ({
      jobs,
      addJob,
      updateJob,
      removeJob,
      clearCompleted,
      syncJobs,
      isSafeMode,
    }),
    [jobs, addJob, updateJob, removeJob, clearCompleted, syncJobs, isSafeMode]
  );

  return <JobContext.Provider value={contextValue}>{children}</JobContext.Provider>;
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error("useJobs must be used within a JobProvider");
  }
  return context;
};
