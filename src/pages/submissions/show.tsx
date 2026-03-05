import { useShow, useUpdate, useGetIdentity, useCustomMutation } from "@refinedev/core";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Loader2, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  User, 
  Calendar, 
  AlertCircle,
  ArrowLeft,
  Save,
  Wand2
} from "lucide-react";
import { Submission, User as UserType } from "@/types";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const SubmissionShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<UserType>();
  
  const [grade, setGrade] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { query: submissionQuery, query: { refetch } } = useShow<Submission>({
    resource: "submissions",
    id,
  });

  const submission = submissionQuery.data?.data;

  const { mutate: updateSubmission, mutation } = useUpdate();
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
        toast.success("Submission graded successfully!");
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
            toast.success("AI Analysis complete!");
        },
        onError: () => {
            setIsAnalyzing(false);
            toast.error("AI Analysis failed. Please try again.");
        }
    });
  };

  if (submissionQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!submission) return <div>Submission not found</div>;

  return (
    <ShowView>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to List
            </Button>
            <div className="flex items-center gap-3">
                {submission.grade !== null ? (
                    <Badge className="bg-green-500 text-white px-4 py-1 rounded-full font-black uppercase tracking-widest text-[10px]">
                        Graded
                    </Badge>
                ) : (
                    <Badge variant="outline" className="px-4 py-1 rounded-full font-black uppercase tracking-widest text-[10px]">
                        Pending Grade
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
                            <ReactMarkdown>{submission.content || "No text content provided."}</ReactMarkdown>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/10 border-t py-4 flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Submitted: {new Date(submission.createdAt).toLocaleString()}
                        </div>
                        {submission.isLate && (
                            <div className="flex items-center gap-1 text-destructive">
                                <AlertCircle className="h-3 w-3" />
                                Late Submission
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
                            Grading Panel
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleAiAnalyze}
                                disabled={isAnalyzing}
                                className="h-7 text-[10px] gap-1.5 border-purple-500/20 text-purple-600 hover:bg-purple-50"
                            >
                                {isAnalyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                AI Analyze
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Final Grade (%)</Label>
                            <div className="relative">
                                <Input 
                                    type="number" 
                                    value={grade} 
                                    onChange={(e) => setGrade(Number(e.target.value))}
                                    className="h-14 text-3xl font-black text-center rounded-xl bg-muted/20 border-none"
                                    min={0}
                                    max={100}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-black text-muted-foreground/30">%</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Teacher Feedback</Label>
                            <Textarea 
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Provide constructive feedback..."
                                className="min-h-[200px] rounded-xl resize-none bg-muted/10 border-none p-4 text-sm leading-relaxed"
                            />
                        </div>

                        {submission.suggestedGrade !== null && !submission.grade && (
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30 space-y-2">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-purple-600">
                                    <Wand2 className="h-3 w-3" />
                                    AI Suggestion
                                </div>
                                <p className="text-xs text-purple-900/70 dark:text-purple-300 leading-relaxed italic">
                                    "AI suggests a grade of {submission.suggestedGrade}% based on the content quality and alignment with objectives."
                                </p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="border-t bg-muted/5 pt-6">
                        <Button 
                            onClick={handleSaveGrade} 
                            disabled={mutation.isPending}
                            className="w-full h-12 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                        >
                            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Final Grade
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
