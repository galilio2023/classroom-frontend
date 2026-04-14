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
  // //   LayoutGrid,
  Loader2,
  MessageSquare,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { GetListResponse, HttpError } from "@refinedev/core";
import { UseQueryResult } from "@tanstack/react-query";
import { Class } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import {} from "@/features/ai/components/ai-feature-disabled";
import { AiFeatureGuard } from "@/features/ai/components/AiFeatureGuard";
import { useAiAccess } from "@/features/ai/hooks/use-ai-access";
import { useJobs } from "@/contexts/job-context";
import { cn } from "@/lib/utils";
import {
  useMagicBuilder,
  MagicBuilderConfig,
  MagicBuilderLevel,
  MagicBuilderTone,
} from "@/features/ai/hooks/use-magic-builder";

interface MagicBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialConfig?: Partial<MagicBuilderConfig>;
  initialClassId?: string;
  onGenerate?: (config: MagicBuilderConfig, classId: string) => void;
  isGenerating?: boolean;
}

/**
 * 🛠️ SUB-COMPONENT: Progress View
 */
const MagicBuilderProgress = ({
  isCompleted,
  step,
  progress,
}: {
  isCompleted: boolean;
  step: string;
  progress: number;
}) => {
  const { t } = useTranslation();
  const safeProgress = Number.isNaN(progress) ? 0 : Math.max(0, Math.min(100, progress));

  return (
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
          <div className="space-y-1" aria-live="polite">
            <p
              className={cn(
                "text-[10px] font-black uppercase tracking-widest transition-colors",
                isCompleted ? "text-emerald-500" : "text-ai-primary"
              )}
            >
              {isCompleted ? t("common.completed") : step}
            </p>
            {!isCompleted && (
              <p className="text-[9px] font-bold text-muted-foreground animate-pulse">
                {t("classes.magicBuilder.wait")}
              </p>
            )}
          </div>
          <p className="text-sm font-black text-foreground">{Math.round(safeProgress)}%</p>
        </div>
        <Progress
          value={safeProgress}
          aria-label={t("classes.magicBuilder.progress", "Generation Progress") as string}
          aria-valuenow={safeProgress}
          aria-valuemin={0}
          aria-valuemax={100}
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
  );
};

/**
 * 🛠️ SUB-COMPONENT: Ready/Completed View
 */
const MagicBuilderReady = ({ onReview }: { onReview: () => void }) => {
  const { t } = useTranslation();
  return (
    <motion.div
      key="completed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-10 flex flex-col items-center text-center space-y-6"
      aria-live="polite"
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
      <Button
        onClick={onReview}
        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20"
      >
        <BookOpen className="h-4 w-4 me-2" />
        {t("buttons.exploreCurriculum", "Review Suggestions")}
      </Button>
    </motion.div>
  );
};

/**
 * 🛠️ SUB-COMPONENT: Configuration Form View
 */
