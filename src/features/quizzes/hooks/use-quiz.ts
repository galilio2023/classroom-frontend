import { useState, useMemo, useEffect, useRef } from "react";
import {
  useCreate,
  useNotification,
  useCustomMutation,
  useCustom,
  useGetIdentity,
} from "@refinedev/core";
import { parseQuizDescription, ParsedQuestion } from "@/lib/quiz-parser";
import { useSocket } from "@/contexts/socket-context";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { User } from "@/types";

interface UseQuizProps {
  assignmentId: number;
  classId?: number;
  description: string;
  onComplete?: (score: number) => void;
}

export const useQuiz = ({ assignmentId, classId, description, onComplete }: UseQuizProps) => {
  const { t } = useTranslation();
  const { mutate: submitScore } = useCreate();
  const { open } = useNotification();
  const { socket } = useSocket();
  const { data: identity } = useGetIdentity<User>();
  const { isOnline, saveQuizOffline } = useOfflineSync();

  const [activeStudents, setActiveStudents] = useState<number>(0);

  const questions = useMemo<ParsedQuestion[]>(() => {
    return parseQuizDescription(description);
  }, [description]);

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isResuming, setIsResuming] = useState(true);

  const currentQuestion = questions[currentStep];
  const progress = questions.length > 0 ? (currentStep / questions.length) * 100 : 0;

  const { mutate: sendHeartbeat } = useCustomMutation();
  const heartbeatTimer = useRef<NodeJS.Timeout | null>(null);

  // --- RECOVERY LOGIC & METADATA ---
  const { query: recoveryQuery } = useCustom({
    url: `/quizzes/${assignmentId}/results`,
    method: "get",
    queryOptions: {
      enabled: !!assignmentId && isResuming,
    },
  });

  // 🛡️ OPTIMIZATION: Derive examMode from metadata already present in results or previous state
  // (In Tablawy, the results endpoint returns the quiz definition to reduce roundtrips)
  const examMode = (recoveryQuery.data as any)?.data?.quiz?.examMode ?? false;

  useEffect(() => {
    if (recoveryQuery.data) {
      const data = recoveryQuery.data as any;
      const active = data.data?.attempts?.find((a: any) => !a.completedAt);
      if (active) {
        setAnswers(active.answers || {});
        const answeredCount = Object.keys(active.answers || {}).length;
        setCurrentStep(Math.min(answeredCount, questions.length - 1));
        toast.success(t("classes.quiz.resumed", "Resumed your progress."));
      }
      setIsResuming(false);
    }
  }, [recoveryQuery.data, questions.length, t]);

  useEffect(() => {
    if (recoveryQuery.isError) {
      setIsResuming(false);
    }
  }, [recoveryQuery.isError]);

  // --- HEARTBEAT SYNC ---
  useEffect(() => {
    if (isFinished || isResuming) return;

    heartbeatTimer.current = setInterval(() => {
      sendHeartbeat({
        url: `/quizzes/${assignmentId}/heartbeat`,
        method: "patch",
        values: { answers },
      });
    }, 5000);

    return () => {
      if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
    };
  }, [answers, isFinished, isResuming, assignmentId, sendHeartbeat]);

  // --- LIVE ACTIVITY LOGIC ---
  useEffect(() => {
    if (!socket || !assignmentId) return;

    // Join quiz room
    socket.emit("quiz:start", { quizId: assignmentId, classId });

    const handleRoomCount = (data: { count: number }) => {
      setActiveStudents(data.count);
    };

    const handleActiveStudent = (data: { studentName: string; quizId: number }) => {
      if (data.quizId === assignmentId) {
        toast((t as any)("classes.quiz.startedToast", { name: data.studentName }), {
          icon: "✍️",
          duration: 3000,
        });
      }
    };

    const handleNudge = (data: { teacherName: string; message: string; quizId: number }) => {
      if (data.quizId === assignmentId) {
        toast(data.message, {
          description: (t as any)("classes.quiz.nudgeFrom", {
            name: data.teacherName,
          }),
          icon: "👋",
          duration: 5000,
        });
      }
    };

    socket.on("quiz:room_count", handleRoomCount);
    socket.on("quiz:active_student", handleActiveStudent);
    socket.on("quiz:nudge_received", handleNudge);

    return () => {
      socket.emit("quiz:leave", assignmentId);
      socket.off("quiz:room_count", handleRoomCount);
      socket.off("quiz:active_student", handleActiveStudent);
      socket.off("quiz:nudge_received", handleNudge);
    };
  }, [socket, assignmentId, classId, t]);

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);

    // 🛡️ HEARTBEAT: Store answer immediately for the next sync
    if (currentQuestion) {
      setAnswers((prev) => ({ ...prev, [currentStep]: option }));
    }
  };

  const handleCheckAnswer = () => {
    if (!selectedOption || !currentQuestion) return;
    setIsAnswered(true);
    if (selectedOption === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);

      if (!isOnline) {
        saveQuizOffline(assignmentId.toString(), identity?.id || "", answers);
        return;
      }

      submitScore(
        {
          resource: `quizzes/${assignmentId}/submit`,
          values: { answers },
        },
        {
          onSuccess: () => {
            open?.({
              type: "success",
              message: t("classes.quiz.submittedTitle", "Quiz Submitted!"),
              description: t(
                "classes.quiz.submittedDesc",
                "Your quiz has been submitted successfully."
              ),
            });
            onComplete?.(0); // Score calculation happens on backend
          },
          onError: () => {
            saveQuizOffline(assignmentId.toString(), identity?.id || "", answers);
          },
        }
      );
    }
  };

  return {
    questions,
    currentStep,
    currentQuestion,
    selectedOption,
    isAnswered,
    score,
    isFinished,
    examMode,
    progress,
    activeStudents,
    isResuming,
    handleOptionSelect,
    handleCheckAnswer,
    handleNext,
  };
};
