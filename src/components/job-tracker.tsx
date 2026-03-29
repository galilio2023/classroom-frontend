import React, { useState } from "react";
import { useJobs, BackgroundJob } from "@/contexts/job-context";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Brain,
  FileText,
  MessageSquare,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";

const JobIcon = ({ type }: { type: BackgroundJob["type"] }) => {
  switch (type) {
    case "summary":
      return <Brain className="w-4 h-4" />;
    case "assignment":
      return <FileText className="w-4 h-4" />;
    case "quiz":
      return <MessageSquare className="w-4 h-4" />;
    case "magic-builder":
      return <Brain className="w-4 h-4" />;
    case "bulk-enroll":
      return <Users className="w-4 h-4" />;
    default:
      return <Loader2 className="w-4 h-4" />;
  }
};

export const JobTracker: React.FC = () => {
  const { jobs, removeJob, clearCompleted } = useJobs();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const processingJobs = jobs.filter((j) => j.status === "processing");
  const hasActiveJobs = processingJobs.length > 0;

  if (jobs.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-80">
      <div className="bg-card border rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div
          className={cn(
            "p-3 flex items-center justify-between cursor-pointer transition-colors",
            hasActiveJobs ? "bg-primary text-primary-foreground" : "bg-muted"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2">
            {hasActiveJobs ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {hasActiveJobs
                ? t("jobs.active_count", {
                    count: processingJobs.length,
                    defaultValue: `${processingJobs.length} Active Tasks`,
                  })
                : t("jobs.all_complete", { defaultValue: "All Tasks Complete" })}
            </span>
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>

        {/* Job List */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="max-h-96 overflow-y-auto"
            >
              <div className="p-2 space-y-1">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors border-b last:border-0 border-border/40"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div
                        className={cn(
                          "p-1.5 rounded-full",
                          job.status === "processing" && "bg-blue-100 text-blue-600 animate-pulse",
                          job.status === "completed" && "bg-green-100 text-green-600",
                          job.status === "failed" && "bg-red-100 text-red-600"
                        )}
                      >
                        <JobIcon type={job.type} />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-semibold truncate">{job.title}</span>
                        <span className="text-[10px] text-muted-foreground capitalize">
                          {job.status}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-50 hover:opacity-100"
                      onClick={() => removeJob(job.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>

              {jobs.some((j) => j.status !== "processing") && (
                <div className="p-2 border-t bg-muted/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={clearCompleted}
                  >
                    {t("jobs.clear_completed", { defaultValue: "Clear Completed" })}
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
