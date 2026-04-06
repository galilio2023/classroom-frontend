import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  GraduationCap,
  LayoutGrid,
  Loader2,
  MessageSquare,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { connectSocket, socket } from "@/lib/socket";
import { AnimatePresence, motion } from "framer-motion";
import { AIFeatureDisabled } from "../../ai/ai-feature-disabled";
import { useAiAccess } from "@/hooks/use-ai-access";
import { useJobs } from "@/contexts/job-context";
import { toast } from "sonner";
import {
  useApiUrl,
  useCustomMutation,
  useGetIdentity,
  useInvalidate,
  useList,
} from "@refinedev/core";
import { Class, User } from "@/types";
import { useTerm } from "@/contexts/term-context";
import { cn } from "@/lib/utils";

export type MagicBuilderLevel = "primary" | "high_school" | "university";
export type MagicBuilderTone = "academic" | "creative" | "practical";

export interface MagicBuilderConfig {
  topic: string;
  subject?: string;
  type: "package" | "note" | "quiz" | "assignment";
  level: MagicBuilderLevel;
  tone: MagicBuilderTone;
  objectives: string;
  moduleId: number | null;
}

interface MagicBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialConfig?: Partial<MagicBuilderConfig>;
  initialClassId?: string;
  // If onGenerate is NOT provided, the dialog will handle its own mutation
  onGenerate?: (config: MagicBuilderConfig, classId: string) => void;
  isGenerating?: boolean;
}

