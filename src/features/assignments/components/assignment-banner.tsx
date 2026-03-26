import { motion } from "framer-motion";
import {
  BrainCircuit,
  Users,
  Calendar,
  Clock,
  Sparkles,
  Activity,
  FlaskConical,
  LayoutDashboard,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Assignment, Submission } from "@/types";
import dayjs from "dayjs";
import { toast } from "sonner";
import { SOCKET_URL } from "@/config";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface Props {
  assignment: Assignment;
  submissions: Submission[];
  isStaff: boolean;
  isQuiz: boolean;
  isPhysicsLab: boolean;
  isMonitoring: boolean;
  setIsMonitoring: (v: boolean) => void;
  isAr: boolean;
}

export const AssignmentBanner = ({
  assignment,
  submissions,
  isStaff,
  isQuiz,
  isPhysicsLab,
  isMonitoring,
  setIsMonitoring,
  isAr,
}: Props) => {
  const { t } = useTranslation();
  const dueDate = assignment.dueDate ? dayjs(assignment.dueDate) : null;
  const isOverdue = dueDate ? dayjs().isAfter(dueDate) : false;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-[2.5rem] md:rounded-[3rem] border border-border/40 bg-card/50 backdrop-blur-3xl shadow-2xl text-start"
    >
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-ai-primary to-primary" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />

      <div className="p-8 md:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8 md:gap-10">
        <div className="space-y-6 flex-1">
          <div className="flex flex-wrap gap-3">
            {assignment.hasPeerReview && (
              <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-4 py-1.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-sm">
                <Users className="h-4 w-4" />
                {t("assignments.show.banner.peerReviewActive")}
              </Badge>
            )}
            {isQuiz && (
              <Badge className="bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 px-4 py-1.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-sm">
                <BrainCircuit className="h-4 w-4" />
                {t("assignments.show.banner.aiQuizMode")}
              </Badge>
            )}
            {isPhysicsLab && (
              <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-4 py-1.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-sm">
                <FlaskConical className="h-4 w-4" />
                {t("assignments.show.banner.physicsLab")}
              </Badge>
            )}
            <Badge className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-sm">
              <LayoutDashboard className="h-4 w-4" />
              {assignment.class?.name || t("assignments.list.labels.general")}
            </Badge>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-none text-balance">
              {assignment.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground font-black text-xs uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <Calendar
                  className={cn(
                    "h-5 w-5",
                    isOverdue ? "text-destructive" : "text-primary",
                  )}
                />
                <span className={cn(isOverdue && "text-destructive")}>
                  {t("assignments.show.banner.due", {
                    date: dueDate
                      ? dueDate.format("MMM D, YYYY")
                      : t("assignments.list.labels.noDeadline"),
                  })}
                </span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
              <div className="flex items-center gap-2">
                <Clock
                  className={cn(
                    "h-5 w-5",
                    isOverdue ? "text-destructive" : "text-primary",
                  )}
                />
                <span className={cn(isOverdue && "text-destructive")}>
                  {dueDate
                    ? dueDate.fromNow()
                    : t("assignments.list.labels.open")}
                </span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span>
                  {t("assignments.show.banner.submissionsReceived", {
                    count: submissions.length,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full lg:w-auto">
          {isStaff && isQuiz && (
            <Button
              variant="outline"
              size="lg"
              className={cn(
                "rounded-[1.5rem] font-bold uppercase tracking-widest text-[10px] h-14 md:h-16 px-10 gap-3 border-primary/20 transition-all shadow-xl shadow-primary/5",
                isMonitoring
                  ? "bg-primary text-white"
                  : "bg-primary/5 text-primary hover:bg-primary/10",
              )}
              onClick={() => setIsMonitoring(!isMonitoring)}
            >
              <Activity
                className={cn("h-5 w-5", isMonitoring && "animate-pulse")}
              />
              {isMonitoring
                ? t("buttons.stopMonitoring")
                : t("buttons.liveMonitor")}
            </Button>
          )}

          {isStaff && assignment.hasPeerReview && (
            <Button
              variant="outline"
              size="lg"
              className="rounded-[1.5rem] font-bold uppercase tracking-widest text-[10px] h-14 md:h-16 px-10 gap-3 border-primary/20 bg-primary/5 backdrop-blur-sm hover:bg-primary/10 transition-all shadow-xl shadow-primary/5"
              onClick={() => {
                toast.promise(
                  fetch(
                    `${SOCKET_URL.replace("/socket.io", "")}/api/assignments/${assignment.id}/assign-peer-reviews`,
                    {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem("refine-auth")}`,
                      },
                    },
                  ),
                  {
                    loading: t("assignments.show.toast.peersLoading"),
                    success: t("assignments.show.toast.peersSuccess"),
                    error: t("assignments.show.toast.peersError"),
                  },
                );
              }}
            >
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              {t("buttons.assignPeerReviews")}
            </Button>
          )}
        </div>
      </div>

      {/* Description Section */}
      <div className="px-4 md:px-6 lg:px-8">
        <div
          className={cn(
            "p-8 md:p-12 rounded-[2.5rem] bg-muted/20 border border-border/40 shadow-inner relative overflow-hidden",
            (isQuiz || isPhysicsLab) && "opacity-40 blur-[0.5px] select-none",
          )}
        >
          <div
            className={cn("absolute opacity-5", isAr ? "left-0" : "right-0")}
          >
            <FileText className="h-32 w-32 md:h-48 md:w-48" />
          </div>
          {isQuiz || isPhysicsLab ? (
            <div className="flex flex-col items-center justify-center py-10 md:py-16 gap-4 text-muted-foreground">
              <FlaskConical className="h-12 w-12 md:h-16 md:w-16" />
              <p className="font-black uppercase tracking-widest text-xs md:text-sm">
                {t("assignments.show.interactiveContentActive")}
              </p>
            </div>
          ) : (
            <div className="prose prose-lg dark:prose-invert max-w-none font-medium leading-relaxed text-start">
              <MarkdownRenderer content={assignment.description || ""} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
