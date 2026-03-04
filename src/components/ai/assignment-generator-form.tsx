import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { LoadingButton } from "../ui/loading-button";
import { AICard } from "./ai-card";
import { Sparkles } from "lucide-react";

interface AssignmentGeneratorFormProps {
  subject: string;
  setSubject: (subject: string) => void;
  topic: string;
  setTopic: (topic: string) => void;
  difficulty: string;
  setDifficulty: (difficulty: string) => void;
  handleGenerate: () => void;
  isLoading: boolean;
}

export const AssignmentGeneratorForm: React.FC<AssignmentGeneratorFormProps> = ({
  subject,
  setSubject,
  topic,
  setTopic,
  difficulty,
  setDifficulty,
  handleGenerate,
  isLoading,
}) => {
  return (
    <AICard
      title="AI Assignment Helper"
      description="Use Gemini AI to draft a structured assignment description."
      footer={
        <LoadingButton
          className="w-full"
          onClick={handleGenerate}
          isLoading={isLoading}
          loadingText="Generating..."
          icon={<Sparkles className="h-4 w-4" />}
        >
          Generate Draft
        </LoadingButton>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            placeholder="e.g. Computer Science, History"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="topic">Topic</Label>
          <Input
            id="topic"
            placeholder="e.g. React Hooks, French Revolution"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger id="difficulty">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </AICard>
  );
};
