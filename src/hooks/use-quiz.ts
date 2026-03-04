import { useState, useMemo } from "react";
import { useCreate, useNotification } from "@refinedev/core";

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface UseQuizProps {
  assignmentId: number;
  description: string;
  onComplete?: (score: number) => void;
}

export const useQuiz = ({ assignmentId, description, onComplete }: UseQuizProps) => {
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
  const progress = questions.length > 0 ? (currentStep / questions.length) * 100 : 0;

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
            message: "Quiz Submitted!",
            description: `Your score of ${finalScore}% has been saved.`,
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
    handleOptionSelect,
    handleCheckAnswer,
    handleNext,
  };
};
