import { 
  Home, 
  BookOpen, 
  Building2, 
  Calendar, 
  Sparkles, 
  UserPlus, 
  ClipboardCheck, 
  FileQuestion,
  BrainCircuit,
  ShieldCheck,
  LayoutGrid,
  FileText,
  Send,
  CheckSquare,
  Library,
  MessageSquare,
  FolderOpen,
  Bell,
  TrendingUp,
  Activity,
  UserCircle,
  CalendarClock,
  CalendarDays,
  Briefcase,
  GraduationCap
} from "lucide-react";
import { ResourceProps } from "@refinedev/core";

export const resources: ResourceProps[] = [
  // --- MAIN ---
  { name: "dashboard", list: "/", meta: { label: "Dashboard", icon: <Home /> } },
  { name: "calendar", list: "/calendar", meta: { label: "Calendar", icon: <Calendar /> } },
  { name: "notifications", list: "/notifications", meta: { label: "Notifications", icon: <Bell /> } },

  // --- AI HUB ---
  { name: "ai-assistant", list: "/ai-assistant", meta: { group: "AI Lab", label: "AI Assistant", icon: <Sparkles /> } },
  { name: "ai-study-lab", list: "/ai-study-lab", meta: { group: "AI Lab", label: "Study Lab", icon: <BrainCircuit /> } },
  { name: "study-planner", list: "/study-planner", meta: { group: "AI Lab", label: "Study Planner", icon: <CalendarDays /> } },

  // --- ACADEMIC ---
  { name: "classes", list: "/classes", create: "/classes/create", edit: "/classes/edit/:id", show: "/classes/show/:id", meta: { group: "Academic", label: "Classes", icon: <LayoutGrid /> } },
  { name: "subjects", list: "/subjects", create: "/subjects/create", edit: "/subjects/edit/:id", meta: { group: "Academic", label: "Subjects", icon: <BookOpen /> } },
  { name: "enrollments", list: "/enrollments", meta: { group: "Academic", label: "Enrollments", icon: <UserPlus />, hide: false } },
  { name: "attendance", list: "/attendance", meta: { group: "Academic", label: "Attendance", icon: <CheckSquare /> } },

  // --- CURRICULUM ---
  { name: "assignments", list: "/assignments", create: "/assignments/create", show: "/assignments/show/:id", meta: { group: "Curriculum", label: "Assignments", icon: <FileText /> } },
  { name: "quizzes", list: "/quizzes", create: "/quizzes/create", show: "/quizzes/show/:id", meta: { group: "Curriculum", label: "Quizzes", icon: <FileQuestion /> } },
  { name: "submissions", list: "/submissions", show: "/submissions/show/:id", meta: { group: "Curriculum", label: "Submissions", icon: <Send /> } },
  { name: "modules", list: "/modules", meta: { group: "Curriculum", label: "Modules", icon: <Library /> } },
  { name: "resources", list: "/resources", meta: { group: "Curriculum", label: "Resources", icon: <FolderOpen /> } },
  { name: "discussions", list: "/discussions", meta: { group: "Curriculum", label: "Discussions", icon: <MessageSquare /> } },

  // --- PROGRESS ---
  { name: "portfolio", list: "/portfolio", meta: { group: "Progress", label: "My Portfolio", icon: <UserCircle /> } },
  { name: "report-card", list: "/student/report-card", meta: { group: "Progress", label: "Report Card", icon: <FileText /> } },
  { name: "progress", list: "/progress", meta: { group: "Progress", label: "Insights", icon: <TrendingUp /> } },

  // --- ADMINISTRATION ---
  { name: "users", list: "/users", create: "/users/create", edit: "/users/edit/:id", show: "/users/show/:id", meta: { group: "Admin", label: "Users", icon: <ShieldCheck /> } },
  { name: "departments", list: "/departments", create: "/departments/create", edit: "/departments/edit/:id", meta: { group: "Admin", label: "Departments", icon: <Building2 /> } },
  { name: "academic-terms", list: "/admin/terms", meta: { group: "Admin", label: "Terms", icon: <CalendarClock /> } },
  { name: "profile-requests", list: "/profile-requests", meta: { group: "Admin", label: "Profile Requests", icon: <ClipboardCheck /> } },
  { name: "teacher-applications", list: "/teacher-applications", meta: { group: "Admin", label: "Teacher Apps", icon: <Briefcase /> } },
  { name: "activity-log", list: "/activity-log", meta: { group: "Admin", label: "Activity Log", icon: <Activity /> } },
];
