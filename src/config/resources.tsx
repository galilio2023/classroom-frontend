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
  CalendarDays,
  Briefcase,
  GraduationCap,
  MessageCircle,
  Users,
  Files,
  Clock,
  Tv
} from "lucide-react";
import { ResourceProps } from "@refinedev/core";

export const resources: ResourceProps[] = [
  // --- MAIN ---
  { name: "dashboard", list: "/dashboard", meta: { label: "resources.dashboard.label", icon: <Home /> } },
  { name: "calendar", list: "/calendar", meta: { label: "resources.calendar.label", icon: <Calendar /> } },
  { name: "notifications", list: "/notifications", meta: { label: "resources.notifications.label", icon: <Bell /> } },
  { name: "messages", list: "/messages", meta: { label: "resources.messages.label", icon: <MessageCircle /> } },

  // --- AI HUB ---
  { name: "ai-assistant", list: "/ai-assistant", meta: { group: "groups.ai-lab", label: "resources.ai-assistant.label", icon: <Sparkles /> } },
  { name: "ai-study-lab", list: "/ai-study-lab", meta: { group: "groups.ai-lab", label: "resources.ai-study-lab.label", icon: <BrainCircuit /> } },
  { name: "study-planner", list: "/study-planner", meta: { group: "groups.ai-lab", label: "resources.study-planner.label", icon: <CalendarDays /> } },

  // --- ACADEMIC ---
  { name: "classes", list: "/classes", create: "/classes/create", edit: "/classes/edit/:id", show: "/classes/show/:id", meta: { group: "groups.academic", label: "resources.classes.label", icon: <LayoutGrid /> } },
  { name: "subjects", list: "/subjects", create: "/subjects/create", edit: "/subjects/edit/:id", meta: { group: "groups.academic", label: "resources.subjects.label", icon: <BookOpen /> } },
  { name: "enrollments", list: "/enrollments", meta: { group: "groups.academic", label: "resources.enrollments.label", icon: <UserPlus />, hide: false } },
  { name: "attendance", list: "/attendance", meta: { group: "groups.academic", label: "resources.attendance.label", icon: <CheckSquare /> } },
  { name: "project-groups", list: "/project-groups", show: "/project-groups/show/:id", meta: { group: "groups.academic", label: "resources.project-groups.label", icon: <Users /> } },

  // --- CURRICULUM ---
  { name: "assignments", list: "/assignments", create: "/assignments/create", show: "/assignments/show/:id", meta: { group: "groups.curriculum", label: "resources.assignments.label", icon: <FileText /> } },
  { name: "quizzes", list: "/quizzes", create: "/quizzes/create", show: "/quizzes/show/:id", meta: { group: "groups.curriculum", label: "resources.quizzes.label", icon: <FileQuestion /> } },
  { name: "submissions", list: "/submissions", show: "/submissions/show/:id", meta: { group: "groups.curriculum", label: "resources.submissions.label", icon: <Send /> } },
  { name: "modules", list: "/modules", meta: { group: "groups.curriculum", label: "resources.modules.label", icon: <Library /> } },
  { name: "resources", list: "/resources", show: "/classes/:classId/lessons/:resourceId", meta: { group: "groups.curriculum", label: "resources.resources.label", icon: <FolderOpen /> } },
  { name: "library", list: "/library", meta: { group: "groups.curriculum", label: "resources.library.label", icon: <Files /> } },
  { name: "discussions", list: "/discussions", meta: { group: "groups.curriculum", label: "resources.discussions.label", icon: <MessageSquare /> } },

  // --- PROGRESS ---
  { name: "portfolio", list: "/portfolio", show: "/portfolio/:id", meta: { group: "groups.progress", label: "resources.portfolio.label", icon: <UserCircle /> } },
  { name: "report-card", list: "/student/report-card", meta: { group: "groups.progress", label: "resources.report-card.label", icon: <FileText /> } },
  { name: "progress", list: "/progress", meta: { group: "groups.progress", label: "resources.progress.label", icon: <TrendingUp /> } },

  // --- TEACHER HUB ---
  { name: "teacher-channel", list: "/teacher/channel", meta: { group: "groups.academic", label: "resources.teacher-channel.label", icon: <Tv /> } },

  // --- ADMINISTRATION ---
  { name: "users", list: "/users", create: "/users/create", edit: "/users/edit/:id", show: "/users/show/:id", meta: { group: "groups.admin", label: "resources.users.label", icon: <ShieldCheck /> } },
  { name: "departments", list: "/departments", create: "/departments/create", edit: "/departments/edit/:id", meta: { group: "groups.admin", label: "resources.departments.label", icon: <Building2 /> } },
  { name: "academic-terms", list: "/admin/terms", meta: { group: "groups.admin", label: "resources.academic-terms.label", icon: <Calendar /> } },
  { name: "profile-requests", list: "/profile-requests", meta: { group: "groups.admin", label: "resources.profile-requests.label", icon: <ClipboardCheck /> } },
  { name: "teacher-applications", list: "/teacher-applications", meta: { group: "groups.admin", label: "resources.teacher-applications.label", icon: <Briefcase /> } },
  { name: "activity-log", list: "/activity-log", meta: { group: "groups.admin", label: "resources.activity-log.label", icon: <Activity /> } },
];