export const MagicBuilderDialog = ({
  open,
  onOpenChange,
  initialConfig,
  initialClassId,
  onGenerate,
  isGenerating: externalIsGenerating,
}: MagicBuilderDialogProps) => {
  const { t } = useTranslation();
  const { isAiEnabled, isAllowed } = useAiAccess();
  const { jobs, addJob, updateJob, removeJob } = useJobs();
  const apiUrl = useApiUrl();
  const invalidate = useInvalidate();
  const { selectedTerm } = useTerm();

  const { mutate } = useCustomMutation();

  const [config, setConfig] = useState<MagicBuilderConfig>({
    topic: "",
    subject: "",
    type: "package",
    level: "high_school",
    tone: "academic",
    objectives: "",
    moduleId: null,
    ...initialConfig,
  });

  const [classId, setClassId] = useState(initialClassId || "");
  const [internalIsGenerating, setInternalIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  const isGenerating = externalIsGenerating ?? internalIsGenerating;

  // --- JOB PERSISTENCE ---
  const activeJob = useMemo(() => {
    return jobs.find(
      (j) =>
        j.type === "magic-builder" &&
        j.metadata?.classId === Number(classId) &&
        j.status === "processing"
    );
  }, [jobs, classId]);

  useEffect(() => {
    if (activeJob && open) {
      setInternalIsGenerating(true);
      setProgress(activeJob.metadata?.progress || 0);
      setStep(activeJob.metadata?.step || "");
    }
  }, [activeJob, open]);

  // Fetch classes if no initialClassId is provided
  // 🛡️ FEATURE GATING: Only fetch if AI is enabled and dialog is open
  const { query } = useList<Class>({
    resource: "classes",
    filters: selectedTerm ? [{ field: "termId", operator: "eq", value: selectedTerm.id }] : [],
    pagination: { mode: "off" },
    queryOptions: { enabled: !initialClassId && open && isAiEnabled },
  });

  const classes = query.data?.data || [];
  const isLoadingClasses = query.isLoading;

  useEffect(() => {
    if ((isGenerating || activeJob) && open && isAiEnabled) {
      void connectSocket();

      const handleProgress = (data: { step: string; progress: number; classId: number }) => {
        if (data.classId === Number(classId)) {
          setStep(data.step);
          setProgress(data.progress);

          // Update global job state
          const jobId = `magic-builder-${data.classId}`;
          updateJob(jobId, {
            metadata: {
              ...activeJob?.metadata,
              progress: data.progress,
              step: data.step,
              classId: data.classId,
            },
          });

          if (data.progress === 100) {
            setInternalIsGenerating(false);
            setIsCompleted(true);
            updateJob(jobId, { status: "completed" });

            // 🛠️ REFINE METADATA: Invalidate list AND specific class detail
            void invalidate({ resource: "modules", invalidates: ["list"] });
            void invalidate({ resource: "classes", id: data.classId, invalidates: ["detail"] });

            toast.success(t("classes.magicBuilder.success"));
          }
        }
      };

      socket.on("magic_builder_progress", handleProgress);
      return () => {
        socket.off("magic_builder_progress", handleProgress);
      };
    }
  }, [isGenerating, open, classId, isAiEnabled, updateJob, activeJob, invalidate, t]);

  // 🛡️ PARENT GATING: AI interactive features are disabled for Parents
  if (!isAllowed) return null;

  const handleStart = async () => {
    const cleanTopic = config.topic.trim();
    if (!cleanTopic || !classId) {
      toast.error(t("common.errors.fillRequired"));
      return;
    }
    if (cleanTopic.length < 3) {
      toast.error(t("classes.magicBuilder.errors.topicTooShort"));
      return;
    }

    if (onGenerate) {
      onGenerate(config, classId);
    } else {
      // Internal mutation flow (Show Page usage)
      setInternalIsGenerating(true);
      setProgress(0);
      const initialStep = t("common.starting");
      setStep(initialStep);
      setIsCompleted(false);

      const jobId = `magic-builder-${classId}`;
      addJob({
        id: jobId,
        type: "magic-builder",
        title: `${config.subject || "Curriculum"}: ${cleanTopic}`,
        metadata: { classId: Number(classId), progress: 0, step: initialStep },
      });

      // Refactored to use useCustomMutation
      mutate(
        {
          url: `${apiUrl}/ai/magic-builder`,
          method: "post",
          values: {
            classId: Number(classId),
            ...config,
          },
        },
        {
          onError: (error) => {
            console.error("AI Magic Builder failed:", error);
            toast.error(t("common.errors.aiFailed"));
            setInternalIsGenerating(false);
            updateJob(jobId, { status: "failed" });
          },
        }
      );
    }
  };

  const reset = () => {
    if (!activeJob) {
      setProgress(0);
      setStep("");
      setIsCompleted(false);
      setInternalIsGenerating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) reset();
      }}
    >
      <DialogContent className="sm:max-w-125 border-none shadow-2xl bg-background/95 backdrop-blur-xl p-0 overflow-hidden">
        {!isAiEnabled ? (
          <div className="p-8 flex flex-col items-center">
            <AIFeatureDisabled
              title="Magic Builder Offline"
              description="Curriculum generation is currently disabled. Please contact your administrator."
            />
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="mt-6 rounded-xl font-bold"
            >
              {t("buttons.close")}
            </Button>
          </div>
        ) : (
          <div className="p-8 space-y-6">
            <DialogHeader className="space-y-3 text-start">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-ai-primary/10 text-ai-primary shadow-sm border border-ai-primary/5">
                  <Zap className="h-6 w-6 fill-ai-primary/10" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                    {t("classes.magicBuilder.title")}
                    <span className="px-2 py-0.5 rounded-full bg-ai-primary/20 text-ai-primary border-none text-[10px] font-black tracking-tighter uppercase">
                      Flash 3.0
                    </span>
                  </DialogTitle>
                  <DialogDescription className="font-bold text-muted-foreground/80">
                    {t("classes.magicBuilder.description")}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <AnimatePresence mode="wait">
              {isGenerating || activeJob ? (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="py-10 flex flex-col items-center justify-center space-y-8"
                >
                  <div className="relative">
                    <div
                      className={cn(
                        "absolute inset-0 blur-3xl rounded-full animate-pulse transition-colors duration-1000",
                        isCompleted ? "bg-emerald-500/20" : "bg-ai-primary/20"
                      )}
                    />
                    <div className="relative bg-background rounded-3xl p-6 shadow-2xl border border-border/50">
                      {isCompleted ? (
                        <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-in zoom-in duration-500" />
                      ) : (
                        <div className="relative">
                          <Loader2 className="h-16 w-16 text-ai-primary animate-spin opacity-20" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BrainCircuit className="h-8 w-8 text-ai-primary animate-pulse" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-full space-y-4">
                    <div className="flex justify-between items-end px-1">
                      <div className="space-y-1">
                        <p
                          className={cn(
                            "text-[10px] font-black uppercase tracking-widest transition-colors",
                            isCompleted ? "text-emerald-500" : "text-ai-primary"
                          )}
                        >
                          {isCompleted ? (t("common.completed") as string) : step}
                        </p>
                        {!isCompleted && (
                          <p className="text-[9px] font-bold text-muted-foreground animate-pulse">
                            {t("classes.magicBuilder.wait")}
                          </p>
                        )}
                      </div>
                      <p className="text-sm font-black text-foreground">{progress}%</p>
                    </div>
                    <Progress
                      value={progress}
                      className="h-3 rounded-full bg-muted shadow-inner"
                      indicatorClassName={cn(
                        "transition-all duration-500",
                        isCompleted
                          ? "bg-emerald-500"
                          : "bg-ai-primary shadow-[0_0_15px_hsla(var(--ai-primary-hsl),0.5)]"
                      )}
                    />
                  </div>
                </motion.div>
              ) : isCompleted ? (
                <motion.div
                  key="completed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-10 flex flex-col items-center text-center space-y-6"
                >
                  <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="h-12 w-12" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black">{t("classes.magicBuilder.readyTitle")}</h4>
                    <p className="text-sm text-muted-foreground font-medium">
                      {t("classes.magicBuilder.readyDesc")}
                    </p>
                  </div>
                  {/* 👤 HUMAN-IN-THE-LOOP: This satisfies the requirement to review suggestions */}
                  <Button
                    onClick={() => {
                      onOpenChange(false);
                      removeJob(`magic-builder-${classId}`);
                    }}
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20"
                  >
                    <BookOpen className="h-4 w-4 me-2" />
                    {t("buttons.exploreCurriculum", "Review Suggestions")}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-5"
                >
                  {!initialClassId && (
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                        {t("classes.magicBuilder.targetClass")}
                      </Label>
                      <Select value={classId} onValueChange={setClassId}>
                        <SelectTrigger className="h-14 rounded-2xl border-none bg-muted/50 shadow-inner font-bold">
                          <SelectValue
                            placeholder={
                              isLoadingClasses
                                ? (t("common.loading") as string)
                                : (t("classes.magicBuilder.selectPlaceholder") as string)
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl">
                          {classes.map((c: Class) => (
                            <SelectItem
                              key={c.id}
                              value={c.id.toString()}
                              className="rounded-xl py-3 font-bold"
                            >
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                        {t("classes.magicBuilder.subjectArea")}
                      </Label>
                      <div className="relative group">
                        <LayoutGrid className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-ai-primary transition-colors" />
                        <Input
                          placeholder={t("classes.magicBuilder.subjectPlaceholder") as string}
                          value={config.subject}
                          onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                          className="ps-11 h-14 rounded-2xl border-none bg-muted/50 shadow-inner font-bold"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                        {t("aiHub.assistant.helper.level")}
                      </Label>
                      <Select
                        value={config.level}
                        onValueChange={(v: MagicBuilderLevel) => setConfig({ ...config, level: v })}
                      >
                        <SelectTrigger className="h-14 rounded-2xl border-none bg-muted/50 shadow-inner font-bold">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-primary" />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-xl">
                          <SelectItem value="primary">
                            {t("aiHub.assistant.helper.levels.beginner")}
                          </SelectItem>
                          <SelectItem value="high_school">
                            {t("aiHub.assistant.helper.levels.intermediate")}
                          </SelectItem>
                          <SelectItem value="university">
                            {t("aiHub.assistant.helper.levels.advanced")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                      {t("classes.magicBuilder.topicLabel")}
                    </Label>
                    <div className="relative group">
                      <Sparkles className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-ai-primary transition-colors" />
                      <Input
                        placeholder={t("classes.magicBuilder.topicPlaceholder") as string}
                        value={config.topic}
                        onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                        className="ps-11 h-14 rounded-2xl border-none bg-muted/50 shadow-inner font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                        {t("classes.resource.addDialog.fieldType")}
                      </Label>
                      <Select
                        value={config.type}
                        onValueChange={(v: any) => setConfig({ ...config, type: v })}
                      >
                        <SelectTrigger className="h-14 rounded-2xl border-none bg-muted/50 shadow-inner font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-xl">
                          <SelectItem value="package">{t("aiHub.assistant.architect")}</SelectItem>
                          <SelectItem value="note">
                            {t("classes.resource.addDialog.types.note")}
                          </SelectItem>
                          <SelectItem value="quiz">{t("classes.show.tabs.quizzes")}</SelectItem>
                          <SelectItem value="assignment">
                            {t("classes.show.tabs.assignments")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                        {t("aiHub.assistant.helper.tone")}
                      </Label>
                      <Select
                        value={config.tone}
                        onValueChange={(v: MagicBuilderTone) => setConfig({ ...config, tone: v })}
                      >
                        <SelectTrigger className="h-14 rounded-2xl border-none bg-muted/50 shadow-inner font-bold">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-xl">
                          <SelectItem value="academic">
                            {t("aiHub.assistant.helper.tones.academic")}
                          </SelectItem>
                          <SelectItem value="creative">
                            {t("aiHub.assistant.helper.tones.creative")}
                          </SelectItem>
                          <SelectItem value="practical">
                            {t("aiHub.assistant.helper.tones.practical")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
                      <Target className="h-3.5 w-3.5 text-primary" />
                      {t("aiHub.assistant.helper.objectives")}
                    </Label>
                    <Textarea
                      placeholder={t("aiHub.assistant.helper.placeholders.objectives")}
                      value={config.objectives}
                      onChange={(e) => setConfig({ ...config, objectives: e.target.value })}
                      className="resize-none h-20 rounded-2xl border-none bg-muted/50 shadow-inner font-bold text-xs"
                    />
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button
                      disabled={!config.topic || !classId || isGenerating}
                      onClick={handleStart}
                      className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 bg-ai-primary hover:bg-ai-primary/90 shadow-xl shadow-ai-primary/20 transition-all hover:scale-105 active:scale-95 group"
                    >
                      <Zap className="h-5 w-5 animate-pulse group-hover:rotate-12 transition-transform" />
                      {t("buttons.generateWithGemini", "Generate with Gemini")}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => onOpenChange(false)}
                      className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] text-muted-foreground"
                    >
                      {t("buttons.cancel")}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
