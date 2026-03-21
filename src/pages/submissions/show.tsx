import { useShow, useUpdate, useGetIdentity, useCustomMutation } from "@refinedev/core";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ShowView } from "@/components/refine-ui/views/show-view";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
  Sparkles
} from "lucide-react";
import { Submission, User as UserType, Assignment } from "@/types";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";

const SubmissionShow = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<UserType>();
  
  const [grade, setGrade] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { query: submissionQuery } = useShow<Submission & { assignment?: Assignment }>({
    resource: "submissions",
    id,
  });

  const submission = submissionQuery.data?.data;

  const { mutate: updateSubmission, mutation: updateMutationObj } = useUpdate();
  const { mutate: aiGrade } = useCustomMutation();

  // Sync local state with fetched data
  useEffect(() => {
    if (submission) {
      setGrade(submission.grade ?? submission.suggestedGrade ?? 0);
      setFeedback(submission.feedback ?? submission.suggestedFeedback ?? "");
    }
  }, [submission]);

  const handleSaveGrade = () => {
    updateSubmission({
      resource: "submissions",
      id: id!,
      values: {
        grade,
        feedback,
      },
    }, {
      onSuccess: () => {
        toast.success(t("assignments.grading.gradeSaved"));
        navigate(-1);
      }
    });
  };

  const handleAiAnalyze = () => {
    setIsAnalyzing(true);
    aiGrade({
        url: `/submissions/${id}/ai-grade`,
        method: "post",
        values: {}
    }, {
        onSuccess: (data: any) => {
            const result = data.data;
            setGrade(result.suggestedGrade);
            setFeedback(result.feedback);
            setIsAnalyzing(false);
            toast.success(t("assignments.grading.toasts.aiComplete"));
        },
        onError: () => {
            setIsAnalyzing(false);
            toast.error(t("common.aiServiceError"));
        }
    });
  };

  if (submissionQuery.isPending) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!submission) return <div className="p-20 text-center font-bold">{t("assignments.show.notFound")}</div>;

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
                {submission.grade !== null ? (
                    <Badge className="bg-success text-success-foreground px-4 py-1 rounded-full font-black uppercase tracking-widest text-[10px]">
                        {t("status.completed")}
                    </Badge>
                ) : (
                    <Badge variant="outline" className="px-4 py-1 rounded-full font-black uppercase tracking-widest text-[10px]">
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
                            <ReactMarkdown>{submission.content || t("assignments.grading.noContent")}</ReactMarkdown>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/10 border-t py-4 flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {t("assignments.show.submittedContent")}: {dayjs(submission.createdAt).locale(i18n.language).format("LLL")}
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

            {/* Right: Grading Panel */}
            <div className="space-y-6">
                <Card className="border-primary/10 shadow-2xl sticky top-24 overflow-hidden">
                    <div className="h-1.5 bg-primary w-full" />
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center justify-between">
                            {t("assignments.grading.gradeSubmission")}
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleAiAnalyze}
                                disabled={isAnalyzing}
                                className="h-7 text-[10px] gap-1.5 border-ai-primary/20 text-ai-primary hover:bg-ai-primary/5"
                            >
                                {isAnalyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                                {t("buttons.aiAssist")}
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("assignments.grading.finalScore")}</Label>
                            <div className="relative">
                                <Input 
                                    type="number" 
                                    value={grade} 
                                    onChange={(e) => setGrade(Number(e.target.value))}
                                    className="h-14 text-3xl font-black text-center rounded-xl bg-muted/20 border-none"
                                    min={0}
                                    max={100}
                                />
                                <div className={cn("absolute top-1/2 -translate-y-1/2 text-xl font-black text-muted-foreground/30", isAr ? "left-4" : "right-4")}>%</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("assignments.grading.feedbackToStudent")}</Label>
                            <Textarea 
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder={t("assignments.grading.feedbackPlaceholder")}
                                className="min-h-[200px] rounded-xl resize-none bg-muted/10 border-none p-4 text-sm leading-relaxed"
                            />
                        </div>

                        {(submission.suggestedGrade !== undefined && submission.suggestedGrade !== null && !submission.grade) && (
                            <div className="p-4 bg-ai-secondary/30 rounded-xl border border-ai-primary/10 space-y-2">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-ai-primary">
                                    <Wand2 className="h-3 w-3" />
                                    {t("assignments.show.aiCoach")}
                                </div>
                                <p className="text-xs text-ai-primary/70 leading-relaxed italic">
                                    {t("assignments.grading.toasts.aiApplied")}
                                </p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="border-t bg-muted/5 pt-6">
                        <Button 
                            onClick={handleSaveGrade} 
                            disabled={updateMutationObj.isPending}
                            className="w-full h-12 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                        >
                            {updateMutationObj.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {t("buttons.saveGrade")}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
      </div>
    </ShowView>
  );
};

export default SubmissionShow;
