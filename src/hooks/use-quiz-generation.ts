import { useState, useEffect } from "react";
import { useCustomMutation, useNotification } from "@refinedev/core";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface AIJobResponse {
  jobId: string;
}

export const useQuizGeneration = (initialCount: number = 5) => {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState([initialCount]);
  const [difficulty, setDifficulty] = useState("medium");
  const [type, setType] = useState("multiple_choice");
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { open } = useNotification();
  const { mutate, mutation } = useCustomMutation<AIJobResponse>();
  const isLoading = mutation.isPending || isProcessing;

  // Listen for background job completion
  useEffect(() => {
    const handleReady = (event: Event) => {
      const customEvent = event as CustomEvent<{ quiz: QuizQuestion[] }>;
      const quizData = customEvent.detail.quiz;
      setQuiz(quizData);
      setIsProcessing(false);
    };

    window.addEventListener("AI_QUIZ_READY", handleReady);
    return () => window.removeEventListener("AI_QUIZ_READY", handleReady);
  }, []);

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
        values: { topic, count: count[0], difficulty, format: type },
      },
      {
        onSuccess: () => {
          setIsProcessing(true);
          open?.({
            type: "success",
            message: "Generation Started",
            description: "Gemini is generating your quiz. You will be notified when it's ready!",
          });
        },
        onError: () => {
          setIsProcessing(false);
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
    difficulty,
    setDifficulty,
    type,
    setType,
    quiz,
    setQuiz,
    handleGenerate,
    isLoading,
  };
};
