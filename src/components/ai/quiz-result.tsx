import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Trophy, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

interface QuizResultProps {
  score: number;
  totalQuestions: number;
  onBackToDashboard: () => void;
}

export const QuizResult: React.FC<QuizResultProps> = ({
  score,
  totalQuestions,
  onBackToDashboard,
}) => {
  const { t } = useTranslation();
  const finalPercentage = Math.round((score / totalQuestions) * 100);

  return (
    <Card className="border-primary/20 bg-primary/5 text-center py-8 md:py-10">
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <Trophy className="h-12 w-10 md:h-16 md:w-12 text-primary animate-bounce" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-black">
            {t("classes.quiz.quizComplete")}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground font-medium px-4">
            {t("classes.quiz.finishedAssessment")}
          </p>
        </div>
        <div className="text-5xl md:text-6xl font-black text-primary">
          {finalPercentage}%
        </div>
        <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-primary/60">
          {t("classes.quiz.scoreSummary", { score, total: totalQuestions })}
        </p>
      </CardContent>
      <CardFooter className="justify-center">
        <Button
          onClick={onBackToDashboard}
          variant="outline"
          className="rounded-xl font-bold w-full max-w-50"
        >
          <RefreshCw className="me-2 h-4 w-4 rtl:me-0 rtl:ms-2" />
          {t("buttons.goBack")}
        </Button>
      </CardFooter>
    </Card>
  );
};
