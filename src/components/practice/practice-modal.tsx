import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Trophy } from "lucide-react";
import { useCustomMutation } from "@refinedev/core";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { PracticeQuizStep } from "./practice-quiz-step";
import { PracticeResultStep } from "./practice-result-step";
import { useTranslation } from "react-i18next";

interface PracticeModalProps {
  topic: string;
  subjectId: number | null;
  onClose: () => void;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface Session {
  id: number;
  questions: Question[];
}

export const PracticeModal = ({ topic, subjectId, onClose }: PracticeModalProps) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<"loading" | "quiz" | "result">("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<any>(null);
  const { width, height } = useWindowSize();

  // Start Session Mutation
  const { mutate: startSession } = useCustomMutation<Session>();

  // Submit Session Mutation
  const { mutate: submitSession, mutation: submitMutation } = useCustomMutation<any>();
  const isSubmitting = (submitMutation as any).isPending || (submitMutation as any).isLoading;

  useEffect(() => {
    startSession(
      {
        url: "/ai/practice/start",
        method: "post",
        values: { topic, subjectId },
        successNotification: false,
        errorNotification: {
          message: t("aiHub.studyLab.toasts.error"),
          type: "error",
        },
      },
      {
        onSuccess: (data) => {
          setSession(data.data);
          setStep("quiz");
        },
        onError: () => {
          onClose();
        },
      }
    );
  }, [topic, subjectId]);

  const handleOptionSelect = (option: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: option }));
  };

  const handleNext = () => {
    if (session && currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!session) return;

    submitSession(
      {
        url: "/ai/practice/submit",
        method: "post",
        values: { sessionId: session.id, answers },
        successNotification: false,
      },
      {
        onSuccess: (data: any) => {
          setResult(data.data);
          setStep("result");
        },
      }
    );
  };

  const currentQuestion = session?.questions[currentQuestionIndex];
  const progress = session ? ((currentQuestionIndex + 1) / session.questions.length) * 100 : 0;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        {step === "result" && result?.passed && (
          <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />
        )}

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {t("aiHub.studyLab.tools.quiz.title")}: {topic}
          </DialogTitle>
          <DialogDescription>
            {step === "loading" && t("common.analyzingData")}
            {step === "quiz" &&
              t("aiHub.studyLab.flashcards.cardOf", {
                current: currentQuestionIndex + 1,
                total: session?.questions.length,
              })}
            {step === "result" && t("aiHub.studyLab.flashcards.sessionComplete")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === "loading" && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">{t("common.analyzingData")}</p>
            </div>
          )}

          {step === "quiz" && currentQuestion && (
            <PracticeQuizStep
              currentQuestion={currentQuestion}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={session?.questions.length || 0}
              progress={progress}
              selectedOption={answers[currentQuestionIndex]}
              onOptionSelect={handleOptionSelect}
              onNext={handleNext}
              isSubmitting={isSubmitting}
            />
          )}

          {step === "result" && result && <PracticeResultStep result={result} onClose={onClose} />}
        </div>
      </DialogContent>
    </Dialog>
  );
};
