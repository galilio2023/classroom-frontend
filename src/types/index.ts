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

export type Class = z.infer<typeof classFormSchema> & {
  id: number;
  inviteCode: string;
  teacher: User;
  subject: Subject;
  createdAt: string;
  updatedAt: string;
};

export type Enrollment = {
  id: number;
  studentId: string;
  classId: number;
  createdAt: string;
  student: User;
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
