import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { LoadingButton } from "../ui/loading-button";
import { AICard } from "./ai-card";
import { Sparkles, GraduationCap, MessageSquare, Target } from "lucide-react";

interface AssignmentGeneratorFormProps {
  subject: string;
  setSubject: (subject: string) => void;
  topic: string;
  setTopic: (topic: string) => void;
  difficulty: string;
  setDifficulty: (difficulty: string) => void;
  tone?: string;
  setTone?: (tone: string) => void;
  objectives?: string;
  setObjectives?: (objectives: string) => void;
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
  tone = "academic",
  setTone,
  objectives = "",
  setObjectives,
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
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subject</Label>
                <Input
                    id="subject"
                    placeholder="e.g. History"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="h-9"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="difficulty" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger id="difficulty" className="h-9">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-3.5 w-3.5 text-primary" />
                            <SelectValue placeholder="Select level" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="topic" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Topic</Label>
          <Input
            id="topic"
            placeholder="e.g. The French Revolution"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="space-y-2">
            <Label htmlFor="tone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tone & Style</Label>
            <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone" className="h-9">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-3.5 w-3.5 text-primary" />
                        <SelectValue placeholder="Select tone" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="academic">Academic & Formal</SelectItem>
                    <SelectItem value="creative">Creative & Engaging</SelectItem>
                    <SelectItem value="practical">Practical & Hands-on</SelectItem>
                    <SelectItem value="strict">Strict & Detailed</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="objectives" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Target className="h-3.5 w-3.5 text-primary" />
            Learning Objectives (Optional)
          </Label>
          <Textarea
            id="objectives"
            placeholder="What should students learn? (e.g. Critical thinking, Data analysis)"
            value={objectives}
            onChange={(e) => setObjectives?.(e.target.value)}
            className="resize-none text-xs min-h-20"
          />
        </div>
      </div>
    </AICard>
  );
};
