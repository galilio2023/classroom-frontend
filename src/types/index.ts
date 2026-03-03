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
  phoneNumber: string | null;
  bio: string | null;
  address: string | null;
  dateOfBirth: string | null;
  parentName: string | null;
  parentPhone: string | null;
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
  fileUrl: string | null;
  fileCldPubId: string | null;
  isLate: boolean;
  assignmentId: number;
  studentId: string;
  createdAt: string;
  updatedAt: string;
  student?: User;
}

export interface Assignment {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  fileUrl: string | null;
  fileCldPubId: string | null;
  classId: number;
  createdAt: string;
  updatedAt: string;
  submissions?: Submission[];
}

export type Enrollment = {
  id: number;
  studentId: string;
  classId: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  student: User;
  class: {
    id: number;
    name: string;
  };
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

export enum AttendanceStatus {
  PRESENT = "present",
  ABSENT = "absent",
  LATE = "late",
  EXCUSED = "excused",
}

export interface Attendance {
  id: number;
  classId: number;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  remarks: string | null;
  student?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Discussion {
  id: number;
  content: string;
  classId: number;
  userId: string;
  parentId: number | null;
  user: Pick<User, "id" | "name" | "image" | "role">;
  replies?: Discussion[];
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: number;
  title: string;
  description: string | null;
  type: "file" | "link" | "video" | "other";
  url: string;
  cldPubId: string | null;
  classId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileChangeRequest {
  id: number;
  userId: string;
  oldData: any;
  newData: any;
  status: "pending" | "approved" | "rejected";
  adminNotes: string | null;
  user: User;
  createdAt: string;
  updatedAt: string;
}

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

export * from "./quiz";
export * from "./dashboard";
