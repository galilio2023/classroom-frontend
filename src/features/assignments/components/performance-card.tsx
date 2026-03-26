import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ArrowRight } from "lucide-react";
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

  return (
    <AnimatePresence>
      {submission?.grade && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="border-none shadow-2xl bg-linear-to-br from-primary to-ai-primary text-primary-foreground overflow-hidden rounded-[2.5rem] md:rounded-[3rem] relative text-start">
            <div
              className={cn(
                "absolute opacity-10 rotate-12",
                isAr ? "-start-12 -top-12" : "-end-12 -top-12"
              )}
            >
              <Trophy className="h-64 w-64" />
            </div>
            <CardHeader className="p-8 md:p-10 pb-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-70 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                {t("assignments.show.academicPerformance")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 md:p-10 pt-0 space-y-10 relative z-10">
              <div className="flex flex-col gap-6">
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
              </div>

              {assignment.hasPeerReview && (
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

              <Button
                variant="secondary"
                className="w-full rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 bg-white text-primary hover:bg-white/90 shadow-2xl shadow-black/20"
              >
                {t("buttons.viewReport")}
                <ArrowRight className={cn("h-4 w-4 ms-2", isAr && "rotate-180 me-2 ms-0")} />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
