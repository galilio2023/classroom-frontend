import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Sparkles, Loader2, Send, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { AtRiskStudentAnalysisTab } from "./AtRiskStudentAnalysisTab";
import { AtRiskStudentInterventionTab } from "./AtRiskStudentInterventionTab";

interface AtRiskStudentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: any;
  activeTab: "analysis" | "intervention";
  setActiveTab: (tab: "analysis" | "intervention") => void;
  isArabic: boolean;
  message: string;
  setMessage: (msg: string) => void;
  isGenerating: boolean;
  onGenerateEncouragement: () => void;
  feedbackSent: "pos" | "neg" | null;
  onFeedback: (isPositive: boolean) => void;
  onSend: () => void;
  isSending: boolean;
}

export const AtRiskStudentDialog = ({
  isOpen,
  onOpenChange,
  student,
  activeTab,
  setActiveTab,
  isArabic,
  message,
  setMessage,
  isGenerating,
  onGenerateEncouragement,
  feedbackSent,
  onFeedback,
  onSend,
  isSending,
}: AtRiskStudentDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] rounded-4xl border-none shadow-2xl bg-card/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto text-start rtl:text-end p-0">
        <div className="p-8 pb-4">
          <DialogHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-destructive/10 text-destructive w-fit">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-ai-primary/10 text-ai-primary border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg">
                  <Sparkles className="w-3 h-3 ltr:me-1 rtl:ms-1" />
                  {t("dashboard.staff.atRiskStudents.aiSupportReady")}
                </Badge>
              </div>
            </div>
            <DialogTitle
              className={cn("text-2xl", isArabic ? "font-bold" : "font-black tracking-tight")}
            >
              {t("dashboard.staff.atRiskStudents.interventionTitle", {
                name: student.name,
              })}
            </DialogTitle>
            <DialogDescription className="font-medium">
              {t("dashboard.staff.atRiskStudents.interventionDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-1 p-1 mt-6 bg-muted/30 rounded-xl w-fit">
            <Button
              variant={activeTab === "analysis" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-lg font-bold text-[10px] uppercase tracking-widest px-4 h-9"
              onClick={() => setActiveTab("analysis")}
            >
              {t("dashboard.staff.atRiskStudents.tabs.analysis")}
            </Button>
            <Button
              variant={activeTab === "intervention" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-lg font-bold text-[10px] uppercase tracking-widest px-4 h-9"
              onClick={() => setActiveTab("intervention")}
            >
              {t("dashboard.staff.atRiskStudents.tabs.intervention")}
            </Button>
          </div>
        </div>

        <div className="px-8 py-4 pb-8 space-y-8">
          {activeTab === "analysis" ? (
            <AtRiskStudentAnalysisTab aiAnalysis={student.aiAnalysis} />
          ) : (
            <AtRiskStudentInterventionTab
              suggestedResources={student.suggestedResources}
              message={message}
              setMessage={setMessage}
              isGenerating={isGenerating}
              onGenerateEncouragement={onGenerateEncouragement}
              feedbackSent={feedbackSent}
              onFeedback={onFeedback}
            />
          )}

          <DialogFooter className="gap-3 pt-4">
            <Button
              variant="ghost"
              className="rounded-xl font-bold h-12"
              onClick={() => onOpenChange(false)}
            >
              {t("buttons.cancel")}
            </Button>
            {activeTab === "intervention" && (
              <Button
                className="rounded-xl font-black uppercase tracking-widest h-12 px-8 shadow-lg shadow-primary/20 gap-2"
                onClick={onSend}
                disabled={isSending || !message.trim()}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {t("buttons.sendUpdateStatus")}
              </Button>
            )}
            {activeTab === "analysis" && (
              <Button
                className="rounded-xl font-black uppercase tracking-widest h-12 px-8 shadow-lg shadow-primary/20 gap-2"
                onClick={() => setActiveTab("intervention")}
              >
                {t("buttons.takeAction")}
                <ArrowRight className="h-4 w-4 ltr:ms-2 rtl:me-2 rtl:rotate-180" />
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
