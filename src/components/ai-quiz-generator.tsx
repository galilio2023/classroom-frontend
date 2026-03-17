import React from "react";
import { useNotification, useCreate } from "@refinedev/core";
import { useQuizGeneration } from "@/hooks/use-quiz-generation";
import { QuizGeneratorForm } from "./ai/quiz-generator-form";
import { QuizPreview } from "./ai/quiz-preview";

interface AIQuizGeneratorProps {
  classId?: string;
}

export const AIQuizGenerator: React.FC<AIQuizGeneratorProps> = ({ classId }) => {
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

  const handleSaveAsAssignment = () => {
    if (!classId || quiz.length === 0) return;

    const description = quiz.map((q, i) => {
      return `### Q${i+1}: ${q.question}\n\n` + 
             q.options.map((opt) => `- ${opt}${opt === q.correctAnswer ? " (Correct)" : ""}`).join("\n") +
             `\n\n**Explanation:** ${q.explanation}\n\n---`;
    }).join("\n\n");

    createAssignment(
      {
        resource: "assignments",
        values: {
          title: `Quiz: ${topic}`,
          description,
          classId: Number(classId),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
