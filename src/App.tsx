import { Authenticated, Refine } from "@refinedev/core";
import { DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerProvider, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { BrowserRouter, Outlet, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { dataProvider } from "./providers/data";
import { authProvider } from "./providers/auth";
import { accessControlProvider } from "./providers/access-control";
import { 
  Home, 
  BookOpen, 
  Building2, 
  Calendar, 
  Sparkles, 
  GraduationCap, 
  UserPlus, 
  ClipboardCheck, 
  Loader2, 
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
  CalendarDays
} from "lucide-react";
import { Layout } from "@/components/refine-ui/layout/layout.tsx";
import { AuthorizedRoute } from "./components/authorized-route";
import React, { Suspense, useEffect, useState } from "react";
import { User, UserRole } from "@/types";
import { ErrorComponent } from "./components/refine-ui/layout/error-component";
import { OfflineBanner } from "./components/offline-banner";

// Lazy Load Pages
const Dashboard = React.lazy(() => import("@/pages/dashboard.tsx"));
const SubjectsList = React.lazy(() => import("@/pages/subjects/list.tsx"));
const SubjectsCreate = React.lazy(() => import("@/pages/subjects/create.tsx"));
const SubjectsEdit = React.lazy(() => import("@/pages/subjects/edit.tsx"));
const DepartmentsList = React.lazy(() => import("@/pages/departments/list.tsx"));
const DepartmentsCreate = React.lazy(() => import("@/pages/departments/create.tsx"));
const DepartmentsEdit = React.lazy(() => import("@/pages/departments/edit.tsx"));
const UsersList = React.lazy(() => import("@/pages/users/list.tsx"));
const UsersCreate = React.lazy(() => import("@/pages/users/create.tsx"));
const UsersEdit = React.lazy(() => import("@/pages/users/edit.tsx"));
const UserShow = React.lazy(() => import("@/pages/users/show.tsx"));
const StudentPortfolio = React.lazy(() => import("@/pages/users/portfolio.tsx"));
const ClassesList = React.lazy(() => import("@/pages/classes/list.tsx"));
const ClassesCreate = React.lazy(() => import("@/pages/classes/create.tsx"));
const ClassesEdit = React.lazy(() => import("@/pages/classes/edit.tsx"));
const ClassShow = React.lazy(() => import("@/pages/classes/show.tsx"));
const LessonReader = React.lazy(() => import("@/pages/classes/lesson-reader.tsx"));
const EnrollmentsList = React.lazy(() => import("@/pages/enrollments/list.tsx"));
const ProfileRequestsList = React.lazy(() => import("@/pages/profile-requests/list.tsx"));
const LoginPage = React.lazy(() => import("@/pages/auth/login.tsx"));
const RegisterPage = React.lazy(() => import("@/pages/auth/register.tsx"));
const PendingVerificationPage = React.lazy(() => import("@/pages/auth/pending-verification.tsx"));
const AssignmentsList = React.lazy(() => import("@/pages/assignments/list-page.tsx"));
const AssignmentCreate = React.lazy(() => import("./pages/assignments/create").then(module => ({ default: module.AssignmentCreate })));
const AssignmentShow = React.lazy(() => import("./pages/assignments/show"));
const SubmissionsList = React.lazy(() => import("@/pages/submissions/list-page.tsx"));
const SubmissionShow = React.lazy(() => import("@/pages/submissions/show.tsx"));
const AttendanceList = React.lazy(() => import("@/pages/attendance/list.tsx"));
const QuizzesList = React.lazy(() => import("@/pages/quizzes/list.tsx"));
const ModulesList = React.lazy(() => import("@/pages/modules/list.tsx"));
const ResourcesList = React.lazy(() => import("@/pages/resources/list.tsx"));
const DiscussionsList = React.lazy(() => import("@/pages/discussions/list.tsx"));
const NotificationsList = React.lazy(() => import("@/pages/notifications/list.tsx"));
const ProgressList = React.lazy(() => import("@/pages/progress/list.tsx"));
const AIAssistantPage = React.lazy(() => import("./pages/ai-assistant"));
const AIStudyLab = React.lazy(() => import("./pages/ai-study-lab"));
const CalendarPage = React.lazy(() => import("./pages/calendar"));
const ActivityLogPage = React.lazy(() => import("@/pages/dashboard/activity-log.tsx"));
const StudyPlanner = React.lazy(() => import("@/pages/study-planner.tsx"));

// Quiz Pages
const QuizCreate = React.lazy(() => import("./pages/quizzes/create"));
const QuizShow = React.lazy(() => import("./pages/quizzes/show"));
const QuizResults = React.lazy(() => import("./pages/quizzes/results"));

const Loading = () => (
  <div className="flex h-dvh items-center justify-center">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
);

/**
 * Simple Error Boundary to catch lazy loading or component crashes.
 */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorComponent />;
    }
    return this.props.children;
  }
}

