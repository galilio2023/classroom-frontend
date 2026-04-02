import {
  useShow,
  useUpdate,
  useGetIdentity,
  useCustomMutation,
  useSubscription,
} from "@refinedev/core";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ShowView } from "@/components/refine-ui/views/show-view";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  FileText,
  Calendar,
  AlertCircle,
  ArrowLeft,
  Save,
  Wand2,
  Sparkles,
  Lock,
} from "lucide-react";
import { Submission, User as UserType, Assignment } from "@/types";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { ErrorBoundary } from "@/components/error-boundary";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { getSocket, connectSocket } from "@/lib/socket";
import { Switch } from "@/components/ui/switch";

import Big from "big.js";

const SubmissionShow = () => {
  const { t, i18n } = useTranslation();
  const { coreData } = useDashboard();
  const isAr = i18n.language === "ar";
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<UserType>();

  const [grade, setGrade] = useState<string>("0");
  const [feedback, setFeedback] = useState("");
  const [teacherPrivateNotes, setTeacherPrivateNotes] = useState("");
  const [requiresResubmission, setRequiresResubmission] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { query: submissionQuery } = useShow<Submission & { assignment?: Assignment }>({
    resource: "submissions",
    id,
  });

  const submission = submissionQuery.data?.data;
  const { refetch } = submissionQuery;

  // 🛡️ REAL-TIME CONCURRENCY: Listen for updates from other teachers
  useSubscription({
    channel: `submissions/${id}`,
    types: ["*"],
    onLiveEvent: (event) => {
      if (event.type === "updated" || event.type === "patch") {
        const serverVersion = event.payload?.data?.version || event.payload?.version;
        if (serverVersion !== undefined && submission && serverVersion > submission.version) {
          // Check if the current teacher has unsaved changes
          // 🛡️ PRECISION: Use big.js for robust grade comparison
          let isDirty = false;
          try {
            const currentGrade = new Big(grade || "0");
            const serverGrade = new Big(submission.grade || submission.suggestedGrade || "0");
            isDirty = !currentGrade.eq(serverGrade);
          } catch (e) {
            isDirty = true;
          }

          if (!isDirty) {
            isDirty =
              feedback !== (submission.feedback || submission.suggestedFeedback || "") ||
              teacherPrivateNotes !== (submission.teacherPrivateNotes || "");
          }

          if (isDirty) {
            toast.warning(
              t("common.concurrencyConflict", {
                defaultValue:
                  "This submission was updated by another user. Please refresh to see changes.",
              }),
              {
                duration: 10000,
                action: {
                  label: t("buttons.refresh"),
                  onClick: () => refetch(),
                },
              }
            );
          } else {
            // Auto-sync if no local changes
            refetch();
          }
        }
      }
    },
    enabled: !!id && !!submission,
  });

  const { mutate: updateSubmission, mutation: updateMutationObj } = useUpdate();
  const { mutate: aiGrade } = useCustomMutation();

  // Socket.io integration for async AI grading
  useEffect(() => {
    const setupSocket = async () => {
      try {
        await connectSocket();
        const socket = getSocket();

        if (socket && id) {
          const handleAiComplete = (data: any) => {
            if (Number(data.submissionId) === Number(id)) {
              setIsAnalyzing(false);
              refetch();
              toast.success(t("assignments.grading.toasts.aiComplete"));
            }
          };

          const handleReconnect = () => {
            // 🛡️ RESILIENCE: If we were waiting for AI and the connection dropped,
            // refetch on reconnect to see if it finished while we were offline.
            if (isAnalyzing) {
              refetch().then(() => {
                // If the status is no longer 'processing', we can stop the spinner
                // but usually the next query result will handle this via useEffect
              });
            }
          };

          socket.on("submission:ai-grade:completed", handleAiComplete);
          socket.on("connect", handleReconnect);

          return () => {
            socket.off("submission:ai-grade:completed", handleAiComplete);
            socket.off("connect", handleReconnect);
          };
        }
      } catch (err) {
        console.error("Failed to setup socket for AI updates:", err);
      }
    };

    setupSocket();
  }, [id, refetch, t, isAnalyzing]); // Added isAnalyzing to dependency array for handleReconnect context

  // Sync local state with fetched data (only when ID changes or manual refetch)
  useEffect(() => {
    if (submission) {
      if (!isAnalyzing) {
        setGrade((submission.grade || submission.suggestedGrade || "0").toString());
        setFeedback(submission.feedback || submission.suggestedFeedback || "");
        setTeacherPrivateNotes(submission.teacherPrivateNotes || "");
        setRequiresResubmission(submission.requiresResubmission || false);
      }
    }
  }, [submission?.id, submission?.version]);

  const handleSaveGrade = () => {
    if (!submission) return;

    updateSubmission(
      {
        resource: "submissions",
        id: id!,
        values: {
          grade,
          feedback,
          teacherPrivateNotes,
          requiresResubmission,
          version: submission.version, // 🛡️ ENFORCED: Satisfy backend optimistic locking
        },
      },
      {
        onSuccess: () => {
          toast.success(t("assignments.grading.gradeSaved"));
          navigate(-1);
        },
      }
    );
  };

  const handleAiAnalyze = () => {
    setIsAnalyzing(true);
    aiGrade(
      {
        url: `/submissions/${id}/ai-grade`,
        method: "post",
        values: {},
      },
      {
        onSuccess: () => {
          // In async mode, we just wait for the socket event or poll
          toast.info(
            t("assignments.grading.toasts.aiStarted", {
              defaultValue: "AI analysis started in the background...",
            })
          );
        },
        onError: () => {
          setIsAnalyzing(false);
          toast.error(t("common.aiServiceError"));
        },
      }
    );
  };

  if (submissionQuery.isPending) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!submission)
    return <div className="p-20 text-center font-bold">{t("assignments.show.notFound")}</div>;

  const isTeacher =
    identity?.role === "teacher" || identity?.role === "ta" || identity?.role === "admin";

  return (
    <ShowView>
      <div className="max-w-5xl mx-auto space-y-8 text-start">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className={cn("h-4 w-4", isAr && "rotate-180")} />
            {t("buttons.back")}
          </Button>
          <div className="flex items-center gap-3">
            {submission.aiApprovalStatus === "pending" && (
              <Badge className="bg-ai-primary/10 text-ai-primary border-ai-primary/20 px-4 py-1 rounded-full font-black uppercase tracking-widest text-[10px] animate-pulse">
                <Sparkles className="h-3 w-3 me-1.5" />
                {t("assignments.grading.proposedAI")}
              </Badge>
            )}
            {submission.grade !== null ? (
              <Badge className="bg-success text-success-foreground px-4 py-1 rounded-full font-black uppercase tracking-widest text-[10px]">
                {t("status.completed")}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="px-4 py-1 rounded-full font-black uppercase tracking-widest text-[10px]"
              >
                {t("assignments.list.table.pending")}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Student Work */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-xl overflow-hidden">
              <CardHeader className="bg-muted/30 border-b">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                    <AvatarImage src={submission.student?.image || ""} />
                    <AvatarFallback>{submission.student?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl font-black">{submission.student?.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      {submission.assignment?.title}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/10 p-6 rounded-2xl border border-dashed">
                  <ErrorBoundary>
                    <ReactMarkdown>
                      {submission.content || t("assignments.grading.noContent")}
                    </ReactMarkdown>
                  </ErrorBoundary>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 border-t py-4 flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {t("assignments.show.submittedContent")}:{" "}
                  {dayjs(submission.createdAt).locale(i18n.language).format("LLL")}
                </div>
                {submission.isLate && (
                  <div className="flex items-center gap-1 text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {t("assignments.list.table.late")}
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>

          {/* Right: Grading/Feedback Panel */}
          <div className="space-y-6">
            <Card
              className={cn(
                "border-primary/10 shadow-2xl sticky top-24 overflow-hidden",
                !isTeacher && "border-success/20 shadow-success/10"
              )}
            >
              <div className={cn("h-1.5 w-full", isTeacher ? "bg-primary" : "bg-success")} />
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center justify-between">
                  {isTeacher
                    ? t("assignments.grading.gradeSubmission")
                    : t("assignments.show.instructorFeedback")}
                  {isTeacher && coreData?.globalConfig?.enableAiFeatures !== false && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAiAnalyze}
                      disabled={isAnalyzing}
                      className="h-7 text-[10px] gap-1.5 border-ai-primary/20 text-ai-primary hover:bg-ai-primary/5"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      {t("buttons.aiAssist")}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {isTeacher
                      ? t("assignments.grading.finalScore")
                      : t("assignments.show.yourGrade")}
                  </Label>
                  <div className="relative">
                    {isTeacher ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="h-14 text-3xl font-black text-center rounded-xl bg-muted/20 border-none"
                        min={0}
                        max={100}
                      />
                    ) : (
                      <div className="h-14 flex items-center justify-center text-4xl font-black rounded-xl bg-success/5 text-success">
                        {submission.grade !== null ? `${submission.grade}` : "--"}
                        <span className="text-xl ms-1 opacity-50">%</span>
                      </div>
                    )}
                    {isTeacher && (
                      <div className="absolute top-1/2 -translate-y-1/2 text-xl font-black text-muted-foreground/30 end-4">
                        %
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {t("assignments.grading.feedbackToStudent")}
                  </Label>
                  {isTeacher ? (
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder={t("assignments.grading.feedbackPlaceholder")}
                      className="min-h-[120px] rounded-xl resize-none bg-muted/10 border-none p-4 text-sm leading-relaxed"
                    />
                  ) : (
                    <div className="min-h-[100px] p-4 rounded-xl bg-muted/10 text-sm leading-relaxed italic font-medium">
                      {submission.feedback || t("assignments.show.noFeedbackYet")}
                    </div>
                  )}
                </div>

                {isTeacher && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-destructive flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        {t("assignments.grading.teacherPrivateNotes", {
                          defaultValue: "Private Notes (Staff Only)",
                        })}
                      </Label>
                      <Textarea
                        value={teacherPrivateNotes}
                        onChange={(e) => setTeacherPrivateNotes(e.target.value)}
                        placeholder="Internal notes, rubrics, or context..."
                        className="min-h-[80px] rounded-xl resize-none bg-destructive/5 border-dashed border-destructive/20 p-4 text-sm leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-dashed">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-black uppercase tracking-tight">
                          {t("assignments.grading.requiresResubmission", {
                            defaultValue: "Request Resubmission",
                          })}
                        </Label>
                        <p className="text-[10px] text-muted-foreground leading-none font-bold">
                          {t("assignments.grading.resubmissionHint", {
                            defaultValue: "Allow student to submit a new version.",
                          })}
                        </p>
                      </div>
                      <Switch
                        checked={requiresResubmission}
                        onCheckedChange={setRequiresResubmission}
                      />
                    </div>
                  </>
                )}

                {!isTeacher && submission.requiresResubmission && (
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {t("notifications.resubmissionRequested.title")}
                    </div>
                    <p className="text-[10px] font-bold text-destructive/80">
                      {t("assignments.grading.resubmissionHint")}
                    </p>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 rounded-lg font-black uppercase tracking-widest text-[10px] md:text-[11px]"
                      onClick={() =>
                        navigate(`/classes/show/${submission.assignment?.classId}?tab=assessments`)
                      }
                    >
                      {" "}
                      {t("buttons.resubmit")}
                    </Button>
                  </div>
                )}

                {isTeacher &&
                  submission.suggestedGrade !== undefined &&
                  submission.suggestedGrade !== null &&
                  !submission.grade && (
                    <div className="p-5 bg-ai-primary/5 rounded-2xl border-2 border-ai-primary/20 space-y-4 animate-in fade-in zoom-in duration-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-ai-primary">
                          <Sparkles className="h-3 w-3" />
                          {t("assignments.grading.aiSuggestion")}
                        </div>
                        <Badge className="bg-ai-primary text-white text-[10px] font-black">
                          {submission.suggestedGrade}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed italic line-clamp-3">
                        "{submission.suggestedFeedback}"
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-9 text-[10px] font-black uppercase tracking-widest gap-2 border-ai-primary/20 text-ai-primary hover:bg-ai-primary hover:text-white transition-all rounded-lg"
                        onClick={() => {
                          setGrade((submission.suggestedGrade || "0").toString());
                          setFeedback(submission.suggestedFeedback || "");
                        }}
                      >
                        <Wand2 className="h-3 w-3" />
                        {t("assignments.grading.applyAI")}
                      </Button>
                    </div>
                  )}
              </CardContent>
              {isTeacher && (
                <CardFooter className="border-t bg-muted/5 pt-6">
                  <Button
                    onClick={handleSaveGrade}
                    disabled={updateMutationObj.isPending}
                    className="w-full h-12 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                  >
                    {updateMutationObj.isPending ? (
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="me-2 h-4 w-4" />
                    )}
                    {t("buttons.saveGrade")}
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>
    </ShowView>
  );
};

export default SubmissionShow;
