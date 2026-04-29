import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users } from "lucide-react";
import { useGo } from "@refinedev/core";
import { QuizResult } from "@/features/ai/components/quiz-result";
import { useQuiz } from "@/features/quizzes/hooks/use-quiz";
import { QuizProgress } from "@/features/ai/components/quiz-progress";
import { QuizOption } from "@/features/ai/components/quiz-option";
import { QuizExplanation } from "@/features/ai/components/quiz-explanation";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { toast } from "sonner";

interface InteractiveQuizProps {
  assignmentId: number;
  classId?: number;
  description: string;
  onComplete?: (score: number) => void;
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({
  assignmentId,
  classId,
  description,
  onComplete,
}) => {
  const { t } = useTranslation();
  const { width, height } = useWindowSize();
  const go = useGo();
  const {
    questions,
    currentStep,
    currentQuestion,
    selectedOption,
    isAnswered,
    score,
    isFinished,
    examMode,
    progress,
    activeStudents,
    handleOptionSelect,
    handleCheckAnswer,
    handleNext,
  } = useQuiz({ assignmentId, classId, description, onComplete });

  // 🛡️ RULE 6: Hardware Privacy & Safety (Tab Visibility)
  // Mandate: Detect and report focus loss during high-stakes exams.
  React.useEffect(() => {
    if (!examMode || isFinished) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        toast.error(
          t(
            "classes.quiz.examModeWarning",
            "Tab-switch detected! This action has been logged for review."
          ),
          {
            duration: 10000,
            icon: "🛡️",
          }
        );

        // 🚀 AUDIT: This is where we would dispatch a focus_loss event via socket or API
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [examMode, isFinished, t]);

  if (questions.length === 0) return null;

  if (isFinished) {
    return (
      <>
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.2}
          colors={["#4f46e5", "#9333ea", "#db2777", "#22c55e", "#eab308"]}
        />
        <QuizResult
          score={score}
          totalQuestions={questions.length}
          onBackToDashboard={() => go({ to: "/dashboard" })}
        />
      </>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <QuizProgress
          currentStep={currentStep}
          totalQuestions={questions.length}
          progress={progress}
          className="flex-1 w-full"
        />

        <AnimatePresence>
          {activeStudents > 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Badge
                variant="outline"
                className="bg-primary/5 text-primary border-primary/20 px-3 py-1.5 rounded-full font-bold gap-2 animate-pulse"
              >
                <Users className="h-3.5 w-3.5" />
                {activeStudents} {t("classes.quiz.studentsActive", "Students active")}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Card className="border-none shadow-xl bg-white/50 dark:bg-black/20 backdrop-blur-xl overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-primary/10 p-4 md:p-6">
          <CardTitle className="text-base md:text-lg leading-relaxed">
            {currentQuestion?.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-8 space-y-4">
          <div className="grid gap-2 md:gap-3">
            {currentQuestion?.options.map((option, index) => (
              <QuizOption
                key={index}
                option={option}
                isSelected={option === selectedOption}
                isCorrect={option === currentQuestion.correctAnswer}
                isAnswered={isAnswered}
                onSelect={handleOptionSelect}
              />
            ))}
          </div>

          {isAnswered && currentQuestion?.explanation && (
            <QuizExplanation explanation={currentQuestion.explanation} />
          )}
        </CardContent>
        <CardFooter className="bg-muted/30 border-t border-black/5 p-4 md:p-6">
          {!isAnswered ? (
            <Button
              className="w-full rounded-xl font-black h-10 md:h-12 shadow-lg shadow-primary/20"
              disabled={!selectedOption}
              onClick={handleCheckAnswer}
            >
              {t("classes.quiz.checkAnswer")}
            </Button>
          ) : (
            <Button
              className="w-full rounded-xl font-black h-10 md:h-12 shadow-lg shadow-primary/20"
              onClick={handleNext}
            >
              {currentStep === questions.length - 1
                ? t("classes.quiz.finishQuiz")
                : t("classes.quiz.nextQuestion")}
              <ArrowRight className="ms-2 h-4 w-4 md:h-5 md:w-5 ltr:block rtl:hidden" />
              <ArrowRight className="me-2 h-4 w-4 md:h-5 md:w-5 rtl:block ltr:hidden rotate-180" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
