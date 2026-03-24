import { useState, useEffect } from "react";
import { useCustomMutation, useNotification } from "@refinedev/core";

interface AIResponse {
  content: string;
}

export const useAssignmentGeneration = () => {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [tone, setTone] = useState("academic");
  const [objectives, setObjectives] = useState("");
  const [generatedContent, setGeneratedContent] = useState(() => {
    // 🧠 BRAVE PERSISTENCE: Restore from session if exists
    return sessionStorage.getItem("pending_ai_assignment") || "";
  });

  const { open } = useNotification();
  const { mutate, mutation } = useCustomMutation<AIResponse>();
  const isLoading = mutation.isPending;

  // Save to session whenever content changes
  useEffect(() => {
    if (generatedContent) {
      sessionStorage.setItem("pending_ai_assignment", generatedContent);
    }
  }, [generatedContent]);

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
        values: { subject, topic, difficulty, tone, objectives },
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
        onError: (error: any) => {
          let description = "There was an error connecting to the AI service.";
          if (error.status === 429) description = "AI generation limit reached for this period. Please try again later.";
          if (error.status === 503) description = "AI services are currently offline for maintenance.";

          open?.({
            type: "error",
            message: "Generation Failed",
            description,
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
    tone,
    setTone,
    objectives,
    setObjectives,
    generatedContent,
    setGeneratedContent,
    handleGenerate,
    isLoading,
  };
};
