import React from "react";
import { useQuizGeneration } from "@/hooks/use-quiz-generation";
import { QuizHelperForm } from "./ai/quiz-helper-form";
import { QuizHelperPreview } from "./ai/quiz-helper-preview";

interface AIQuizHelperProps {
  onUseQuestions?: (questions: any[]) => void;
}

export const AIQuizHelper: React.FC<AIQuizHelperProps> = ({ onUseQuestions }) => {
  const {
    topic,
    setTopic,
    count,
    setCount,
    quiz: generatedQuestions,
    handleGenerate,
    isLoading,
  } = useQuizGeneration(5);

  const handleUseAll = () => {
    if (onUseQuestions) {
      onUseQuestions(generatedQuestions.map(q => ({ ...q, points: 10 })));
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <QuizHelperForm
        topic={topic}
        setTopic={setTopic}
        count={count[0]}
        setCount={(val) => setCount([val])}
        handleGenerate={handleGenerate}
        isLoading={isLoading}
      />
      <QuizHelperPreview 
        questions={generatedQuestions} 
        onUseAll={handleUseAll} 
      />
    </div>
  );
};
