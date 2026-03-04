import { useState } from "react";
import { useCustomMutation, useNotification } from "@refinedev/core";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface AIResponse {
  quiz: QuizQuestion[];
}

export const useQuizGeneration = (initialCount: number = 5) => {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState([initialCount]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);

  const { open } = useNotification();
  const { mutate, mutation } = useCustomMutation<AIResponse>();
  const isLoading = mutation.isPending;

  const handleGenerate = () => {
    if (!topic) {
      open?.({
        type: "error",
        message: "Topic required",
        description: "Please enter a topic to generate questions.",
      });
      return;
    }

    mutate(
      {
        url: "/ai/generate-quiz",
        method: "post",
        values: { topic, count: count[0] },
      },
      {
        onSuccess: (data) => {
          setQuiz(data.data.quiz);
          open?.({
            type: "success",
            message: "Quiz Generated!",
            description: `Successfully created ${data.data.quiz.length} questions.`,
          });
        },
        onError: () => {
          open?.({
            type: "error",
            message: "Generation Failed",
            description: "There was an error connecting to the AI service.",
          });
        },
      }
    );
  };

  return {
    topic,
    setTopic,
    count,
    setCount,
    quiz,
    setQuiz,
    handleGenerate,
    isLoading,
  };
};
