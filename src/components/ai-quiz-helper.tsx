import React from "react";
import { useQuizGeneration, QuizQuestion } from "@/hooks/use-quiz-generation";
import { QuizHelperForm } from "./ai/quiz-helper-form";
import { QuizHelperPreview } from "./ai/quiz-helper-preview";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { useUserRole } from "@/hooks/use-user-role";
import { AIFeatureDisabled } from "./ai/ai-feature-disabled";

interface AIQuizHelperProps {
  onUseQuestions?: (questions: (QuizQuestion & { points: number })[]) => void;
}

export const AIQuizHelper: React.FC<AIQuizHelperProps> = ({ onUseQuestions }) => {
  const { coreData } = useDashboard();
  const { isParent } = useUserRole();
  const {
    topic,
    setTopic,
    count,
    setCount,
    quiz: generatedQuestions,
    handleGenerate,
    isLoading,
  } = useQuizGeneration(5);

  const isAiEnabled = !!coreData?.globalConfig && coreData.globalConfig.enableAiFeatures === true;

  // 🛡️ PARENT GATING: AI interactive features are disabled for Parents
  if (isParent) return null;

  // 🛡️ Global Master Switch: Graceful Degradation
  if (!isAiEnabled) {
    return <AIFeatureDisabled title="AI Quiz Helper Offline" />;
  }

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
