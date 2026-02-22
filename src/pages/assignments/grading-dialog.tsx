import { useForm, SubmitHandler } from "react-hook-form";
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
import { useUpdate, useCustomMutation, useNotification } from "@refinedev/core";
import { Submission, Assignment } from "@/types";
import { useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";

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

interface AIFeedbackResponse {
  suggestedGrade: number;
  feedback: string;
  summary: string;
}

export const GradingDialog = ({
  isOpen,
  onOpenChange,
  submission,
}: GradingDialogProps) => {
  const { open } = useNotification();
  const { mutate, mutation } = useUpdate();
  const { isPending } = mutation;

  const { mutate: getAIFeedback, mutation: aiMutation } = useCustomMutation<AIFeedbackResponse>();
  const isAILoading = aiMutation.isPending;

  const form = useForm<GradingFormValues>({
    resolver: zodResolver(gradingSchema),
    defaultValues: {
      grade: 0,
      feedback: "",
    },
  });

  // Reset form when submission changes
  useEffect(() => {
    if (submission) {
      form.reset({
        grade: submission.grade ?? 0,
        feedback: submission.feedback ?? "",
      });
    }
  }, [submission, form]);

  const onSubmit: SubmitHandler<GradingFormValues> = (values) => {
    if (!submission) return;

    mutate(
      {
        resource: "submissions",
        id: submission.id,
        values: values,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  const handleAIGrade = () => {
    if (!submission) return;

    getAIFeedback(
      {
        url: "/ai/generate-feedback",
        method: "post",
        values: {
          assignmentTitle: submission.assignment?.title,
          assignmentDescription: submission.assignment?.description,
          studentSubmission: submission.content,
        },
      },
      {
        onSuccess: (data) => {
          const { suggestedGrade, feedback } = data.data;
          form.setValue("grade", suggestedGrade);
          form.setValue("feedback", feedback);
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
      <DialogContent className="sm:max-w-[600px]">
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

        <div className="py-4">
          <h4 className="mb-2 text-sm font-medium">Submission Content:</h4>
          <div className="p-3 rounded-md bg-muted/50 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto border">
            {submission.content}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
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
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Great job! Just a few notes..."
                      className="min-h-[150px]"
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
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Grade"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
