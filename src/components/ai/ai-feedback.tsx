import React, { useState } from "react";
import { useCustomMutation } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface AIFeedbackProps {
  actionType: string;
  metadata?: Record<string, any>;
  className?: string;
}

export const AIFeedback: React.FC<AIFeedbackProps> = ({ actionType, metadata, className }) => {
  const { t } = useTranslation();
  const [feedbackSent, setFeedbackSent] = useState<"pos" | "neg" | null>(null);
  const { mutate: sendFeedback, isLoading } = useCustomMutation() as any;

  const handleFeedback = (isPositive: boolean) => {
    if (isLoading || feedbackSent) return;

    setFeedbackSent(isPositive ? "pos" : "neg");
    sendFeedback(
      {
        url: "/ai/feedback",
        method: "post",
        values: {
          actionType,
          isPositive,
          metadata,
        },
      },
      {
        onSuccess: () => {
          toast.success(t("notifications.thankYou" as any));
        },
        onError: () => {
          setFeedbackSent(null);
          toast.error("Failed to record feedback.");
        },
      }
    );
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <AnimatePresence mode="wait">
        {!feedbackSent ? (
          <motion.div
            key="actions"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground me-2">
              {t("aiHub.studyLab.wasHelpful" as any)}
            </span>
            <Button
              size="sm"
              variant="ghost"
              disabled={isLoading}
              className="h-8 w-8 p-0 rounded-full hover:bg-green-500/10 hover:text-green-600 transition-colors"
              onClick={() => handleFeedback(true)}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={isLoading}
              className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => handleFeedback(false)}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-green-600"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {t("notifications.thankYou" as any)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
