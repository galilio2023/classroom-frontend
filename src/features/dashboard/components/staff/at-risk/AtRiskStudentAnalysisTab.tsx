import { motion } from "framer-motion";
import { Sparkles, Info, CheckCircle2, TrendingDown, Zap } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface AtRiskStudentAnalysisTabProps {
  aiAnalysis?: {
    strengths: string[];
    weaknesses: string[];
    improvementPlan: string[];
    summary: string;
  };
}

export const AtRiskStudentAnalysisTab = ({ aiAnalysis }: AtRiskStudentAnalysisTabProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      key="analysis"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8 text-start rtl:text-end"
    >
      {/* SUMMARY SECTION */}
      <div className="p-6 rounded-3xl bg-ai-primary/3 border border-ai-primary/10 space-y-3 relative overflow-hidden group">
        <div className="absolute top-0 end-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Sparkles className="w-12 h-12 text-ai-primary" />
        </div>
        <Label className="text-[10px] font-black uppercase tracking-widest text-ai-primary flex items-center gap-2">
          <Info className="h-3 w-3" />
          {t("dashboard.staff.atRiskStudents.guardianSummary")}
        </Label>
        <p className="text-sm leading-relaxed font-medium break-words whitespace-pre-wrap">
          {typeof aiAnalysis === "object"
            ? aiAnalysis.summary
            : aiAnalysis || "No analysis available."}
        </p>
      </div>

      {/* STRENGTHS & WEAKNESSES GRID */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-success/3 border border-success/10 space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-widest text-success flex items-center gap-2">
            <CheckCircle2 className="h-3 w-3" />
            {t("dashboard.staff.atRiskStudents.strengths")}
          </Label>
          <div className="space-y-2">
            {(typeof aiAnalysis === "object" &&
              aiAnalysis.strengths?.map((s, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-[11px] font-medium text-success/80 leading-relaxed break-words"
                >
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-success flex-shrink-0" />
                  <span className="flex-1 min-w-0">{s}</span>
                </div>
              ))) || (
              <span className="text-[11px] text-muted-foreground italic">
                No strengths identified yet.
              </span>
            )}
          </div>
        </div>
        <div className="p-5 rounded-3xl bg-destructive/3 border border-destructive/10 space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-widest text-destructive flex items-center gap-2">
            <TrendingDown className="h-3 w-3" />
            {t("dashboard.staff.atRiskStudents.weaknesses")}
          </Label>
          <div className="space-y-2">
            {(typeof aiAnalysis === "object" &&
              aiAnalysis.weaknesses?.map((w, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-[11px] font-medium text-destructive/80 leading-relaxed break-words"
                >
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-destructive flex-shrink-0" />
                  <span className="flex-1 min-w-0">{w}</span>
                </div>
              ))) || (
              <span className="text-[11px] text-muted-foreground italic">
                No risk factors identified.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* IMPROVEMENT PLAN */}
      <div className="p-6 rounded-3xl bg-primary/3 border border-primary/10 space-y-4">
        <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
          <Zap className="h-3 w-3" />
          {t("dashboard.staff.atRiskStudents.plan")}
        </Label>
        <div className="grid gap-3">
          {(typeof aiAnalysis === "object" &&
            aiAnalysis.improvementPlan?.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-background border border-black/3 shadow-sm"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">
                  {i + 1}
                </div>
                <span className="text-xs font-semibold break-words">{p}</span>
              </div>
            ))) || (
            <span className="text-xs text-muted-foreground italic">Generating roadmap...</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
