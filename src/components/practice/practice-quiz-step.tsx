import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface PracticeQuizStepProps {
  currentQuestion: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  progress: number;
  selectedOption?: string;
  onOptionSelect: (option: string) => void;
  onNext: () => void;
  isSubmitting: boolean;
}

export const PracticeQuizStep: React.FC<PracticeQuizStepProps> = ({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  progress,
  selectedOption,
  onOptionSelect,
  onNext,
  isSubmitting,
}) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold leading-relaxed">
          {currentQuestion.question}
        </h3>
        <div className="grid gap-3">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => onOptionSelect(option)}
              className={cn(
                "p-4 rounded-xl border-2 text-start transition-all hover:bg-accent",
                selectedOption === option
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border bg-card",
              )}
            >
              <span className="font-medium">{option}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={onNext}
          disabled={!selectedOption || isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin me-2" />
          ) : currentQuestionIndex === totalQuestions - 1 ? (
            t("classes.quiz.finishQuiz")
          ) : (
            <>
              {t("classes.quiz.nextQuestion")}
              <ArrowRight
                className={cn(
                  "h-4 w-4 ms-2",
                  isArabic && "rotate-180 ms-0 me-2",
                )}
              />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
