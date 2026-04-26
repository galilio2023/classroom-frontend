import { useEffect, useMemo, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Sparkles, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useCustom, useCustomMutation, HttpError, useGetIdentity } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import usePageTitle from "@/hooks/use-page-title";
import { handleError, getCorrelationId } from "@/providers/utils/api-errors";
import { offlineDB } from "@/lib/offline-db";
import { useJobs, BackgroundJob } from "@/contexts/job-context";
import { socket } from "@/lib/socket";
import { useStudyPlanSync, useOfflineSync } from "@/features/engagement/hooks/use-offline-sync";
import { TablawyCreateResponse } from "@/types/refine-extensions.d";
import { User } from "@/types";
import { dispatchStudyBlockXp } from "@/lib/gamification";

// Deconstructed Components
import { StudyPlannerHeader } from "./study-planner/StudyPlannerHeader";
import { StudyPlanDayCard } from "./study-planner/StudyPlanDayCard";
import { StudyPlanStats } from "./study-planner/StudyPlanStats";

interface StudyBlock {
  day: string;
  timeSlot: "Morning" | "Afternoon" | "Evening";
  task: string;
  assignmentId?: number;
  duration: string;
}

/**
 * 🛡️ StudyPlanResponse Interface
 * Standardized structure for AI-generated study plans.
 */
interface StudyPlanResponse {
  id: number;
  plan: StudyBlock[];
  completedBlocks: Record<string, boolean>;
  updatedAt?: number;
  jobId?: string;
  statusCode?: number;
}

type StudyPlanTopic = "generate_study_plan";

interface JobSocketPayload {
  topic?: StudyPlanTopic;
  type?: "study_plan";
  userId?: string;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const StudyPlanner = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  usePageTitle(t("studyPlanner.title"));
  const { addJob, jobs } = useJobs();
  const { isOnline } = useOfflineSync();
  const { data: user } = useGetIdentity<User>();
  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 🛡️ COMPONENT LIFECYCLE: Handle cleanup and race conditions
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // --- FETCH CURRENT PLAN ---
  const { query: planQuery } = useCustom<StudyPlanResponse>({
    url: "study-planner",
    method: "get",
  });

  const { data: initialData, isLoading: isFetching, refetch: refetchPlan } = planQuery;

  // 🚀 RULE 4 Hardening: Synchronized Source of Truth logic
  // The useStudyPlanSync hook ensures "Freshest Copy Wins"
  const {
    plan,
    completedBlocks,
    setCompletedBlocks,
    isSyncingRef,
    lastUpdated: previousUpdatedAt,
  } = useStudyPlanSync(initialData, isFetching);

  // 🚀 BACKGROUND JOB STATUS
  const activeStudyPlanJob = useMemo(
    () =>
      jobs.find((j) => j.type === "study_plan" && j.status === "processing") as
        | BackgroundJob
        | undefined,
    [jobs]
  );

  // 🚀 RULE 6: Resource Preserving Visibility Safety
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        // AI is generating or interacting but user left. Stop sound/heavy polling (Mandate Rule 6).
        console.log("StudyPlanner: Preserved resources (Rule 6).");
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // --- MUTATIONS ---
  const { mutate: generatePlanMutation, mutation: generateMutation } = useCustomMutation<
    StudyPlanResponse,
    HttpError
  >({
    mutationOptions: {
      onSuccess: () => {
        // 🚀 SUCCESS TIMING: Generation is async (202). refetchPlan here is premature.
        // Rely on socket.on("ai:job_completed") for the real refetch.
      },
      onError: (err) => {
        if (!isMounted.current) return;
        const correlationId = getCorrelationId(err);
        handleError(err, correlationId);
      },
    },
  });

  const { mutate: toggleBlockMutation } = useCustomMutation<StudyPlanResponse, HttpError>({
    mutationOptions: {
      onError: (_err) => {
        // Handled in toggleBlock's own onError
      },
      onSettled: () => {
        if (isMounted.current) {
          isSyncingRef.current = false;
        }
      },
    },
  });

  const handleJobComplete = useCallback(
    (data: JobSocketPayload) => {
      if (!isMounted.current) return;
      // 🛡️ SOCKET SCOPING: Ensure we only refetch if the job belongs to the current user
      // Cast user.id to string to prevent comparison mismatches (Review #19)
      const currentUserId = user?.id ? String(user.id) : null;
      if (data.userId && currentUserId && String(data.userId) !== currentUserId) return;

      if (data.topic === "generate_study_plan" || data.type === "study_plan") {
        refetchPlan();
      }
    },
    [refetchPlan, user?.id]
  );

  useEffect(() => {
    socket.on("ai:job_completed", handleJobComplete);
    return () => {
      socket.off("ai:job_completed", handleJobComplete);
    };
  }, [handleJobComplete]);

