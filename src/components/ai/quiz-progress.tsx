import React from "react";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";

interface QuizProgressProps {
  currentStep: number;
  totalQuestions: number;
  progress: number;
  className?: string;
}

export const QuizProgress: React.FC<QuizProgressProps> = ({
  currentStep,
  totalQuestions,
  progress,
  className,
}) => {
  return (
    <div className={cn("space-y-2 px-1", className)}>
      <div className="flex justify-between text-[10px] md:text-xs font-black uppercase tracking-tighter text-muted-foreground">
        <span>Question {currentStep + 1} of {totalQuestions}</span>
        <span>{Math.round(progress)}% Complete</span>
      </div>
      <Progress value={progress} className="h-1.5 md:h-2" />
    </div>
  );
};
