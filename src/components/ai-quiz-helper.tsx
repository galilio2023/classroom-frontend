import React from "react";
import { useQuizGeneration, QuizQuestion } from "@/hooks/use-quiz-generation";
import { QuizHelperForm } from "./ai/quiz-helper-form";
import { QuizHelperPreview } from "./ai/quiz-helper-preview";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { useUserRole } from "@/hooks/use-user-role";
import { BrainCircuit } from "lucide-react";

interface AIQuizHelperProps {
  onUseQuestions?: (questions: (QuizQuestion & { points: number })[]) => void;
}

export const AIQuizHelper: React.FC<AIQuizHelperProps> = ({
  onUseQuestions,
}) => {
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

  const isAiEnabled = coreData?.globalConfig?.enableAiFeatures !== false;

  // 🛡️ PARENT GATING: AI interactive features are disabled for Parents
  if (isParent) return null;

  // 🛡️ Global Master Switch: Graceful Degradation
  if (!isAiEnabled) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-border/40 text-center p-8 space-y-4">
        <div className="bg-destructive/10 p-4 rounded-full">
          <BrainCircuit className="w-10 h-10 text-destructive grayscale" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold">AI Quiz Helper Offline</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            AI features are currently disabled by the administrator.
          </p>
        </div>
      </div>
    );
  }

  const handleUseAll = () => {
    if (onUseQuestions) {
      onUseQuestions(generatedQuestions.map((q) => ({ ...q, points: 10 })));
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
