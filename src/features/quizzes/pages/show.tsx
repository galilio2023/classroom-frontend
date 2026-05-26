import { useShow, useGetIdentity, useCustomMutation, useNavigation } from "@refinedev/core";
import { Quiz, User } from "@/types";
import { Loader2, FileQuestion, XCircle } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import usePageTitle from "@/hooks/use-page-title";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// New sub-components
import { QuizIntro } from "../components/show/QuizIntro";
import { QuizActive } from "../components/show/QuizActive";
import { QuizResults } from "../components/show/QuizResults";

const QuizShow = () => {
  const { t } = useTranslation();
  const { query } = useShow<Quiz>();
  const { data: identity } = useGetIdentity<User>();
  const { list, show } = useNavigation();
  const { mutate: submitQuiz, mutation: submitMutation } = useCustomMutation<any>();

  const quiz = query.data?.data;
  const isLoading = query.isLoading;
  const isStudent = identity?.role === "student";

  usePageTitle(
    quiz?.title
      ? `${quiz.title} - ${t("classes.quiz.classQuizzes")}`
      : t("classes.quiz.classQuizzes")
  );

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string | number, string>>({});
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

  const handleAnswer = (questionId: string | number, option: string) => {
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
          // 🧹 CLEANUP: Remove cached progress on success
          localStorage.removeItem(`quiz_progress_${quiz.id}`);
          toast.success(t("classes.live.toasts.sessionStartedTeacher"));
        },
        onError: (error: any) => {
          toast.error(error?.message || t("common.error"));
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[85vh] gap-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div className="absolute inset-[-20px] rounded-full bg-primary/5 animate-ping duration-[3000ms]" />
          <Loader2 className="h-20 w-20 animate-spin text-primary/10 stroke-[1]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FileQuestion className="h-8 w-8 text-primary/30" />
          </div>
        </motion.div>
        <div className="text-center space-y-2">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary/60 animate-pulse">
            {t("classes.quiz.loading")}
          </h2>
          <p className="text-xs font-medium text-muted-foreground/60 italic">
            Loading quiz questions and settings...
          </p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto py-32 text-center space-y-8">
        <div className="p-8 rounded-[2.5rem] bg-destructive/5 text-destructive w-fit mx-auto border border-destructive/10">
          <XCircle className="h-20 w-20" />
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-black tracking-tight">{t("classes.show.notFound")}</h2>
          <p className="text-muted-foreground font-medium max-w-md mx-auto text-lg">
            {t("classes.show.notFoundDescription")}
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="rounded-2xl h-14 px-10 font-bold uppercase tracking-widest text-[10px]"
        >
          <Link to="/classes">{t("buttons.back")}</Link>
        </Button>
      </div>
    );
  }

  if (isFinished) {
    return <QuizResults score={score} onBack={() => list("classes")} />;
  }

  if (isStarted && quiz.questions) {
    return (
      <QuizActive
        quiz={quiz}
        currentQuestionIndex={currentQuestionIndex}
        setCurrentQuestionIndex={setCurrentQuestionIndex}
        answers={answers}
        onAnswer={handleAnswer}
        timeLeft={timeLeft}
        onFinish={handleFinish}
        isSubmitting={submitMutation.isPending}
        setAnswers={setAnswers}
      />
    );
  }

  return (
    <QuizIntro
      quiz={quiz}
      isStudent={isStudent}
      onStart={handleStart}
      onViewResults={() =>
        show("quizzes", quiz.id.toString(), "push", {
          query: { action: "results" },
        })
      }
      onBack={() => list("classes")}
    />
  );
};

export default QuizShow;
