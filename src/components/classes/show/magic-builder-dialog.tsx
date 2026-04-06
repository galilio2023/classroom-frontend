import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, CheckCircle2, Wand2, BrainCircuit, LayoutGrid } from "lucide-react";
import {
  useApiUrl,
  useInvalidate,
  useGetIdentity,
  useCustomMutation,
  useList,
  HttpError,
} from "@refinedev/core";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { socket, connectSocket } from "@/lib/socket";
import { User, Class } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTerm } from "@/contexts/term-context";
import { AiFeatureGuard } from "../../ai/AiFeatureGuard";
import { useJobs } from "@/contexts/job-context";

interface MagicBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialClassId?: string;
}

export const MagicBuilderDialog = ({
  open,
  onOpenChange,
  initialClassId,
}: MagicBuilderDialogProps) => {
  const { t } = useTranslation();
  const apiUrl = useApiUrl();
  const invalidate = useInvalidate();
  const { data: identity } = useGetIdentity<User>();
  const { selectedTerm } = useTerm();
  const { jobs, addJob, updateJob, removeJob } = useJobs();

  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [classId, setClassId] = useState(initialClassId || "");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  // --- JOB PERSISTENCE ---
  // Look for an existing job for this class
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
      setLoading(true);
      setProgress(activeJob.metadata?.progress || 0);
      setStep(activeJob.metadata?.step || "");
    }
  }, [activeJob, open]);

  // Fetch classes if no initialClassId is provided
  const { query } = useList<Class>({
    resource: "classes",
    filters: selectedTerm ? [{ field: "termId", operator: "eq", value: selectedTerm.id }] : [],
    pagination: { mode: "off" },
    queryOptions: { enabled: !initialClassId && open },
  });

  const classes = query.data?.data || [];
  const isLoadingClasses = query.isLoading;

  // --- REAL-TIME UPDATES ---
  useEffect(() => {
    if (!open || !identity?.id) return;

    void connectSocket();

    const handleProgress = (data: { step: string; progress: number; classId: number }) => {
      // 🛡️ SECURITY: Verify that this progress event is for the class we are currently building.
      if (Number(classId) !== data.classId) return;

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
        setLoading(false);
        setIsCompleted(true);
        updateJob(jobId, { status: "completed" });
        toast.success(t("classes.magicBuilder.success", "Curriculum generated successfully!"));
        invalidate({ resource: "modules", invalidates: ["list"] });
        invalidate({ resource: "classes", id: data.classId, invalidates: ["detail"] });
      }
    };

    socket.on("magic_builder_progress", handleProgress);

    return () => {
      socket.off("magic_builder_progress", handleProgress);
    };
  }, [open, identity?.id, t, invalidate, classId, updateJob, activeJob?.metadata]);

  const { mutate: startMagicBuilder } = useCustomMutation();

  const handleStart = async () => {
    // 🛡️ INPUT VALIDATION
    const cleanTopic = topic.trim();
    const cleanSubject = subject.trim();

    if (!cleanTopic || !cleanSubject || !classId) {
      toast.error(t("common.errors.fillRequired", "Please fill all required fields."));
      return;
    }

    if (cleanTopic.length < 3) {
      toast.error(
        t("classes.magicBuilder.errors.topicTooShort", "Topic must be at least 3 characters.")
      );
      return;
    }

    setLoading(true);
    setProgress(0);
    const initialStep = t("common.starting", "Starting AI engine...");
    setStep(initialStep);
    setIsCompleted(false);

    const jobId = `magic-builder-${classId}`;
    addJob({
      id: jobId,
      type: "magic-builder",
      title: `${cleanSubject}: ${cleanTopic}`,
      metadata: { classId: Number(classId), progress: 0, step: initialStep },
    });

    startMagicBuilder(
      {
        url: `${apiUrl}/ai/magic-builder`,
        method: "post",
        values: {
          classId: Number(classId),
          topic: cleanTopic,
          subject: cleanSubject,
        },
      },
      {
        onSuccess: () => {
          // Progress is handled via sockets
        },
        onError: (error: HttpError) => {
          const message = error.message || t("common.errors.aiFailed", "AI Generation failed.");
          toast.error(message);
          setLoading(false);
          updateJob(jobId, { status: "failed" });
        },
      }
    );
  };

  const reset = () => {
    setTopic("");
    setSubject("");
    setStep("");
    setProgress(0);
    setLoading(false);
    setIsCompleted(false);
    if (!initialClassId) setClassId("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        // Only reset if NOT building or if completed
        if (!val && (!loading || isCompleted)) {
          reset();
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px] rounded-4xl border-none shadow-2xl p-0 overflow-hidden bg-card/95 backdrop-blur-2xl">
        <AiFeatureGuard silent>
          <div className="p-8 space-y-6">
            <DialogHeader className="space-y-3 text-start">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-ai-primary/10 text-ai-primary shadow-sm border border-ai-primary/5">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                    {t("classes.magicBuilder.title", "AI Magic Builder")}
                    <Badge className="bg-ai-primary/20 text-ai-primary border-none text-[10px] font-black tracking-tighter uppercase">
                      Flash 3.0
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="font-bold text-muted-foreground/80">
                    {t(
                      "classes.magicBuilder.description",
                      "Let Gemini build your entire curriculum structure from a single topic."
                    )}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {loading || isCompleted ? (
              <div className="py-10 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500">
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
                        {isCompleted ? (t("common.completed" as any) as string) : step}
                      </p>
                      {!isCompleted && (
                        <p className="text-[9px] font-bold text-muted-foreground animate-pulse">
                          {t("classes.magicBuilder.wait", " Gemini is thinking and structuring...")}
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
                        : "bg-ai-primary shadow-[0_0_15px_rgba(var(--ai-primary),0.5)]"
                    )}
                  />
                </div>

                {isCompleted && (
                  <Button
                    onClick={() => {
                      onOpenChange(false);
                      removeJob(`magic-builder-${classId}`);
                    }}
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="h-4 w-4 me-2" />
                    {t("buttons.exploreCurriculum", "Explore Curriculum")}
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                {!initialClassId && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                      {t("classes.magicBuilder.targetClass", "Target Class")}
                    </label>
                    <Select value={classId} onValueChange={setClassId}>
                      <SelectTrigger className="h-14 rounded-2xl border-none bg-muted/50 shadow-inner font-bold">
                        <SelectValue
                          placeholder={
                            isLoadingClasses
                              ? (t("common.loading" as any) as string)
                              : (t(
                                  "classes.magicBuilder.selectPlaceholder",
                                  "Select a class..."
                                ) as string)
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

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                    {t("classes.magicBuilder.subjectArea", "Subject Area")}
                  </label>
                  <div className="relative group">
                    <LayoutGrid className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-ai-primary transition-colors" />
                    <Input
                      placeholder={
                        t(
                          "classes.magicBuilder.subjectPlaceholder",
                          "e.g. Physics, History, Math"
                        ) as string
                      }
                      className="ps-11 h-14 rounded-2xl border-none bg-muted/50 shadow-inner font-bold"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                    {t("classes.magicBuilder.topicLabel", "Core Topic / Unit Name")}
                  </label>
                  <div className="relative group">
                    <Wand2 className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-ai-primary transition-colors" />
                    <Input
                      placeholder={
                        t(
                          "classes.magicBuilder.topicPlaceholder",
                          "e.g. Quantum Mechanics, World War II"
                        ) as string
                      }
                      className="ps-11 h-14 rounded-2xl border-none bg-muted/50 shadow-inner font-bold"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <Button
                    disabled={!topic || !subject || !classId}
                    onClick={handleStart}
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 bg-ai-primary hover:bg-ai-primary/90 shadow-xl shadow-ai-primary/20 transition-all hover:scale-105 active:scale-95 group"
                  >
                    <Sparkles className="h-5 w-5 animate-pulse group-hover:rotate-12 transition-transform" />
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
              </div>
            )}
          </div>
        </AiFeatureGuard>
      </DialogContent>
    </Dialog>
  );
};

const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", className)}>
    {children}
  </span>
);
