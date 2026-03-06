import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, ArrowRight, Plus, UserPlus, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useNavigation } from "@refinedev/core";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  action: () => void;
  completed: boolean;
}

export const TeacherOnboarding = ({ stats }: { stats?: any }) => {
  const { create, list } = useNavigation();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem("teacher-onboarding-dismissed");
    if (isDismissed) setDismissed(true);
  }, []);

  const steps: OnboardingStep[] = [
    {
      id: "create-class",
      title: "Create your first class",
      description: "Set up a space for your students to learn and collaborate.",
      icon: Plus,
      action: () => create("classes"),
      completed: (stats?.totalClasses || 0) > 0,
    },
    {
      id: "add-assignment",
      title: "Add an assignment",
      description: "Create your first task to start tracking student progress.",
      icon: BookOpen,
      action: () => create("assignments"),
      completed: (stats?.totalAssignments || 0) > 0,
    },
    {
      id: "invite-students",
      title: "Invite students",
      description: "Add students to your classes to begin the journey.",
      icon: UserPlus,
      action: () => list("users"),
      completed: (stats?.totalStudents || 0) > 0,
    },
  ];

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
    <Card className="border-primary/20 bg-primary/5 mb-8 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4">
        <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
          Dismiss
        </Button>
      </div>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Welcome, Teacher! Let's get started</CardTitle>
            <CardDescription>Complete these steps to set up your digital classroom.</CardDescription>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Setup Progress</span>
            <span>{completedSteps} of {steps.length} steps</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "relative p-4 rounded-xl border transition-all",
                step.completed 
                  ? "bg-background/50 border-primary/20 opacity-75" 
                  : "bg-background border-border hover:border-primary/50 shadow-sm"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  step.completed ? "bg-primary/10" : "bg-muted"
                )}>
                  <step.icon className={cn("h-5 w-5", step.completed ? "text-primary" : "text-muted-foreground")} />
                </div>
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <h3 className="font-semibold mb-1">{step.title}</h3>
              <p className="text-xs text-muted-foreground mb-4">{step.description}</p>
              {!step.completed && (
                <Button size="sm" variant="outline" className="w-full group" onClick={step.action}>
                  Get Started
                  <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
