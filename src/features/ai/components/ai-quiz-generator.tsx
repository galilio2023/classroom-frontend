import React from "react";
import { useNotification, useCreate } from "@refinedev/core";
import { useQuizGeneration } from "@/features/ai/hooks/use-quiz-generation";
import { QuizGeneratorForm } from "./quiz-generator-form";
import { QuizPreview } from "./quiz-preview";
import { AIFeatureDisabled } from "./ai-feature-disabled";
import { useAiAccess } from "@/features/ai/hooks/use-ai-access";
import { addDays, format } from "date-fns";

interface AIQuizGeneratorProps {
  classId?: string;
}

export const AIQuizGenerator: React.FC<AIQuizGeneratorProps> = ({ classId }) => {
  const { isAiEnabled, isAllowed } = useAiAccess();
  const {
    topic,
    setTopic,
    count,
    setCount,
    difficulty,
    setDifficulty,
    type,
    setType,
    quiz,
    handleGenerate,
    isLoading,
  } = useQuizGeneration(5);

  const { open } = useNotification();
  const { mutate: createAssignment, mutation: createMutation } = useCreate();
  const isSaving = createMutation.isPending;

  // ðŸ›¡ï¸ PARENT GATING: AI interactive features are disabled for Parents
  if (!isAllowed) return null;

  // ðŸ›¡ï¸ Global Master Switch: Graceful Degradation
  if (!isAiEnabled) {
    return <AIFeatureDisabled title="AI Quiz Generator Offline" />;
  }

  const handleSaveAsAssignment = () => {
    if (!classId || quiz.length === 0) return;

    const description = quiz
      .map((q, i) => {
        return (
          `### Q${i + 1}: ${q.question}\n\n` +
          q.options
            .map((opt) => `- ${opt}${opt === q.correctAnswer ? " (Correct)" : ""}`)
            .join("\n") +
          `\n\n**Explanation:** ${q.explanation}\n\n---`
        );
      })
      .join("\n\n");

    createAssignment(
      {
        resource: "assignments",
        values: {
          title: `Quiz: ${topic}`,
          description,
          classId: Number(classId),
          dueDate: format(addDays(new Date(), 7), "yyyy-MM-dd"),
        },
      },
      {
        onSuccess: () => {
          open?.({
            type: "success",
            message: "Assignment Created!",
            description: "The quiz has been saved as an assignment for this class.",
          });
        },
      }
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <QuizGeneratorForm
        topic={topic}
        setTopic={setTopic}
        count={count}
        setCount={setCount}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        type={type}
        setType={setType}
        handleGenerate={handleGenerate}
        handleSaveAsAssignment={handleSaveAsAssignment}
        isLoading={isLoading}
        isSaving={isSaving}
        hasQuiz={quiz.length > 0}
        classId={classId}
      />
      <QuizPreview quiz={quiz} />
    </div>
  );
};
