/**
 * Dashboard API Response Types
 * Mirrored from backend DashboardService.
 */

export interface ScheduleItem {
  id: number;
  name: string;
  description?: string;
  bannerUrl?: string;
  bannerCldPubId?: string;
  capacity?: number;
  status: "active" | "inactive" | "archived";
  subject?: {
    id: number;
    name: string;
  };
  teacher?: {
    id: string;
    name: string;
  };
  todaySchedule?: {
    day: string;
    startTime: string;
    endTime: string;
    room?: string;
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalAssignments: number;
  pendingVerifications?: number;
}

export interface AttendanceTrend {
  date: string;
  present: number;
  absent: number;
}

export interface GradeDistribution {
  range: string;
  count: number;
}

export interface PendingSubmission {
  id: number;
  content?: string;
  fileUrl?: string;
  fileCldPubId?: string;
  isLate: boolean;
  assignmentId: number;
  studentId: string;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    name: string;
    email: string;
    image?: string;
    phoneNumber?: string;
  };
  assignment: {
    id: number;
    title: string;
    description?: string;
    dueDate?: string;
    classId: number;
    class: {
      id: number;
      name: string;
    };
  };
}

export interface AtRiskStudent {
  id: string;
  name: string;
  image?: string;
  avgGrade?: string;
  absentCount?: number;
  reason: string;
  value: string;
}

export interface UpcomingAssignment {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  classId: number;
  class: {
    id: number;
    name: string;
  };
}

export interface GradeTrend {
  date: string;
  grade: number;
  title: string;
}

export interface SubjectMastery {
  subject: string;
  subjectId?: number;
  avgGrade: number;
  trend?: number;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  total: number;
}

export interface AssignmentCompletionTrend {
  date: string;
  completionRate: number; // 0-100
  assignmentTitle: string;
}

export interface SubmissionTiming {
  dayOfWeek: number; // 0-6 (Sun-Sat)
  hour: number; // 0-23
  count: number;
}

export interface StudentTrajectory {
  studentId: string;
  studentName: string;
  currentGrade: number;
  predictedGrade: number;
  trend: { date: string; grade: number }[];
}

export interface ClassComparison {
  classId: string;
  className: string;
  averageGrade: number;
  attendanceRate: number;
  completionRate: number;
  studentCount: number;
}

export interface ChannelStats {
  totalViews: number;
  conversionRate: number;
}

export interface GlobalConfig {
  enableAiFeatures: boolean;
  isDryRun?: boolean;
  welcomeMessage?: string;
}

export interface SystemHealth {
  diagnosis: string;
  suggestedFixes: string[];
  metadata: {
    happinessScore: number;
    posCount: number;
    negCount: number;
  };
  reportDate: string;
}

export interface RLHFDataPoint {
  date: string;
  avgAdjustmentGap: number;
  acceptanceRate: number;
  totalAudits: number;
}

export interface MarketplaceEarnings {
  totalRevenue: number;
  platformFees: number;
  netEarnings: number;
  totalSales: number;
}

export interface TransactionItem {
  id: number;
  amount: number;
  currency: string;
  studentName: string;
  studentImage?: string;
  className: string;
  date: string;
}

export interface DashboardData {
  school?: any;
  todaySchedule: ScheduleItem[];
  stats?: DashboardStats;
  attendanceTrend?: AttendanceTrend[];
  gradeDistribution?: GradeDistribution[];
  pendingSubmissions?: PendingSubmission[];
  atRiskStudents?: AtRiskStudent[];
  upcomingAssignments?: UpcomingAssignment[];
  gradeTrends?: GradeTrend[];
  subjectMastery?: SubjectMastery[];
  attendanceSummary?: AttendanceSummary;
  resubmissions?: any[];
  assignmentCompletionTrend?: AssignmentCompletionTrend[];
  submissionTiming?: SubmissionTiming[];
  studentTrajectories?: StudentTrajectory[];
  classComparison?: ClassComparison[];
  channelStats?: ChannelStats;
  systemHealth?: SystemHealth;
  globalConfig?: GlobalConfig;
  rlhf?: RLHFDataPoint[];
  marketplaceEarnings?: MarketplaceEarnings;
  recentTransactions?: TransactionItem[];
}
