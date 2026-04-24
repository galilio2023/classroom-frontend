import { BackgroundJob } from "@/contexts/job-context";

/**
 * 🧹 JOB MANAGER UTILITIES
 * Centralized logic for maintaining background job state.
 */

const JOB_RETENTION_MS = 24 * 60 * 60 * 1000; // 24 Hours

/**
 * Filters out jobs older than the retention period.
 */
export const pruneExpiredJobs = (jobs: BackgroundJob[]): BackgroundJob[] => {
  const now = Date.now();
  return jobs.filter((job) => now - job.createdAt < JOB_RETENTION_MS);
};

/**
 * Formats a job type for display or translation.
 */
export const formatJobType = (type: BackgroundJob["type"]): string => {
  return type.replace(/_/g, "-");
};

/**
 * Batches newly finished jobs for summarized notifications.
 */
export const getNewlyFinishedJobs = (
  prevJobs: BackgroundJob[],
  currentJobs: BackgroundJob[]
): BackgroundJob[] => {
  return currentJobs.filter((job) => {
    const prev = prevJobs.find((p) => p.id === job.id);
    return prev && prev.status === "processing" && job.status !== "processing";
  });
};
