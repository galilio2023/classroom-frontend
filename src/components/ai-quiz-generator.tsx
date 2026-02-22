import React, { useState } from "react";
import { useCustomMutation, useNotification, useCreate } from "@refinedev/core";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Loader2, Sparkles, BrainCircuit, HelpCircle, CheckCircle2, Save } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface AIResponse {
  quiz: QuizQuestion[];
}

interface AIQuizGeneratorProps {
  classId?: string;
}

export const AIQuizGenerator: React.FC<AIQuizGeneratorProps> = ({ classId }) => {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState([5]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);

  const { open } = useNotification();
  const { mutate, mutation } = useCustomMutation<AIResponse>();
  const isLoading = mutation.isPending;

  const { mutate: createAssignment, mutation: createMutation } = useCreate();
  const isSaving = createMutation.isPending;

  const handleGenerate = () => {
    if (!topic) {
      open?.({
        type: "error",
        message: "Topic required",
        description: "Please enter a topic to generate questions.",
      });
      return;
    }

    mutate(
      {
        url: "/ai/generate-quiz",
        method: "post",
        values: {
          topic,
          count: count[0],
        },
      },
      {
        onSuccess: (data) => {
          setQuiz(data.data.quiz);
          open?.({
            type: "success",
            message: "Quiz Generated!",
            description: `Successfully created ${data.data.quiz.length} questions.`,
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

  const handleSaveAsAssignment = () => {
    if (!classId || quiz.length === 0) return;

    const description = quiz.map((q, i) => {
      return `### Q${i+1}: ${q.question}\n\n` + 
             q.options.map((opt) => `- ${opt}${opt === q.correctAnswer ? " (Correct)" : ""}`).join("\n") +
             `\n\n**Explanation:** ${q.explanation}\n\n---`;
    }).join("\n\n");

    createAssignment(
      {
        resource: "assignments",
        values: {
          title: `Quiz: ${topic}`,
          description,
          classId: Number(classId),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 1 week
        },
      },
      {
        onSuccess: () => {
          open?.({
            type: "success",
            message: "Assignment Created!",
            description: "The quiz has been saved as an assignment for this class.",
          });
        },
      }
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            AI Quiz Generator
          </CardTitle>
          <CardDescription>
            Generate multiple-choice questions instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
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
                Generate Quiz
              </>
            )}
          </Button>
          {quiz.length > 0 && classId && (
            <Button 
              variant="outline" 
              className="w-full gap-2" 
              onClick={handleSaveAsAssignment}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save as Assignment
            </Button>
          )}
        </CardFooter>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Questions Preview
          </CardTitle>
          <CardDescription>
            Review the generated questions and explanations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {quiz.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {quiz.map((q, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    <span className="font-medium">Q{index + 1}: {q.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {q.options.map((option, i) => (
                        <div 
                          key={i} 
                          className={`p-2 rounded-md border text-sm flex items-center gap-2 ${
                            option === q.correctAnswer 
                              ? "bg-green-50 border-green-200 text-green-700" 
                              : "bg-muted/50 border-transparent"
                          }`}
                        >
                          {option === q.correctAnswer && <CheckCircle2 className="h-4 w-4" />}
                          {option}
                        </div>
                      ))}
                    </div>
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                      <p className="text-xs font-semibold text-blue-800 uppercase mb-1">Explanation</p>
                      <p className="text-sm text-blue-700">{q.explanation}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
              <BrainCircuit className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground">No questions generated yet.</p>
              <p className="text-xs text-muted-foreground/60">Enter a topic and click generate to start.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