const MagicBuilderForm = ({
  config,
  setConfig,
  classId,
  setClassId,
  classOptions,
  classQuery,
  initialClassId,
  isGenerating,
  handleStart,
  onCancel,
}: {
  config: MagicBuilderConfig;
  setConfig: (c: MagicBuilderConfig) => void;
  classId: string;
  setClassId: (id: string) => void;
  classOptions: { label: string; value: string }[];
  classQuery: UseQueryResult<GetListResponse<Class>, HttpError>;
  initialClassId?: string;
  isGenerating: boolean;
  handleStart: () => void;
  onCancel: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {!initialClassId && (
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <Label
              htmlFor="target-class"
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
            >
              {t("classes.magicBuilder.targetClass")}
            </Label>
            {classQuery.isError && (
              <Button
                variant="link"
                size="sm"
                onClick={() => void classQuery.refetch()}
                className="h-auto p-0 text-[10px] font-black uppercase text-destructive hover:text-destructive/80"
              >
                {t("buttons.tryAgain", "Retry")}
              </Button>
            )}
          </div>
          <Select value={classId?.toString() || ""} onValueChange={setClassId}>
            <SelectTrigger
              id="target-class"
              disabled={classQuery.isLoading}
              className={cn(
                "h-14 rounded-2xl border-none bg-muted/50 shadow-inner font-bold",
                classQuery.isError && "ring-2 ring-destructive/20"
              )}
            >
              <div className="flex items-center gap-2">
                {classQuery.isLoading && (
                  <Loader2 className="h-3 w-3 animate-spin text-ai-primary" />
                )}
                <SelectValue
                  placeholder={
                    classQuery.isLoading
                      ? (t("common.loading") as string)
                      : classQuery.isError
                        ? (t("common.errors.loadingFailed", "Failed to load classes") as string)
                        : (t("classes.magicBuilder.selectPlaceholder") as string)
                  }
                />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl">
              {classOptions.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value.toString()}
                  className="rounded-xl py-3 font-bold"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="subject-area"
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1"
          >
            {t("classes.magicBuilder.subjectArea")}
          </Label>
          <div className="relative group">
            <BookOpen className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-ai-primary transition-colors" />
            <Input
              id="subject-area"
              placeholder={t("classes.magicBuilder.subjectPlaceholder") as string}
              value={config.subject}
              onChange={(e) => setConfig({ ...config, subject: e.target.value })}
              className="ps-11 h-14 rounded-2xl border-none bg-muted/50 shadow-inner font-bold"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="target-level"
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1"
          >
            {t("aiHub.assistant.helper.level")}
          </Label>
          <Select
            value={config.level}
            onValueChange={(v: MagicBuilderLevel) => setConfig({ ...config, level: v })}
          >
            <SelectTrigger
              id="target-level"
              className="h-14 rounded-2xl border-none bg-muted/50 shadow-inner font-bold"
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-xl">
              <SelectItem value="primary">{t("aiHub.assistant.helper.levels.beginner")}</SelectItem>
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
        <Label
          htmlFor="core-topic"
          className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1"
        >
          {t("classes.magicBuilder.topicLabel")}
        </Label>
        <div className="relative group">
          <Sparkles className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-ai-primary transition-colors" />
          <Input
            id="core-topic"
            placeholder={t("classes.magicBuilder.topicPlaceholder") as string}
            value={config.topic}
            onChange={(e) => setConfig({ ...config, topic: e.target.value })}
            className="ps-11 h-14 rounded-2xl border-none bg-muted/50 shadow-inner font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="resource-type"
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1"
          >
            {t("classes.resource.addDialog.fieldType")}
          </Label>
          <Select
            value={config.type}
            onValueChange={(v: MagicBuilderConfig["type"]) => setConfig({ ...config, type: v })}
          >
            <SelectTrigger
              id="resource-type"
              className="h-14 rounded-2xl border-none bg-muted/50 shadow-inner font-bold"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-xl">
              <SelectItem value="package">{t("aiHub.assistant.architect")}</SelectItem>
              <SelectItem value="note">{t("classes.resource.addDialog.types.note")}</SelectItem>
              <SelectItem value="quiz">{t("classes.show.tabs.quizzes")}</SelectItem>
              <SelectItem value="assignment">{t("classes.show.tabs.assignments")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="assistant-tone"
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1"
          >
            {t("aiHub.assistant.helper.tone")}
          </Label>
          <Select
            value={config.tone}
            onValueChange={(v: MagicBuilderTone) => setConfig({ ...config, tone: v })}
          >
            <SelectTrigger
              id="assistant-tone"
              className="h-14 rounded-2xl border-none bg-muted/50 shadow-inner font-bold"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-xl">
              <SelectItem value="academic">{t("aiHub.assistant.helper.tones.academic")}</SelectItem>
              <SelectItem value="creative">{t("aiHub.assistant.helper.tones.creative")}</SelectItem>
              <SelectItem value="practical">
                {t("aiHub.assistant.helper.tones.practical")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="objectives"
          className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2"
        >
          <Target className="h-3.5 w-3.5 text-primary" />
          {t("aiHub.assistant.helper.objectives")}
        </Label>
        <Textarea
          id="objectives"
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
          onClick={onCancel}
          className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] text-muted-foreground"
        >
          {t("buttons.cancel")}
        </Button>
      </div>
    </motion.div>
  );
};

export const MagicBuilderDialog = ({
  open,
  onOpenChange,
  initialConfig,
  initialClassId,
  onGenerate,
  isGenerating: externalIsGenerating,
}: MagicBuilderDialogProps) => {
  const { t } = useTranslation();
  const { isAiEnabled } = useAiAccess();
  const { removeJob } = useJobs();

  const {
    config,
    setConfig,
    classId,
    setClassId,
    classOptions,
    classQuery,
    isGenerating,
    isCompleted,
    progress,
    step,
    jobId,
    handleStart,
    reset,
  } = useMagicBuilder({
    open,
    initialConfig,
    initialClassId,
    onGenerate,
    externalIsGenerating,
  });

  /**
   * 🛡️ UX POLISH: Determine the current view based on job status and loading state
   */
  const renderContent = () => {
    if (isGenerating) {
      return <MagicBuilderProgress isCompleted={isCompleted} step={step} progress={progress} />;
    }

    if (isCompleted) {
      return (
        <MagicBuilderReady
          onReview={() => {
            onOpenChange(false);
            removeJob(jobId);
          }}
        />
      );
    }

    return (
      <MagicBuilderForm
        config={config}
        setConfig={setConfig}
        classId={classId}
        setClassId={setClassId}
        classOptions={classOptions}
        classQuery={classQuery}
        initialClassId={initialClassId}
        isGenerating={isGenerating}
        handleStart={handleStart}
        onCancel={() => onOpenChange(false)}
      />
    );
  };

  return (
    <AiFeatureGuard>
      <Dialog
        open={open}
        onOpenChange={(val) => {
          onOpenChange(val);
          if (!val && !isGenerating) reset();
        }}
      >
        <DialogContent
          aria-busy={isGenerating}
          className="sm:max-w-125 min-h-[500px] border-none shadow-2xl bg-background/95 backdrop-blur-xl p-0 overflow-hidden"
        >
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
                      {t("classes.magicBuilder.version")}
                    </span>
                  </DialogTitle>
                  <DialogDescription className="font-bold text-muted-foreground/80">
                    {t("classes.magicBuilder.description")}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </AiFeatureGuard>
  );
};
