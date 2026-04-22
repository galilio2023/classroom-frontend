import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useNotification } from "@refinedev/core";
import { handleError, getCorrelationId } from "@/providers/utils/api-errors";
import { socket } from "@/lib/socket";
import { useTranslation } from "react-i18next";
import { getJitteredDelay } from "@/lib/jitter";
import { calculateBackoff } from "@/lib/utils";

export interface BackgroundJob {
  id: string;
  type: "summary" | "assignment" | "quiz" | "magic-builder" | "bulk-enroll";
  status: "processing" | "completed" | "failed";
  title: string;
  createdAt: number;
  metadata?: any;
  retryCount?: number; // 🛡️ Mandate Review #8: Track retries for exponential backoff
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

const POLLING_CONFIG = {
  INITIAL_DELAY: 5000, // 5s (🚀 UX: Faster initial feedback)
  MAX_DELAY: 30000, // 30s (🚀 UX: More aggressive cap for active jobs)
  RETRY_INTERVAL: 15000, // 15s (🚀 RESILIENCE: Standard retry delay)
  IDLE_POLL_INTERVAL: 60000, // 1m when tab is hidden
};

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [syncDelay, setSyncDelay] = useState(POLLING_CONFIG.INITIAL_DELAY);
  const [isVisible, setIsVisible] = useState(true);

  const jobsRef = useRef<BackgroundJob[]>([]);
  const syncDelayRef = useRef(syncDelay);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const { open } = useNotification();
  const { t } = useTranslation();

  // Keep refs in sync for interval closures
  useEffect(() => {
    jobsRef.current = jobs;
  }, [jobs]);

  useEffect(() => {
    syncDelayRef.current = syncDelay;
  }, [syncDelay]);

  // Handle Tab Visibility to save mobile battery
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const updateJob = useCallback((id: string, updates: Partial<BackgroundJob>) => {
    setJobs((prev) => prev.map((job) => (job.id === id ? { ...job, ...updates } : job)));
  }, []);

  const addJob = useCallback((job: Omit<BackgroundJob, "status" | "createdAt">) => {
    const newJob: BackgroundJob = {
      ...job,
      status: "processing",
      createdAt: Date.now(),
      retryCount: 0,
    };
    setJobs((prev) => [newJob, ...prev]);
  }, []);

  const removeJob = useCallback((id: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setJobs((prev) => prev.filter((job) => job.status === "processing"));
  }, []);

  const syncJobs = useCallback(async () => {
    const processingJobs = jobsRef.current.filter((j) => j.status === "processing");
    if (processingJobs.length === 0) return;

    try {
      const response = await fetch(
        `/api/ai/jobs/sync?since=${new Date(Math.min(...processingJobs.map((j) => j.createdAt))).toISOString()}`,
        {
          headers: {
            "X-Correlation-ID": `poll-${Date.now()}`,
          },
        }
      );

      if (!response.ok) {
        throw await handleError(response);
      }

      const { data: updatedJobs } = await response.json();

      setJobs((prev) => {
        return prev.map((job) => {
          const update = updatedJobs.find((u: any) => u.id === job.id);
          if (update) {
            // If status changed to completed/failed, notify user
            if (job.status === "processing" && update.status !== "processing") {
              open?.({
                type: update.status === "completed" ? "success" : "error",
                message: t(`ai.jobs.${job.type}.${update.status}`),
                description: job.title,
              });
            }
            return { ...job, ...update };
          }
          return job;
        });
      });
    } catch (error) {
      console.error("Job Sync Failed:", error);
      // Increment retries on failure to trigger backoff
      setJobs((prev) =>
        prev.map((j) =>
          j.status === "processing" ? { ...j, retryCount: (j.retryCount || 0) + 1 } : j
        )
      );
    }
  }, [open, t]);

  const scheduleNext = useCallback(async () => {
    if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);

    let nextDelay = POLLING_CONFIG.INITIAL_DELAY;
    let shouldSchedule = false;

    if (isVisible) {
      const activeAiJobs = jobsRef.current.filter((j) => j.status === "processing");
      if (activeAiJobs.length > 0) {
        await syncJobs();

        // 🛡️ RESILIENCE: Full Jitter Exponential backoff
        // Mandate Review #8: Use the max retry count across all active jobs for consistent backoff
        const maxRetries = activeAiJobs.reduce((max, job) => Math.max(max, job.retryCount || 0), 0);

        nextDelay = Math.max(
          POLLING_CONFIG.INITIAL_DELAY,
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
        scheduleNext();
      }, nextDelay);
    }
  }, [isVisible, syncJobs]);

  useEffect(() => {
    scheduleNext();
    return () => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    };
  }, [scheduleNext]);

  // Socket Listeners for Real-time completion
  useEffect(() => {
    const handleJobCompleted = (data: { jobId: string; status: string; result?: any }) => {
      updateJob(data.jobId, {
        status: data.status as any,
        metadata: { ...data.result },
      });

      const job = jobsRef.current.find((j) => j.id === data.jobId);
      if (job) {
        open?.({
          type: data.status === "completed" ? "success" : "error",
          message: t(`ai.jobs.${job.type}.${data.status}`),
          description: job.title,
        });
      }
    };

    socket.on("ai:job_completed", handleJobCompleted);
    return () => {
      socket.off("ai:job_completed", handleJobCompleted);
    };
  }, [open, t, updateJob]);

  return (
    <JobContext.Provider value={{ jobs, addJob, updateJob, removeJob, clearCompleted, syncJobs }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error("useJobs must be used within a JobProvider");
  }
  return context;
};
