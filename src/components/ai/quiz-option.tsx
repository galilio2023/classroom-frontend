import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizOptionProps {
  option: string;
  isSelected: boolean;
  isCorrect: boolean;
  isAnswered: boolean;
  onSelect: (option: string) => void;
}

export const QuizOption: React.FC<QuizOptionProps> = ({
  option,
  isSelected,
  isCorrect,
  isAnswered,
  onSelect,
}) => {
  return (
    <button
      disabled={isAnswered}
      onClick={() => onSelect(option)}
      className={cn(
        "flex items-center justify-between p-3 md:p-4 rounded-xl border-2 transition-all text-left text-sm md:text-base font-medium",
        !isAnswered && isSelected && "border-primary bg-primary/5 shadow-md",
        !isAnswered && !isSelected && "border-transparent bg-white dark:bg-white/5 hover:border-primary/30",
        isAnswered && isCorrect && "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400",
        isAnswered && isSelected && !isCorrect && "border-destructive bg-destructive/10 text-destructive",
        isAnswered && !isSelected && !isCorrect && "opacity-50 border-transparent bg-muted/30"
      )}
    >
      <span className="pr-2">{option}</span>
      {isAnswered && isCorrect && <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 shrink-0" />}
      {isAnswered && isSelected && !isCorrect && <XCircle className="h-4 w-4 md:h-5 md:w-5 shrink-0" />}
    </button>
  );
};
