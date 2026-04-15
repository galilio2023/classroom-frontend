import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

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
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);

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
  };

  const updateJob = useCallback((id: string, updates: Partial<BackgroundJob>) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id || j.metadata?.jobId === id ? { ...j, ...updates } : j))
    );
  }, []);

  // 🛡️ RECOVERY: Polling for AI jobs that might have finished while disconnected
  const syncJobs = useCallback(async () => {
    const activeAiJobs = jobs.filter((j) => j.status === "processing");
    if (activeAiJobs.length === 0) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await axios.get(`${API_URL}/ai/jobs/sync`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.data && Array.isArray(data.data)) {
        data.data.forEach((remoteJob: any) => {
          const localJob = jobs.find(
            (j) =>
              j.status === "processing" &&
              j.type === remoteJob.topic &&
              j.metadata?.classId === remoteJob.classId
          );

          if (localJob && remoteJob.status === "completed") {
            updateJob(localJob.id, {
              status: "completed",
              metadata: { ...localJob.metadata, ...remoteJob.result },
            });
          } else if (localJob && remoteJob.status === "failed") {
            updateJob(localJob.id, { status: "failed" });
          }
        });
      }
    } catch (e) {
      console.error("AI Job Sync failed:", e);
    }
  }, [jobs, updateJob]);

  useEffect(() => {
    const pollInterval = setInterval(() => void syncJobs(), 30000); // Backoff to 30s as socket trigger will handle the rest
    return () => clearInterval(pollInterval);
  }, [syncJobs]);

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
