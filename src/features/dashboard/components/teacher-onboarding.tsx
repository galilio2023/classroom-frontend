import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Plus,
  UserPlus,
  BookOpen,
  X,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useNavigation } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useCapabilities } from "@/hooks/use-capabilities";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  action: () => void;
  completed: boolean;
}

export const TeacherOnboarding = ({ stats }: { stats?: any }) => {
  const { t } = useTranslation();
  const { create, list } = useNavigation();
  const { isPrivate } = useCapabilities();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem("teacher-onboarding-dismissed");
    if (isDismissed) setDismissed(true);
  }, []);

  const steps: OnboardingStep[] = [
    {
      id: "create-class",
      title: t("dashboard.onboarding.teacher.steps.createClass.title"),
      description: t("dashboard.onboarding.teacher.steps.createClass.description"),
      icon: Plus,
      action: () => create("classes"),
      completed: (stats?.totalClasses || 0) > 0,
    },
    {
      id: "add-assignment",
      title: t("dashboard.onboarding.teacher.steps.addAssignment.title"),
      description: t("dashboard.onboarding.teacher.steps.addAssignment.description"),
      icon: BookOpen,
      action: () => create("assignments"),
      completed: (stats?.totalAssignments || 0) > 0,
    },
  ];

  // 🚀 MODE-AWARE STEPS
  if (isPrivate) {
    // Private Teachers focus on AI Productivity
    steps.push({
      id: "ai-quiz",
      title: t("dashboard.onboarding.teacher.steps.aiQuiz.title", "Generate AI Quiz"),
      description: t(
        "dashboard.onboarding.teacher.steps.aiQuiz.description",
        "Save time by generating a quiz from your materials."
      ),
      icon: Sparkles,
      action: () => list("ai-assistant"),
      completed: (stats?.totalQuizzes || 0) > 0,
    });
  } else {
    // Institutional Teachers focus on Student Management
    steps.push({
      id: "invite-students",
      title: t("dashboard.onboarding.teacher.steps.inviteStudents.title"),
      description: t("dashboard.onboarding.teacher.steps.inviteStudents.description"),
      icon: UserPlus,
      action: () => list("users"),
      completed: (stats?.totalStudents || 0) > 0,
    });
  }

  const completedSteps = steps.filter((step) => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;
  const allCompleted = completedSteps === steps.length;

  if (dismissed || (allCompleted && localStorage.getItem("teacher-onboarding-dismissed"))) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem("teacher-onboarding-dismissed", "true");
    setDismissed(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="mb-12"
    >
      <Card className="border-border/40 bg-primary/5 backdrop-blur-xl shadow-2xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden relative border-2 border-dashed">
        {/* Decorative Sparkles */}
        <div className="absolute top-6 end-20 pointer-events-none opacity-20">
          <Sparkles className="h-12 w-12 text-primary animate-pulse" />
        </div>

        <div className="absolute top-6 end-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-10 w-10 rounded-full bg-background/40 hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <CardHeader className="p-8 md:p-12 pb-6 md:pb-8 text-start">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/5 shadow-sm w-fit">
              <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10" />
            </div>
            <div className="space-y-1.5 flex-1">
              <CardTitle className="text-2xl md:text-3xl font-black tracking-tight">
                {t("dashboard.onboarding.teacher.welcome")}
              </CardTitle>
              <CardDescription className="text-base md:text-lg font-medium text-muted-foreground/80 max-w-2xl leading-relaxed">
                {t("dashboard.onboarding.teacher.description")}
              </CardDescription>
            </div>
          </div>
          <div className="mt-10 space-y-4">
            <div className="flex justify-between items-end px-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                {t("dashboard.onboarding.teacher.setupProgress")}
              </span>
              <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-3 rounded-full bg-primary/10 shadow-inner" />
          </div>
        </CardHeader>

        <CardContent className="p-8 md:p-12 pt-0">
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className={cn(
                  "relative p-6 md:p-8 rounded-4xl border transition-all duration-500 flex flex-col group hover-shine",
                  step.completed
                    ? "bg-emerald-500/3 border-emerald-500/20 grayscale-[0.5]"
                    : "bg-background/40 backdrop-blur-sm border-border/40 hover:border-primary/30 hover:bg-background shadow-sm hover:shadow-xl hover:shadow-primary/5"
                )}
              >
                <div className="flex items-start justify-between mb-6">
                  <div
                    className={cn(
                      "p-3.5 rounded-2xl transition-all duration-500 shadow-sm",
                      step.completed
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-primary/10 text-primary border border-primary/5 group-hover:scale-110"
                    )}
                  >
                    <step.icon className="h-6 w-6" />
                  </div>
                  {step.completed ? (
                    <div className="p-1 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 animate-in zoom-in duration-500">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground/20" />
                  )}
                </div>
                <div className="flex-1 space-y-2 text-start">
                  <h3
                    className={cn(
                      "text-lg font-black tracking-tight transition-colors",
                      step.completed
                        ? "text-emerald-600/70"
                        : "text-foreground group-hover:text-primary"
                    )}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground/70 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {!step.completed && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full mt-8 rounded-xl font-black uppercase tracking-widest text-[10px] h-12 gap-2 border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm"
                    onClick={step.action}
                  >
                    {t("buttons.getStarted")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
