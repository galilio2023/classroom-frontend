import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useUpdate, HttpError, useCustom } from "@refinedev/core";
import { Submission, Assignment } from "@/types";
import { useEffect, useState, useMemo } from "react";
import { Sparkles, Loader2, Check, Dna, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingButton } from "@/components/ui/loading-button";
import { SubmitHandler } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { toast } from "sonner";
import { useUserRole } from "@/features/users/hooks/use-user-role";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatGrade } from "@/lib/numeric";

// --- NEW IMPORTS ---
import { useGradingAutomation } from "../hooks/use-grading-automation";
import { GradingTopBar } from "../components/grading-top-bar";
import { GradingStudentWork } from "../components/grading-student-work";

const gradingSchema = (t: TFunction) =>
  z.object({
    grade: z.coerce
      .number()
      .min(0, t("assignments.grading.validation.min"))
      .max(100, t("assignments.grading.validation.max")),
    feedback: z.string().optional(),
    requiresResubmission: z.boolean().default(false),
    teacherPrivateNotes: z.string().optional(),
    aiApprovalStatus: z.string().optional(),
    version: z.number(), // 🛡️ ENFORCED: Support optimistic locking
  });

type GradingFormValues = z.infer<ReturnType<typeof gradingSchema>>;

interface GradingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  submission: (Submission & { assignment?: Assignment }) | null;
  submissions?: Submission[]; // For navigation
  onNavigate?: (submission: Submission) => void;
  readOnly?: boolean;
}

