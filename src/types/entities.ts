import { z } from "zod";
import { BaseRecord } from "@refinedev/core";
import { classFormSchema, scheduleSchema } from "@/schemas/class";
import { signUpFormSchema } from "@/schemas/auth";
import { Quiz } from "./quiz";
import { AIMetadata, AIUsageMetadata } from "./ai";

export interface AIResponse<T> {
  data: T;
  metadata?: AIMetadata;
  usage?: AIUsageMetadata;
  latencyMs?: number;
}

export type SignUpPayload = z.infer<typeof signUpFormSchema>;

export enum UserRole {
  ADMIN = "admin",
  TEACHER = "teacher",
  TA = "ta",
  STUDENT = "student",
  PARENT = "parent",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

export enum VerificationStatus {
  UNVERIFIED = "unverified",
  PENDING = "pending",
  VERIFIED = "verified",
  REJECTED = "rejected",
}

export interface BasePermissions {
  role?: UserRole;
  canAccessAi?: boolean;
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
  schoolId: string | null;
  schoolName: string | null;
  bio: string | null;
  address: string | null;
  dateOfBirth: string | null;
  parentName: string | null;
  parentPhone: string | null;
  verificationStatus: VerificationStatus;
  verificationDocumentUrl: string | null;
  verificationDocumentCldPubId: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
  level?: number;
  xp?: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveAt: string | null;
  aiTokensUsed?: number;
  aiMonthlyLimit?: number;
  enrollments?: Enrollment[];
  teacherChannel?: TeacherChannel;
  persona?: {
    learningDNA: string;
    preferredTone: string;
    lastSummarizedAt: string;
  };
  stripeAccountId?: string | null;
  stripeOnboardingComplete?: boolean;
}

export interface PresenceUser {
  id: string;
  name: string;
  role: UserRole;
  image?: string;
  lastSeen: number;
}

export interface NotificationMetadata {
  link?: string;
  message?: string;
  [key: string]: any;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string | null;
  headOfDepartmentId: string | null;
  headOfDepartment?: User;
  version: number;
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
  prerequisiteSubjectId: number | null;
  prerequisite?: Subject;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export enum ClassStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ARCHIVED = "archived",
}

export enum GradingStatus {
  OPEN = "open",
  LOCKED = "locked",
  FINALIZED = "finalized",
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: {
    type: "completion_threshold" | "date_reached" | "student_at_risk";
    threshold?: number;
    moduleId?: number;
    date?: string;
  };
  action: {
    type: "publish_module" | "send_announcement" | "award_badge";
    targetModuleId?: number;
    announcementTitle?: string;
    announcementMessage?: string;
    badgeId?: number;
  };
  isActive: boolean;
  lastTriggeredAt?: string | null;
}

export type Schedule = z.infer<typeof scheduleSchema>;

export interface GradeCategory {
  id: number;
  classId: number;
  name: string;
  weight: number;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: number;
  content: string | null;
  grade: number | null;
  feedback: string | null;
  fileUrl: string | null;
  fileCldPubId: string | null;
  isLate: boolean;
  isDraft: boolean;
  requiresResubmission: boolean;
  teacherPrivateNotes: string | null;
  attemptNumber: number;
  assignmentId: number;
  studentId: string;
  groupId?: number | null;
  aiApprovalStatus?: "pending" | "approved" | "rejected";
  aiStatus: "idle" | "processing" | "completed" | "failed";
  aiError?: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  student?: User;
  gradedBy?: User;
  gradedAt?: string | null;
  suggestedGrade?: number;
  suggestedFeedback?: string;
  assignment?: Assignment;
  peerReviews?: PeerReview[];
}

export interface RubricItem {
  criteria: string;
  maxPoints: number;
}

export interface Assignment {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  fileUrl: string | null;
  fileCldPubId: string | null;
  classId: number;
  class?: Class;
  moduleId: number | null;
  categoryId: number | null;
  category?: GradeCategory;
  allowLateSubmissions: boolean;
  latePenaltyPercentage: number;
  isGroupAssignment: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  submissions?: Submission[];
  hasPeerReview: boolean;
  peerReviewWeight: number;
  maxPoints?: number;
  timeEstimate?: string;
  rubric: RubricItem[];
}

export interface ProjectGroup {
  id: number;
  classId: number;
  name: string;
  description: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface PeerReview {
  id: number;
  assignmentId: number;
  reviewerId: string;
  submissionId: number;
  scores: Record<string, number>;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
  assignment?: Assignment;
  reviewer?: User;
  submission?: Submission;
}

export type Enrollment = {
  id: number;
  studentId: string;
  classId: number;
  status: "pending" | "approved" | "rejected" | "waitlisted" | "dropped";
  waitlistPosition: number | null;
  createdAt: string;
  student: User;
  class: {
    id: number;
    name: string;
  };
  approvedBy?: User;
  lastAccessedAt?: string | null;
  lastSyncedManifest: number;
  riskAssessment?: {
    riskLevel: "low" | "medium" | "high" | "critical";
    aiAnalysis?: {
      strengths: string[];
      weaknesses: string[];
      improvementPlan: string[];
      summary: string;
    };
    predictedGrade?: number;
  };
};

export interface Module {
  id: number;
  classId: number;
  class?: Class;
  name: string;
  description: string | null;
  order: number;
  isPublished: boolean;
  publishedAt: string | null;
  prerequisiteModuleId: number | null;
  prerequisite?: Module;
  assignments?: Assignment[];
  resources?: Resource[];
  quizzes?: Quiz[];
  version: number;
  createdAt: string;
  updatedAt: string;
  isUpdated?: boolean;
}

export enum AnnouncementPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  classId: number;
  authorId: string;
  isPinned: boolean;
  priority: AnnouncementPriority;
  expiresAt: string | null;
  allowComments: boolean;
  linkUrl?: string | null;
  fileUrl?: string | null;
  fileCldPubId?: string | null;
  author?: User;
  version: number;
  createdAt: string;
  updatedAt: string;
  isRead?: boolean;
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
  lastViewedVersion: number;
  lastViewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type Class = z.infer<typeof classFormSchema> & {
  id: number;
  inviteCode: string;
  bannerUrl?: string | null;
  bannerCldPubId?: string | null;
  color?: string;
  gradingStatus: GradingStatus;
  allowParentAccess: boolean;
  archivedAt: string | null;
  teachers: {
    teacher: User;
    isPrimary: boolean;
  }[];
  subject: Subject;
  version: number;
  createdAt: string;
  updatedAt: string;
  enrollments: Enrollment[];
  assignments: Assignment[];
  modules?: Module[];
  gradeCategories?: GradeCategory[];
  isLive?: boolean;
  isBreakoutActive?: boolean;
  isAiDelegated?: boolean;
  aiDelegationPhoto?: string | null;
  aiDelegationContext?: {
    script?: string;
    visualCue?: string;
  };
  manifestVersion: number;
  automationRules?: AutomationRule[];
  liveLessonRoadmap?: {
    sessionTitle?: string;
    icebreaker?: string;
    keyConcepts?: string[];
    outline?: {
      time: string;
      topic: string;
      goal: string;
    }[];
    studentWatchouts?: string;
  };
  termId?: number;
  term?: AcademicTerm;
};

export type ClassListItem = Pick<
  Class,
  | "id"
  | "name"
  | "status"
  | "capacity"
  | "bannerUrl"
  | "teachers"
  | "schedules"
  | "isLive"
  | "isBreakoutActive"
  | "color"
  | "enrollments"
  | "version"
> & {
  isEnrolled?: boolean;
  isTeacherAssigned?: boolean;
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
  minutesPresent: number;
  participationScore: number;
  isExcused: boolean;
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
  isEdited: boolean;
  lastEditedAt: string | null;
  isSolved: boolean;
  solvedById: string | null;
  solvedBy?: Pick<User, "id" | "name" | "image">;
  user: Pick<User, "id" | "name" | "image" | "role">;
  replies?: Discussion[];
  repliesCount?: number; // 🛡️ DATA GROWTH: Virtual field for lazy loading
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: number;
  title: string;
  description: string | null;
  type: "file" | "link" | "video" | "note" | "image" | "other";
  url: string;
  content: string | null;
  cldPubId: string | null;
  classId: number | null;
  moduleId: number | null;
  ownerId: string | null;
  isInternal: boolean;
  isRequired: boolean;
  isAiPinned: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClassNote {
  id: number;
  classId: number;
  userId: string;
  content: string;
  version: number;
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

export interface ListResponse<T = BaseRecord> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateResponse<T = BaseRecord> {
  data: T;
}

export interface GetOneResponse<T = BaseRecord> {
  data: T;
}

export interface AiLog {
  id: number;
  userId: string;
  action: string;
  prompt: string;
  response: string;
  tokensUsed: number;
  latencyMs: number;
  model: string;
  metadata: {
    classId?: number;
    conversationId?: number;
    isAborted?: boolean;
    errorName?: string;
    errorCode?: string;
    [key: string]: any;
  };
  createdAt: string;
  user?: User;
}

export interface ActivityLog {
  id: number;
  userId: string;
  action: string;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  entityType?: string;
  entityId?: string;
  createdAt: string;
  user?: User;
}

export interface AcademicTerm {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: "active" | "upcoming" | "archived";
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherApplication {
  id: number;
  teacherId: string;
  classId: number;
  status: "pending" | "approved" | "rejected";
  message: string | null;
  createdAt: string;
  updatedAt: string;
  teacher: User;
  class: Class;
}

export interface TeacherChannel {
  id: number;
  teacherId: string;
  headline: string;
  bio: string;
  trailerVideoUrl: string | null;
  trailerVideoCldPubId: string | null;
  thumbnailUrl: string | null;
  thumbnailCldPubId: string | null;
  totalViews: number;
  conversionRate: number;
  teacher?: User;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export * from "./quiz";
export * from "./dashboard";
