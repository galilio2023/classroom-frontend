export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalUsers: number;
  totalClasses: number;
  totalAssignments: number;
  totalSubjects: number;
  totalDepartments: number;
}

export interface AttendanceTrend {
  date: string;
  present: number;
  absent: number;
}

export interface ScheduleItem {
  id: string;
  name: string;
  todaySchedule?: { startTime: string; endTime: string };
}

export interface UpcomingAssignment {
  id: string;
  title: string;
  dueDate: string;
  class?: { name: string };
}

export interface PendingSubmission {
  id: string;
  assignmentId: string;
  createdAt: string;
  student?: { name: string; image?: string };
  assignment?: { title: string };
}