export const GradingDialog = ({
  isOpen,
  onOpenChange,
  submission,
  submissions = [],
  onNavigate,
  readOnly = false,
}: GradingDialogProps) => {
  const { t, i18n } = useTranslation();
  const { width, height } = useWindowSize();
  const { isStaff: _isStaff } = useUserRole();
  const isStaff = _isStaff && !readOnly;
  const isAr = i18n.language === "ar";

  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAiAudit, setShowAiAudit] = useState(false);
  const [hasReasoningBeenOpened, setHasReasoningBeenOpened] = useState(false);

  // 🛡️ TEACHER SHIELD STATE
  const [shieldCountdown, setShieldCountdown] = useState(0);
  const [originalAiFeedback, setOriginalAiFeedback] = useState<string | null>(null);

  const form = useForm<GradingFormValues>({
    resolver: zodResolver(gradingSchema(t)) as any,
    defaultValues: {
      grade: submission?.grade ?? 0,
      feedback: submission?.feedback ?? "",
      requiresResubmission: submission?.requiresResubmission ?? false,
      teacherPrivateNotes: submission?.teacherPrivateNotes ?? "",
      version: submission?.version,
    },
  });

  const { handleSubmit, control, setValue, reset } = form;

  // Watch feedback for the "10% edit" rule
  const watchedFeedback = useWatch({ control, name: "feedback" }) || "";

  // --- AI AUTOMATION HOOK ---
  const { isAISuggested, isAILoading } = useGradingAutomation({
    submission,
    isOpen,
    isStaff,
    isDraft: submission?.isDraft,
    setValue,
  });

  // 🛡️ SHIELD LOGIC: Start countdown when AI suggests a grade
  useEffect(() => {
    if (isAISuggested && shieldCountdown === 0 && !originalAiFeedback) {
      setShieldCountdown(5);
      setOriginalAiFeedback(form.getValues("feedback") || "");
    }
  }, [isAISuggested, originalAiFeedback]);

  useEffect(() => {
    if (shieldCountdown > 0) {
      const timer = setInterval(() => setShieldCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [shieldCountdown]);

  // Determine if the shield is still active
  const isSignificantEdit = useMemo(() => {
    if (!originalAiFeedback) return false;
    const diff = Math.abs(watchedFeedback.length - originalAiFeedback.length);
    const threshold = originalAiFeedback.length * 0.1;
    return (
      diff > threshold || (watchedFeedback !== originalAiFeedback && watchedFeedback.length > 10)
    );
  }, [watchedFeedback, originalAiFeedback]);

  const isShieldActive =
    isAISuggested && (!hasReasoningBeenOpened || (shieldCountdown > 0 && !isSignificantEdit));

  const handleToggleAudit = () => {
    const newState = !showAiAudit;
    setShowAiAudit(newState);
    if (newState) setHasReasoningBeenOpened(true);
  };

  // --- AI AUDIT DATA ---
  const { result: auditData, query: auditQuery } = useCustom<any>({
    url: `/submissions/${submission?.id}/ai-audits`,
    method: "get",
    queryOptions: { enabled: !!submission?.id && showAiAudit },
  });

  const audit = auditData?.data;
  const isAuditLoading = auditQuery.isLoading;

  const { mutate: updateSubmission, mutation: updateMutation } = useUpdate<
    Submission,
    HttpError,
    GradingFormValues
  >();
  const isUpdating = updateMutation.isPending;

  // Navigation Logic
  const currentIndex = useMemo(
    () => submissions.findIndex((s) => s.id === submission?.id),
    [submissions, submission]
  );
  const hasNext = currentIndex < submissions.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNext = () => {
    if (hasNext && onNavigate) onNavigate(submissions[currentIndex + 1]);
  };

  const handlePrev = () => {
    if (hasPrev && onNavigate) onNavigate(submissions[currentIndex - 1]);
  };

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(false);
      setShieldCountdown(0);
      setOriginalAiFeedback(null);
      reset({
        grade: submission?.grade ?? 0,
        feedback: submission?.feedback ?? "",
        requiresResubmission: submission?.requiresResubmission ?? false,
        teacherPrivateNotes: submission?.teacherPrivateNotes ?? "",
        version: submission?.version,
      });
    }
  }, [
    isOpen,
    submission?.id,
    reset,
    submission?.version,
    submission?.grade,
    submission?.feedback,
    submission?.requiresResubmission,
    submission?.teacherPrivateNotes,
  ]);

  const onSubmit: SubmitHandler<GradingFormValues> = async (values) => {
    if (!isStaff || !submission?.id || submission?.isDraft || isShieldActive) return;

    updateSubmission(
      {
        resource: "submissions",
        id: submission.id,
        values: {
          ...values,
          aiApprovalStatus: "approved",
          version: submission.version, // 🛡️ ENFORCE LOCKING
        },
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
          if (values.grade >= 90) setShowConfetti(true);

          toast.success(t("assignments.grading.gradeSaved"));

          setTimeout(() => {
            setIsSuccess(false);
            if (hasNext) {
              handleNext();
            } else {
              onOpenChange(false);
            }
          }, 1000);
        },
        onError: (error: HttpError) => {
          if (error.statusCode === 409) {
            toast.error(
              t("assignments.grading.toasts.conflictError", {
                defaultValue:
                  "Conflict Detected: Another teacher has just updated this grade. Please refresh to see their changes.",
              }),
              {
                duration: 5000,
                action: {
                  label: t("buttons.refresh", { defaultValue: "Refresh Now" }),
                  onClick: () => window.location.reload(),
                },
              }
            );
          } else {
            toast.error(
              t("assignments.grading.toasts.saveError", { defaultValue: "Failed to save grade." })
            );
          }
        },
      }
    );
  };

  if (!submission) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] w-[1400px] h-[90vh] overflow-hidden border-none shadow-2xl p-0 text-start bg-background/95 backdrop-blur-xl flex flex-col"
        style={{ direction: isAr ? "rtl" : "ltr" }}
      >
        {showConfetti && (
          <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />
        )}

        <GradingTopBar
          submission={submission}
          currentIndex={currentIndex}
          totalSubmissions={submissions.length}
          hasPrev={hasPrev}
          hasNext={hasNext}
          isAISuggested={isAISuggested}
          onPrev={handlePrev}
          onNext={handleNext}
          onClose={() => onOpenChange(false)}
        />

        {/* --- MAIN CONTENT: 70/30 SPLIT --- */}
        <div className="flex-1 flex overflow-hidden">
          <GradingStudentWork submission={submission} />

          {/* RIGHT: GRADING PANEL (30%) */}
          <div className="flex-[3] bg-card overflow-hidden flex flex-col min-w-[380px]">
            <ScrollArea className="flex-1">
              <div className="p-8 space-y-10">
                {isStaff && !submission.isDraft ? (
                  <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-10">
                      <FormField
                        control={control}
                        name="grade"
                        render={({ field }) => (
                          <FormItem className="space-y-6">
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-primary" />
                                {t("assignments.grading.finalScore")}
                              </FormLabel>
                              {(isAISuggested || audit) && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleToggleAudit}
                                  className={cn(
                                    "h-7 rounded-lg text-[9px] font-black uppercase tracking-widest gap-2",
                                    showAiAudit
                                      ? "bg-primary/10 text-primary"
                                      : "hover:bg-primary/5 text-muted-foreground",
                                    !hasReasoningBeenOpened &&
                                      isAISuggested &&
                                      "animate-bounce ring-2 ring-primary/20"
                                  )}
                                >
                                  <Dna className="h-3 w-3" />
                                  {showAiAudit ? "Hide Reasoning" : "View AI Reasoning"}
                                </Button>
                              )}
                            </div>
                            <FormControl>
                              <div className="space-y-8">
                                <div className="relative group">
                                  <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    className="h-24 text-6xl font-black text-center rounded-3xl bg-muted/20 border-none focus-visible:ring-primary focus-visible:ring-offset-0 transition-all"
                                  />
                                  <span className="absolute end-8 top-1/2 -translate-y-1/2 text-3xl font-black opacity-20">
                                    %
                                  </span>
                                </div>
                                <Slider
                                  value={[field.value ?? 0]}
                                  max={100}
                                  onValueChange={(vals) => field.onChange(vals[0])}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <AnimatePresence>
                        {showAiAudit && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <Card className="rounded-2xl border-dashed border-primary/20 bg-primary/5 p-6 space-y-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary">
                                  <Sparkles className="h-3 w-3" />
                                  AI Thinking Process
                                </div>
                                {audit?.modelName && (
                                  <Badge
                                    variant="outline"
                                    className="text-[8px] font-bold uppercase py-0 h-5"
                                  >
                                    {audit.modelName}
                                  </Badge>
                                )}
                              </div>

                              {isAuditLoading ? (
                                <div className="py-10 flex flex-col items-center justify-center gap-3">
                                  <Loader2 className="h-5 w-5 animate-spin text-primary/40" />
                                  <span className="text-[9px] font-bold text-muted-foreground uppercase animate-pulse">
                                    Tracing Logic...
                                  </span>
                                </div>
                              ) : audit ? (
                                <div className="space-y-4">
                                  {audit.metadata?.logicChain ? (
                                    <div className="space-y-3">
                                      {audit.metadata.logicChain.map((step: string, i: number) => (
                                        <div key={i} className="flex gap-3 text-[11px]">
                                          <span className="text-primary font-black shrink-0">
                                            {i + 1}.
                                          </span>
                                          <p className="font-medium text-muted-foreground leading-snug">
                                            {step}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs font-medium text-muted-foreground italic">
                                      No granular logic steps recorded for this version.
                                    </p>
                                  )}

                                  <div className="pt-4 border-t border-primary/10 flex items-center justify-between text-[9px] font-bold text-muted-foreground/60 uppercase">
                                    <span>
                                      Confidence:{" "}
                                      {formatGrade(
                                        (audit.metadata?.aiConfidenceScore || 0) * 100,
                                        0
                                      )}
                                    </span>
                                    <span>v{audit.promptVersion || 1}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="py-8 text-center">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Audit trail unavailable for this attempt.
                                  </p>
                                </div>
                              )}
                            </Card>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <FormField
                        control={control}
                        name="feedback"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              {t("assignments.grading.feedbackToStudent")}
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t("assignments.grading.feedbackPlaceholder")}
                                className="min-h-[200px] rounded-3xl bg-muted/10 border-none p-6 text-sm leading-relaxed"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <FormField
                          control={control}
                          name="requiresResubmission"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between p-5 rounded-3xl bg-orange-500/5 border border-orange-500/10">
                              <div className="space-y-0.5">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-orange-700">
                                  {t("assignments.grading.requiresResubmission")}
                                </FormLabel>
                                <p className="text-[9px] text-orange-600/60 font-bold">
                                  {t("assignments.grading.resubmissionNote")}
                                </p>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex flex-col gap-3 sticky bottom-0 bg-card pt-4 pb-2 mt-10">
                        {isShieldActive && (
                          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 text-amber-700 text-[10px] font-black uppercase tracking-widest border border-amber-500/20 animate-pulse">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            {!hasReasoningBeenOpened
                              ? "Critical: You must expand 'AI Reasoning' before approving"
                              : `Review Required: Review AI feedback for ${shieldCountdown}s or edit it`}
                          </div>
                        )}
                        <LoadingButton
                          type="submit"
                          isLoading={isUpdating}
                          isSuccess={isSuccess}
                          disabled={isShieldActive}
                          className={cn(
                            "w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl transition-all",
                            isShieldActive ? "opacity-50 grayscale" : "shadow-primary/20"
                          )}
                        >
                          <Check className="h-5 w-5 me-2" />
                          {t("buttons.saveGrade")}
                        </LoadingButton>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground italic text-sm">
                    {submission.isDraft ? t("assignments.grading.draftNotice") : "View Mode Only"}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
