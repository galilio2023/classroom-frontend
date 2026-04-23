import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useNotification } from "@refinedev/core";
import { handleError, getCorrelationId } from "@/providers/utils/api-errors";
import { socket } from "@/lib/socket";
import { useTranslation } from "react-i18next";
import { getJitteredDelay, calculateBackoff } from "@/lib/jitter";
import { BACKEND_URL } from "@/config";
import { createCorrelationId } from "@/lib/traceability";
import { pruneExpiredJobs } from "@/providers/utils/job-manager";
import { offlineDB, BackgroundJobRecord } from "@/lib/offline-db";
import { getAuthToken } from "@/lib/auth-helper";
import { BrainCircuit } from "lucide-react";

export type BackgroundJob = BackgroundJobRecord;

interface JobContextType {
  jobs: BackgroundJob[];
  addJob: (job: Omit<BackgroundJob, "status" | "createdAt">) => void;
  updateJob: (id: string, updates: Partial<BackgroundJob>) => void;
  removeJob: (id: string) => void;
  clearCompleted: () => void;
  syncJobs: () => Promise<any>;
  isSafeMode: boolean; // 🛡️ Mandate Review #8: Inform UI of high system load
}

const JobContext = createContext<JobContextType | undefined>(undefined);

const POLLING_CONFIG = {
  BASE_INTERVAL: 120000, // 2 Minutes (Mandate Review #9 - Adaptive)
  MAX_INTERVAL: 900000, // 15 Minutes (Mandate Review #9 - Adaptive)
  HEALTH_CHECK_INTERVAL: 300000, // 5 Minutes
  MAINTENANCE_CLEANUP_INTERVAL: 3600000, // 1 Hour
};

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [isVisible, setIsVisible] = useState(document.visibilityState === "visible");
  const [isSafeMode, setIsSafeMode] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const jobsRef = useRef<BackgroundJob[]>([]);
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
    const interval = setInterval(checkAiHealth, POLLING_CONFIG.HEALTH_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // 🛡️ INITIALIZATION: Restore jobs from Dexie (Mandate #4 - Rural Hardening)
  useEffect(() => {
    const initJobs = async () => {
      try {
        const savedJobs = await offlineDB.background_jobs.toArray();
        // 🛡️ Mandate Review #9: Prune expired jobs immediately on load to prevent UI flicker
        const validJobs = pruneExpiredJobs(savedJobs);
        setJobs(validJobs);
        jobsRef.current = validJobs;
        setIsReady(true);
      } catch (err) {
        console.error("Failed to initialize jobs from Dexie:", err);
        setIsReady(true); // Fail open to allow new jobs
      }
    };
    void initJobs();
  }, []);

  // 🛡️ MONITORING: Alert user when system load is high (Mandate Review #8)
  useEffect(() => {
    if (isSafeMode) {
      open?.({
        type: "warning" as any,
        message: t("ai.governance.safe_mode_active", "System Load is High"),
        description: t(
          "ai.governance.safe_mode_desc",
          "AI features are currently prioritized. Tasks may take longer than usual."
        ),
        meta: {
          icon: <BrainCircuit className="h-4 w-4 text-warning" />,
        },
      } as any);
    }
  }, [isSafeMode, open, t]);

  // 🛡️ PERSISTENCE: Sync memory state to Dexie (Mandate #4 - Rural Hardening)
  useEffect(() => {
    const syncToIndexedDB = async () => {
      try {
        // 🛡️ RACE GUARD: Wrap in transaction to ensure atomic sync (Mandate Review #9)
        await offlineDB.transaction("rw", [offlineDB.background_jobs], async () => {
          // 1. Source of truth in memory -> Persist to DB
          await offlineDB.background_jobs.bulkPut(jobs);

          // 2. Cleanup jobs that were removed from memory but still exist in IndexedDB
          const allIds = jobs.map((j) => j.id);
          await offlineDB.background_jobs
            .toCollection()
            .filter((j) => !allIds.includes(j.id))
            .delete();
        });
      } catch (err) {
        console.error("Failed to sync jobs to Dexie:", err);
      }
    };

    if (Array.isArray(jobs)) {
      void syncToIndexedDB();
    }
  }, [jobs]);

  // Keep jobsRef in sync for interval closures
  useEffect(() => {
    jobsRef.current = jobs;
  }, [jobs]);

  // 🛡️ MAINTENANCE: Prune old jobs from in-memory state every hour
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setJobs((prev) => pruneExpiredJobs(prev));
    }, POLLING_CONFIG.MAINTENANCE_CLEANUP_INTERVAL);
    return () => clearInterval(cleanupInterval);
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
    setJobs((prev) => {
      const next = prev.filter((job) => job.status === "processing");
      jobsRef.current = next;
      return next;
    });
  }, []);

  // 🛡️ SYNC CORE: Fetches current status of processing jobs from backend
  const syncJobs = useCallback(async (): Promise<number | undefined> => {
    if (isSyncingRef.current || !isVisible) return;

    const processingJobs = jobsRef.current.filter((j) => j.status === "processing");
    if (processingJobs.length === 0) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const correlationId = createCorrelationId("poll");

    try {
      isSyncingRef.current = true;
      const minCreatedAt = Math.min(...processingJobs.map((j) => j.createdAt));
      const token = getAuthToken();

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

      setConsecutiveFailures(0);

      const newlyFinished = updatedJobs.filter((u) => u.status !== "processing");
      if (newlyFinished.length > 1) {
        open?.({
          type: "info",
          message: t("ai.jobs.multiple_completed" as any, { count: newlyFinished.length }),
          description: t("ai.jobs.check_dashboard" as any),
        } as any);
      }

      const nextJobs = jobsRef.current.map((job) => {
        const update = updatedJobs.find((u) => u.id === job.id || u.correlationId === job.id);
        if (update) {
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
          return { ...job, ...update, retryCount: 0 };
        }
        return job;
      });

      // 🛡️ ATOMIC: Sync to memory and Dexie together (Mandate Review #9)
      setJobs(nextJobs);
      jobsRef.current = nextJobs;
      void offlineDB.background_jobs.bulkPut(nextJobs);
    } catch (error: any) {
      if (error.name === "AbortError") return;

      console.error("Job Sync Failed:", error);

      setConsecutiveFailures((prev) => prev + 1);

      open?.({
        type: "error",
        message: t("ai.jobs.syncError" as any),
        meta: { correlationId, ...(error.meta || {}) },
      } as any);

      // 🛡️ Mandate Review #9: Pass Retry-After back to the scheduler
      if (error.statusCode === 429 && error.meta?.retryAfter) {
        return error.meta.retryAfter;
      }
    } finally {
      if (abortControllerRef.current === controller) {
        isSyncingRef.current = false;
      }
    }
    return undefined;
  }, [open, t, isVisible]);

  // 🛡️ ADAPTIVE SCHEDULER: Failure-based backoff logic
  const calculateNextPollDelay = useCallback(
    (retryAfterSeconds?: number) => {
      // 🛡️ MANDATE: Always respect server-provided Retry-After as the floor (Mandate Review #9)
      const retryAfterMs = retryAfterSeconds ? retryAfterSeconds * 1000 : 0;

      // 🛡️ RURAL RESILIENCE: Respect 'Save Data' mode (Mandate Review #9)
      const isSaveDataMode = (navigator as any).connection?.saveData === true;
      if (isSaveDataMode && !retryAfterSeconds) {
        return POLLING_CONFIG.MAX_INTERVAL;
      }

      // 🛡️ FAST-FOLLOW: If there's a very fresh job (< 60s), poll every 10s (Mandate Review #9)
      const newestJob = jobsRef.current.find((j) => j.status === "processing");
      const isRecentlyQueued = newestJob && Date.now() - newestJob.createdAt < 60000;

      let baseDelay = POLLING_CONFIG.BASE_INTERVAL;
      if (consecutiveFailures === 0 && isRecentlyQueued) {
        baseDelay = 10000;
      } else if (consecutiveFailures > 0) {
        // 🛡️ EXPONENTIAL BACKOFF: 2m -> 4m -> 8m -> 15m (Cap)
        baseDelay = Math.min(
          POLLING_CONFIG.BASE_INTERVAL * Math.pow(2, consecutiveFailures),
          POLLING_CONFIG.MAX_INTERVAL
        );
      }

      // 🛡️ FULL JITTER: Apply entropy and respect the Retry-After floor
      const jitteredDelay = Math.floor(Math.random() * baseDelay);
      return Math.max(jitteredDelay, retryAfterMs);
    },
    [consecutiveFailures]
  );

  const scheduleNext = useCallback(
    async (delayOverride?: number, retryAfterSeconds?: number) => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }

      if (!isVisible || isSyncingRef.current || !isReady) return;

      const activeAiJobs = jobsRef.current.filter((j) => j.status === "processing");
      if (activeAiJobs.length === 0) return;

      const nextDelay = delayOverride ?? calculateNextPollDelay(retryAfterSeconds);

      timeoutIdRef.current = setTimeout(() => {
        syncJobs().then((retryAfter) => {
          // 🛡️ Mandate Review #9: Schedule next poll using retryAfter if provided
          scheduleNext(undefined, retryAfter).catch((err) => {
            console.error("Critical error in job sync loop:", err);
            setConsecutiveFailures((prev) => prev + 1);
            void scheduleNext(POLLING_CONFIG.MAX_INTERVAL);
          });
        });
      }, nextDelay);
    },
    [isVisible, calculateNextPollDelay, syncJobs]
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === "visible";
      setIsVisible(visible);

      if (visible) {
        void scheduleNext(0);
      } else {
        // 🛡️ RURAL RESILIENCE: Abort active sync if tab is hidden (Mandate Review #9)
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }

        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [scheduleNext]);

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
        void offlineDB.background_jobs.put(newJob);
        return next;
      });

      setConsecutiveFailures(0);
      void scheduleNext(0);

      open?.({
        type: "info",
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
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
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
      const targetJob = jobsRef.current.find(
        (j) => j.id === data.jobId || (data.correlationId && j.id === data.correlationId)
      );

      if (targetJob) {
        const updates = {
          status: data.status as any,
          metadata: { ...data.result },
        };

        updateJob(targetJob.id, updates);
        void offlineDB.background_jobs.update(targetJob.id, updates);

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
