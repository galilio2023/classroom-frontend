import { useShow, useGetIdentity, useCustomMutation, useNavigation } from "@refinedev/core";
import { Quiz, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Trophy, 
  ArrowRight, 
  ArrowLeft, 
  FileQuestion, 
  Sparkles, 
  Timer, 
  ShieldCheck, 
  LayoutDashboard,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import usePageTitle from "@/hooks/use-page-title";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const QuizShow = () => {
  const { query: queryResult } = useShow<Quiz>();
  const { data: identity } = useGetIdentity<User>();
  const { list, show } = useNavigation();
  const { mutate: submitQuiz, mutation: submitMutation } = useCustomMutation<any>();

  const quiz = queryResult.data?.data;
  const isLoading = queryResult.isLoading;
  const isStudent = identity?.role === "student";

  usePageTitle(quiz?.title ? `${quiz.title} - Assessment` : "Quiz");

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
      <div className="flex flex-col items-center justify-center h-[80vh] gap-6">
        <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary/20" />
            <div className="absolute inset-0 flex items-center justify-center">
                <FileQuestion className="h-6 w-6 text-primary/40" />
            </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Preparing Assessment...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto py-20 text-center space-y-6">
        <div className="p-6 rounded-full bg-destructive/10 text-destructive w-fit mx-auto">
          <AlertCircle className="h-16 w-16" />
        </div>
        <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight">Quiz not found</h2>
            <p className="text-muted-foreground font-medium max-w-md mx-auto">The assessment you are looking for does not exist or has been removed.</p>
        </div>
        <Button onClick={() => list("classes")} className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px]">
            Back to Class
        </Button>
      </div>
    );
  }

  // --- FINISHED STATE ---
  if (isFinished) {
    return (
      <div className="container max-w-2xl mx-auto py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
            <Card className="text-center border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[3rem] overflow-hidden">
              <div className="h-3 bg-gradient-to-r from-primary via-indigo-500 to-primary" />
              <CardHeader className="p-10">
                <div className="flex justify-center mb-6">
                  <div className="p-6 rounded-[2rem] bg-yellow-500/10 text-yellow-500 shadow-xl shadow-yellow-500/10">
                    <Trophy className="h-16 w-16 animate-bounce" />
                  </div>
                </div>
                <CardTitle className="text-4xl font-black tracking-tight">Quiz Completed!</CardTitle>
                <CardDescription className="text-lg font-medium">Great job on finishing the assessment.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 pt-0 space-y-8">
                <div className="p-10 bg-primary/5 rounded-[2.5rem] inline-block border border-primary/10 shadow-inner">
                  <span className="text-7xl font-black text-primary tracking-tighter">{score}</span>
                  <span className="text-xl font-black text-muted-foreground/60 uppercase tracking-widest ml-4">Points</span>
                </div>
                <p className="text-muted-foreground font-medium max-w-xs mx-auto">
                  Your results have been securely recorded and shared with your instructor.
                </p>
              </CardContent>
              <CardFooter className="p-10 bg-primary/5 flex justify-center">
                <Button 
                    onClick={() => list("classes")}
                    className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
                >
                  Return to Classroom
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
        </motion.div>
      </div>
    );
  }

  // --- QUIZ IN PROGRESS ---
  if (isStarted && quiz.questions) {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
      <div className="container max-w-4xl mx-auto py-10 px-4 space-y-8">
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center justify-between gap-6 bg-card/50 backdrop-blur-xl p-6 rounded-[2rem] border border-primary/5 shadow-xl"
        >
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-2xl font-black tracking-tight">{quiz.title}</h2>
            <div className="flex items-center justify-center md:justify-start gap-3">
                <Badge variant="secondary" className="font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg">
                    Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </Badge>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{Math.round(progress)}% Complete</span>
            </div>
          </div>
          {timeLeft !== null && (
            <div className={cn(
                "flex items-center gap-3 px-8 py-4 rounded-2xl border-2 transition-all shadow-lg",
                timeLeft < 60 
                    ? "bg-destructive/10 border-destructive text-destructive animate-pulse shadow-destructive/20" 
                    : "bg-primary/5 border-primary/10 text-primary shadow-primary/5"
            )}>
              <Timer className="h-6 w-6" />
              <span className="font-mono text-2xl font-black tracking-wider">{formatTime(timeLeft)}</span>
            </div>
          )}
        </motion.div>

        <div className="px-2">
            <Progress value={progress} className="h-3 rounded-full bg-primary/10" />
        </div>

        <AnimatePresence mode="wait">
            <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
            >
                <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[3rem] overflow-hidden">
                  <CardHeader className="p-10 pb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <FileQuestion className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Assessment Question</span>
                    </div>
                    <CardTitle className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                      {currentQuestion.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 pt-4">
                    <RadioGroup
                      value={answers[currentQuestion.id] || ""}
                      onValueChange={(val) => handleAnswer(currentQuestion.id, val)}
                      className="grid gap-4"
                    >
                      {currentQuestion.options.map((option: string, idx: number) => {
                        const isSelected = answers[currentQuestion.id] === option;
                        return (
                            <div
                              key={idx}
                              className={cn(
                                "flex items-center space-x-4 p-6 rounded-[1.5rem] border-2 transition-all cursor-pointer group",
                                isSelected 
                                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" 
                                    : "border-primary/5 bg-muted/20 hover:bg-primary/[0.02] hover:border-primary/20"
                              )}
                              onClick={() => handleAnswer(currentQuestion.id, option)}
                            >
                              <div className={cn(
                                  "size-6 rounded-full border-2 flex items-center justify-center transition-all",
                                  isSelected ? "border-primary bg-primary" : "border-primary/20"
                              )}>
                                  {isSelected && <div className="size-2 bg-white rounded-full" />}
                              </div>
                              <RadioGroupItem value={option} id={`opt-${idx}`} className="sr-only" />
                              <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer text-lg font-bold leading-tight">
                                {option}
                              </Label>
                            </div>
                        );
                      })}
                    </RadioGroup>
                  </CardContent>
                  <CardFooter className="p-10 bg-primary/[0.02] border-t border-primary/5 flex justify-between">
                    <Button
                      variant="ghost"
                      size="lg"
                      className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8"
                      onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                      disabled={currentQuestionIndex === 0}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    
                    {currentQuestionIndex === quiz.questions.length - 1 ? (
                      <Button 
                        size="lg"
                        onClick={handleFinish} 
                        disabled={submitMutation.isPending || !answers[currentQuestion.id]}
                        className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-10 bg-green-600 hover:bg-green-700 shadow-xl shadow-green-600/20"
                      >
                        {submitMutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                        Submit Assessment
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                        disabled={!answers[currentQuestion.id]}
                        className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-10 shadow-xl shadow-primary/20"
                      >
                        Next Question <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
            </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // --- PREVIEW / START STATE ---
  return (
    <div className="container max-w-3xl mx-auto py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[3rem] overflow-hidden">
            <div className="h-3 bg-gradient-to-r from-primary via-ai-primary to-primary" />
            <CardHeader className="p-12 text-center space-y-6">
              <div className="mx-auto p-5 rounded-[2rem] bg-primary/10 text-primary shadow-xl shadow-primary/5 w-fit">
                <FileQuestion className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tight">{quiz.title}</h1>
                <p className="text-lg font-medium text-muted-foreground max-w-md mx-auto">
                  {quiz.description || "Please review the instructions carefully before beginning your assessment."}
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-12 pt-0 space-y-10">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-[2rem] bg-muted/30 border border-primary/5 space-y-2 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Total Questions</p>
                  <p className="text-3xl font-black text-primary">{quiz.questions?.length || 0}</p>
                </div>
                <div className="p-6 rounded-[2rem] bg-muted/30 border border-primary/5 space-y-2 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Time Allocation</p>
                  <p className="text-3xl font-black text-primary">{quiz.timeLimit ? `${quiz.timeLimit} Mins` : "Unlimited"}</p>
                </div>
              </div>

              {isStudent && (
                <div className="bg-amber-500/5 border-2 border-dashed border-amber-500/20 p-8 rounded-[2rem] flex gap-5 items-start">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-black uppercase tracking-widest text-xs text-amber-600">Assessment Rules</p>
                    <p className="text-sm text-amber-800/70 font-medium leading-relaxed">
                        Once you start, the timer will begin. You cannot pause or restart the quiz. Ensure you have a stable connection and a quiet environment.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="p-12 bg-primary/[0.02] border-t border-primary/5 flex flex-col gap-4">
              {isStudent ? (
                <Button 
                    className="w-full h-16 text-xs font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/20" 
                    onClick={handleStart}
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Begin Assessment
                </Button>
              ) : (
                <div className="w-full space-y-4">
                  <Button 
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20" 
                    variant="outline" 
                    onClick={() => show("quizzes", quiz.id.toString(), "push", { query: { action: "results" } })}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    View Student Performance
                  </Button>
                  <p className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                    Instructors can only preview assessment content.
                  </p>
                </div>
              )}
              <Button 
                variant="ghost" 
                className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] text-muted-foreground" 
                onClick={() => list("classes")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Classroom
              </Button>
            </CardFooter>
          </Card>
      </motion.div>
    </div>
  );
};

export default QuizShow;
