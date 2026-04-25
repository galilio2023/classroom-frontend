import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  Sparkles,
  Loader2,
  CheckCircle2,
  Clock,
  BookOpen,
  Zap,
  ExternalLink,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useCustom, useCustomMutation, HttpError } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/refine/layout/breadcrumb";
import usePageTitle from "@/hooks/use-page-title";
import { handleError } from "@/providers/utils/api-errors";
import { offlineDB } from "@/lib/offline-db";
import { useJobs } from "@/contexts/job-context";
import { socket } from "@/lib/socket";

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
  statusCode?: number;
  jobId?: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_SLOTS = ["Morning", "Afternoon", "Evening"];

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

  // 🚀 BACKGROUND JOB STATUS: Check if a study plan is currently being generated
  const activeStudyPlanJob = useMemo(
    () => jobs.find((j) => j.type === "study_plan" && j.status === "processing"),
    [jobs]
  );

  // 🚀 RULE 4: Load from IndexedDB (Offline-First)
  useEffect(() => {
    const loadOffline = async () => {
      const record = await offlineDB.study_plans.get("current");
      if (record) {
        setPlan(record.plan as any);
        setCompletedBlocks(record.completedBlocks);
      }
    };

    if (initialData?.data) {
      setPlan(initialData.data.plan || []);
      setCompletedBlocks(initialData.data.completedBlocks || {});
      // Persist to offline storage
      void offlineDB.study_plans.put({
        id: "current",
        plan: initialData.data.plan || [],
        completedBlocks: initialData.data.completedBlocks || {},
        updatedAt: Date.now(),
      });
    } else if (!isFetching) {
      // 🚀 RACE CONDITION GUARD: Only load offline if the network request is NOT active
      loadOffline();
    }
  }, [initialData, isFetching]);

  // 🚀 BACKGROUND JOB REAL-TIME SYNC
  useEffect(() => {
    const handleJobComplete = (data: unknown) => {
      const typedData = data as { topic?: string; type?: string };
      if (typedData.topic === "generate_study_plan" || typedData.type === "study_plan") {
        refetchPlan();
      }
    };

    socket.on("ai:job_completed", handleJobComplete);
    return () => {
      socket.off("ai:job_completed", handleJobComplete);
    };
  }, [refetchPlan]);

  // --- MUTATIONS ---
  const { mutate: generatePlanMutation, mutation: generateMutation } = useCustomMutation<
    StudyPlanResponse,
    HttpError
  >({
    mutationOptions: {
      onError: (err) => {
        handleError(err); // 🚀 RULE 5: Standardized Error Handling
      },
    },
  });

  const isGenerating = generateMutation.isPending;
  const { mutate: toggleBlockMutation } = useCustomMutation();

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
          }
        },
      }
    );
  };

  const toggleBlock = (blockId: string) => {
    const newStatus = !completedBlocks[blockId];
    setCompletedBlocks((prev) => ({ ...prev, [blockId]: newStatus }));

    toggleBlockMutation({
      url: `study-planner/toggle-block/${blockId}`,
      method: "post",
      values: { isCompleted: newStatus },
    });
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
        <div className="space-y-4">
          <Breadcrumb />
          <div className="space-y-1 text-start">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
              {t("studyPlanner.title" as any)}
            </h1>
            <p className="text-muted-foreground font-medium max-w-xl text-lg">
              {t("studyPlanner.description" as any)}
            </p>
          </div>
        </div>

        <Button
          size="lg"
          onClick={generatePlan}
          disabled={isGenerating || !!activeStudyPlanJob}
          className="h-16 px-8 rounded-2xl bg-ai-primary hover:opacity-90 transition-all group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-linear-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {isGenerating || activeStudyPlanJob ? (
            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
          ) : (
            <Sparkles className="mr-3 h-6 w-6" />
          )}
          <span className="font-black uppercase tracking-widest">
            {isGenerating || activeStudyPlanJob
              ? t("studyPlanner.buttons.generating" as any)
              : t("studyPlanner.buttons.generate" as any)}
          </span>
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-10">
        {/* Weekly View */}
        <div className="lg:col-span-5 space-y-8">
          <AnimatePresence mode="wait">
            {plan.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 gap-6"
              >
                {DAYS.map((day) => {
                  const dayBlocks = plan.filter((b) => b.day === day);
                  if (dayBlocks.length === 0) return null;

                  return (
                    <Card key={day} className="border-border/40 bg-card/50 backdrop-blur-xl rounded-3xl overflow-hidden text-start">
                      <CardHeader className="border-b border-border/40 py-6 px-8 bg-muted/20">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <CalendarIcon className="h-5 w-5" />
                          </div>
                          <CardTitle className="text-xl font-black uppercase tracking-tight">
                            {t(`common.days.${day.toLowerCase()}` as any)}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-border/40">
                          {TIME_SLOTS.map((slot) => {
                            const block = dayBlocks.find((b) => b.timeSlot === slot);
                            if (!block) return null;
                            const blockId = `${day}-${slot}`;
                            const isCompleted = completedBlocks[blockId];

                            return (
                              <div
                                key={slot}
                                className={cn(
                                  "flex items-center justify-between p-8 group transition-colors",
                                  isCompleted ? "bg-emerald-500/5" : "hover:bg-muted/30"
                                )}
                              >
                                <div className="flex items-start gap-6">
                                  <button
                                    onClick={() => toggleBlock(blockId)}
                                    className={cn(
                                      "mt-1 h-8 w-8 rounded-xl border-2 flex items-center justify-center transition-all shrink-0",
                                      isCompleted
                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                        : "border-border/60 hover:border-primary group-hover:scale-110"
                                    )}
                                  >
                                    {isCompleted && <CheckCircle2 className="h-5 w-5" />}
                                  </button>

                                  <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                        {t(`studyPlanner.slots.${slot.toLowerCase()}` as any)}
                                      </span>
                                      <Badge variant="outline" className="text-[10px] font-bold rounded-lg border-border/40">
                                        {block.duration}
                                      </Badge>
                                    </div>
                                    <h4 className={cn(
                                      "text-xl font-black tracking-tight",
                                      isAr ? "font-noto-arabic" : "font-sans",
                                      isCompleted && "line-through text-muted-foreground/60"
                                    )}>
                                      {block.task}
                                    </h4>
                                  </div>
                                </div>

                                {block.assignmentId && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    asChild
                                    className="rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                                  >
                                    <Link to={`/assignments/show/${block.assignmentId}`}>
                                      <ExternalLink className="h-5 w-5" />
                                    </Link>
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
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
                <Button onClick={generatePlan} size="lg" className="rounded-2xl px-10 h-14 bg-ai-primary font-black uppercase tracking-widest">
                  <Sparkles className="mr-3 h-5 w-5" />
                  {t("studyPlanner.buttons.generateNow" as any)}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar / Stats */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-border/40 bg-card/50 backdrop-blur-xl rounded-3xl overflow-hidden text-start">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                {t("studyPlanner.stats.progressTitle" as any)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-3xl font-black tracking-tighter">
                    {Object.values(completedBlocks).filter(Boolean).length} / {plan.length}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground mb-1">
                    {t("studyPlanner.stats.blocksLabel" as any)}
                  </span>
                </div>
                <div className="h-3 w-full bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(Object.values(completedBlocks).filter(Boolean).length / (plan.length || 1)) * 100}%` }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest text-primary/60">
                    {t("studyPlanner.stats.nextTask" as any)}
                  </p>
                  <p className="text-sm font-bold leading-tight">
                    {plan.find((b) => !completedBlocks[`${b.day}-${b.timeSlot}`])?.task || t("studyPlanner.stats.allDone" as any)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Tip Box */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border/40 bg-ai-primary/5 rounded-4xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                <Sparkles className="h-24 w-24" />
              </div>
              <CardContent className="p-10 space-y-6 text-start">
                <div className="space-y-4">
                  <div className="p-3 rounded-2xl bg-ai-primary/20 text-ai-primary w-fit">
                    <Info className="h-5 w-5" />
                  </div>
                  <p className="text-base md:text-xl font-medium text-muted-foreground leading-relaxed italic selection:bg-indigo-500/20">
                    "{t("studyPlanner.labels.tipText" as any)}"
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanner;
