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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { StudentInsightContent } from "./ai/student-insight-content";
import { useTranslation } from "react-i18next";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";

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
  const { mutate: sendNotification, mutation: sendMutation } =
    useCustomMutation();
  const isSending = sendMutation.isPending;

  const { query } = useCustom<AIInsight>({
    url: `/ai/student-insight/${studentId}/${classId}`,
    method: "get",
    queryOptions: {
      enabled:
        isOpen &&
        !!studentId &&
        !!classId &&
        coreData?.globalConfig?.enableAiFeatures !== false,
    },
  });

  const { data: insightData, isLoading, isError, refetch } = query;
  const insight = insightData?.data;

  const handleCopy = () => {
    if (!insight) return;
    const text = `${t("common.aiInsightTitle", { name: studentName })}:\n\n${t("common.strengths")}:\n${insight.strengths.join("\n")}\n\n${t("common.weaknesses")}:\n${insight.weaknesses.join("\n")}\n\n${t("common.improvementPlan")}:\n${insight.improvementPlan}\n\n${t("common.aiSummary")}:\n${insight.summary}`;
    navigator.clipboard.writeText(text);
    toast.success(t("common.insightCopied"));
  };

  const handleSendToStudent = () => {
    if (!insight) return;

    sendNotification(
      {
        url: "/notifications",
        method: "post",
        values: {
          userId: studentId,
          type: "ai_insight",
          title: t("common.aiInsightTitle", { name: studentName }),
          message: insight.summary,
          payload: {
            insight,
            classId,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success(
            t(
              "common.insightSentSuccess",
              "AI Insight shared with student successfully!",
            ),
          );
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
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            {t("common.aiInsightTitle", { name: studentName })}
          </DialogTitle>
          <DialogDescription>{t("common.aiInsightDesc")}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pe-4 rtl:pe-0 rtl:ps-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
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
            disabled={!insight}
          >
            <ClipboardCopy className="h-4 w-4 me-2 rtl:me-0 rtl:ms-2" />
            {t("common.copyInsight")}
          </Button>
          <Button
            size="sm"
            disabled={!insight || isSending}
            onClick={handleSendToStudent}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin me-2 rtl:me-0 rtl:ms-2" />
            ) : (
              <Send className="h-4 w-4 me-2 rtl:me-0 rtl:ms-2 rtl:rotate-180" />
            )}
            {t("common.sendToStudent")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
