import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  FileQuestion,
  Timer,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { Quiz } from "@/types";
import { cn } from "@/lib/utils";

interface QuizActiveProps {
  quiz: Quiz;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number | ((prev: number) => number)) => void;
  answers: Record<string, string>;
  onAnswer: (questionId: string | number, option: string) => void;
  timeLeft: number | null;
  onFinish: () => void;
  isSubmitting: boolean;
  setAnswers: (answers: Record<string, string>) => void;
}

export const QuizActive = ({
  quiz,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  answers,
  onAnswer,
  timeLeft,
  onFinish,
  isSubmitting,
  setAnswers,
}: QuizActiveProps) => {
  const { t } = useTranslation();

  // 🛡️ RESILIENCE: LocalStorage Recovery for Network Drops
  const CACHE_KEY = `quiz_progress_${quiz.id}`;

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached && Object.keys(answers).length === 0) {
      try {
        setAnswers(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse quiz cache", e);
      }
    }
  }, [quiz.id]);

  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(answers));
    }
  }, [answers, CACHE_KEY]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (!currentQuestion) return null;

  return (
    <div className="container max-w-4xl mx-auto py-8 md:py-12 px-4 md:px-6 space-y-8 md:space-y-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center justify-between gap-6 bg-card/50 backdrop-blur-xl p-6 md:p-8 rounded-4xl border border-primary/5 shadow-xl sticky top-20 z-40 text-start"
      >
        <div className="space-y-1 text-center md:text-start">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
            {quiz.title}
          </h2>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <Badge
              variant="secondary"
              className="font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg shadow-sm"
            >
              {t("classes.quiz.questionsCount", {
                count: questions.length,
              })}
            </Badge>
            <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              {Math.round(progress)}% {t("status.completed")}
            </span>
          </div>
        </div>
        {timeLeft !== null && (
          <div
            className={cn(
              "flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-2xl border-2 transition-all shadow-lg",
              timeLeft < 60
                ? "bg-destructive/10 border-destructive text-destructive animate-pulse shadow-destructive/20"
                : "bg-primary/5 border-primary/10 text-primary shadow-primary/5"
            )}
          >
            <Timer className="h-5 w-5 md:h-6 w-6" />
            <span className="font-mono text-xl md:text-2xl font-black tracking-wider">
              {formatTime(timeLeft)}
            </span>
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
          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden text-start">
            <CardHeader className="p-8 md:p-10 pb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/5">
                  <FileQuestion className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                  {t("classes.quiz.classQuizzes")}
                </span>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-black tracking-tight leading-tight text-balance">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 md:p-10 pt-4">
              <RadioGroup
                value={answers[String(currentQuestion.id)] || ""}
                onValueChange={(val) => onAnswer(currentQuestion.id, val)}
                className="grid gap-4 md:gap-6"
              >
                {currentQuestion.options.map((option: string, idx: number) => {
                  const isSelected = answers[String(currentQuestion.id)] === option;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center space-x-4 p-5 md:p-6 rounded-[1.5rem] border-2 transition-all cursor-pointer group",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
                          : "border-border/40 bg-muted/20 hover:bg-primary/2 hover:border-primary/20"
                      )}
                      onClick={() => onAnswer(currentQuestion.id, option)}
                    >
                      <div
                        className={cn(
                          "size-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                          isSelected ? "border-primary bg-primary" : "border-primary/20"
                        )}
                      >
                        {isSelected && <div className="size-2 bg-white rounded-full" />}
                      </div>
                      <RadioGroupItem value={option} id={`opt-${idx}`} className="sr-only" />
                      <Label
                        htmlFor={`opt-${idx}`}
                        className="flex-1 cursor-pointer text-base md:text-lg font-bold leading-tight"
                      >
                        {option}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </CardContent>
            <CardFooter className="p-8 md:p-10 bg-primary/2 border-t border-primary/5 flex flex-col sm:flex-row justify-between gap-4">
              <Button
                variant="ghost"
                size="lg"
                className="w-full sm:w-auto rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8"
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="me-2 h-4 w-4" /> {t("buttons.back")}
              </Button>

              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  size="lg"
                  onClick={onFinish}
                  disabled={isSubmitting || !answers[String(currentQuestion.id)]}
                  className="w-full sm:w-auto rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-10 bg-green-600 hover:bg-green-700 shadow-xl shadow-green-600/20 text-white"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin h-4 w-4 me-2" />
                  ) : (
                    <CheckCircle2 className="me-2 h-4 w-4" />
                  )}
                  {t("buttons.save")}
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  disabled={!answers[String(currentQuestion.id)]}
                  className="w-full sm:w-auto rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-10 shadow-xl shadow-primary/20"
                >
                  {t("classes.quiz.nextQuestion")} <ChevronRight className="ms-2 h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
