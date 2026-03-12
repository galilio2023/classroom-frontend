import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { ArrowRight } from "lucide-react";
import { useGo } from "@refinedev/core";
import { QuizResult } from "./ai/quiz-result";
import { useQuiz } from "@/hooks/use-quiz";
import { QuizProgress } from "./ai/quiz-progress";
import { QuizOption } from "./ai/quiz-option";
import { QuizExplanation } from "./ai/quiz-explanation";
import { useTranslation } from "react-i18next";

interface InteractiveQuizProps {
  assignmentId: number;
  description: string;
  onComplete?: (score: number) => void;
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({ assignmentId, description, onComplete }) => {
  const { t } = useTranslation();
  const go = useGo();
  const {
    questions,
    currentStep,
    currentQuestion,
    selectedOption,
    isAnswered,
    score,
    isFinished,
    progress,
    handleOptionSelect,
    handleCheckAnswer,
    handleNext,
  } = useQuiz({ assignmentId, description, onComplete });

  if (questions.length === 0) return null;

  if (isFinished) {
    return (
      <QuizResult 
        score={score} 
        totalQuestions={questions.length} 
        onBackToDashboard={() => go({ to: "/dashboard" })} 
      />
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      <QuizProgress 
        currentStep={currentStep} 
        totalQuestions={questions.length} 
        progress={progress} 
      />

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
              {currentStep === questions.length - 1 ? t("classes.quiz.finishQuiz") : t("classes.quiz.nextQuestion")}
              <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 ltr:block rtl:hidden" />
              <ArrowRight className="mr-2 h-4 w-4 md:h-5 md:w-5 rtl:block ltr:hidden rotate-180" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
