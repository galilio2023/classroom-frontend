import React from "react";
import { CheckCircle2 } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface QuizQuestionItemProps {
  question: QuizQuestion;
  index?: number;
  showExplanation?: boolean;
}

export const QuizQuestionItem: React.FC<QuizQuestionItemProps> = ({ 
  question, 
  index: _index,
  showExplanation = true 
}) => {
  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {question.options.map((option, i) => (
          <div 
            key={i} 
            className={`p-2 rounded-md border text-sm flex items-center gap-2 ${
              option === question.correctAnswer 
                ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" 
                : "bg-muted/50 border-transparent"
            }`}
          >
            {option === question.correctAnswer && <CheckCircle2 className="h-4 w-4" />}
            {option}
          </div>
        ))}
      </div>
      {showExplanation && question.explanation && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100 dark:border-blue-800">
          <p className="text-xs font-semibold text-blue-800 dark:text-blue-400 uppercase mb-1">Explanation</p>
          <p className="text-sm text-blue-700 dark:text-blue-300">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};
