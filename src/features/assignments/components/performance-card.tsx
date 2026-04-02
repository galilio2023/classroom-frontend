import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Assignment, Submission } from "@/types";

interface Props {
  assignment: Assignment;
  submission: Submission | null;
  blendedGrade: number | null;
  isAr: boolean;
}

export const PerformanceCard = ({ assignment, submission, blendedGrade, isAr }: Props) => {
  const { t } = useTranslation();

  const isAiPending = submission?.aiApprovalStatus === "pending" && !submission.grade;

  return (
    <AnimatePresence>
      {submission && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full"
        >
          <Card
            className={cn(
              "border-none shadow-2xl overflow-hidden rounded-[2.5rem] md:rounded-[3rem] relative text-start transition-all duration-500",
              submission.grade
                ? "bg-linear-to-br from-primary to-ai-primary text-primary-foreground"
                : "bg-ai-primary/5 border-2 border-dashed border-ai-primary/20 text-foreground"
            )}
          >
            <div
              className={cn(
                "absolute opacity-10 rotate-12 transition-all duration-500",
                isAr ? "-start-12 -top-12" : "-end-12 -top-12",
                isAiPending && "animate-pulse"
              )}
            >
              {submission.grade ? (
                <Trophy className="h-64 w-64" />
              ) : (
                <Sparkles className="h-64 w-64 text-ai-primary" />
              )}
            </div>
            <CardHeader className="p-8 md:p-10 pb-4">
              <CardTitle
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                  submission.grade ? "opacity-70" : "text-ai-primary"
                )}
              >
                {submission.grade ? (
                  <Trophy className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4 animate-pulse" />
                )}
                {submission.grade
                  ? t("assignments.show.academicPerformance")
                  : t("assignments.show.aiProcessing")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 md:p-10 pt-0 space-y-10 relative z-10">
              <div className="flex flex-col gap-6">
                {submission.grade ? (
                  <>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                        {t("assignments.show.instructorGrade")}
                      </p>
                      <p className="text-5xl md:text-6xl font-black">{submission.grade}%</p>
                    </div>
                    {blendedGrade && (
                      <div className="space-y-1 pt-6 border-t border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                          {t("assignments.show.blendedScore")}
                        </p>
                        <p className="text-6xl md:text-7xl font-black tracking-tighter">
                          {blendedGrade.toFixed(1)}%
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-ai-primary/40" />
                        <p className="text-3xl md:text-4xl font-black tracking-tight text-ai-primary/80">
                          {t("assignments.show.aiReviewing", { defaultValue: "AI Reviewing..." })}
                        </p>
                      </div>
                      <p className="text-xs font-bold text-muted-foreground leading-relaxed max-w-[250px]">
                        {t("assignments.show.aiReviewDescription", {
                          defaultValue:
                            "Our AI is analyzing your work to provide instant feedback for your teacher's final review.",
                        })}
                      </p>
                    </div>
                    <div className="h-2 bg-ai-primary/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "10%" }}
                        animate={{ width: "90%" }}
                        transition={{ duration: 15, ease: "linear" }}
                        className="h-full bg-ai-primary rounded-full shadow-[0_0_10px_rgba(var(--ai-primary),0.5)]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {submission.grade && assignment.hasPeerReview && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-70">
                    <span>{t("assignments.show.peerReviewerWeight")}</span>
                    <span>{assignment.peerReviewWeight}%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden p-1 border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${assignment.peerReviewWeight}%` }}
                      className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                    />
                  </div>
                </div>
              )}

              {submission.grade && (
                <Button
                  variant="secondary"
                  className="w-full rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 bg-white text-primary hover:bg-white/90 shadow-2xl shadow-black/20"
                >
                  {t("buttons.viewReport")}
                  <ArrowRight className={cn("h-4 w-4 ms-2", isAr && "rotate-180 me-2 ms-0")} />
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
