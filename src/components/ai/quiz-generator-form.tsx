import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import { LoadingButton } from "../ui/loading-button";
import { AICard } from "./ai-card";
import { BrainCircuit, Sparkles, Save } from "lucide-react";

interface QuizGeneratorFormProps {
  topic: string;
  setTopic: (topic: string) => void;
  count: number[];
  setCount: (count: number[]) => void;
  handleGenerate: () => void;
  handleSaveAsAssignment: () => void;
  isLoading: boolean;
  isSaving: boolean;
  hasQuiz: boolean;
  classId?: string;
}

export const QuizGeneratorForm: React.FC<QuizGeneratorFormProps> = ({
  topic,
  setTopic,
  count,
  setCount,
  handleGenerate,
  handleSaveAsAssignment,
  isLoading,
  isSaving,
  hasQuiz,
  classId,
}) => {
  return (
    <AICard
      title="AI Quiz Generator"
      description="Generate multiple-choice questions instantly."
      icon={BrainCircuit}
      className="lg:col-span-1"
      footer={
        <div className="flex flex-col gap-2 w-full">
          <LoadingButton
            className="w-full"
            onClick={handleGenerate}
            isLoading={isLoading}
            loadingText="Generating..."
            icon={<Sparkles className="h-4 w-4" />}
          >
            Generate Quiz
          </LoadingButton>
          {hasQuiz && classId && (
            <LoadingButton
              variant="outline"
              className="w-full"
              onClick={handleSaveAsAssignment}
              isLoading={isSaving}
              loadingText="Saving..."
              icon={<Save className="h-4 w-4" />}
            >
              Save as Assignment
            </LoadingButton>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="topic">Topic</Label>
          <Input
            id="topic"
            placeholder="e.g. Quantum Physics, World War II"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between">
            <Label>Number of Questions</Label>
            <span className="text-sm font-medium text-muted-foreground">{count[0]}</span>
          </div>
          <Slider
            value={count}
            onValueChange={setCount}
            max={10}
            min={1}
            step={1}
          />
        </div>
      </div>
    </AICard>
  );
};