/**
 * Verification Guard Component
 * Redirects unverified teachers to the pending page.
 */
const VerificationGuard = ({ children }: { children: React.ReactNode }) => {
  const userJson = localStorage.getItem("user");
  if (!userJson) return <>{children}</>;
  
  try {
    const user = JSON.parse(userJson) as User;
    const isUnverifiedTeacher = user.role === UserRole.TEACHER && !user.isVerified;
    
    if (isUnverifiedTeacher) {
      return <Navigate to="/pending-verification" replace />;
    }
  } catch (e) {
    console.error("Error parsing user for verification guard", e);
  }
  
  return <>{children}</>;
};

function App() {
  // Reactive role state to ensure UI updates when role changes
  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    const userJson = localStorage.getItem("user");
    if (!userJson) return null;
    try {
      return (JSON.parse(userJson) as User).role;
    } catch {
      return null;
    }
  });

  // Listen for storage changes (handles role updates from authProvider)
  useEffect(() => {
    const handleStorageChange = () => {
      const userJson = localStorage.getItem("user");
      if (userJson) {
        try {
          setUserRole((JSON.parse(userJson) as User).role);
        } catch {}
      } else {
        setUserRole(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // Also poll slightly for local changes that don't trigger 'storage' event in same tab
    const interval = setInterval(handleStorageChange, 2000);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const isStudent = userRole === UserRole.STUDENT;
  const isAdmin = userRole === UserRole.ADMIN;

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <DevtoolsProvider>
          <ErrorBoundary>
            <Refine
              dataProvider={dataProvider}
              authProvider={authProvider}
              notificationProvider={useNotificationProvider()}
              routerProvider={routerProvider}
              accessControlProvider={accessControlProvider}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "nDt0bx-k8buuJ-It2Nvq",
                title: {
                  icon: <GraduationCap className="w-8 h-8 text-primary" />,
                  text: "Classroom AI",
                },
              }}
              resources={[
                {
                  name: "dashboard",
                  list: "/",
                  meta: { label: "Dashboard", icon: <Home /> },
                },
                {
                  name: "classes",
                  list: "/classes",
                  create: "/classes/create",
                  edit: "/classes/edit/:id",
                  show: "/classes/show/:id",
                  meta: { label: "Classes", icon: <LayoutGrid /> },
                },
                {
                  name: "ai-study-lab",
                  list: "/ai-study-lab",
                  meta: { 
                    label: "AI Study Lab", 
                    icon: <BrainCircuit />,
                    hide: !isStudent 
                  },
                },
                {
                  name: "study-planner",
                  list: "/study-planner",
                  meta: { 
                    label: "Study Planner", 
                    icon: <CalendarDays />,
                    hide: !isStudent 
                  },
                },
                {
                  name: "ai-assistant",
                  list: "/ai-assistant",
                  meta: { 
                    label: "AI Assistant", 
                    icon: <Sparkles />,
                    hide: isStudent,
                  },
                },
                {
                  name: "calendar",
                  list: "/calendar",
                  meta: { label: "Calendar", icon: <Calendar /> },
                },
                {
                  name: "subjects",
                  list: "/subjects",
                  create: "/subjects/create",
                  edit: "/subjects/edit/:id",
                  meta: { 
                      label: "Subjects", 
                      icon: <BookOpen />,
                      hide: isStudent 
                  },
                },
                {
                  name: "departments",
                  list: "/departments",
                  create: "/departments/create",
                  edit: "/departments/edit/:id",
                  meta: { 
                      label: "Departments", 
                      icon: <Building2 />,
                      hide: !isAdmin 
                  },
                },
                {
                  name: "users",
                  list: "/users",
                  create: "/users/create",
                  edit: "/users/edit/:id",
                  show: "/users/show/:id",
                  meta: { 
                      label: "Users", 
                      icon: <ShieldCheck />,
                      hide: !isAdmin 
                  },
                },
                {
                  name: "portfolio",
                  list: "/portfolio",
                  meta: {
                    label: "My Portfolio",
                    icon: <UserCircle />,
                    hide: !isStudent
                  }
                },
                {
                  name: "profile-requests",
                  list: "/profile-requests",
                  meta: { 
                      label: "Profile Requests", 
                      icon: <ClipboardCheck />,
                      hide: !isAdmin 
                  },
                },
                {
                  name: "activity-log",
                  list: "/activity-log",
                  meta: { 
                      label: "Activity Log", 
                      icon: <Activity />,
                      hide: !isAdmin 
                  },
                },
                {
                  name: "enrollments",
                  list: "/enrollments",
                  meta: { 
                      label: "Enrollments", 
                      icon: <UserPlus />,
                      hide: !isAdmin 
                  },
                },
                {
                  name: "assignments",
                  list: "/assignments",
                  create: "/assignments/create",
                  show: "/assignments/show/:id",
                  meta: { label: "Assignments", icon: <FileText /> },
                },
                {
                  name: "submissions",
                  list: "/submissions",
                  show: "/submissions/show/:id",
                  meta: { label: "Submissions", icon: <Send /> },
                },
                {
                  name: "attendance",
                  list: "/attendance",
                  meta: { label: "Attendance", icon: <CheckSquare /> },
                },
                {
                  name: "quizzes",
                  list: "/quizzes",
                  create: "/quizzes/create",
                  show: "/quizzes/show/:id",
                  meta: { label: "Quizzes", icon: <FileQuestion /> },
                },
                {
                  name: "modules",
                  list: "/modules",
                  meta: { label: "Modules", icon: <Library /> },
                },
                {
                  name: "discussions",
                  list: "/discussions",
                  meta: { label: "Discussions", icon: <MessageSquare /> },
                },
                {
                  name: "resources",
                  list: "/resources",
                  meta: { label: "Resources", icon: <FolderOpen /> },
                },
                {
                  name: "notifications",
                  list: "/notifications",
                  meta: { label: "Notifications", icon: <Bell /> },
                },
                {
                  name: "progress",
                  list: "/progress",
                  meta: { label: "Progress", icon: <TrendingUp /> },
                },
              ]}
            >
              <OfflineBanner />
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route
                    element={
                      <Authenticated key="public-routes" fallback={<Outlet />}>
                        <NavigateToResource resource="dashboard" />
                      </Authenticated>
                    }
                  >
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                  </Route>

                  <Route
                    element={
                      <Authenticated key="private-routes" fallback={<LoginPage />}>
                        <VerificationGuard>
                          <Layout>
                            <Outlet />
                          </Layout>
                        </VerificationGuard>
                      </Authenticated>
                    }
                  >
                    <Route
                      index
                      element={
                        <AuthorizedRoute resource="dashboard" action="list">
                          <Dashboard />
                        </AuthorizedRoute>
                      }
                    />
                    <Route 
                      path="calendar" 
                      element={
                        <AuthorizedRoute resource="calendar" action="list">
                          <CalendarPage />
                        </AuthorizedRoute>
                      }
                    />
                    <Route 
                      path="ai-assistant" 
                      element={
                        <AuthorizedRoute resource="ai-assistant" action="list">
                          <AIAssistantPage />
                        </AuthorizedRoute>
                      } 
                    />
                    <Route 
                      path="ai-study-lab" 
                      element={
                        <AuthorizedRoute resource="ai-study-lab" action="list">
                          <AIStudyLab />
                        </AuthorizedRoute>
                      } 
                    />
                    <Route 
                      path="study-planner" 
                      element={
                        <AuthorizedRoute resource="study-planner" action="list">
                          <StudyPlanner />
                        </AuthorizedRoute>
                      } 
                    />
                    <Route path="subjects">
                      <Route
                        index
                        element={
                          <AuthorizedRoute resource="subjects" action="list">
                            <SubjectsList />
                          </AuthorizedRoute>
                        }
                      />
                      <Route
                        path="create"
                        element={
                          <AuthorizedRoute resource="subjects" action="create">
                            <SubjectsCreate />
                          </AuthorizedRoute>
                        }
                      />
                      <Route
                        path="edit/:id"
                        element={
                          <AuthorizedRoute resource="subjects" action="edit">
                            <SubjectsEdit />
                          </AuthorizedRoute>
                        }
                      />
                    </Route>
                    <Route path="departments">
                      <Route
                        index
                        element={
                          <AuthorizedRoute resource="departments" action="list">
                            <DepartmentsList />
                          </AuthorizedRoute>
                        }
                      />
                      <Route
                        path="create"
                        element={
                          <AuthorizedRoute resource="departments" action="create">
                            <DepartmentsCreate />
                          </AuthorizedRoute>
                        }
                      />
                      <Route
                        path="edit/:id"
                        element={
                          <AuthorizedRoute resource="departments" action="edit">
                            <DepartmentsEdit />
                          </AuthorizedRoute>
                        }
                      />
                    </Route>
                    <Route path="users">
                      <Route
                        index
                        element={
                          <AuthorizedRoute resource="users" action="list">
                            <UsersList />
                          </AuthorizedRoute>
                        }
                      />
                      <Route
                        path="create"
                        element={
                          <AuthorizedRoute resource="users" action="create">
                            <UsersCreate />
                          </AuthorizedRoute>
                        }
                      />
                      <Route
                        path="edit/:id"
                        element={
                          <AuthorizedRoute resource="users" action="edit">
                            <UsersEdit />
                          </AuthorizedRoute>
                        }
                      />
                      <Route
                        path="show/:id"
                        element={
                          <AuthorizedRoute resource="users" action="show">
                            <UserShow />
                          </AuthorizedRoute>
                        }
                      />
                    </Route>
                    <Route path="portfolio" element={<StudentPortfolio />} />
                    <Route path="profile-requests">
                      <Route
                        index
                        element={
                          <AuthorizedRoute resource="profile-requests" action="list">
                            <ProfileRequestsList />
                          </AuthorizedRoute>
                        }
                      />
                    </Route>
                    <Route path="activity-log">
                      <Route
                        index
                        element={
                          <AuthorizedRoute resource="activity-log" action="list">
                            <ActivityLogPage />
                          </AuthorizedRoute>
                        }
                      />
                    </Route>
                    <Route path="classes">
                      <Route
                        index
                        element={
                          <AuthorizedRoute resource="classes" action="list">
                            <ClassesList />
                          </AuthorizedRoute>
                        }
                      />
                      <Route
                        path="create"
                        element={
                          <AuthorizedRoute resource="classes" action="create">
                            <ClassesCreate />
                          </AuthorizedRoute>
                        }
                      />
                      <Route
                        path="edit/:id"
                        element={
                          <AuthorizedRoute resource="classes" action="edit">
                            <ClassesEdit />
                          </AuthorizedRoute>
                        }
                      />
                      <Route
                        path="show/:id"
                        element={
                          <AuthorizedRoute resource="classes" action="show">
                            <ClassShow />
                          </AuthorizedRoute>
                        }
                      />
                      <Route
                        path=":classId/lessons/:resourceId"
                        element={
                          <AuthorizedRoute resource="classes" action="show">
                            <LessonReader />
                          </AuthorizedRoute>
                        }
                      />
                    </Route>
                    <Route path="enrollments">
                      <Route
                        index
                        element={
                          <AuthorizedRoute resource="enrollments" action="list">
                            <EnrollmentsList />
                          </AuthorizedRoute>
                        }
                      />
                    </Route>
                    <Route path="assignments">
                      <Route
                        index
                        element={
                          <AuthorizedRoute resource="assignments" action="list">
                            <AssignmentsList />
                          </AuthorizedRoute>
                        }
                      />
                      <Route
                        path="create"
                        element={
                          <AuthorizedRoute resource="assignments" action="create">
                            <AssignmentCreate />
                          </AuthorizedRoute>
                        }
                      />
                      <Route
                        path="show/:id"
                        element={
                          <AuthorizedRoute resource="assignments" action="show">
                            <AssignmentShow />
                          </AuthorizedRoute>
                        }
                      />
                    </Route>
                    <Route path="submissions">
                      <Route
                        index
                        element={
                          <AuthorizedRoute resource="submissions" action="list">
                            <SubmissionsList />
                          </AuthorizedRoute>
                        }
                      />
                      <Route
                        path="show/:id"
                        element={
                          <AuthorizedRoute resource="submissions" action="show">
                            <SubmissionShow />
                          </AuthorizedRoute>
                        }
                      />
                    </Route>
                    <Route path="attendance">
                      <Route
                        index
                        element={
                          <AuthorizedRoute resource="attendance" action="list">
                            <AttendanceList />
                          </AuthorizedRoute>
                        }
                      />
                    </Route>
                    <Route path="quizzes">
                      <Route
                        index
                        element={
                          <AuthorizedRoute resource="quizzes" action="list">
                            <QuizzesList />
                          </AuthorizedRoute>
                        }
                      />
                      <Route
                        path="create"
                        element={
                          <AuthorizedRoute resource="quizzes" action="create">
                            <QuizCreate />
                          </AuthorizedRoute>
                        }
                      />
                      <Route
                        path="show/:id"
                        element={
                          <AuthorizedRoute resource="quizzes" action="show">
                            <QuizShow />
                          </AuthorizedRoute>
                        }
                      />
                      <Route
                        path="results/:id"
                        element={
                          <AuthorizedRoute resource="quizzes" action="show">
                            <QuizResults />
                          </AuthorizedRoute>
                        }
                      />
                    </Route>
                    <Route path="modules">
                      <Route
                        index
                        element={
                          <AuthorizedRoute resource="modules" action="list">
                            <ModulesList />
                          </AuthorizedRoute>
                        }
                      />
                    </Route>
                    <Route path="resources">
                      <Route
                        index
                        element={
                          <AuthorizedRoute resource="resources" action="list">
                            <ResourcesList />
                          </AuthorizedRoute>
                        }
                      />
                    </Route>
                    <Route path="discussions">
                      <Route
                        index
                        element={
                          <AuthorizedRoute resource="discussions" action="list">
                            <DiscussionsList />
                          </AuthorizedRoute>
                        }
                      />
                    </Route>
                    <Route path="notifications">
                      <Route
                        index
                        element={
                          <AuthorizedRoute resource="notifications" action="list">
                            <NotificationsList />
                          </AuthorizedRoute>
                        }
                      />
                    </Route>
                    <Route path="progress">
                      <Route
                        index
                        element={
                          <AuthorizedRoute resource="progress" action="list">
                            <ProgressList />
                          </AuthorizedRoute>
                        }
                      />
                    </Route>
                    
                    {/* Catch-all route for 404 INSIDE the layout */}
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                </Routes>
              </Suspense>

              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
          </ErrorBoundary>
        </DevtoolsProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
