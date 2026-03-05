import { z } from "zod";
import { classFormSchema, scheduleSchema } from "@/schemas/class";
import { signUpFormSchema } from "@/schemas/auth";
import { Quiz } from "./quiz";

export type SignUpPayload = z.infer<typeof signUpFormSchema>;

export enum UserRole {
  ADMIN = "admin",
  TEACHER = "teacher",
  STUDENT = "student",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  status: UserStatus;
  departmentId: number | null;
  department?: Department;
  imageCldPubId: string | null;
  phoneNumber: string | null;
  bio: string | null;
  address: string | null;
  dateOfBirth: string | null;
  parentName: string | null;
  parentPhone: string | null;
  isVerified: boolean;
  verificationDocumentUrl: string | null;
  verificationDocumentCldPubId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string | null;
  headId: string | null;
  head?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  description: string | null;
  credits: number;
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
  gradedBy?: User;
  gradedAt?: string | null;
}

export interface Assignment {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  fileUrl: string | null;
  fileCldPubId: string | null;
  classId: number;
  moduleId: number | null;
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
  approvedBy?: User;
  lastAccessedAt?: string | null;
};

export interface Module {
  id: number;
  classId: number;
  name: string;
  description: string | null;
  order: number;
  assignments?: Assignment[];
  resources?: Resource[];
  quizzes?: Quiz[];
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  classId: number;
  authorId: string;
  isPinned: boolean;
  author?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Progress {
  id: number;
  userId: string;
  classId: number;
  moduleId: number | null;
  resourceId: number | null;
  assignmentId: number | null;
  quizId: number | null;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type Class = z.infer<typeof classFormSchema> & {
  id: number;
  inviteCode: string;
  bannerUrl?: string | null;
  bannerCldPubId?: string | null;
  teachers: {
    teacher: User;
    isPrimary: boolean;
  }[];
  subject: Subject;
  createdAt: string;
  updatedAt: string;
  enrollments: Enrollment[];
  assignments: Assignment[];
  modules?: Module[];
};

export type ClassListItem = Pick<Class, "id" | "name" | "status" | "capacity" | "bannerUrl" | "teachers" | "schedule"> & {
  subject?: {
    name: string;
    department?: {
      name: string;
    };
  };
  _count?: {
    enrollments: number;
  };
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
  recordedBy?: User;
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
  type: "file" | "link" | "video" | "note" | "other";
  url: string;
  content: string | null;
  cldPubId: string | null;
  classId: number;
  moduleId: number | null;
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

export interface AIFeedbackResponse {
  suggestedGrade: number;
  feedback: string;
  summary: string;
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
