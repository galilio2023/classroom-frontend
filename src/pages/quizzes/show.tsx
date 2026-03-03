import { useShow, useGetIdentity, useCustomMutation, useNavigation } from "@refinedev/core";
import { Quiz, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, AlertCircle, CheckCircle2, Trophy, ArrowRight, ArrowLeft, FileQuestion } from "lucide-react";
import React, { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const QuizShow = () => {
  const { query: queryResult } = useShow<Quiz>();
  const { data: identity } = useGetIdentity<User>();
  const { list, show } = useNavigation();
  const { mutate: submitQuiz, mutation: submitMutation } = useCustomMutation<any>();

  const quiz = queryResult.data?.data;
  const isLoading = queryResult.isLoading;
  const isStudent = identity?.role === "student";

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Initialize timer
  useEffect(() => {
    if (isStarted && quiz?.timeLimit) {
      setTimeLeft(quiz.timeLimit * 60);
    }
  }, [isStarted, quiz?.timeLimit]);

  // Timer countdown
  useEffect(() => {
    if (isStarted && timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isFinished) {
      handleFinish();
    }
  }, [isStarted, timeLeft, isFinished]);

  const handleStart = () => setIsStarted(true);

  const handleAnswer = (questionId: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleFinish = () => {
    if (!quiz) return;

    submitQuiz(
      {
        url: `/quizzes/${quiz.id}/submit`,
        method: "post",
        values: { answers },
      },
      {
        onSuccess: (data) => {
          setScore(data.data.score);
          setIsFinished(true);
          setIsStarted(false);
          toast.success("Quiz submitted successfully!");
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to submit quiz");
        },
      }
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Quiz not found</h2>
      </div>
    );
  }

  // --- FINISHED STATE ---
  if (isFinished) {
    return (
      <div className="container max-w-2xl mx-auto py-10 px-4">
        <Card className="text-center border-2 border-primary/20">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Trophy className="h-16 w-16 text-yellow-500 animate-bounce" />
            </div>
            <CardTitle className="text-3xl font-bold">Quiz Completed!</CardTitle>
            <CardDescription>Great job on finishing the quiz.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 bg-primary/5 rounded-full inline-block">
              <span className="text-5xl font-black text-primary">{score}</span>
              <span className="text-xl text-muted-foreground ml-2">Points</span>
            </div>
            <p className="text-muted-foreground">
              Your results have been recorded and shared with your teacher.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => list("classes")}>
              Back to Class
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // --- QUIZ IN PROGRESS ---
  if (isStarted && quiz.questions) {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
      <div className="container max-w-3xl mx-auto py-10 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">{quiz.title}</h2>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </p>
          </div>
          {timeLeft !== null && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${timeLeft < 60 ? "bg-destructive/10 border-destructive text-destructive animate-pulse" : "bg-muted border-border"}`}>
              <Clock className="h-4 w-4" />
              <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        <Progress value={progress} className="h-2" />

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[currentQuestion.id] || ""}
              onValueChange={(val) => handleAnswer(currentQuestion.id, val)}
              className="space-y-3"
            >
              {currentQuestion.options.map((option: string, idx: number) => (
                <div
                  key={idx}
                  className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer hover:bg-accent ${
                    answers[currentQuestion.id] === option ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  onClick={() => handleAnswer(currentQuestion.id, option)}
                >
                  <RadioGroupItem value={option} id={`opt-${idx}`} />
                  <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer text-base">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            
            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button 
                onClick={handleFinish} 
                disabled={submitMutation.isPending || !answers[currentQuestion.id]}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitMutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                disabled={!answers[currentQuestion.id]}
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  // --- PREVIEW / START STATE ---
  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <Card className="border-2">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
            <FileQuestion className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">{quiz.title}</CardTitle>
          <CardDescription className="text-base">
            {quiz.description || "No instructions provided."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-muted/50 space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Questions</p>
              <p className="text-xl font-semibold">{quiz.questions?.length || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Time Limit</p>
              <p className="text-xl font-semibold">{quiz.timeLimit ? `${quiz.timeLimit} Mins` : "No Limit"}</p>
            </div>
          </div>

          {isStudent && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 p-4 rounded-lg flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Once you start, the timer will begin. You cannot pause or restart the quiz. Ensure you have a stable connection.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          {isStudent ? (
            <Button className="w-full h-12 text-lg" onClick={handleStart}>
              Start Quiz
            </Button>
          ) : (
            <div className="w-full space-y-3">
              <Button className="w-full" variant="outline" onClick={() => show("quizzes", quiz.id.toString(), "push", { query: { action: "results" } })}>
                View Student Results
              </Button>
              <p className="text-center text-xs text-muted-foreground italic">
                Teachers can only preview the quiz.
              </p>
            </div>
          )}
          <Button variant="ghost" className="w-full" onClick={() => list("classes")}>
            Back to Class
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizShow;
