import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UpcomingAssignment } from "@/types/dashboard";
import { AssignmentItemCard } from "./assignment-item-card";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck,
  Sparkles,
  ArrowRight,
  Calendar,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface UpcomingAssignmentsListProps {
  assignments: UpcomingAssignment[];
  list: (resource: string) => void;
  show: (resource: string, id: string) => void;
}

export const UpcomingAssignmentsList = ({
  assignments,
  list,
  show,
}: UpcomingAssignmentsListProps) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">
              {t("dashboard.student.upcomingTasks")}
            </h3>
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              {t("dashboard.student.dontMissDeadlines")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="hidden sm:flex rounded-full px-3 py-1 font-black text-[10px] uppercase tracking-widest bg-muted/50 border-none"
          >
            {t("dashboard.student.pendingCount", { count: assignments.length })}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => list("assignments")}
            className="h-8 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 gap-2 group transition-all"
          >
            {t("buttons.viewAll")}
            <ArrowRight
              className={cn(
                "h-3 w-3 group-hover:translate-x-1 transition-transform",
                i18n.language === "ar" &&
                  "rotate-180 group-hover:-translate-x-1",
              )}
            />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {assignments.length > 0 ? (
            assignments.map((assignment, idx) => (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
              >
                <AssignmentItemCard
                  assignment={assignment}
                  onOpen={(id) => show("assignments", id)}
                />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full text-center py-16 border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2rem] flex flex-col items-center gap-4 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative p-5 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500">
                  <Calendar className="h-10 w-10" />
                </div>
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-xl font-black tracking-tight text-foreground">
                  {t("dashboard.student.allCaughtUp")}
                </p>
                <p className="text-sm font-medium text-muted-foreground/60">
                  {t("dashboard.student.noUpcoming")}
                </p>
              </div>
              <div className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60 relative z-10">
                <Sparkles className="h-3 w-3" />
                <span>{t("dashboard.student.greatJobStudent")}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {assignments.length > 0 && (
        <div className="pt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
          <Info className="h-3 w-3" />
          <span>{t("dashboard.student.clickTask")}</span>
        </div>
      )}
    </div>
  );
};
