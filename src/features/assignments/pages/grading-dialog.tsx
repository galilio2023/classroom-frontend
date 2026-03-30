import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useCustomMutation, useNotification, useUpdate, HttpError } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { Submission, Assignment, AIFeedbackResponse, GetOneResponse, User } from "@/types";
import { useEffect, useState, useMemo } from "react";
import {
  Sparkles,
  Loader2,
  FileText,
  User as UserIcon,
  Copy,
  Check,
  Download,
  ExternalLink,
  MessageSquareQuote,
  Trophy,
  PartyPopper,
  RotateCcw,
  Lock,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingButton } from "@/components/ui/loading-button";
import { SubmitHandler } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useSocket } from "@/contexts/socket-context";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/use-user-role";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const { open } = useNotification();
  const { width, height } = useWindowSize();
  const { isStaff: _isStaff } = useUserRole();
  const isStaff = _isStaff && !readOnly;
  const { socket } = useSocket();

  const [hasAutoAnalyzed, setHasAutoAnalyzed] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAISuggested, setIsAISuggested] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [aiStatus, setAiStatus] = useState<Submission["aiStatus"]>(submission?.aiStatus || "idle");
  const [aiError, setAiError] = useState<string | null>(submission?.aiError || null);

  const { mutate: updateSubmission, mutation: updateMutation } = useUpdate<
    Submission,
    HttpError,
    GradingFormValues
  >();
  const isUpdating = updateMutation.isPending;
  const queryClient = useQueryClient();

  const form = useForm<GradingFormValues>({
    resolver: zodResolver(gradingSchema(t)) as any,
    defaultValues: {
      grade: submission?.grade ?? 0,
      feedback: submission?.feedback ?? "",
      requiresResubmission: submission?.requiresResubmission ?? false,
      teacherPrivateNotes: submission?.teacherPrivateNotes ?? "",
    },
  });

  const { handleSubmit, control, setValue, watch, reset } = form;

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

  const currentGrade = watch("grade");
  const isDraft = submission?.isDraft;
  const isAr = i18n.language === "ar";

  const { mutate: getAIFeedback, mutation: aiMutation } = useCustomMutation<any>() as any;
  const isAILoading = aiMutation.isPending || aiStatus === "processing";

  useEffect(() => {
    if (isOpen) {
      setHasAutoAnalyzed(false);
      setIsAISuggested(false);
      setShowConfetti(false);
      setAiStatus(submission?.aiStatus || "idle");
      setAiError(submission?.aiError || null);

      // Reset form values for new submission
      reset({
        grade: submission?.grade ?? 0,
        feedback: submission?.feedback ?? "",
        requiresResubmission: submission?.requiresResubmission ?? false,
        teacherPrivateNotes: submission?.teacherPrivateNotes ?? "",
      });
    }
  }, [isOpen, submission?.id, submission?.aiStatus, submission?.aiError, reset]);

  useEffect(() => {
    if (isOpen && submission?.id && socket) {
      socket.emit("join_submission", submission.id);

      const handleAiComplete = (data: { result: AIFeedbackResponse }) => {
        const { suggestedGrade, feedback } = data.result;
        setValue("grade", Number(suggestedGrade));
        setValue("feedback", feedback);
        setIsAISuggested(true);
        setAiStatus("completed");
        setAiError(null);
        toast.success(
          t("assignments.grading.toasts.aiComplete", { defaultValue: "AI analysis complete!" })
        );

        queryClient.invalidateQueries({ queryKey: ["submissions"] });
      };

      const handleAiFailed = (data: { error: string }) => {
        setAiStatus("failed");
        setAiError(data.error);
        toast.error(
          t("assignments.grading.toasts.aiFailed", { defaultValue: "AI analysis failed." })
        );
      };

      socket.on("submission:ai-grade:completed", handleAiComplete);
      socket.on("submission:ai-grade:failed", handleAiFailed);

      return () => {
        socket.emit("leave_submission", submission.id);
        socket.off("submission:ai-grade:completed", handleAiComplete);
        socket.off("submission:ai-grade:failed", handleAiFailed);
      };
    }
  }, [isOpen, submission?.id, socket, setValue, t, queryClient]);

  useEffect(() => {
    if (
      submission &&
      isStaff &&
      isOpen &&
      !submission.grade &&
      !submission.suggestedGrade &&
      !hasAutoAnalyzed &&
      !isAILoading &&
      !isDraft &&
      aiStatus === "idle"
    ) {
      handleAIGrade();
      setHasAutoAnalyzed(true);
    }
  }, [submission, isOpen, isStaff, hasAutoAnalyzed, isAILoading, isDraft, aiStatus]);

  const onSubmit: SubmitHandler<GradingFormValues> = async (values) => {
    if (!isStaff || !submission?.id || isDraft) return;

    updateSubmission(
      {
        resource: "submissions",
        id: submission.id,
        values: {
          ...values,
          aiApprovalStatus: "approved",
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
      }
    );
  };

  const handleAIGrade = () => {
    if (!submission || !isStaff || isDraft) return;
    setAiStatus("processing");
    getAIFeedback(
      {
        url: `/submissions/${submission.id}/ai-grade`,
        method: "post",
        values: {},
      },
      {
        onSuccess: (response: any) => {
          if (response.status === "accepted") return;
          const { suggestedGrade, feedback } = response.data;
          setValue("grade", Number(suggestedGrade));
          setValue("feedback", feedback);
          setIsAISuggested(true);
          setAiStatus("completed");
        },
      }
    );
  };

  const copyToClipboard = () => {
    if (!submission?.content) return;
    navigator.clipboard.writeText(submission.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

        {/* --- TOP BAR: SPEED GRADER CONTROLS --- */}
        <div className="h-16 border-b bg-card/50 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border-2 border-primary/10">
                <AvatarImage src={submission.student?.image || undefined} />
                <AvatarFallback className="font-black text-xs">
                  {submission.student?.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-black tracking-tight leading-none">
                  {submission.student?.name}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
                  {t("assignments.grading.attempt", { count: submission.attemptNumber })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-xl border">
            <Button
              variant="ghost"
              size="icon"
              disabled={!hasPrev}
              onClick={handlePrev}
              className="h-9 w-9 rounded-lg hover:bg-background shadow-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {currentIndex + 1} / {submissions.length}
            </div>
            <Button
              variant="ghost"
              size="icon"
              disabled={!hasNext}
              onClick={handleNext}
              className="h-9 w-9 rounded-lg hover:bg-background shadow-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {isAISuggested && (
              <Badge className="bg-ai-primary/10 text-ai-primary border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg animate-pulse">
                <Sparkles className="h-3 w-3 me-1.5" />
                {t("assignments.grading.aiSuggested")}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="rounded-xl h-10 w-10"
            >
              <Maximize2 className="h-4 w-4 rotate-45" />
            </Button>
          </div>
        </div>

        {/* --- MAIN CONTENT: 70/30 SPLIT --- */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: STUDENT WORK (70%) */}
          <div className="flex-[7] bg-muted/10 overflow-hidden flex flex-col border-e">
            <ScrollArea className="flex-1 p-8 md:p-12">
              <div className="max-w-4xl mx-auto space-y-8 pb-20">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {t("assignments.grading.studentWork")}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyToClipboard}
                      className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest gap-2"
                    >
                      {copied ? (
                        <Check className="h-3 w-3 text-success" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      {t("buttons.copy")}
                    </Button>
                  </div>

                  <div className="bg-card p-10 rounded-4xl shadow-sm border leading-relaxed text-lg font-medium italic min-h-[400px] relative">
                    <MessageSquareQuote className="absolute top-6 start-6 h-12 w-12 text-primary/5 -scale-x-100" />
                    <div className="relative z-10 whitespace-pre-wrap">{submission.content}</div>
                  </div>
                </div>

                {submission.fileUrl && (
                  <div className="p-6 border-2 border-dashed rounded-4xl bg-primary/5 border-primary/10 flex items-center justify-between group hover:bg-primary/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-4 rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform">
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-black text-sm uppercase tracking-tight">
                          {t("assignments.grading.attachedDoc")}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">
                          {t("assignments.grading.viewOrDownload")}
                        </p>
                      </div>
                    </div>
                    <Button
                      className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
                      asChild
                    >
                      <a href={submission.fileUrl} target="_blank" rel="noreferrer">
                        <Download className="h-4 w-4 me-2" />
                        {t("buttons.open")}
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* RIGHT: GRADING PANEL (30%) */}
          <div className="flex-[3] bg-card overflow-hidden flex flex-col min-w-[380px]">
            <ScrollArea className="flex-1">
              <div className="p-8 space-y-10">
                {isStaff && !isDraft ? (
                  <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-10">
                      <FormField
                        control={control}
                        name="grade"
                        render={({ field }) => (
                          <FormItem className="space-y-6">
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-primary" />
                              {t("assignments.grading.finalScore")}
                            </FormLabel>
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

                      <div className="flex gap-3 sticky bottom-0 bg-card pt-4 pb-2 mt-10">
                        <LoadingButton
                          type="submit"
                          isLoading={isUpdating}
                          isSuccess={isSuccess}
                          className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20"
                        >
                          <Check className="h-5 w-5 me-2" />
                          {t("buttons.saveGrade")}
                        </LoadingButton>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground italic text-sm">
                    {isDraft ? t("assignments.grading.draftNotice") : "View Mode Only"}
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

// Helper components missing from original imports but needed for the UI
const Switch = ({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) => (
  <button
    type="button"
    onClick={() => onCheckedChange(!checked)}
    className={cn(
      "h-6 w-11 rounded-full transition-colors relative",
      checked ? "bg-primary" : "bg-muted"
    )}
  >
    <div
      className={cn(
        "absolute top-1 start-1 h-4 w-4 rounded-full bg-white transition-transform",
        checked ? "translate-x-5" : "translate-x-0"
      )}
    />
  </button>
);
