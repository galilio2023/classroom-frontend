import { useState } from "react";
import { useCustomMutation, useNotification } from "@refinedev/core";

interface AIResponse {
  content: string;
}

export const useAssignmentGeneration = () => {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [generatedContent, setGeneratedContent] = useState("");

  const { open } = useNotification();
  const { mutate, mutation } = useCustomMutation<AIResponse>();
  const isLoading = mutation.isPending;

  const handleGenerate = () => {
    if (!subject || !topic) {
      open?.({
        type: "error",
        message: "Please fill in all fields",
        description: "Subject and Topic are required to generate an assignment.",
      });
      return;
    }

    mutate(
      {
        url: "/ai/generate-assignment",
        method: "post",
        values: { subject, topic, difficulty },
      },
      {
        onSuccess: (data) => {
          setGeneratedContent(data.data.content);
          open?.({
            type: "success",
            message: "Assignment Generated!",
            description: "Gemini has created a draft for you.",
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
    subject,
    setSubject,
    topic,
    setTopic,
    difficulty,
    setDifficulty,
    generatedContent,
    setGeneratedContent,
    handleGenerate,
    isLoading,
  };
};
