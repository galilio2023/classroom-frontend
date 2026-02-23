import React, { useState } from "react";
import { useCustomMutation, useNotification } from "@refinedev/core";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Loader2, Sparkles, Copy, Check, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AIResponse {
  content: string;
}

interface AIAssignmentHelperProps {
  onUseContent?: (content: string) => void;
}

export const AIAssignmentHelper: React.FC<AIAssignmentHelperProps> = ({ onUseContent }) => {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [generatedContent, setGeneratedContent] = useState("");
  const [copied, setCopied] = useState(false);

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
        values: {
          subject,
          topic,
          difficulty,
        },
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Assignment Helper
          </CardTitle>
          <CardDescription>
            Use Gemini AI to draft a structured assignment description.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleGenerate} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Draft
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>Generated Content</CardTitle>
            <CardDescription>Your AI-generated assignment draft.</CardDescription>
          </div>
          <div className="flex gap-2">
            {generatedContent && onUseContent && (
              <Button variant="outline" size="sm" onClick={() => onUseContent(generatedContent)} className="gap-2">
                <Send className="h-4 w-4" />
                Use Content
              </Button>
            )}
            {generatedContent && (
              <Button variant="outline" size="icon" onClick={copyToClipboard}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <div className="h-full min-h-[300px] p-4 border rounded-md bg-muted/30 prose prose-sm dark:prose-invert max-w-none">
            {generatedContent ? (
              <ReactMarkdown>{generatedContent}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground italic">Generated content will appear here...</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
