import React, { createContext, useContext, useEffect, useState } from "react";

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
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) throw new Error("useJobs must be used within a JobProvider");
  return context;
};

const STORAGE_KEY = "classroom_active_jobs";

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

  const updateJob = (id: string, updates: Partial<BackgroundJob>) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id || j.metadata?.jobId === id ? { ...j, ...updates } : j))
    );
  };

  const removeJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id && j.metadata?.jobId !== id));
  };

  const clearCompleted = () => {
    setJobs((prev) => prev.filter((j) => j.status === "processing"));
  };

  return (
    <JobContext.Provider value={{ jobs, addJob, updateJob, removeJob, clearCompleted }}>
      {children}
    </JobContext.Provider>
  );
};
