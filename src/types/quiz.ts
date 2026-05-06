export interface QuizQuestion {
  id: string | number;
  quizId: string | number;
  question: string;
  options: string[];
  correctAnswer?: string; // Hidden for students
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: string | number;
  title: string;
  description?: string;
  dueDate?: string;
  timeLimit?: number;
  classId: string | number;
  moduleId?: string | number | null;
  categoryId?: string | number | null;
  maxAttempts?: number;
  gradingPolicy?: "highest" | "latest" | "average";
  shuffleQuestions?: boolean;
  showCorrectAnswers?: boolean;
  totalMarks?: number;
  isAiGenerated: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
  reviewedById: string | null;
  createdAt: string;
  updatedAt: string;
  questions?: QuizQuestion[];
  class?: {
    id: string | number;
    name: string;
  };
}

export interface QuizAttempt {
  id: string | number;
  quizId: string | number;
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

export * from "@/schemas/quiz";
