/**
 * Quiz API Response Types
 * Mirrored from backend QuizService.
 */

export interface QuizQuestion {
  id: number;
  quizId: number;
  question: string;
  options: string[];
  correctAnswer?: string; // Hidden for students
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  timeLimit?: number;
  classId: number;
  moduleId?: number | null;
  categoryId?: number | null;
  maxAttempts?: number;
  gradingPolicy?: "highest" | "latest" | "average";
  shuffleQuestions?: boolean;
  showCorrectAnswers?: boolean;
  totalMarks?: number;
  createdAt: string;
  updatedAt: string;
  questions?: QuizQuestion[];
  class?: {
    id: number;
    name: string;
  };
}

export interface QuizAttempt {
  id: number;
  quizId: number;
  studentId: string;
  score: number;
  answers: Record<number, string>;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    name: string;
    image?: string;
  };
}

export interface CreateQuizInput {
  title: string;
  description?: string;
  dueDate?: string | null;
  timeLimit?: number;
  classId: number;
  moduleId?: number;
  categoryId?: number;
  maxAttempts?: number;
  gradingPolicy?: "highest" | "latest" | "average";
  shuffleQuestions?: boolean;
  showCorrectAnswers?: boolean;
  questions: {
    question: string;
    options: string[];
    correctAnswer: string;
    points?: number;
  }[];
}

export interface SubmitQuizInput {
  answers: Record<number, string>;
}