  const generatePlan = async () => {
    // 🛡️ ABORT PREVIOUS: Ensure no overlapping generation requests (Review #19)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    generatePlanMutation(
      {
        url: "study-planner/generate",
        method: "post",
        values: {},
        successNotification: false,
        // Pass signal to underlying axios/fetch call
        meta: {
          abortSignal: abortControllerRef.current.signal,
        },
      },
      {
        onSuccess: (data) => {
          if (!isMounted.current) return;
          const response = data as TablawyCreateResponse<StudyPlanResponse>;
          const jobId = response.data?.jobId || (response as any).jobId;
          
          if (jobId) {
            addJob({
              id: jobId,
              type: "study_plan",
              title: t("studyPlanner.notifications.generatingTitle"),
            });
            toast.success(t("studyPlanner.notifications.generatingMessage"));
          } else if (response.statusCode === 202) {
            // 🚀 Rule 202 Handling: Background processing without immediate jobId
            toast.info(t("studyPlanner.notifications.queuedMessage"));
          }
        },
      }
    );
  };

  const toggleBlock = async (blockId: string) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;

    try {
      const previousStatus = !!completedBlocks[blockId];
      const newStatus = !previousStatus;
      const now = Date.now();

      // 🚀 RULE 4 Hardening (Atomic Update): Update React state and Offline DB with the same object.
      const newCompleted = { ...completedBlocks, [blockId]: newStatus };
      setCompletedBlocks(newCompleted);

      await offlineDB.study_plans.update("current", {
        completedBlocks: newCompleted,
        updatedAt: now,
      });

      // 🚀 GAMIFICATION: Centralized XP helper
      if (newStatus) {
        dispatchStudyBlockXp();
      }

      // 📶 OFFLINE MUTATION QUEUEING (Rule 4 Suggestion)
      // Only dispatch network mutation if online. useOfflineSync handles reconciliation when coming back.
      if (isOnline) {
        toggleBlockMutation(
          {
            url: `study-planner/toggle-block/${blockId}`,
            method: "post",
            values: { isCompleted: newStatus },
            successNotification: false,
          },
          {
            onSuccess: (res) => {
              if (!isMounted.current) return;
              const serverUpdate = res.data?.updatedAt;
              if (serverUpdate) {
                void offlineDB.study_plans.update("current", { updatedAt: serverUpdate });
              }
            },
            onError: async (err) => {
              if (!isMounted.current) return;

              // 🛡️ SRE Visibility: Log rollback for production monitoring (Review #19)
              console.warn(`[StudyPlanner] Toggle failed for ${blockId}. Rolling back.`, { error: err });

              // 🛡️ ROLLBACK (Fixed Stale Closure & Deterministic Timestamp)
              setCompletedBlocks((prev) => {
                const rolledBack = { ...prev, [blockId]: previousStatus };
                
                try {
                  // 🚀 Hardening: Restore the PREVIOUS timestamp (or 0 if unknown), not a new one.
                  // This ensures "Freshest Copy Wins" logic doesn't treat the rollback as a fresh update.
                  void offlineDB.study_plans.update("current", {
                    completedBlocks: rolledBack,
                    updatedAt: previousUpdatedAt || 0,
                  });
                } catch (rollbackDbErr) {
                  console.error("Rollback Offline DB update failed:", rollbackDbErr);
                }
                
                return rolledBack;
              });

              toast.error(t("studyPlanner.notifications.rollbackError"));
              const correlationId = getCorrelationId(err);
              handleError(err, correlationId);
            },
          }
        );
      } else {
        // If offline, release the sync lock immediately (Dexie update is already done)
        isSyncingRef.current = false;
      }
    } catch (err) {
      console.error("Critical failure in toggleBlock:", err);
      // 🛡️ RACE CONDITION FIX: Ensure ref is reset even if setup fails
      if (isMounted.current) {
        isSyncingRef.current = false;
      }
    }
  };

  // 🚀 PERFORMANCE: O(N) grouping via useMemo
  // plan is memoized in useStudyPlanSync, ensuring this only runs when data truly changes.
  const blocksByDay = useMemo(() => {
    const map: Record<string, StudyBlock[]> = {};
    (plan || []).forEach((b) => {
      if (!map[b.day]) map[b.day] = [];
      map[b.day].push(b);
    });
    return map;
  }, [plan]);

  const completedCount = useMemo(
    () => Object.values(completedBlocks || {}).filter(Boolean).length,
    [completedBlocks]
  );

  const nextTask = useMemo(
    () => (plan || []).find((b) => !completedBlocks[`${b.day}-${b.timeSlot}`])?.task,
    [plan, completedBlocks]
  );

  return (
    <div className="space-y-12 pb-24">
      <StudyPlannerHeader
        onGenerate={generatePlan}
        isGenerating={generateMutation.isPending}
        activeJob={activeStudyPlanJob}
      />
      {/* 🚀 Rule 7: Offline Indicator Badge */}
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-full w-fit mx-auto text-[10px] font-black uppercase tracking-widest border border-destructive/20 animate-pulse"
        >
          <WifiOff className="h-3 w-3" />
          {t("common.offline")}
        </motion.div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-10">
        <div className="lg:col-span-5 space-y-8">
          <AnimatePresence mode="wait">
            {plan && plan.length > 0 ? (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {DAYS.map((day) => (
                  <StudyPlanDayCard
                    key={day}
                    day={day}
                    dayBlocks={blocksByDay[day] || []}
                    completedBlocks={completedBlocks}
                    onToggleBlock={toggleBlock}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-border/40 rounded-4xl bg-muted/5 text-center"
              >
                <div className="p-8 rounded-3xl bg-ai-primary/10 text-ai-primary mb-8">
                  <Zap className="h-16 w-16" />
                </div>
                <h3 className="text-3xl font-black tracking-tighter uppercase mb-2">
                  {t("studyPlanner.empty.title")}
                </h3>
                <p className="text-muted-foreground font-medium max-w-sm mb-8">
                  {t("studyPlanner.empty.description")}
                </p>
                <Button
                  onClick={generatePlan}
                  size="lg"
                  className="rounded-2xl px-10 h-14 bg-ai-primary font-black uppercase tracking-widest"
                >
                  <Sparkles className="mr-3 h-5 w-5" />
                  {t("studyPlanner.buttons.generateNow")}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-2">
          <StudyPlanStats
            completedCount={completedCount}
            totalCount={plan?.length || 0}
            nextTask={nextTask}
          />
        </div>
      </div>
    </div>
  );
};

export default StudyPlanner;
