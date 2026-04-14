import { useEffect, useState, useCallback, useRef } from "react";
import { useCustomMutation } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useSocket } from "@/contexts/socket-context";
import { Submission, AIFeedbackResponse } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface UseGradingAutomationProps {
  submission: Submission | null;
  isOpen: boolean;
  isStaff: boolean;
  isDraft?: boolean;
  setValue: (name: string, value: any) => void;
}

export const useGradingAutomation = ({
  submission,
  isOpen,
  isStaff,
  isDraft,
  setValue,
}: UseGradingAutomationProps) => {
  const { t } = useTranslation();
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  // 🛡️ TRANSACTION TRACKING: Prevent duplicate/stale updates
  const lastTransactionId = useRef<string | null>(null);
  const dataApplied = useRef<boolean>(false);

  const [hasAutoAnalyzed, setHasAutoAnalyzed] = useState(false);
  const [isAISuggested, setIsAISuggested] = useState(false);
  const [aiStatus, setAiStatus] = useState<Submission["aiStatus"]>(submission?.aiStatus || "idle");
  const [aiError, setAiError] = useState<string | null>(submission?.aiError || null);

  const { mutate: getAIFeedback, mutation: aiMutation } = useCustomMutation<any>();
  const isAILoading = aiMutation.isPending || aiStatus === "processing";

  // Reset state when a new submission opens
  useEffect(() => {
    if (isOpen) {
      setHasAutoAnalyzed(false);
      setIsAISuggested(false);
      setAiStatus(submission?.aiStatus || "idle");
      setAiError(submission?.aiError || null);
      lastTransactionId.current = null;
      dataApplied.current = false;
    }
  }, [isOpen, submission?.id, submission?.aiStatus, submission?.aiError]);

  // Helper to apply AI data safely
  const applyAIData = useCallback(
    (data: AIFeedbackResponse, source: "http" | "socket") => {
      if (dataApplied.current) return; // Already applied via other channel

      const { suggestedGrade, feedback } = data;
      setValue("grade", Number(suggestedGrade));
      setValue("feedback", feedback);
      setIsAISuggested(true);
      setAiStatus("completed");
      setAiError(null);
      dataApplied.current = true;

      toast.success(
        t("assignments.grading.toasts.aiComplete", {
          defaultValue: `AI analysis complete! (via ${source})`,
        })
      );
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
    [setValue, t, queryClient]
  );

  // Socket logic for async grading
  useEffect(() => {
    if (isOpen && submission?.id && socket) {
      socket.emit("join_submission", submission.id);

      const handleAiComplete = (data: { result: AIFeedbackResponse; correlationId?: string }) => {
        // 🛡️ VALIDATE: Only apply if it matches our last request OR is a legacy event
        if (
          lastTransactionId.current &&
          data.correlationId &&
          data.correlationId !== lastTransactionId.current
        ) {
          return;
        }
        applyAIData(data.result, "socket");
      };

      const handleAiFailed = (data: { error: string; correlationId?: string }) => {
        if (
          lastTransactionId.current &&
          data.correlationId &&
          data.correlationId !== lastTransactionId.current
        ) {
          return;
        }
        setAiStatus("failed");
        setAiError(data.error);
        toast.error(
          t("assignments.grading.toasts.aiFailed", {
            defaultValue: "AI analysis failed.",
          })
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
  }, [isOpen, submission?.id, socket, applyAIData, t]);

  const handleAIGrade = useCallback(() => {
    if (!submission || !isStaff || isDraft) return;

    const transactionId = uuidv4();
    lastTransactionId.current = transactionId;
    dataApplied.current = false;

    setAiStatus("processing");
    getAIFeedback(
      {
        url: `/submissions/${submission.id}/ai-grade`,
        method: "post",
        values: { correlationId: transactionId },
      },
      {
        onSuccess: (response: any) => {
          // If backend already returned 200 with full data (fast path)
          if (response.data && response.data.suggestedGrade) {
            applyAIData(response.data, "http");
          }
        },
        onError: (error: any) => {
          // Only show error if socket hasn't already succeeded
          if (!dataApplied.current) {
            setAiStatus("failed");
            setAiError(error.message);
          }
        },
      }
    );
  }, [submission, isStaff, isDraft, getAIFeedback, applyAIData]);

  // Auto-trigger AI if appropriate
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
  }, [submission, isOpen, isStaff, hasAutoAnalyzed, isAILoading, isDraft, aiStatus, handleAIGrade]);

  return {
    isAISuggested,
    aiStatus,
    aiError,
    isAILoading,
    handleAIGrade,
  };
};
