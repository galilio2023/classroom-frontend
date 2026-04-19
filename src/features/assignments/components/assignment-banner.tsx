import { Assignment, Submission } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  FileText,
  Users,
  Trophy,
  BrainCircuit,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { eventBus, UI_EVENTS } from "@/lib/event-bus";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface Props {
  assignment: Assignment;
  submissions: Submission[];
  isStaff: boolean;
  isQuiz?: boolean;
  isPhysicsLab?: boolean;
  isMonitoring?: boolean;
  setIsMonitoring?: (val: boolean) => void;
}

const StatItem = ({
  icon: Icon,
  label,
  value,
  iconColor,
  valueColor,
}: {
  icon: any;
  label: string;
  value: string | number;
  iconColor?: string;
  valueColor?: string;
}) => (
  <div className="flex items-center gap-3">
    <div className="p-2.5 rounded-xl bg-muted/50 border border-border/40 shadow-inner">
      <Icon className={cn("h-5 w-5", iconColor || "text-muted-foreground")} />
    </div>
    <div className="flex flex-col text-start">
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
        {label}
      </span>
      <span className={cn("font-bold text-sm uppercase", valueColor || "text-foreground")}>
        {value}
      </span>
    </div>
  </div>
);

export const AssignmentBanner = ({
  assignment,
  submissions,
  isStaff,
  isQuiz,
  isPhysicsLab,
  isMonitoring,
  setIsMonitoring,
}: Props) => {
  const { t } = useTranslation();
  const dueDate = assignment.dueDate ? dayjs(assignment.dueDate) : null;
  const isOverdue = dueDate ? dayjs().isAfter(dueDate) : false;

  const handleAiHelp = () => {
    eventBus.emit(UI_EVENTS.OPEN_STUDY_BUDDY, { classId: assignment.classId });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-[2.5rem] md:rounded-[3rem] border border-border/40 bg-card/50 backdrop-blur-3xl shadow-2xl text-start"
    >
      <div className="absolute top-0 start-0 w-full h-2 bg-linear-to-r from-primary via-ai-primary to-primary" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />

      <div className="p-8 md:p-12 flex flex-col gap-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 md:gap-10">
          <div className="space-y-6 flex-1">
            <div className="flex flex-wrap gap-3">
              {assignment.hasPeerReview && (
                <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-4 py-1.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-sm">
                  <Users className="h-4 w-4" />
                  {t("assignments.show.banner.peerReviewActive")}
                </Badge>
              )}
              {isQuiz && (
                <Badge className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-sm">
                  <BrainCircuit className="h-4 w-4" />
                  {t("assignments.show.banner.aiQuizMode")}
                </Badge>
              )}
              {isPhysicsLab && (
                <Badge className="bg-ai-primary/10 text-ai-primary border border-ai-primary/20 px-4 py-1.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  {t("assignments.show.banner.physicsLab")}
                </Badge>
              )}
              {isOverdue && submissions.length === 0 && !isStaff && (
                <Badge
                  variant="destructive"
                  className="px-4 py-1.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-lg"
                >
                  <AlertCircle className="h-4 w-4" />
                  {t("assignments.show.banner.overdue")}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] opacity-60">
                <FileText className="h-3.5 w-3.5" />
                {"ASSIGNMENT"}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.9] uppercase text-foreground">
                {assignment.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <StatItem
                icon={Calendar}
                label={t("assignments.show.banner.dueDate")}
                value={dueDate ? dueDate.format("MMM DD, YYYY") : "No Due Date"}
                valueColor={isOverdue ? "text-destructive" : "text-foreground"}
              />

              <StatItem
                icon={Trophy}
                label={t("assignments.show.banner.maxPoints")}
                value={`${assignment.maxPoints || 100} POINTS`}
                iconColor="text-primary"
              />

              <StatItem
                icon={Clock}
                label={t("assignments.show.banner.timeEstimate")}
                value={assignment.timeEstimate || "45-60 MINS"}
                iconColor="text-orange-500"
              />

              {isStaff && (
                <StatItem
                  icon={Users}
                  label={t("assignments.show.banner.submissionsReceived", {
                    count: submissions.length,
                  })}
                  value={`${submissions.length} SUBMITTED`}
                  iconColor="text-emerald-500"
                />
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-4 min-w-[240px]">
            {isStaff ? (
              <>
                {setIsMonitoring && (
                  <Button
                    onClick={() => setIsMonitoring(!isMonitoring)}
                    className={cn(
                      "h-16 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 gap-3",
                      isMonitoring
                        ? "bg-destructive text-white shadow-destructive/20"
                        : "bg-primary text-white shadow-primary/20"
                    )}
                  >
                    <ShieldAlert className="h-5 w-5" />
                    {isMonitoring ? "Stop Monitoring" : "Monitor Room"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="h-16 rounded-2xl border-2 font-black uppercase tracking-widest gap-3"
                >
                  <Users className="h-5 w-5" />
                  {t("buttons.manageStudents")}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleAiHelp}
                  className="h-16 rounded-2xl bg-linear-to-r from-primary to-ai-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 gap-3 group"
                >
                  <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  {t("buttons.askStudyBuddy")}
                </Button>
                <Button
                  variant="outline"
                  className="h-16 rounded-2xl border-2 border-border/60 font-black uppercase tracking-widest gap-3 bg-card/50 backdrop-blur-sm"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  {t("buttons.markAsStarted")}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Restore Assignment Description */}
        {assignment.description && (
          <div className="pt-6 border-t border-border/40">
            <div className="flex items-center gap-2 mb-4 text-muted-foreground font-black uppercase tracking-widest text-[10px]">
              <FileText className="h-3.5 w-3.5" />
              {t("assignments.show.banner.instructions")}
            </div>
            <MarkdownRenderer content={assignment.description} className="text-muted-foreground" />
          </div>
        )}
      </div>
    </motion.div>
  );
};
