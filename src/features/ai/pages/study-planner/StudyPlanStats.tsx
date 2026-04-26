import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, BrainCircuit, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface StudyPlanStatsProps {
  completedCount: number;
  totalCount: number;
  nextTask?: string;
}

export const StudyPlanStats = ({
  completedCount,
  totalCount,
  nextTask,
}: StudyPlanStatsProps) => {
  const { t } = useTranslation();
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-8 sticky top-32">
      {/* Overall Progress Card */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-xl rounded-4xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            {t("studyPlanner.stats.progressTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-3xl font-black tracking-tighter">
                {completedCount} / {totalCount}
              </span>
              <span className="text-xs font-bold text-muted-foreground mb-1">
                {t("studyPlanner.stats.blocksLabel")}
              </span>
            </div>
            <div className="h-3 w-full bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-widest text-primary/60">
                {t("studyPlanner.stats.nextTask")}
              </p>
              <p className="text-sm font-bold leading-tight">
                {nextTask || t("studyPlanner.stats.allDone")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Tip Box - 🚀 RULE 7: Using BrainCircuit */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-border/40 bg-ai-primary/5 rounded-4xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
            <Sparkles className="h-24 w-24" />
          </div>
          <CardContent className="p-10 space-y-6 text-start">
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-ai-primary/20 text-ai-primary w-fit">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <p className="text-base md:text-xl font-medium text-muted-foreground leading-relaxed italic selection:bg-indigo-500/20">
                "{t("studyPlanner.labels.tipText")}"
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
