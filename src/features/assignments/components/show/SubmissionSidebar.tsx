import { Info, Sparkles, Save, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface SubmissionSidebarProps {
  formLoading: boolean;
  isSuccess: boolean;
  onSaveDraft: () => void;
  onCancel?: () => void;
  isAr: boolean;
  hasExistingSubmission: boolean;
  isDraft: boolean;
}

export const SubmissionSidebar = ({
  formLoading,
  isSuccess,
  onSaveDraft,
  onCancel,
  isAr,
  hasExistingSubmission,
  isDraft,
}: SubmissionSidebarProps) => {
  const { t } = useTranslation();
  const tips = t("assignments.form.tips", { returnObjects: true });
  const tipsList = Array.isArray(tips) ? tips : [];

  return (
    <div className="lg:col-span-1 space-y-6 text-start">
      <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Info className="h-3.5 w-3.5" />
          </div>
          {t("assignments.form.submissionTips")}
        </h4>
        <ul className="space-y-3">
          {tipsList.map((tip: any, i: number) => (
            <li
              key={i}
              className="flex items-start gap-2 text-xs font-medium text-muted-foreground"
            >
              <div className="mt-1 size-1 rounded-full bg-primary/40" />
              {tip}
            </li>
          ))}
        </ul>
        <div className="pt-4 border-t border-primary/10">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {t("assignments.form.aiReady")}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
            {t("assignments.form.aiDescription")}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          onClick={onSaveDraft}
          disabled={formLoading}
          className="w-full h-14 rounded-2xl font-black uppercase tracking-widest border-primary/10 bg-card/50 backdrop-blur-sm hover:bg-primary/5 text-primary gap-2"
        >
          <Save className="h-4 w-4" />
          {t("buttons.saveAsDraft")}
        </Button>

        <LoadingButton
          type="submit"
          isLoading={formLoading}
          isSuccess={isSuccess}
          className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 gap-2"
        >
          <Send className={cn("h-4 w-4", isAr && "rotate-180")} />
          {hasExistingSubmission && !isDraft ? t("buttons.resubmitWork") : t("buttons.turnInNow")}
        </LoadingButton>

        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={formLoading}
            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-muted-foreground hover:bg-destructive/5 hover:text-destructive gap-2"
          >
            <X className="h-4 w-4" />
            {t("buttons.cancel")}
          </Button>
        )}
      </div>
    </div>
  );
};
