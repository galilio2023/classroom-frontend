import { useCustom } from "@refinedev/core";
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
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { StudentInsightContent } from "./ai/student-insight-content";
import { useTranslation } from "react-i18next";

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
  classId 
}: AIStudentInsightModalProps) => {
  const { t } = useTranslation();
  const { data: insightData, isLoading, isError, refetch } = useCustom<AIInsight>({
    url: `/ai/student-insight/${studentId}/${classId}`,
    method: "get",
    queryOptions: {
      enabled: isOpen && !!studentId && !!classId,
    },
  }) as any;

  const insight = insightData?.data;

  const handleCopy = () => {
    if (!insight) return;
    const text = `${t("common.aiInsightTitle", { name: studentName })}:\n\n${t("common.strengths")}:\n${insight.strengths.join("\n")}\n\n${t("common.weaknesses")}:\n${insight.weaknesses.join("\n")}\n\n${t("common.improvementPlan")}:\n${insight.improvementPlan}\n\n${t("common.aiSummary")}:\n${insight.summary}`;
    navigator.clipboard.writeText(text);
    toast.success(t("common.insightCopied"));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            {t("common.aiInsightTitle", { name: studentName })}
          </DialogTitle>
          <DialogDescription>
            {t("common.aiInsightDesc")}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 rtl:pr-0 rtl:pl-4">
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
          <Button variant="outline" size="sm" onClick={handleCopy} disabled={!insight}>
            <ClipboardCopy className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
            {t("common.copyInsight")}
          </Button>
          <Button size="sm" disabled={!insight} onClick={() => toast.info("Feature coming soon")}>
            <Send className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2 rtl:rotate-180" />
            {t("common.sendToStudent")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
