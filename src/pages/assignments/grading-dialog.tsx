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
import { useCustomMutation, useNotification, useGetIdentity } from "@refinedev/core";
import { Submission, Assignment, AIFeedbackResponse, User, UserRole } from "@/types";
import { useEffect, useState } from "react";
import { Sparkles, Loader2, FileText } from "lucide-react";
import { FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

const gradingSchema = z.object({
  grade: z.coerce
    .number()
    .min(0, "Grade must be at least 0")
    .max(100, "Grade cannot exceed 100"),
  feedback: z.string().optional(),
});

type GradingFormValues = z.infer<typeof gradingSchema>;

interface GradingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  submission: (Submission & { assignment?: Assignment }) | null;
}

export const GradingDialog = ({
  isOpen,
  onOpenChange,
  submission,
}: GradingDialogProps) => {
  const { open } = useNotification();
  const { data: identity } = useGetIdentity<User>();
  const isStaff = identity?.role === UserRole.TEACHER || identity?.role === UserRole.ADMIN;
  const [hasAutoAnalyzed, setHasAutoAnalyzed] = useState(false);

  const form = useForm<GradingFormValues>({
    resolver: zodResolver(gradingSchema) as any,
    defaultValues: {
      grade: submission?.grade ?? 0,
      feedback: submission?.feedback ?? "",
    },
    refineCoreProps: {
      resource: "submissions",
      action: "edit",
      id: submission?.id,
      queryOptions: { enabled: false },
      onMutationSuccess: () => {
        onOpenChange(false);
      },
    },
  });

  const {
    handleSubmit,
    control,
    setValue,
    refineCore: { onFinish, formLoading },
  } = form;

  const { mutate: getAIFeedback, mutation: aiMutation } = useCustomMutation<AIFeedbackResponse>();
  const isAILoading = aiMutation.isPending;

  useEffect(() => {
    if (isOpen) {
        setHasAutoAnalyzed(false);
    }
  }, [isOpen, submission?.id]);

  useEffect(() => {
    if (submission) {
      setValue("grade", submission.grade ?? submission.suggestedGrade ?? 0);
      setValue("feedback", submission.feedback ?? submission.suggestedFeedback ?? "");
      
      // Auto-trigger AI if no grade exists and we haven't analyzed yet (STAFF ONLY)
      if (isStaff && isOpen && !submission.grade && !submission.suggestedGrade && !hasAutoAnalyzed && !isAILoading) {
          handleAIGrade();
          setHasAutoAnalyzed(true);
      }
    }
  }, [submission, setValue, isOpen, isStaff]);

  const onSubmit = (values: FieldValues) => {
    if (!isStaff) return;
    onFinish(values);
  };

  const handleAIGrade = () => {
    if (!submission || !isStaff) return;

    getAIFeedback(
      {
        url: `/submissions/${submission.id}/ai-grade`,
        method: "post",
        values: {},
      },
      {
        onSuccess: (data) => {
          const { suggestedGrade, feedback } = data.data;
          setValue("grade", suggestedGrade);
          setValue("feedback", feedback);
          open?.({
            type: "success",
            message: "AI Analysis Complete",
            description: "Suggested grade and feedback applied.",
          });
        },
      }
    );
  };

  if (!submission) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto border-none shadow-2xl p-0 overflow-hidden text-left">
        <div className="h-1.5 bg-primary w-full" />
        
        <div className="p-6 space-y-6">
            <DialogHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <DialogTitle className="text-2xl font-black tracking-tight">
                            {isStaff ? "Grade Submission" : "Submission Details"}
                        </DialogTitle>
                        <DialogDescription className="font-medium">
                            Student: <span className="text-foreground font-bold">{submission.student?.name}</span>
                        </DialogDescription>
                    </div>
                    {isStaff && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className={cn(
                                "gap-2 rounded-xl transition-all",
                                isAILoading ? "border-ai-primary bg-ai-primary/5" : "border-ai-primary/20 text-ai-primary hover:bg-ai-primary/5"
                            )}
                            onClick={handleAIGrade}
                            disabled={isAILoading}
                        >
                            {isAILoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            {isAILoading ? "AI Analyzing..." : "AI Re-Analyze"}
                        </Button>
                    )}
                </div>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Content */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Student Work</Label>
                        <div className="p-4 rounded-2xl bg-muted/30 text-sm whitespace-pre-wrap min-h-[200px] max-h-[400px] overflow-y-auto border border-dashed leading-relaxed italic">
                            {submission.content || "No text content provided."}
                        </div>
                    </div>

                    {submission.fileUrl && (
                        <div className="flex items-center justify-between p-3 border rounded-xl bg-primary/5 border-primary/10">
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-primary" />
                                <span className="text-xs font-bold">Attached Document</span>
                            </div>
                            <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest" asChild>
                                <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">View File</a>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Right: Form or Result */}
                <div className="space-y-4">
                    {isStaff ? (
                        <Form {...form}>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={control}
                                    name="grade"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Final Score (%)</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input type="number" {...field} className="h-14 text-3xl font-black text-center rounded-2xl bg-muted/20 border-none focus-visible:ring-primary" />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-black opacity-20">%</span>
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
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Feedback</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Provide feedback..."
                                                    className="min-h-[180px] rounded-2xl resize-none bg-muted/10 border-none p-4 text-sm leading-relaxed"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex gap-3 pt-2">
                                    <Button type="button" variant="ghost" className="flex-1 rounded-xl font-bold" onClick={() => onOpenChange(false)}>Cancel</Button>
                                    <Button type="submit" disabled={formLoading || isAILoading} className="flex-[2] rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                                        {formLoading ? "Saving..." : "Save Grade"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    ) : (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Your Score</Label>
                                <div className="h-24 flex items-center justify-center rounded-2xl bg-primary/5 border border-primary/10">
                                    <span className="text-5xl font-black text-primary">{submission.grade ?? "--"}</span>
                                    <span className="text-xl font-black text-primary/40 ml-1">%</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Teacher Feedback</Label>
                                <div className="p-6 rounded-2xl bg-muted/20 border min-h-[150px] text-sm leading-relaxed">
                                    {submission.feedback || "No feedback provided yet."}
                                </div>
                            </div>
                            <Button className="w-full rounded-xl font-bold" onClick={() => onOpenChange(false)}>Close</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
