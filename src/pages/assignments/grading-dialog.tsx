import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { useCustomMutation, useNotification } from "@refinedev/core";
import { Submission, Assignment, AIFeedbackResponse } from "@/types";
import { useEffect } from "react";
import { Sparkles, Loader2, FileText, ExternalLink } from "lucide-react";
import { FieldValues } from "react-hook-form";

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
      queryOptions: {
        enabled: false,
      },
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
    if (submission) {
      setValue("grade", submission.grade ?? 0);
      setValue("feedback", submission.feedback ?? "");
    }
  }, [submission, setValue]);

  const onSubmit = (values: FieldValues) => {
    onFinish(values);
  };

  const handleAIGrade = () => {
    if (!submission) return;

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
            message: "AI Feedback Generated!",
            description: "Suggested grade and feedback have been applied.",
          });
        },
        onError: () => {
          open?.({
            type: "error",
            message: "AI Error",
            description: "Failed to generate feedback from Gemini.",
          });
        },
      }
    );
  };

  if (!submission) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div>
              <DialogTitle>Grade Submission</DialogTitle>
              <DialogDescription>
                Student: {submission.student?.name}
              </DialogDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 text-primary border-primary/20 hover:bg-primary/5"
              onClick={handleAIGrade}
              disabled={isAILoading}
            >
              {isAILoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              AI Grade Assistant
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-medium">Submission Content:</h4>
            <div className="p-3 rounded-md bg-muted/50 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto border">
              {submission.content || "No text content provided."}
            </div>
          </div>

          {submission.fileUrl && (
            <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Attached File</span>
                  <span className="text-xs text-muted-foreground">Student uploaded a document</span>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View File
                </a>
              </Button>
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade (0-100)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
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
                  <FormLabel>Feedback</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Great job! Just a few notes..."
                      className="min-h-37.5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? "Saving..." : "Save Grade"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
