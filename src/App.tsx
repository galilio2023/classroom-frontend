import { Authenticated, Refine, useGetIdentity } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerProvider, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
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
  Users, 
  Calendar, 
  Sparkles, 
  GraduationCap, 
  MessageSquare, 
  UserPlus, 
  ClipboardCheck, 
  Loader2, 
  FileQuestion,
  BrainCircuit,
  ShieldCheck,
  LayoutGrid
} from "lucide-react";
import { Layout } from "@/components/refine-ui/layout/layout.tsx";
import { AuthorizedRoute } from "./components/authorized-route";
import React, { Suspense } from "react";
import { User, UserRole } from "@/types";

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
const ClassesList = React.lazy(() => import("@/pages/classes/list.tsx"));
const ClassesCreate = React.lazy(() => import("@/pages/classes/create.tsx"));
const ClassesEdit = React.lazy(() => import("@/pages/classes/edit.tsx"));
const ClassShow = React.lazy(() => import("@/pages/classes/show.tsx"));
const LessonReader = React.lazy(() => import("@/pages/classes/lesson-reader.tsx"));
const EnrollmentsList = React.lazy(() => import("@/pages/enrollments/list.tsx"));
const ProfileRequestsList = React.lazy(() => import("@/pages/profile-requests/list.tsx"));
const LoginPage = React.lazy(() => import("@/pages/auth/login.tsx"));
const RegisterPage = React.lazy(() => import("@/pages/auth/register.tsx"));
const AssignmentCreate = React.lazy(() => import("./pages/assignments/create").then(module => ({ default: module.AssignmentCreate })));
const AssignmentShow = React.lazy(() => import("./pages/assignments/show"));
const AIAssistantPage = React.lazy(() => import("./pages/ai-assistant"));
const AIStudyLab = React.lazy(() => import("./pages/ai-study-lab"));
const CalendarPage = React.lazy(() => import("./pages/calendar"));

// Quiz Pages
const QuizCreate = React.lazy(() => import("./pages/quizzes/create"));
const QuizShow = React.lazy(() => import("./pages/quizzes/show"));
const QuizResults = React.lazy(() => import("./pages/quizzes/results"));

const Loading = () => (
  <div className="flex h-dvh items-center justify-center">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
);

function App() {
  const { data: user } = useGetIdentity<User>();
  
  const userRole = user?.role;
  const isStudent = userRole === UserRole.STUDENT;
  const isAdmin = userRole === UserRole.ADMIN;

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <DevtoolsProvider>
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
                meta: { label: "My Classes", icon: <LayoutGrid /> },
              },
              {
                name: "ai-study-lab",
                list: "/ai-study-lab",
                meta: { 
                  label: "AI Study Lab", 
                  icon: <BrainCircuit />,
                  hide: !isStudent // Only Students see AI Study Lab
                },
              },
              {
                name: "ai-assistant",
                list: "/ai-assistant",
                meta: { 
                  label: "AI Assistant", 
                  icon: <Sparkles />,
                  hide: isStudent, // Teachers/Admins see AI Assistant
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
                    hide: isStudent // Students don't manage subjects
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
                    hide: !isAdmin // Only Admins see Departments
                },
              },
              {
                name: "users",
                list: "/users",
                create: "/users/create",
                edit: "/users/edit/:id",
                show: "/users/show/:id",
                meta: { 
                    label: "Users & Verification", 
                    icon: <ShieldCheck />,
                    hide: !isAdmin // Only Admins see Users list
                },
              },
              {
                name: "profile-requests",
                list: "/profile-requests",
                meta: { 
                    label: "Profile Requests", 
                    icon: <ClipboardCheck />,
                    hide: !isAdmin // Only Admins see Profile Requests
                },
              },
              {
                name: "enrollments",
                list: "/enrollments",
                meta: { 
                    label: "Enrollments", 
                    icon: <UserPlus />,
                    hide: !isAdmin // Only Admins see Global Enrollments
                },
              },
              {
                name: "quizzes",
                meta: { label: "Quizzes", icon: <FileQuestion />, hide: true },
              },
              {
                name: "assignments",
                meta: { hide: true },
              },
              {
                name: "submissions",
                meta: { hide: true },
              },
              {
                name: "discussions",
                meta: { hide: true },
              },
            ]}
          >
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
                      <Layout>
                        <Outlet />
                      </Layout>
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
                  <Route path="quizzes">
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
                </Route>
              </Routes>
            </Suspense>

            <Toaster />
            <RefineKbar />
            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
          </Refine>
        </DevtoolsProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
