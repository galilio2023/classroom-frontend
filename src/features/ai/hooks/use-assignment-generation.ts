import { useState, useEffect, useCallback } from "react";
import { useCustomMutation, useNotification, HttpError } from "@refinedev/core";

interface AIJobResponse {
  jobId: string;
}

export const useAssignmentGeneration = () => {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [tone, setTone] = useState("academic");
  const [objectives, setObjectives] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(() => {
    // 🧠 BRAVE PERSISTENCE: Restore from session if exists
    return sessionStorage.getItem("pending_ai_assignment") || "";
  });

  const { open } = useNotification();
  const { mutate, mutation } = useCustomMutation<AIJobResponse>();
  const isLoading = mutation.isPending || isProcessing;

  // Listen for background job completion
  useEffect(() => {
    const handleReady = (event: Event) => {
      const customEvent = event as CustomEvent<{ content: string }>;
      const content = customEvent.detail.content;
      setGeneratedContent(content);
      setIsProcessing(false);
      sessionStorage.setItem("pending_ai_assignment", content);
    };

    window.addEventListener("AI_ASSIGNMENT_READY", handleReady);
    return () => window.removeEventListener("AI_ASSIGNMENT_READY", handleReady);
  }, []);

  const handleGenerate = useCallback(() => {
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
        onSuccess: () => {
          setIsProcessing(true);
          open?.({
            type: "success",
            message: "Generation Started",
            description:
              "Gemini is building your assignment. You will be notified when it's ready!",
          });
        },
        onError: (error: HttpError) => {
          setIsProcessing(false);
          let description = "There was an error connecting to the AI service.";
          if (error.status === 429)
            description = "AI generation limit reached for this period. Please try again later.";
          if (error.status === 503)
            description = "AI services are currently offline for maintenance.";

          open?.({
            type: "error",
            message: "Generation Failed",
            description,
          });
        },
      }
    );
  }, [subject, topic, difficulty, tone, objectives, mutate, open]);

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
