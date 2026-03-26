import React from "react";
import { BrainCircuit } from "lucide-react";
import { useTranslation } from "react-i18next";

interface QuizExplanationProps {
  explanation: string;
}

export const QuizExplanation: React.FC<QuizExplanationProps> = ({ explanation }) => {
  const { t } = useTranslation();
  return (
    <div className="mt-4 md:mt-6 p-3 md:p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 animate-in zoom-in-95 duration-300">
      <div className="flex items-center gap-2 mb-1 md:mb-2 text-blue-600 dark:text-blue-400 font-black text-[10px] md:text-xs uppercase tracking-widest">
        <BrainCircuit className="h-3 w-3 md:h-4 md:w-4" />
        {t("classes.quiz.explanation")}
      </div>
      <p className="text-xs md:text-sm leading-relaxed">{explanation}</p>
    </div>
  );
};
