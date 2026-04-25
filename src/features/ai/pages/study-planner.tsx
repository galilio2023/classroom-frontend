import { useState, useEffect } from "react";
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
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_SLOTS = ["Morning", "Afternoon", "Evening"];

const StudyPlanner = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  usePageTitle(t("resources.study-planner.label"));

  // --- FETCH CURRENT PLAN ---
  const { query: planQuery } = useCustom<StudyPlanResponse>({
    url: "study-planner",
    method: "get",
  });

  const { data: initialData, isLoading: isFetching } = planQuery;

  const [plan, setPlan] = useState<StudyBlock[]>([]);
  const [completedBlocks, setCompletedBlocks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialData?.data) {
      setPlan(initialData.data.plan || []);
      setCompletedBlocks(initialData.data.completedBlocks || {});
    }
  }, [initialData]);

  // --- MUTATIONS ---
  const { mutate: generatePlanMutation, mutation: generateMutation } = useCustomMutation<
    StudyPlanResponse,
    HttpError
  >();
  const isGenerating = generateMutation.isPending;
  const { mutate: toggleBlockMutation } = useCustomMutation();

  const generatePlan = async () => {
    generatePlanMutation(
      {
        url: "ai/generate-study-plan",
        method: "post",
        values: {},
      },
      {
        onSuccess: (result) => {
          // 🚀 RURAL HARDENING: Handle asynchronous background job (202 Accepted)
          if (result.data?.statusCode === 202) {
            toast.info(
              t("studyPlanner.toasts.processing", {
                defaultValue:
                  "AI is crafting your study plan in the background. You'll be notified when it's ready!",
              }),
              {
                icon: <Sparkles className="h-4 w-4 text-ai-primary" />,
                duration: 6000,
              }
            );
            return;
          }

          // Legacy/Immediate fallback support
          if (result.data?.plan) {
            setPlan(result.data.plan);
            setCompletedBlocks({});
            toast.success(
              t("studyPlanner.toasts.generated", {
                defaultValue: "Study plan generated successfully!",
              })
            );
          }
        },
        onError: (err) => {
          void handleError(err); // 🛡️ RULE 5: Standardized error handling
        },
      }
    );
  };

  const toggleComplete = (day: string, slot: string) => {
    const key = `${day}-${slot}`;
    const isNowCompleted = !completedBlocks[key];

    // Optimistic Update
    setCompletedBlocks((prev) => ({ ...prev, [key]: isNowCompleted }));

    toggleBlockMutation({
      url: "study-planner/toggle",
      method: "post",
      values: { day, timeSlot: slot },
    });

    if (isNowCompleted) {
      toast.success(t("studyPlanner.toasts.completed", { defaultValue: "Block completed!" }), {
        icon: <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />,
      });
      const event = new CustomEvent("xp_gained_local", {
        detail: {
          amount: 20,
          reason: t("studyPlanner.labels.blockCompleted", {
            defaultValue: "Study block completed",
          }),
        },
      });
      window.dispatchEvent(event);
    }
  };

  const getBlock = (day: string, slot: string) => {
    return plan.find((b) => b.day === day && b.timeSlot === slot);
  };

  const isLoading = isFetching || isGenerating;

  return (
    <div
      className="space-y-10 md:space-y-16 pb-20 max-w-screen-2xl mx-auto"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 md:space-y-6 text-start px-2"
      >
        <Breadcrumb />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
              <CalendarIcon className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-balance">
                {t("resources.study-planner.label")}
              </h1>
              <p className="text-muted-foreground font-medium max-w-xl text-balance">
                {t("studyPlanner.description")}
              </p>
            </div>
          </div>
          <Button
            onClick={generatePlan}
            disabled={isLoading}
            size="lg"
            className="w-full md:w-auto rounded-2xl h-12 md:h-14 px-10 font-bold uppercase tracking-widest text-[10px] gap-3 shadow-lg shadow-primary/25 hover:translate-y-[-2px] transition-all"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
            {plan.length > 0
              ? t("studyPlanner.buttons.regenerate")
              : t("studyPlanner.buttons.generate")}
          </Button>
        </div>
      </motion.div>

      {plan.length === 0 && !isLoading ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-2"
        >
          <Card className="border-2 border-dashed border-border/40 bg-card/20 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center py-20 md:py-32 text-center space-y-6">
              <div className="p-8 rounded-4xl bg-primary/5 text-primary/30">
                <BookOpen className="h-16 w-16" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                  {t("studyPlanner.empty.title")}
                </h3>
                <p className="text-muted-foreground max-sm mx-auto text-base font-medium">
                  {t("studyPlanner.empty.desc")}
                </p>
              </div>
              <Button
                size="lg"
                onClick={generatePlan}
                className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 mt-4"
              >
                <Sparkles className="h-4 w-4 me-2" />
                {t("studyPlanner.buttons.generate")}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="px-2 space-y-10 md:space-y-16">
          {/* Desktop Grid / Mobile List - Truly Adaptive */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-6 md:gap-4 items-start">
            <AnimatePresence mode="popLayout">
              {DAYS.map((day, dayIndex) => (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: dayIndex * 0.05 }}
                  className="space-y-4 md:space-y-6"
                >
                  <div className="flex items-center gap-3 md:justify-center px-4">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/5">
                      <span className="text-[10px] font-black">{day[0]}</span>
                    </div>
                    <h3 className="font-black text-sm uppercase tracking-[0.2em] text-muted-foreground/60">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {t(`days.${day.substring(0, 3)}` as any)}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {TIME_SLOTS.map((slot) => {
                      const block = getBlock(day, slot);
                      const isCompleted = completedBlocks[`${day}-${slot}`];

                      return (
                        <Card
                          key={slot}
                          className={cn(
                            "group relative overflow-hidden transition-all duration-500 border border-border/40 shadow-sm rounded-[1.5rem] md:rounded-4xl bg-card/50 backdrop-blur-3xl cursor-default",
                            block
                              ? "min-h-[12rem] hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20"
                              : "h-24 opacity-30 bg-muted/10 border-dashed",
                            isCompleted &&
                              "bg-primary/3 border-primary/20 shadow-none grayscale-[0.5]"
                          )}
                        >
                          {block ? (
                            <CardContent className="p-5 md:p-6 flex flex-col h-full space-y-4">
                              <div className="flex justify-between items-start">
                                <Badge
                                  variant="ai"
                                  className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm"
                                >
                                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                  {t(`studyPlanner.slots.${slot.toLowerCase()}` as any)}
                                </Badge>
                                <button
                                  onClick={() => toggleComplete(day, slot)}
                                  className={cn(
                                    "size-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm",
                                    isCompleted
                                      ? "bg-primary text-primary-foreground shadow-lg scale-110"
                                      : "bg-muted/50 text-muted-foreground hover:bg-primary hover:text-white"
                                  )}
                                >
                                  <CheckCircle2 className="h-5 w-5" />
                                </button>
                              </div>

                              <p
                                className={cn(
                                  "text-sm md:text-base font-black leading-relaxed flex-grow text-start transition-all duration-500",
                                  isCompleted
                                    ? "opacity-40 line-through decoration-primary/30"
                                    : "text-foreground group-hover:text-primary"
                                )}
                              >
                                {block.task}
                              </p>

                              <div className="pt-4 border-t border-border/40 flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                  <div className="p-1.5 rounded-lg bg-primary/5 text-primary">
                                    <Clock className="h-3.5 w-3.5" />
                                  </div>
                                  {block.duration}
                                </div>

                                {block.assignmentId && (
                                  <Link
                                    to={`/assignments/show/${block.assignmentId}`}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:underline group/link"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
                                    {t("assignments.show.assignmentDetails")}
                                  </Link>
                                )}
                              </div>

                              {/* Visual Completion Stamp */}
                              <AnimatePresence>
                                {isCompleted && (
                                  <motion.div
                                    initial={{
                                      scale: 0.5,
                                      opacity: 0,
                                      rotate: -45,
                                    }}
                                    animate={{
                                      scale: 1,
                                      opacity: 1,
                                      rotate: 0,
                                    }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                    className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                  >
                                    <div className="p-4 rounded-full bg-background/80 backdrop-blur-md shadow-2xl border border-primary/20 text-primary opacity-20">
                                      <CheckCircle2 className="h-16 w-16" />
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </CardContent>
                          ) : (
                            <CardContent className="p-5 flex items-center justify-center h-full">
                              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/20">
                                {t("studyPlanner.labels.free")}
                              </span>
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* AI Coach Tip Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <Card className="border-border/40 shadow-2xl rounded-[2.5rem] md:rounded-[3rem] bg-indigo-500/3 backdrop-blur-3xl max-w-3xl w-full overflow-hidden border-2 border-dashed">
              <CardHeader className="p-8 md:p-10 pb-4 border-b border-indigo-500/10 text-start bg-indigo-500/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 shadow-sm">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <CardTitle className="text-xl md:text-2xl font-black tracking-tight leading-none">
                      {t("studyPlanner.labels.coachTip")}
                    </CardTitle>
                    <span className="text-[10px] font-bold text-indigo-600/60 uppercase tracking-[0.2em] mt-1.5">
                      Learning Strategies
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 md:p-10 text-start">
                <div className="flex gap-6 items-start">
                  <div className="p-2.5 rounded-xl bg-indigo-500/5 text-indigo-400 h-fit shrink-0 mt-1">
                    <Info className="h-5 w-5" />
                  </div>
                  <p className="text-base md:text-xl font-medium text-muted-foreground leading-relaxed italic selection:bg-indigo-500/20">
                    "{t("studyPlanner.labels.tipText")}"
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StudyPlanner;
