import {} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ClipboardCheck, Sparkles } from "lucide-react";
import { PendingSubmission } from "@/types/dashboard";
import { PendingSubmissionCard } from "./pending-submission-card";
import { motion, AnimatePresence } from "framer-motion";
import {} from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface PendingGradingListProps {
  submissions: PendingSubmission[];
  show: (resource: string, id: string) => void;
}

export const PendingGradingList = ({ submissions, show }: PendingGradingListProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">
              {t("dashboard.staff.pendingGrading")}
            </h3>
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              {t("dashboard.staff.submissionsAwaiting")}
            </p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className="rounded-full px-3 py-1 font-black text-[10px] uppercase tracking-widest bg-primary/10 text-primary border-none animate-pulse"
        >
          {t("dashboard.staff.newSubmissions", { count: submissions.length })}
        </Badge>
      </div>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {submissions.length > 0 ? (
            submissions.map((submission, idx) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
              >
                <PendingSubmissionCard
                  submission={submission}
                  onGrade={(id) => show("assignments", id)}
                />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-4xl flex flex-col items-center gap-4 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-linear-to-br from-success/5 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="absolute inset-0 bg-success/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative p-5 rounded-full bg-success/10 text-success group-hover:scale-110 transition-transform duration-500">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-xl font-black tracking-tight text-foreground">
                  {t("dashboard.staff.allCaughtUp")}
                </p>
                <p className="text-sm font-medium text-muted-foreground/60">
                  {t("dashboard.staff.allGraded")}
                </p>
              </div>
              <div className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-success/60 relative z-10">
                <Sparkles className="h-3 w-3" />
                <span>{t("dashboard.staff.greatJobTeacher")}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
