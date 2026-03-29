import React from "react";
import { useQuizGeneration, QuizQuestion } from "@/hooks/use-quiz-generation";
import { QuizHelperForm } from "./ai/quiz-helper-form";
import { QuizHelperPreview } from "./ai/quiz-helper-preview";
import { AIFeatureDisabled } from "./ai/ai-feature-disabled";
import { useAiAccess } from "@/hooks/use-ai-access";

interface AIQuizHelperProps {
  onUseQuestions?: (questions: (QuizQuestion & { points: number })[]) => void;
}

export const AIQuizHelper: React.FC<AIQuizHelperProps> = ({ onUseQuestions }) => {
  const { isAiEnabled, isAllowed } = useAiAccess();
  const {
    topic,
    setTopic,
    count,
    setCount,
    quiz: generatedQuestions,
    handleGenerate,
    isLoading,
  } = useQuizGeneration(5);

  // 🛡️ PARENT GATING: AI interactive features are disabled for Parents
  if (!isAllowed) return null;

  // 🛡️ Global Master Switch: Graceful Degradation
  if (!isAiEnabled) {
    return <AIFeatureDisabled title="AI Quiz Helper Offline" />;
  }

  const handleUseAll = () => {
    if (onUseQuestions) {
      onUseQuestions(generatedQuestions as (QuizQuestion & { points: number })[]);
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
      <QuizHelperPreview questions={generatedQuestions} onUseAll={handleUseAll} />
    </div>
  );
};
