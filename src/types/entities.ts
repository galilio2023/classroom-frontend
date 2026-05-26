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
  departmentId: string | number | null;
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
  inviteCode: string | null;
  planType: "basic" | "faculty" | "school" | "candidate";
  suiteType: "private" | "school" | "faculty" | "corporate";
  suiteOnboardingComplete: boolean;
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
  brandingConfig?: BrandingConfig;
  aiTokensUsed?: number;
  aiMonthlyLimit?: number;
  aiConsentVersion?: string;
  accessibilityPreferences?: {
    highContrast?: boolean;
    fontSize?: number;
  } | null;
  lowBandwidthMode?: boolean;
  metadata?: {
    rejectionReason?: string;
    rejectedAt?: string;
    [key: string]: any;
  };
  enrollments?: Enrollment[];
  teacherChannel?: TeacherChannel;
  school?: School;
  persona?: {
    learningDNA: string;
    preferredTone: string;
    lastSummarizedAt: string;
  };
  stripeAccountId?: string | null;
  stripeOnboardingComplete?: boolean;
}

export type SuiteType = "private" | "school" | "faculty" | "corporate";

export enum UserRole {
  STUDENT = "student",
  TEACHER = "teacher",
  TA = "ta",
  ADMIN = "admin",
  PARENT = "parent",
  PRINCIPAL = "principal",
  DEPT_HEAD = "deptHead",
  REGISTRAR = "registrar",
  MANAGER = "manager",
}

export interface BrandingConfig {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  theme?: "light" | "dark" | "system";
  accentColor?: string;
}

export interface School extends BaseRecord {
  id: string;
  name: string;
  slug: string;
  brandingConfig: BrandingConfig;
  planType: "basic" | "faculty" | "school";
  suiteType: "private" | "school" | "faculty" | "corporate";
  suiteActivatedAt?: string;
  previousSuiteType?: string;
  suiteUpgradedAt?: string;
  suiteOnboardingComplete: boolean;
  ownerId: string | null;
  isActive: boolean;
  aiTokensUsed: string;
  aiMonthlyLimit: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicYear extends BaseRecord {
  id: string | number;
  tenantId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface TimetableSlot extends BaseRecord {
  id: string | number;
  tenantId: string;
  academicYearId: string | number;
  termId?: string | number;
  scheduleType: "bell" | "lecture" | "exam";
  classId?: string | number;
  subjectId?: string | number;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  roomId?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
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

export interface SessionRoadmap {
  sessionTitle: string;
  icebreaker: string;
  keyConcepts: string[];
  outline: {
    time: string;
    topic: string;
    goal: string;
  }[];
  studentWatchouts: string;
}

export interface CourseRoadmap {
  title: string;
  vision: string;
  competencies: string[];
  milestones: {
    phase: string;
    title: string;
    description: string;
  }[];
  expectations: string;
}

export type Roadmap = SessionRoadmap | CourseRoadmap;

export interface BackgroundJobRecord {
  id: string;
  type: string;
  title: string;
  status: "idle" | "processing" | "completed" | "failed";
  progress?: number;
  message?: string;
  createdAt: number;
}

export interface Department {
  id: string | number;
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
  id: string | number;
  name: string;
  code: string;
  description: string | null;
  credits: number;
  departmentId: string | number;
  department: Department;
  prerequisiteSubjectId: string | number | null;
  prerequisite?: Subject;
  language?: string;
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
    moduleId?: string | number;
    date?: string;
  };
  action: {
    type: "publish_module" | "send_announcement" | "award_badge";
    targetModuleId?: string | number;
    announcementTitle?: string;
    announcementMessage?: string;
    badgeId?: string | number;
  };
  isActive: boolean;
  lastTriggeredAt?: string | null;
}

export type Schedule = z.infer<typeof scheduleSchema>;

export interface GradeCategory {
  id: string | number;
  classId: string | number;
  name: string;
  weight: number;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string | number;
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
  assignmentId: string | number;
  studentId: string;
  groupId?: string | number | null;
  approvalStatus?: "pending" | "approved" | "rejected";
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
  id: string | number;
  title: string;
  description: string | null;
  dueDate: string | null;
  fileUrl: string | null;
  fileCldPubId: string | null;
  classId: string | number;
  class?: Class;
  moduleId: string | number | null;
  categoryId: string | number | null;
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
  isAiGenerated: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
  reviewedById: string | null;
}

export interface ProjectGroup {
  id: string | number;
  classId: string | number;
  name: string;
  description: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface PeerReview {
  id: string | number;
  assignmentId: string | number;
  reviewerId: string;
  submissionId: string | number;
  scores: Record<string, number>;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
  assignment?: Assignment;
  reviewer?: User;
  submission?: Submission;
}

export type Enrollment = {
  id: string | number;
  studentId: string;
  classId: string | number;
  status: "pending" | "approved" | "rejected" | "waitlisted" | "dropped";
  waitlistPosition: number | null;
  createdAt: string;
  student: User;
  class: {
    id: string | number;
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
  id: string | number;
  classId: string | number;
  class?: Class;
  name: string;
  description: string | null;
  order: number;
  isPublished: boolean;
  publishedAt: string | null;
  prerequisiteModuleId: string | number | null;
  prerequisite?: Module;
  assignments?: Assignment[];
  resources?: Resource[];
  quizzes?: Quiz[];
  version: number;
  isAiGenerated: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
  reviewedById: string | null;
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
  id: string | number;
  title: string;
  content: string;
  classId: string | number;
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
  id: string | number;
  userId: string;
  classId: string | number;
  moduleId: string | number | null;
  resourceId: string | number | null;
  assignmentId: string | number | null;
  quizId: string | number | null;
  isCompleted: boolean;
  completedAt: string | null;
  lastViewedVersion: number;
  lastViewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type Class = z.infer<typeof classFormSchema> & {
  id: string | number;
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
    script?: string | null;
    visualCue?: "talking" | "thinking" | "listening" | "idle";
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
  termId?: string | number;
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
  id: string | number;
  classId: string | number;
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
  id: string | number;
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
  id: string | number;
  content: string;
  classId: string | number;
  userId: string;
  parentId: string | number | null;
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
  id: string | number;
  title: string;
  description: string | null;
  type: "file" | "link" | "video" | "note" | "image" | "other";
  url: string;
  content: string | null;
  cldPubId: string | null;
  classId: string | number | null;
  moduleId: string | number | null;
  ownerId: string | null;
  isInternal: boolean;
  isRequired: boolean;
  isAiPinned: boolean;
  isAiGenerated: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
  reviewedById: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClassNote {
  id: string | number;
  classId: string | number;
  userId: string;
  content: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileChangeRequest {
  id: string | number;
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
  id: string | number;
  userId: string;
  action: string;
  prompt: string;
  response: string;
  tokensUsed: number;
  latencyMs: number;
  model: string;
  metadata: {
    classId?: string | number;
    conversationId?: string | number;
    isAborted?: boolean;
    errorName?: string;
    errorCode?: string;
    [key: string]: any;
  };
  createdAt: string;
  user?: User;
}

export interface ActivityLog {
  id: string | number;
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
  id: string | number;
  name: string;
  startDate: string;
  endDate: string;
  status: "active" | "upcoming" | "archived";
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherApplication {
  id: string | number;
  teacherId: string;
  classId: string | number;
  status: "pending" | "approved" | "rejected";
  message: string | null;
  createdAt: string;
  updatedAt: string;
  teacher: User;
  class: Class;
}

export interface TeacherChannel {
  id: string | number;
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
