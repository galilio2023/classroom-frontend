import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useNotification } from "@refinedev/core";
import { handleError } from "@/providers/utils/api-errors";
import { getFreshSession } from "@/providers/auth";
import { BASE_URL } from "@/constants/api";

export interface BackgroundJob {
  id: string;
  type: "summary" | "assignment" | "quiz" | "magic-builder" | "bulk-enroll";
  status: "processing" | "completed" | "failed";
  title: string;
  createdAt: number;
  metadata?: any;
}

interface JobContextType {
  jobs: BackgroundJob[];
  addJob: (job: Omit<BackgroundJob, "status" | "createdAt">) => void;
  updateJob: (id: string, updates: Partial<BackgroundJob>) => void;
  removeJob: (id: string) => void;
  clearCompleted: () => void;
  syncJobs: () => Promise<void>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) throw new Error("useJobs must be used within a JobProvider");
  return context;
};

const STORAGE_KEY = "classroom_active_jobs";

// 🛡️ POLLING CONFIGURATION (Mandate M-008)
const POLLING_CONFIG = {
  INITIAL_DELAY: 10000,   // 10s
  MAX_DELAY: 120000,      // 2m
  IDLE_POLL_INTERVAL: 60000, // 1m when tab is hidden
  JITTER_FACTOR: 0.1,     // 10%
};

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [syncDelay, setSyncDelay] = useState(POLLING_CONFIG.INITIAL_DELAY);
  const [pollTick, setPollTick] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  const jobsRef = useRef<BackgroundJob[]>([]);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { open } = useNotification();

  // Sync ref with state
  useEffect(() => {
    jobsRef.current = jobs;
  }, [jobs]);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 🛡️ AUTO-CLEANUP: Remove very old jobs (> 24h) or completed/failed jobs (> 1h)
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const hourAgo = Date.now() - 60 * 60 * 1000;

        const valid = parsed.filter((j: BackgroundJob) => {
          if (j.status === "processing") return j.createdAt > dayAgo;
          return j.createdAt > hourAgo;
        });
        setJobs(valid);
        jobsRef.current = valid;
      } catch (e) {
        console.error("Failed to load jobs from storage", e);
      }
    }
  }, []);

  // 2. Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  }, [jobs]);

  const addJob = (job: Omit<BackgroundJob, "status" | "createdAt">) => {
    setJobs((prev) => [
      ...prev,
      { ...job, status: "processing", createdAt: Date.now() } as BackgroundJob,
    ]);
    setSyncDelay(10000); // 🚀 UX: Trigger immediate responsiveness for new jobs
    setPollTick((prev) => prev + 1); // 🚀 WAKE UP: Force immediate poll
  };

  const updateJob = useCallback((id: string, updates: Partial<BackgroundJob>) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id || j.metadata?.jobId === id ? { ...j, ...updates } : j))
    );
  }, []);

  // 🛡️ RECOVERY: Polling for AI jobs that might have finished while disconnected
  // 🛡️ PERFORMANCE: updateJob and open are stable, so syncJobs will only be created once.
  const syncJobs = useCallback(async () => {
    const activeAiJobs = jobsRef.current.filter((j) => j.status === "processing");
    if (activeAiJobs.length === 0) return;

    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // 🛡️ SECURITY: Use session helper instead of direct localStorage access
      const { data: session } = await getFreshSession();
      const token = (session as any)?.token;
      if (!token) return;

      const response = await fetch(`${BASE_URL}/ai/jobs/sync`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw await handleError(response);
      }

      const { data } = await response.json();

      if (data && Array.isArray(data)) {
        data.forEach((remoteJob: any) => {
          const localJob = jobsRef.current.find(
            (j) =>
              j.status === "processing" &&
              j.type === remoteJob.topic &&
              j.metadata?.classId === remoteJob.classId
          );

          if (localJob && remoteJob.status === "completed") {
            const updatedMetadata = { ...localJob.metadata, ...remoteJob.result };
            updateJob(localJob.id, {
              status: "completed",
              metadata: updatedMetadata,
            });

            // 🚀 UI RE-HYDRATION: Notify components that a specific job is ready
            window.dispatchEvent(
              new CustomEvent(`JOB_COMPLETED_${localJob.type.toUpperCase()}`, {
                detail: {
                  jobId: localJob.id,
                  metadata: updatedMetadata,
                },
              })
            );
          } else if (localJob && remoteJob.status === "failed") {
            updateJob(localJob.id, { status: "failed" });

            window.dispatchEvent(
              new CustomEvent(`JOB_FAILED_${localJob.type.toUpperCase()}`, {
                detail: { jobId: localJob.id },
              })
            );
          }
        });
      }
    } catch (e: any) {
      if (e.name === "AbortError") return;

      console.error("AI Job Sync failed:", e);
      open?.({
        type: "error",
        message: "Sync Failed",
        description: e.message || "Failed to synchronize background jobs.",
      });
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, [updateJob, open]);

  const pollRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
      // If returning to tab, trigger an immediate check
      if (document.visibilityState === "visible") setPollTick((prev) => prev + 1);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const scheduleNext = (delay: number) => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = setTimeout(poll, delay);
    };

    const poll = async () => {
      // 🛡️ RULE 6: Tab Visibility Safety. Pause polling when tab is hidden to save battery/data.
      if (!isVisible) {
        scheduleNext(POLLING_CONFIG.IDLE_POLL_INTERVAL);
        return;
      }

      const activeAiJobs = jobsRef.current.filter((j) => j.status === "processing");
      if (activeAiJobs.length > 0) {
        await syncJobs();

        // 🛡️ RESILIENCE: Jittered Exponential backoff (Mandate M-008)
        setSyncDelay((prev) => {
          const nextBase = Math.min(prev * 2, POLLING_CONFIG.MAX_DELAY);
          const jitter = Math.random() * (nextBase * POLLING_CONFIG.JITTER_FACTOR);
          const nextDelay = nextBase + jitter;
          scheduleNext(nextDelay);
          return nextDelay;
        });
      } else {
        // 🛡️ PERFORMANCE: Reset delay when pipe is empty
        setSyncDelay(POLLING_CONFIG.INITIAL_DELAY);
      }
    };

    pollRef.current = poll;

    const activeJobsCount = jobsRef.current.filter((j) => j.status === "processing").length;
    if (activeJobsCount > 0) {
      scheduleNext(syncDelay);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [syncJobs, isVisible, pollTick]);

  const removeJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id && j.metadata?.jobId !== id));
  };

  const clearCompleted = () => {
    setJobs((prev) => prev.filter((j) => j.status === "processing"));
  };

  return (
    <JobContext.Provider value={{ jobs, addJob, updateJob, removeJob, clearCompleted, syncJobs }}>
      {children}
    </JobContext.Provider>
  );
};
