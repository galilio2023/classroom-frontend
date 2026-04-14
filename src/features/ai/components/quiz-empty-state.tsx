import React from "react";
import { BrainCircuit } from "lucide-react";
import { useTranslation } from "react-i18next";

export const QuizEmptyState: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
      <BrainCircuit className="h-12 w-12 text-muted-foreground/20 mb-4" />
      <p className="text-muted-foreground">{t("classes.quiz.noQuizzes")}</p>
      <p className="text-xs text-muted-foreground/60">{t("aiHub.assistant.quizGen.desc")}</p>
    </div>
  );
};
