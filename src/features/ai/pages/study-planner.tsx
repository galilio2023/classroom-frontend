import { useState, useEffect, useMemo } from "react";
import { Zap, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useCustom, useCustomMutation, HttpError } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import usePageTitle from "@/hooks/use-page-title";
import { handleError } from "@/providers/utils/api-errors";
import { offlineDB } from "@/lib/offline-db";
import { useJobs } from "@/contexts/job-context";
import { socket } from "@/lib/socket";

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

interface StudyPlanResponse {
  id: number;
  plan: StudyBlock[];
  completedBlocks: Record<string, boolean>;
  updatedAt?: number;
  jobId?: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const StudyPlanner = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  usePageTitle(t("resources.study-planner.label"));
  const { addJob, jobs } = useJobs();

  // --- FETCH CURRENT PLAN ---
  const { query: planQuery } = useCustom<StudyPlanResponse>({
    url: "study-planner",
    method: "get",
  });

  const { data: initialData, isLoading: isFetching, refetch: refetchPlan } = planQuery;

  const [plan, setPlan] = useState<StudyBlock[]>([]);
  const [completedBlocks, setCompletedBlocks] = useState<Record<string, boolean>>({});
  const [lastUpdated, setLastUpdate] = useState<number>(0);

  // 🚀 BACKGROUND JOB STATUS
  const activeStudyPlanJob = useMemo(
    () => jobs.find((j) => j.type === "study_plan" && j.status === "processing"),
    [jobs]
  );

  // 🚀 RULE 4 Hardening: Source of Truth logic
  useEffect(() => {
    const loadAndSync = async () => {
      const record = await offlineDB.study_plans.get("current");

      // If network data is available and newer, synchronize
      if (initialData?.data) {
        const netUpdate = initialData.data.updatedAt || Date.now();
        const localUpdate = record?.updatedAt || 0;

        if (netUpdate >= localUpdate) {
          setPlan(initialData.data.plan || []);
          setCompletedBlocks(initialData.data.completedBlocks || {});
          setLastUpdate(netUpdate);
          // Sync to local
          void offlineDB.study_plans.put({
            id: "current",
            plan: initialData.data.plan || [],
            completedBlocks: initialData.data.completedBlocks || {},
            updatedAt: netUpdate,
          });
          return;
        }
      }

      // Fallback to local if network is stale or missing
      if (record) {
        setPlan(record.plan as StudyBlock[]);
        setCompletedBlocks(record.completedBlocks);
        setLastUpdate(record.updatedAt);
      }
    };

    if (!isFetching) {
      loadAndSync();
    }
  }, [initialData, isFetching]);

  // 🚀 REAL-TIME SYNC
  useEffect(() => {
    const handleJobComplete = (data: unknown) => {
      const typedData = data as { topic?: string; type?: string };
      if (typedData.topic === "generate_study_plan" || typedData.type === "study_plan") {
        refetchPlan();
      }
    };

    socket.on("ai:job_completed", handleJobComplete);
    return () => socket.off("ai:job_completed", handleJobComplete);
  }, [refetchPlan]);

  // --- MUTATIONS ---
  const { mutate: generatePlanMutation, mutation: generateMutation } = useCustomMutation<
    StudyPlanResponse,
    HttpError
  >({
    mutationOptions: {
      onError: (err) => handleError(err),
    },
  });

  const { mutate: toggleBlockMutation } = useCustomMutation({
    mutationOptions: {
      resource: "study-planner", // 🛡️ Refine v5 Alignment
    },
  });

  const generatePlan = async () => {
    generatePlanMutation(
      {
        url: "study-planner/generate",
        method: "post",
        values: {},
      },
      {
        onSuccess: (data) => {
          if (data.data?.jobId) {
            addJob({
              id: data.data.jobId,
              type: "study_plan",
              title: t("studyPlanner.notifications.generatingTitle" as any),
            });
            toast.success(t("studyPlanner.notifications.generatingMessage" as any));
          } else if (data.statusCode === 202) {
            // 🚀 Rule 202 Handling: Background processing without immediate jobId
            toast.info(
              t(
                "studyPlanner.notifications.queuedMessage" as any,
                "Study plan is being prepared in the background."
              )
            );
          }
        },
      }
    );
  };

  const toggleBlock = async (blockId: string) => {
    const newStatus = !completedBlocks[blockId];
    const newCompleted = { ...completedBlocks, [blockId]: newStatus };

    // 🚀 RULE 4: Immediate Offline Persistence
    setCompletedBlocks(newCompleted);
    await offlineDB.study_plans.update("current", {
      completedBlocks: newCompleted,
      updatedAt: Date.now(),
    });

    // 🚀 GAMIFICATION: Local XP Event for immediate feedback
    if (newStatus) {
      window.dispatchEvent(
        new CustomEvent("xp_gained_local", {
          detail: { amount: 25, reason: "Study Task Completed" },
        })
      );
    }

    toggleBlockMutation({
      url: `study-planner/toggle-block/${blockId}`,
      method: "post",
      values: { isCompleted: newStatus },
    });
  };

  // 🚀 PERFORMANCE: O(N) grouping via useMemo
  const blocksByDay = useMemo(() => {
    const map: Record<string, StudyBlock[]> = {};
    plan.forEach((b) => {
      if (!map[b.day]) map[b.day] = [];
      map[b.day].push(b);
    });
    return map;
  }, [plan]);

  const completedCount = useMemo(
    () => Object.values(completedBlocks).filter(Boolean).length,
    [completedBlocks]
  );

  const nextTask = useMemo(
    () => plan.find((b) => !completedBlocks[`${b.day}-${b.timeSlot}`])?.task,
    [plan, completedBlocks]
  );

  return (
    <div className="space-y-12 pb-24">
      <StudyPlannerHeader
        onGenerate={generatePlan}
        isGenerating={generateMutation.isPending}
        activeJob={activeStudyPlanJob}
      />

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-10">
        <div className="lg:col-span-5 space-y-8">
          <AnimatePresence mode="wait">
            {plan.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 gap-6"
              >
                {DAYS.map(
                  (day) =>
                    blocksByDay[day] && (
                      <StudyPlanDayCard
                        key={day}
                        day={day}
                        dayBlocks={blocksByDay[day]}
                        completedBlocks={completedBlocks}
                        onToggleBlock={toggleBlock}
                        isAr={isAr}
                      />
                    )
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-[600px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border/40 rounded-4xl bg-card/20"
              >
                <div className="p-8 rounded-full bg-ai-primary/10 text-ai-primary mb-6 animate-pulse">
                  <Zap className="h-16 w-16" />
                </div>
                <h3 className="text-3xl font-black tracking-tighter uppercase mb-2">
                  {t("studyPlanner.empty.title" as any)}
                </h3>
                <p className="text-muted-foreground font-medium max-w-sm mb-8">
                  {t("studyPlanner.empty.description" as any)}
                </p>
                <Button
                  onClick={generatePlan}
                  size="lg"
                  className="rounded-2xl px-10 h-14 bg-ai-primary font-black uppercase tracking-widest"
                >
                  <Sparkles className="mr-3 h-5 w-5" />
                  {t("studyPlanner.buttons.generateNow" as any)}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-2">
          <StudyPlanStats
            completedCount={completedCount}
            totalCount={plan.length}
            nextTask={nextTask}
          />
        </div>
      </div>
    </div>
  );
};

export default StudyPlanner;
