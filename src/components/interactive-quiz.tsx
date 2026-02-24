import React, { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { CheckCircle2, XCircle, ArrowRight, Trophy, RefreshCw, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreate, useNotification, useGo } from "@refinedev/core";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface InteractiveQuizProps {
  assignmentId: number;
  description: string;
  onComplete?: (score: number) => void;
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({ assignmentId, description, onComplete }) => {
  const go = useGo();
  const { mutate: submitScore } = useCreate();
  const { open } = useNotification();

  const questions = useMemo(() => {
    try {
      const qBlocks = description.split("---").filter(block => block.includes("Q"));
      return qBlocks.map(block => {
        const lines = block.trim().split("\n");
        const question = lines[0].replace(/### Q\d+: /, "").trim();
        const options = lines.filter(l => l.startsWith("- ")).map(l => l.replace("- ", "").replace(" (Correct)", "").trim());
        const correctAnswerLine = lines.find(l => l.includes("(Correct)"));
        const correctAnswer = correctAnswerLine ? correctAnswerLine.replace("- ", "").replace(" (Correct)", "").trim() : "";
        const explanation = lines.find(l => l.includes("**Explanation:**"))?.replace("**Explanation:**", "").trim() || "";
        
        return { question, options, correctAnswer, explanation };
      }).filter(q => q.question && q.options.length > 0);
    } catch (error) {
      console.error("Failed to parse quiz content:", error);
      return [];
    }
  }, [description]);

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep) / questions.length) * 100;

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    setIsAnswered(true);
    if (selectedOption === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      const finalScore = Math.round((score / questions.length) * 100);
      
      submitScore({
        resource: "submissions",
        values: {
          assignmentId,
          content: `Completed AI Quiz. Final Score: ${finalScore}%`,
          grade: finalScore,
          feedback: `Automated grade from interactive quiz. Correct answers: ${score}/${questions.length}`,
        }
      }, {
        onSuccess: () => {
          open?.({
            type: "success",
            message: "Quiz Submitted!",
            description: `Your score of ${finalScore}% has been saved.`,
          });
          onComplete?.(finalScore);
        }
      });
    }
  };

  if (questions.length === 0) return null;

  if (isFinished) {
    const finalPercentage = Math.round((score / questions.length) * 100);
    return (
      <Card className="border-primary/20 bg-primary/5 text-center py-8 md:py-10">
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Trophy className="h-12 w-10 md:h-16 md:w-12 text-primary animate-bounce" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black">Quiz Complete!</h2>
            <p className="text-sm md:text-base text-muted-foreground font-medium px-4">You've finished the interactive assessment.</p>
          </div>
          <div className="text-5xl md:text-6xl font-black text-primary">
            {finalPercentage}%
          </div>
          <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-primary/60">
            {score} out of {questions.length} correct
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button 
            onClick={() => go({ to: "/dashboard" })} 
            variant="outline" 
            className="rounded-xl font-bold w-full max-w-[200px]"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2 px-1">
        <div className="flex justify-between text-[10px] md:text-xs font-black uppercase tracking-tighter text-muted-foreground">
          <span>Question {currentStep + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-1.5 md:h-2" />
      </div>

      <Card className="border-none shadow-xl bg-white/50 dark:bg-black/20 backdrop-blur-xl overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-primary/10 p-4 md:p-6">
          <CardTitle className="text-base md:text-lg leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-8 space-y-4">
          <div className="grid gap-2 md:gap-3">
            {currentQuestion.options.map((option, index) => {
              const isCorrect = option === currentQuestion.correctAnswer;
              const isSelected = option === selectedOption;
              
              return (
                <button
                  key={index}
                  disabled={isAnswered}
                  onClick={() => handleOptionSelect(option)}
                  className={cn(
                    "flex items-center justify-between p-3 md:p-4 rounded-xl border-2 transition-all text-left text-sm md:text-base font-medium",
                    !isAnswered && isSelected && "border-primary bg-primary/5 shadow-md",
                    !isAnswered && !isSelected && "border-transparent bg-white dark:bg-white/5 hover:border-primary/30",
                    isAnswered && isCorrect && "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400",
                    isAnswered && isSelected && !isCorrect && "border-destructive bg-destructive/10 text-destructive",
                    isAnswered && !isSelected && !isCorrect && "opacity-50 border-transparent bg-muted/30"
                  )}
                >
                  <span className="pr-2">{option}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 shrink-0" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="h-4 w-4 md:h-5 md:w-5 shrink-0" />}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="mt-4 md:mt-6 p-3 md:p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-2 mb-1 md:mb-2 text-blue-600 dark:text-blue-400 font-black text-[10px] md:text-xs uppercase tracking-widest">
                <BrainCircuit className="h-3 w-3 md:h-4 md:w-4" />
                Explanation
              </div>
              <p className="text-xs md:text-sm leading-relaxed">{currentQuestion.explanation}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/30 border-t border-black/5 p-4 md:p-6">
          {!isAnswered ? (
            <Button 
              className="w-full rounded-xl font-black h-10 md:h-12 shadow-lg shadow-primary/20" 
              disabled={!selectedOption}
              onClick={handleCheckAnswer}
            >
              Check Answer
            </Button>
          ) : (
            <Button 
              className="w-full rounded-xl font-black h-10 md:h-12 shadow-lg shadow-primary/20" 
              onClick={handleNext}
            >
              {currentStep === questions.length - 1 ? "Finish Quiz" : "Next Question"}
              <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
