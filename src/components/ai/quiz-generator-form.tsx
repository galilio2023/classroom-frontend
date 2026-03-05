import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { LoadingButton } from "../ui/loading-button";
import { AICard } from "./ai-card";
import { BrainCircuit, Sparkles, Save, BarChart, ListChecks } from "lucide-react";

interface QuizGeneratorFormProps {
  topic: string;
  setTopic: (topic: string) => void;
  count: number[];
  setCount: (count: number[]) => void;
  difficulty?: string;
  setDifficulty?: (difficulty: string) => void;
  type?: string;
  setType?: (type: string) => void;
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
  difficulty = "medium",
  setDifficulty,
  type = "multiple_choice",
  setType,
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
      description="Generate high-quality assessments instantly."
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
          <Label htmlFor="topic" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Topic</Label>
          <Input
            id="topic"
            placeholder="e.g. Quantum Physics"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="difficulty" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger id="difficulty" className="h-9">
                        <div className="flex items-center gap-2">
                            <BarChart className="h-3.5 w-3.5 text-primary" />
                            <SelectValue placeholder="Level" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="type" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Format</Label>
                <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="type" className="h-9">
                        <div className="flex items-center gap-2">
                            <ListChecks className="h-3.5 w-3.5 text-primary" />
                            <SelectValue placeholder="Type" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                        <SelectItem value="true_false">True / False</SelectItem>
                        <SelectItem value="mixed">Mixed Format</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Number of Questions</Label>
            <span className="text-sm font-black text-primary">{count[0]}</span>
          </div>
          <Slider
            value={count}
            onValueChange={setCount}
            max={15}
            min={1}
            step={1}
            className="py-2"
          />
        </div>
      </div>
    </AICard>
  );
};
