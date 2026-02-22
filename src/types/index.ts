import { z } from "zod";
import { classFormSchema, scheduleSchema } from "@/schemas/class";
import { signUpFormSchema } from "@/schemas/auth";

export type SignUpPayload = z.infer<typeof signUpFormSchema>;

export enum UserRole {
  ADMIN = "admin",
  TEACHER = "teacher",
  STUDENT = "student",
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  imageCldPubId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  description: string | null;
  departmentId: number;
  department: Department;
  createdAt: string;
  updatedAt: string;
}

export enum ClassStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ARCHIVED = "archived",
}

export type Schedule = z.infer<typeof scheduleSchema>;

export interface Submission {
  id: number;
  content: string | null;
  grade: number | null;
  feedback: string | null;
  fileUrl: string | null; // Added for file uploads
  fileCldPubId: string | null; // Added for file uploads
  assignmentId: number;
  studentId: string;
  createdAt: string;
  updatedAt: string;
  student?: User; // Student who made the submission
}

export interface Assignment {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  fileUrl: string | null; // Added for attachments
  fileCldPubId: string | null; // Added for attachments
  classId: number;
  createdAt: string;
  updatedAt: string;
  submissions?: Submission[]; // Include submissions in the assignment type
}

export type Enrollment = {
  id: number;
  studentId: string;
  classId: number;
  createdAt: string;
  student: User;
};

export type Class = z.infer<typeof classFormSchema> & {
  id: number;
  inviteCode: string;
  teacher: User;
  subject: Subject;
  createdAt: string;
  updatedAt: string;
  enrollments: Enrollment[];
  assignments: Assignment[];
};

export interface ListResponse<T = any> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateResponse<T = any> {
  data: T;
}

export interface GetOneResponse<T = any> {
  data: T;
}
