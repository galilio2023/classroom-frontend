import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { LoadingButton } from "../ui/loading-button";
import { AICard } from "./ai-card";
import { Sparkles } from "lucide-react";

interface QuizHelperFormProps {
  topic: string;
  setTopic: (topic: string) => void;
  count: number;
  setCount: (count: number) => void;
  handleGenerate: () => void;
  isLoading: boolean;
}

export const QuizHelperForm: React.FC<QuizHelperFormProps> = ({
  topic,
  setTopic,
  count,
  setCount,
  handleGenerate,
  isLoading,
}) => {
  return (
    <AICard
      title="AI Quiz Helper"
      description="Use Gemini AI to draft multiple-choice questions for your quiz."
      footer={
        <LoadingButton
          className="w-full"
          onClick={handleGenerate}
          isLoading={isLoading}
          loadingText="Generating..."
          icon={<Sparkles className="h-4 w-4" />}
        >
          Generate Questions
        </LoadingButton>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Topic</Label>
          <Input
            id="topic"
            placeholder="e.g. Photosynthesis, World War II, React Hooks"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="count">Number of Questions</Label>
          <Input
            id="count"
            type="number"
            min="1"
            max="20"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </div>
      </div>
    </AICard>
  );
};
