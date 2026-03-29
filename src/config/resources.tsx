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
  Bookmark,
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
  Tv,
  History,
  Settings,
  CircleDollarSign,
} from "lucide-react";
import { ResourceProps } from "@refinedev/core";
import { UserRole } from "@/types"; // Assuming UserRole enum is defined here or imported

export const resources: ResourceProps[] = [
  // --- MAIN ---
  {
    name: "dashboard",
    list: "/dashboard",
    meta: {
      label: "resources.dashboard.label",
      icon: <Home />,
      roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
    },
  },
  {
    name: "calendar",
    list: "/calendar",
    meta: {
      label: "resources.calendar.label",
      icon: <Calendar />,
      roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
    },
  },
  {
    name: "notifications",
    list: "/notifications",
    meta: {
      label: "resources.notifications.label",
      icon: <Bell />,
      roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
    },
  },
  {
    name: "messages",
    list: "/messages",
    meta: {
      label: "resources.messages.label",
      icon: <MessageCircle />,
      roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
    },
  },

  // --- AI HUB ---
  {
    name: "ai-assistant",
    list: "/ai-assistant",
    meta: {
      group: "groups.ai-lab",
      label: "resources.ai-assistant.label",
      icon: <Sparkles />,
      roles: [UserRole.ADMIN, UserRole.TEACHER],
    },
  },
  {
    name: "ai-study-lab",
    list: "/ai-study-lab",
    meta: {
      group: "groups.ai-lab",
      label: "resources.ai-study-lab.label",
      icon: <BrainCircuit />,
      roles: [UserRole.ADMIN, UserRole.STUDENT],
    },
  }, // Student-specific AI
  {
    name: "ai-activity-logs",
    list: "/ai-history",
    show: "/ai-history/show/:id",
    meta: {
      group: "groups.ai-lab",
      label: "resources.ai-history.label",
      icon: <History />,
      roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
    },
  },
  {
    name: "study-planner",
    list: "/study-planner",
    meta: {
      group: "groups.ai-lab",
      label: "resources.study-planner.label",
      icon: <CalendarDays />,
      roles: [UserRole.ADMIN, UserRole.STUDENT],
    },
  }, // Student-specific

  // --- ACADEMIC ---
  {
    name: "academic-terms",
    list: "/terms",
    meta: {
      group: "groups.academic",
      label: "resources.academic-terms.label",
      icon: <Calendar />,
      roles: [UserRole.TEACHER],
    },
  }, // MOVED TO TEACHER
  {
    name: "classes",
    list: "/classes",
    create: "/classes/create",
    edit: "/classes/edit/:id",
    show: "/classes/show/:id",
    meta: {
      group: "groups.academic",
      label: "resources.classes.label",
      icon: <LayoutGrid />,
      roles: [UserRole.TEACHER, UserRole.STUDENT],
    },
  },
  {
    name: "subjects",
    list: "/subjects",
    create: "/subjects/create",
    edit: "/subjects/edit/:id",
    meta: {
      group: "groups.academic",
      label: "resources.subjects.label",
      icon: <BookOpen />,
      roles: [UserRole.TEACHER, UserRole.STUDENT],
    },
  },
  {
    name: "enrollments",
    list: "/enrollments",
    meta: {
      group: "groups.academic",
      label: "resources.enrollments.label",
      icon: <Bookmark />,
      hide: false,
      roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
    },
  },
  {
    name: "attendance",
    list: "/attendance",
    meta: {
      group: "groups.academic",
      label: "resources.attendance.label",
      icon: <CheckSquare />,
      roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
    },
  },
  {
    name: "project-groups",
    list: "/project-groups",
    show: "/project-groups/show/:id",
    meta: {
      group: "groups.academic",
      label: "resources.project-groups.label",
      icon: <Users />,
      roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
    },
  },

  // --- CURRICULUM ---
  {
    name: "assignments",
    list: "/assignments",
    create: "/assignments/create",
    show: "/assignments/show/:id",
    meta: {
      group: "groups.curriculum",
      label: "resources.assignments.label",
      icon: <FileText />,
      roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
    },
  },
  {
    name: "quizzes",
    list: "/quizzes",
    create: "/quizzes/create",
    show: "/quizzes/show/:id",
    meta: {
      group: "groups.curriculum",
      label: "resources.quizzes.label",
      icon: <FileQuestion />,
      roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
    },
  },
  {
    name: "submissions",
    list: "/submissions",
    show: "/submissions/show/:id",
    meta: {
      group: "groups.curriculum",
      label: "resources.submissions.label",
      icon: <Send />,
      roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
    },
  },
  {
    name: "modules",
    list: "/modules",
    meta: {
      group: "groups.curriculum",
      label: "resources.modules.label",
      icon: <Library />,
      roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
    },
  },
  {
    name: "resources",
    list: "/resources",
    show: "/classes/:classId/lessons/:resourceId",
    meta: {
      group: "groups.curriculum",
      label: "resources.resources.label",
      icon: <FolderOpen />,
      roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
    },
  },
  {
    name: "library",
    list: "/library",
    meta: {
      group: "groups.curriculum",
      label: "resources.library.label",
      icon: <Files />,
      roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
    },
  },
  {
    name: "discussions",
    list: "/discussions",
    meta: {
      group: "groups.curriculum",
      label: "resources.discussions.label",
      icon: <MessageSquare />,
      roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
    },
  },

  // --- PROGRESS ---
  {
    name: "portfolio",
    list: "/portfolio",
    show: "/portfolio/:id",
    meta: {
      group: "groups.progress",
      label: "resources.portfolio.label",
      icon: <UserCircle />,
      roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
      resource: "users",
    },
  },
  {
    name: "report-card",
    list: "/student/report-card",
    meta: {
      group: "groups.progress",
      label: "resources.report-card.label",
      icon: <FileText />,
      roles: [UserRole.ADMIN, UserRole.STUDENT],
    },
  }, // Student-specific
  {
    name: "progress",
    list: "/progress",
    meta: {
      group: "groups.progress",
      label: "resources.progress.label",
      icon: <TrendingUp />,
      roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
    },
  },

  // --- STUDENT HUB ---
  {
    name: "my-teachers",
    list: "/my-teachers",
    meta: {
      group: "groups.student-hub",
      label: "resources.my-teachers.label",
      icon: <GraduationCap />,
      roles: [UserRole.STUDENT],
    },
  },
  {
    name: "teacher-subscriptions",
    list: "/followed-teachers",
    meta: {
      group: "groups.student-hub",
      label: "resources.followed-teachers.label",
      icon: <Bookmark />,
      roles: [UserRole.STUDENT],
    },
  },
  {
    name: "teacher-channels",
    list: "/discovery",
    meta: {
      group: "groups.student-hub",
      label: "resources.discovery.label",
      icon: <Tv />,
      roles: [UserRole.STUDENT],
      resource: "channels",
    },
  },
  // --- TEACHER HUB ---
  {
    name: "teacher-channel",
    list: "/teacher/channel",
    meta: {
      group: "groups.teacher-hub",
      label: "resources.teacher-channel.label",
      icon: <Tv />,
      roles: [UserRole.TEACHER],
    },
  },
  {
    name: "monetization",
    list: "/settings/monetization",
    meta: {
      group: "groups.teacher-hub",
      label: "resources.monetization.label",
      icon: <CircleDollarSign />,
      roles: [UserRole.TEACHER, UserRole.ADMIN],
    },
  },

  // --- ADMINISTRATION ---
  {
    name: "users",
    list: "/users",
    create: "/users/create",
    edit: "/users/edit/:id",
    show: "/users/show/:id",
    meta: {
      group: "groups.admin",
      label: "resources.users.label",
      icon: <ShieldCheck />,
      roles: [UserRole.ADMIN],
    },
  },
  {
    name: "departments",
    list: "/departments",
    create: "/departments/create",
    edit: "/departments/edit/:id",
    meta: {
      group: "groups.admin",
      label: "resources.departments.label",
      icon: <Building2 />,
      roles: [UserRole.ADMIN],
    },
  },
  {
    name: "profile-requests",
    list: "/profile-requests",
    meta: {
      group: "groups.admin",
      label: "resources.profile-requests.label",
      icon: <ClipboardCheck />,
      roles: [UserRole.ADMIN],
    },
  },
  {
    name: "teacher-applications",
    list: "/teacher-applications",
    meta: {
      group: "groups.admin",
      label: "resources.teacher-applications.label",
      icon: <Briefcase />,
      roles: [UserRole.ADMIN],
    },
  },
  {
    name: "activity-log",
    list: "/activity-log",
    meta: {
      group: "groups.admin",
      label: "resources.activity-log.label",
      icon: <Activity />,
      roles: [UserRole.ADMIN],
    },
  },
  {
    name: "ai-health-reports",
    list: "/ai-governance",
    meta: {
      group: "groups.admin",
      label: "resources.ai-health-reports.label",
      icon: <BrainCircuit />,
      roles: [UserRole.ADMIN],
    },
  },
  {
    name: "ai-metrics",
    list: "/ai-metrics",
    meta: {
      group: "groups.admin",
      label: "resources.ai-metrics.label",
      icon: <Activity />,
      roles: [UserRole.ADMIN],
    },
  },
  {
    name: "settings",
    list: "/settings",
    edit: "/settings/edit",
    meta: {
      group: "groups.admin",
      label: "resources.settings.label",
      icon: <Settings />,
      roles: [UserRole.ADMIN],
    },
  },
];
