import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PeerReview, Assignment } from "@/types";
import { useUpdate } from "@refinedev/core";
import { Loader2, CheckCircle2, Star, MessageSquare, Info, Sparkles, Send } from "lucide-react";
import {} from "@/lib/utils";
import { motion } from "framer-motion";
import {} from "@/components/ui/label";
import { useTranslation } from "react-i18next";

const peerReviewSchema = z.object({
  scores: z.record(z.string(), z.coerce.number().min(0)),
  feedback: z.string().min(10, "Feedback must be at least 10 characters"),
});

type PeerReviewFormValues = z.infer<typeof peerReviewSchema>;

interface PeerReviewFormProps {
  review: PeerReview;
  assignment: Assignment;
  onSuccess?: () => void;
}

export const PeerReviewForm = ({ review, assignment, onSuccess }: PeerReviewFormProps) => {
  const { t } = useTranslation();
  const { mutate, mutation } = useUpdate();
  const isLoading = mutation.isPending;

  const form = useForm<PeerReviewFormValues>({
    resolver: zodResolver(peerReviewSchema),
    defaultValues: {
      scores: review.scores || {},
      feedback: review.feedback || "",
    },
  });

  const onSubmit = (values: PeerReviewFormValues) => {
    mutate(
      {
        resource: "peer-reviews",
        id: review.id,
        values,
        successNotification: {
          message: t("assignments.show.toast.peersSuccess"),
          type: "success",
        },
      },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      }
    );
  };

  const isSubmitted = !!review.feedback;

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-[1.5rem] bg-success/5 border-2 border-success/20 flex flex-col items-center justify-center gap-4 text-center shadow-sm"
      >
        <div className="p-3 rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-8 w-8 stroke-[3]" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black tracking-tight text-success">
            {t("assignments.show.peersAssigned")}
          </h3>
          <p className="text-sm text-success/70 font-medium">
            {t("assignments.show.pendingReview")}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <Card className="border-none shadow-none bg-muted/20 rounded-[1.5rem] overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-primary/10 p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-primary">
            <Star className="h-4 w-4" />
            {t("assignments.create.gradingRubric")}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              {t("assignments.create.criteria")}: {assignment.rubric.length}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignment.rubric.map((item, idx) => (
                <FormField
                  key={item.criteria}
                  control={form.control}
                  name={`scores.${item.criteria}`}
                  render={({ field }) => (
                    <FormItem className="space-y-3 p-4 rounded-2xl bg-background/50 border border-black/3 dark:border-white/3 shadow-sm hover:border-primary/20 transition-all group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                            {idx + 1}
                          </div>
                          <FormLabel className="text-xs font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                            {item.criteria}
                          </FormLabel>
                        </div>
                        <div className="px-2 py-0.5 rounded-full bg-muted text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                          {t("assignments.create.maxPoints")}: {item.maxPoints}
                        </div>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            max={item.maxPoints}
                            min={0}
                            {...field}
                            className="h-12 text-lg font-black text-center rounded-xl bg-muted/20 border-none focus-visible:ring-primary transition-all"
                          />
                          <div className="absolute end-3 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-20 uppercase tracking-widest">
                            PTS
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {t("assignments.grading.feedbackToStudent")}
                    </FormLabel>
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-primary/60">
                      <Sparkles className="h-2.5 w-2.5" />
                      {t("buttons.aiSuggestion")}
                    </div>
                  </div>
                  <FormControl>
                    <div className="relative group">
                      <Textarea
                        placeholder={t("assignments.grading.feedbackPlaceholder")}
                        className="min-h-[150px] rounded-2xl resize-none bg-muted/10 border-2 border-transparent focus-visible:ring-primary p-5 text-sm leading-relaxed shadow-inner transition-all"
                        {...field}
                      />
                      <div className="absolute bottom-4 end-4 opacity-10 group-focus-within:opacity-30 transition-opacity">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <Info className="h-3.5 w-3.5 text-primary mt-0.5" />
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      {t("assignments.show.integrityDescription")}
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              {t("buttons.submitEvaluation", { defaultValue: "Submit Evaluation" })}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
