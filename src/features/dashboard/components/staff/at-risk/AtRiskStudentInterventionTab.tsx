import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  ExternalLink,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Check,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";

interface AtRiskStudentInterventionTabProps {
  suggestedResources?: { title: string; url: string }[];
  message: string;
  setMessage: (msg: string) => void;
  isGenerating: boolean;
  onGenerateEncouragement: () => void;
  feedbackSent: "pos" | "neg" | null;
  onFeedback: (isPositive: boolean) => void;
}

export const AtRiskStudentInterventionTab = ({
  suggestedResources,
  message,
  setMessage,
  isGenerating,
  onGenerateEncouragement,
  feedbackSent,
  onFeedback,
}: AtRiskStudentInterventionTabProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      key="intervention"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8 text-start rtl:text-end"
    >
      {suggestedResources && suggestedResources.length > 0 && (
        <div className="space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-widest text-ai-primary flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            {t("dashboard.staff.atRiskStudents.aiResources")}
          </Label>
          <div className="grid gap-3">
            {suggestedResources.map((res, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-2xl bg-ai-primary/5 border border-ai-primary/10 group hover:bg-ai-primary/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white dark:bg-muted/10 shadow-sm">
                    <BookOpen className="h-4 w-4 text-ai-primary" />
                  </div>
                  <span className="text-xs font-bold">{res.title}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-ai-primary"
                  asChild
                >
                  <a href={res.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {t("dashboard.staff.atRiskStudents.sendEncouragement")}
          </Label>
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 border-ai-primary/20 text-ai-primary hover:bg-ai-primary/5 relative overflow-hidden group shadow-sm"
            onClick={onGenerateEncouragement}
            disabled={isGenerating}
          >
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out] pointer-events-none" />
            {isGenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {t("buttons.aiSuggestion")}
          </Button>
        </div>
        <div className="relative group">
          <Textarea
            placeholder={t("dashboard.staff.atRiskStudents.encouragementPlaceholder")}
            className="min-h-[150px] rounded-2xl bg-muted/20 border-none focus-visible:ring-primary p-6 text-sm leading-relaxed shadow-inner transition-all resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.1, scale: 1 }}
                className="absolute bottom-4 end-4"
              >
                <Sparkles className="h-8 w-8 text-ai-primary" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 🔄 AI FEEDBACK LOOP (Teacher) */}
        {message && !isGenerating && (
          <div className="flex items-center gap-3 px-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              {t("aiHub.studyLab.wasHelpful")}
            </span>
            <AnimatePresence mode="wait">
              {!feedbackSent ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg hover:bg-green-500/10 hover:text-green-600"
                    onClick={() => onFeedback(true)}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onFeedback(false)}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-1.5 text-primary"
                >
                  <Check className="h-3 w-3" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    {t("notifications.thankYou")}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
        <Info className="h-4 w-4 text-primary mt-0.5" />
        <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
          {t("dashboard.staff.atRiskStudents.interventionNote")}
        </p>
      </div>
    </motion.div>
  );
};
