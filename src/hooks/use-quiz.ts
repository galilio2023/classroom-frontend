import { useState, useMemo, useEffect } from "react";
import { useCreate, useNotification } from "@refinedev/core";
import { parseQuizDescription, ParsedQuestion } from "@/lib/quiz-parser";
import { useSocket } from "@/contexts/socket-context";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

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

  const [activeStudents, setActiveStudents] = useState<number>(0);

  const questions = useMemo<ParsedQuestion[]>(() => {
    return parseQuizDescription(description);
  }, [description]);

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentStep];
  const progress = questions.length > 0 ? (currentStep / questions.length) * 100 : 0;

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
                description: (t as any)("classes.quiz.nudgeFrom", { name: data.teacherName }),
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
  };

  const handleCheckAnswer = () => {
    if (!selectedOption || !currentQuestion) return;
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
            message: t("classes.quiz.submittedTitle", "Quiz Submitted!"),
            description: (t as any)("classes.quiz.submittedDesc", { score: finalScore }),
          });
          onComplete?.(finalScore);
        }
      });
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
    progress,
    activeStudents, // Export live count
    handleOptionSelect,
    handleCheckAnswer,
    handleNext,
  };
};
