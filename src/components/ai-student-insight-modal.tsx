import { useCustom, useCustomMutation } from "@refinedev/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  ClipboardCopy,
  Send,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { StudentInsightContent } from "./ai/student-insight-content";
import { useTranslation } from "react-i18next";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { useState } from "react";

interface AIInsight {
  strengths: string[];
  weaknesses: string[];
  improvementPlan: string;
  summary: string;
}

interface AIStudentInsightModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  classId: string;
}

export const AIStudentInsightModal = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  classId,
}: AIStudentInsightModalProps) => {
  const { t } = useTranslation();
  const { coreData } = useDashboard();
  const [isCopied, setIsCopied] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const { mutate: sendNotification, mutation: sendMutation } =
    useCustomMutation();
  const isSending = sendMutation.isPending;

  const { query } = useCustom<AIInsight>({
    url: `/ai/student-insight/${studentId}/${classId}`,
    method: "get",
    queryOptions: {
      // 🛡️ RACE CONDITION GUARD: Explicitly wait for coreData and enableAiFeatures to be true
      enabled:
        isOpen &&
        !!studentId &&
        !!classId &&
        !!coreData?.globalConfig &&
        coreData.globalConfig.enableAiFeatures === true,
    },
  });

  const { data: insightData, isLoading, isError, refetch } = query;
  const insight = insightData?.data;

  const handleCopy = () => {
    if (!insight) return;
    const text = `${t("common.aiInsightTitle", { name: studentName })}:\n\n${t("common.strengths")}:\n${insight.strengths.join("\n")}\n\n${t("common.weaknesses")}:\n${insight.weaknesses.join("\n")}\n\n${t("common.improvementPlan")}:\n${insight.improvementPlan}\n\n${t("common.aiSummary")}:\n${insight.summary}`;
    navigator.clipboard.writeText(text);
    
    setIsCopied(true);
    toast.success(t("common.insightCopied"));
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSendToStudent = () => {
    if (!insight) return;

    // 🛡️ PAYLOAD SAFETY: Truncate message for notification system limits
    const safeSummary = insight.summary.length > 200 
        ? `${insight.summary.substring(0, 200)}...` 
        : insight.summary;

    sendNotification(
      {
        url: "/notifications",
        method: "post",
        values: {
          userId: studentId,
          type: "ai_insight",
          title: t("common.aiInsightTitle", { name: studentName }),
          message: safeSummary,
          payload: {
            insight,
            classId,
          },
        },
      },
      {
        onSuccess: () => {
          setIsSent(true);
          toast.success(
            t(
              "common.insightSentSuccess",
              "AI Insight shared with student successfully!",
            ),
          );
          setTimeout(() => setIsSent(false), 2000);
        },
        onError: () => {
          toast.error(t("common.insightSentError", "Failed to share insight."));
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-ai-primary animate-pulse" />
            {t("common.aiInsightTitle", { name: studentName })}
          </DialogTitle>
          <DialogDescription>{t("common.aiInsightDesc")}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pe-4 rtl:pe-0 rtl:ps-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-ai-primary" />
              <p className="text-sm text-muted-foreground animate-pulse">
                {t("common.analyzingData")}
              </p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <div className="space-y-1">
                <p className="font-semibold">{t("common.failedInsight")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("common.aiServiceError")}
                </p>
              </div>
              <Button variant="outline" onClick={() => refetch()}>
                {t("buttons.tryAgain")}
              </Button>
            </div>
          ) : insight ? (
            <StudentInsightContent insight={insight} />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <p>{t("common.noInsight")}</p>
            </div>
          )}
        </ScrollArea>

        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!insight || isCopied}
            className="rounded-xl"
          >
            {isCopied ? (
                <CheckCircle2 className="h-4 w-4 me-2 rtl:me-0 rtl:ms-2 text-green-500" />
            ) : (
                <ClipboardCopy className="h-4 w-4 me-2 rtl:me-0 rtl:ms-2" />
            )}
            {isCopied ? t("common.copied") : t("common.copyInsight")}
          </Button>
          <Button
            size="sm"
            disabled={!insight || isSending || isSent}
            onClick={handleSendToStudent}
            className="rounded-xl"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin me-2 rtl:me-0 rtl:ms-2" />
            ) : isSent ? (
              <CheckCircle2 className="h-4 w-4 me-2 rtl:me-0 rtl:ms-2" />
            ) : (
              <Send className="h-4 w-4 me-2 rtl:me-0 rtl:ms-2 rtl:rotate-180" />
            )}
            {isSent ? t("common.sent") : t("common.sendToStudent")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
