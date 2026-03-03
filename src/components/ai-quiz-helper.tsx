import React, { useState } from "react";
import { useCustomMutation, useNotification } from "@refinedev/core";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loader2, Sparkles, Send, PlusCircle } from "lucide-react";

interface AIQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
}

interface AIQuizResponse {
  quiz: AIQuizQuestion[];
}

interface AIQuizHelperProps {
  onUseQuestions?: (questions: AIQuizQuestion[]) => void;
}

export const AIQuizHelper: React.FC<AIQuizHelperProps> = ({ onUseQuestions }) => {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState("5");
  const [generatedQuestions, setGeneratedQuestions] = useState<AIQuizQuestion[]>([]);

  const { open } = useNotification();
  const { mutate, mutation } = useCustomMutation<AIQuizResponse>();
  const isLoading = mutation.isPending;

  const handleGenerate = () => {
    if (!topic) {
      open?.({
        type: "error",
        message: "Please enter a topic",
        description: "A topic is required to generate quiz questions.",
      });
      return;
    }

    mutate(
      {
        url: "/ai/generate-quiz",
        method: "post",
        values: {
          topic,
          count: Number(count),
        },
      },
      {
        onSuccess: (data) => {
          setGeneratedQuestions(data.data.quiz);
          open?.({
            type: "success",
            message: "Quiz Questions Generated!",
            description: `Gemini has created ${data.data.quiz.length} questions for you.`,
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

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Quiz Helper
          </CardTitle>
          <CardDescription>
            Use Gemini AI to draft multiple-choice questions for your quiz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              onChange={(e) => setCount(e.target.value)}
            />
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
                Generate Questions
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>Generated Questions</CardTitle>
            <CardDescription>Review and add these to your quiz.</CardDescription>
          </div>
          {generatedQuestions.length > 0 && onUseQuestions && (
            <Button variant="outline" size="sm" onClick={() => onUseQuestions(generatedQuestions)} className="gap-2">
              <Send className="h-4 w-4" />
              Use All Questions
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <div className="space-y-4 max-h-[400px]">
            {generatedQuestions.length > 0 ? (
              generatedQuestions.map((q, idx) => (
                <div key={idx} className="p-3 border rounded-md bg-muted/30 space-y-2">
                  <p className="font-medium text-sm">{idx + 1}. {q.question}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className={opt === q.correctAnswer ? "text-green-600 font-bold" : ""}>
                        • {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground italic text-center py-10">Questions will appear here...</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
