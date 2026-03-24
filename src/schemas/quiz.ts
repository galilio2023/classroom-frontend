import { z } from "zod";

export const createQuizSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional().nullable(),
  timeLimit: z.coerce.number().min(1).optional(),
  classId: z.coerce.number({ required_error: "Class ID is required" }),
  moduleId: z.coerce.number().optional().nullable(),
  questions: z.array(
    z.object({
      question: z.string().min(1, "Question text is required"),
      options: z.array(z.string()).length(4, "Exactly 4 options are required"),
      correctAnswer: z.string().min(1, "Correct answer is required"),
      points: z.coerce.number().min(1).optional().default(1),
    })
  ).min(1, "At least one question is required"),
});

export const submitAttemptSchema = z.object({
  answers: z.record(z.coerce.string(), z.string()),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type SubmitQuizInput = z.infer<typeof submitAttemptSchema>;
