import React, { Suspense } from "react";
import { Authenticated, Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { DevtoolsProvider } from "@refinedev/devtools";

import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";

import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import "./App.css";
import { authProvider } from "./providers/auth";
import { accessControlProvider } from "./providers/access-control";
import { Layout } from "./components/refine-ui/layout/layout";
import { resources } from "./config/resources";
import { dataProvider } from "./providers/data";
import { Toaster } from "./components/ui/sonner";
import { TermProvider } from "./contexts/term-context";
import { SocketProvider } from "./contexts/socket-context";
import { Loader2, GraduationCap } from "lucide-react";
import { ErrorBoundary } from "./components/error-boundary";
import { AuthorizedRoute } from "./components/authorized-route";
import { VerificationGuard } from "./components/verification-guard";

// i18n
import "./i18n/i18n";
import { useTranslation } from "react-i18next";

// Lazy Load Pages
const Dashboard = React.lazy(() => import("./pages/dashboard"));
const LoginPage = React.lazy(() => import("./pages/auth/login"));
const RegisterPage = React.lazy(() => import("./pages/auth/register"));
const PendingVerification = React.lazy(() => import("./pages/auth/pending-verification"));
const UnauthorizedPage = React.lazy(() => import("./pages/unauthorized"));

const ClassesList = React.lazy(() => import("./pages/classes/list"));
const ClassShow = React.lazy(() => import("./pages/classes/show"));
const CreateClass = React.lazy(() => import("./pages/classes/create"));
const EditClass = React.lazy(() => import("./pages/classes/edit"));
const LessonReader = React.lazy(() => import("./pages/classes/lesson-reader"));

const UsersList = React.lazy(() => import("./pages/users/list"));
const ShowUser = React.lazy(() => import("./pages/users/show"));
const CreateUser = React.lazy(() => import("./pages/users/create"));
const EditUser = React.lazy(() => import("./pages/users/edit"));

const AssignmentsList = React.lazy(() => import("./pages/assignments/list-page"));
const CreateAssignment = React.lazy(() => import("./pages/assignments/create").then(m => ({ default: m.AssignmentCreate })));
const AssignmentShow = React.lazy(() => import("./pages/assignments/show"));

const SubmissionsList = React.lazy(() => import("./pages/submissions/list-page"));
const SubmissionShow = React.lazy(() => import("./pages/submissions/show"));

const AttendanceList = React.lazy(() => import("./pages/attendance/list"));
const EnrollmentList = React.lazy(() => import("./pages/enrollments/list"));
const DiscussionsList = React.lazy(() => import("./pages/discussions/list"));

const QuizzesList = React.lazy(() => import("./pages/quizzes/list"));
const CreateQuiz = React.lazy(() => import("./pages/quizzes/create"));
const QuizShow = React.lazy(() => import("./pages/quizzes/show"));

const ModulesList = React.lazy(() => import("./pages/modules/list"));
const ResourcesList = React.lazy(() => import("./pages/resources/list"));

const DepartmentsList = React.lazy(() => import("./pages/departments/list"));
const CreateDepartment = React.lazy(() => import("./pages/departments/create"));
const EditDepartment = React.lazy(() => import("./pages/departments/edit"));

const SubjectsList = React.lazy(() => import("./pages/subjects/list"));
const CreateSubject = React.lazy(() => import("./pages/subjects/create"));
const EditSubject = React.lazy(() => import("./pages/subjects/edit"));

const CalendarPage = React.lazy(() => import("./pages/calendar"));
const NotificationsPage = React.lazy(() => import("./pages/notifications/list"));
const AiAssistantPage = React.lazy(() => import("./pages/ai-assistant"));
const AiStudyLabPage = React.lazy(() => import("./pages/ai-study-lab"));
const MessagesPage = React.lazy(() => import("./pages/messages/index"));
const ProjectGroupsPage = React.lazy(() => import("./pages/project-groups/index"));
const ShowProjectGroup = React.lazy(() => import("./pages/project-groups/show"));
const GlobalLibraryPage = React.lazy(() => import("./pages/library/index"));
const TermsList = React.lazy(() => import("./pages/terms/list"));
const ProfileRequestsList = React.lazy(() => import("./pages/profile-requests/list"));
const StudyPlanner = React.lazy(() => import("./pages/study-planner"));
const TeacherApplicationsList = React.lazy(() => import("./pages/teacher-applications/list"));
const ActivityLogPage = React.lazy(() => import("./pages/dashboard/activity-log"));
const StudentReportCard = React.lazy(() => import("./pages/student/report-card"));
const StudentProgress = React.lazy(() => import("./pages/progress/list"));
const TeacherChannelPage = React.lazy(() => import("./pages/teacher-channel/index"));

// PUBLIC PAGES
const LandingPage = React.lazy(() => import("./pages/landing"));
const PricingPage = React.lazy(() => import("./pages/pricing"));
const PublicLayout = React.lazy(() => import("./components/public-ui/layout").then(m => ({ default: m.PublicLayout })));

const Loading = () => (
  <div className="flex h-dvh items-center justify-center">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
);

function App() {
  const { t, i18n } = useTranslation();

  const i18nProvider = {
    translate: (key: string, params: object) => t(key, { ...params, defaultValue: key }),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
  };

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <DevtoolsProvider>
          <ErrorBoundary>
            <Refine
              dataProvider={dataProvider}
              authProvider={authProvider}
              accessControlProvider={accessControlProvider}
              routerProvider={routerBindings}
              notificationProvider={useNotificationProvider}
              i18nProvider={i18nProvider}
              resources={resources}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "classroom-refine",
                title: {
                  icon: <GraduationCap className="w-8 h-8 text-primary" />,
                  text: t("app.title", { defaultValue: "Classroom AI" }),
                },
              }}
            >
              <Suspense fallback={<Loading />}>
                <SocketProvider>
                  <TermProvider>
                    <Routes>
                      {/* PUBLIC ROUTES */}
                      <Route element={<PublicLayout />}>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/pricing" element={<PricingPage />} />
                      </Route>

                      {/* AUTH PAGES (REDIRECTS IF LOGGED IN) */}
                      <Route
                        element={
                          <Authenticated
                            key="auth-pages"
                            fallback={<Outlet />}
                          >
                            <NavigateToResource resource="dashboard" />
                          </Authenticated>
                        }
                      >
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                      </Route>

                      <Route path="/unauthorized" element={<UnauthorizedPage />} />

                      {/* PROTECTED ROUTES */}
                      <Route
                        element={
                          <Authenticated
                            key="authenticated-layout"
                            fallback={<CatchAllNavigate to="/login" />}
                          >
                            <Outlet />
                          </Authenticated>
                        }
                      >
                        <Route 
                            path="/pending-verification" 
                            element={<PendingVerification />} 
                        />
                        
                        <Route
                            element={
                                <VerificationGuard>
                                    <Layout>
                                        <Outlet />
                                    </Layout>
                                </VerificationGuard>
                            }
                        >
                            <Route 
                            path="/dashboard" 
                            element={
                                <AuthorizedRoute resource="dashboard" action="list">
                                <Dashboard />
                                </AuthorizedRoute>
                            } 
                            />
                            <Route 
                            path="/calendar" 
                            element={
                                <AuthorizedRoute resource="calendar" action="list">
                                <CalendarPage />
                                </AuthorizedRoute>
                            } 
                            />
                            <Route 
                            path="/notifications" 
                            element={
                                <AuthorizedRoute resource="notifications" action="list">
                                <NotificationsPage />
                                </AuthorizedRoute>
                            } 
                            />
                            <Route 
                                path="/messages" 
                                element={
                                    <AuthorizedRoute resource="messages" action="list">
                                        <MessagesPage />
                                    </AuthorizedRoute>
                                } 
                            /> 
                            <Route path="/project-groups">
                                <Route 
                                    index 
                                    element={
                                        <AuthorizedRoute resource="project-groups" action="list">
                                            <ProjectGroupsPage />
                                        </AuthorizedRoute>
                                    } 
                                />
                                <Route 
                                    path="show/:id" 
                                    element={
                                        <AuthorizedRoute resource="project-groups" action="show">
                                            <ShowProjectGroup />
                                        </AuthorizedRoute>
                                    } 
                                />
                            </Route>
                            <Route 
                                path="/library" 
                                element={
                                    <AuthorizedRoute resource="library" action="list">
                                        <GlobalLibraryPage />
                                    </AuthorizedRoute>
                                } 
                            />

                            {/* AI */}
                            <Route 
                            path="/ai-assistant" 
                            element={
                                <AuthorizedRoute resource="ai-assistant" action="list">
                                <AiAssistantPage />
                                </AuthorizedRoute>
                            } 
                            />
                            <Route 
                            path="/ai-study-lab" 
                            element={
                                <AuthorizedRoute resource="ai-study-lab" action="list">
                                <AiStudyLabPage />
                                </AuthorizedRoute>
                            } 
                            />
                            <Route 
                            path="/study-planner" 
                            element={
                                <AuthorizedRoute resource="study-planner" action="list">
                                <StudyPlanner />
                                </AuthorizedRoute>
                            } 
                            />

                            {/* CLASSES */}
                            <Route path="/classes">
                                <Route index element={<AuthorizedRoute resource="classes" action="list"><ClassesList /></AuthorizedRoute>} />
                                <Route path="create" element={<AuthorizedRoute resource="classes" action="create"><CreateClass /></AuthorizedRoute>} />
                                <Route path="edit/:id" element={<AuthorizedRoute resource="classes" action="edit"><EditClass /></AuthorizedRoute>} />
                                <Route path="show/:id" element={<AuthorizedRoute resource="classes" action="show"><ClassShow /></AuthorizedRoute>} />
                                <Route path=":classId/lessons/:resourceId" element={<AuthorizedRoute resource="resources" action="show"><LessonReader /></AuthorizedRoute>} />
                            </Route>

                            {/* ASSIGNMENTS */}
                            <Route path="/assignments">
                                <Route index element={<AuthorizedRoute resource="assignments" action="list"><AssignmentsList /></AuthorizedRoute>} />
                                <Route path="create" element={<AuthorizedRoute resource="assignments" action="create"><CreateAssignment /></AuthorizedRoute>} />
                                <Route path="show/:id" element={<AuthorizedRoute resource="assignments" action="show"><AssignmentShow /></AuthorizedRoute>} />
                            </Route>

                            {/* SUBMISSIONS */}
                            <Route path="/submissions">
                                <Route index element={<AuthorizedRoute resource="submissions" action="list"><SubmissionsList /></AuthorizedRoute>} />
                                <Route path="show/:id" element={<AuthorizedRoute resource="submissions" action="show"><SubmissionShow /></AuthorizedRoute>} />
                            </Route>

                            {/* QUIZZES */}
                            <Route path="/quizzes">
                                <Route index element={<AuthorizedRoute resource="quizzes" action="list"><QuizzesList /></AuthorizedRoute>} />
                                <Route path="create" element={<AuthorizedRoute resource="quizzes" action="create"><CreateQuiz /></AuthorizedRoute>} />
                                <Route path="show/:id" element={<AuthorizedRoute resource="quizzes" action="show"><QuizShow /></AuthorizedRoute>} />
                            </Route>

                            {/* OTHERS */}
                            <Route path="/attendance" element={<AuthorizedRoute resource="attendance" action="list"><AttendanceList /></AuthorizedRoute>} />
                            <Route path="/enrollments" element={<AuthorizedRoute resource="enrollments" action="list"><EnrollmentList /></AuthorizedRoute>} />
                            <Route path="/discussions" element={<AuthorizedRoute resource="discussions" action="list"><DiscussionsList /></AuthorizedRoute>} />
                            <Route path="/modules" element={<AuthorizedRoute resource="modules" action="list"><ModulesList /></AuthorizedRoute>} />
                            <Route path="/resources" element={<AuthorizedRoute resource="resources" action="list"><ResourcesList /></AuthorizedRoute>} />

                            {/* TEACHER HUB */}
                            <Route 
                                path="/teacher/channel" 
                                element={
                                    <AuthorizedRoute resource="teacher-channel" action="list">
                                        <TeacherChannelPage />
                                    </AuthorizedRoute>
                                } 
                            />

                            {/* ADMIN */}
                            <Route path="/users">
                                <Route index element={<AuthorizedRoute resource="users" action="list"><UsersList /></AuthorizedRoute>} />
                                <Route path="create" element={<AuthorizedRoute resource="users" action="create"><CreateUser /></AuthorizedRoute>} />
                                <Route path="edit/:id" element={<AuthorizedRoute resource="users" action="edit"><EditUser /></AuthorizedRoute>} />
                                <Route path="show/:id" element={<AuthorizedRoute resource="users" action="show"><ShowUser /></AuthorizedRoute>} />
                            </Route>
                            
                            <Route path="/departments">
                                <Route index element={<AuthorizedRoute resource="departments" action="list"><DepartmentsList /></AuthorizedRoute>} />
                                <Route path="create" element={<AuthorizedRoute resource="departments" action="create"><CreateDepartment /></AuthorizedRoute>} />
                                <Route path="edit/:id" element={<AuthorizedRoute resource="departments" action="edit"><EditDepartment /></AuthorizedRoute>} />
                            </Route>
                            <Route path="/subjects">
                                <Route index element={<AuthorizedRoute resource="subjects" action="list"><SubjectsList /></AuthorizedRoute>} />
                                <Route path="create" element={<AuthorizedRoute resource="subjects" action="create"><CreateSubject /></AuthorizedRoute>} />
                                <Route path="edit/:id" element={<AuthorizedRoute resource="subjects" action="edit"><EditSubject /></AuthorizedRoute>} />
                            </Route>
                            <Route path="/admin/terms" element={<AuthorizedRoute resource="academic-terms" action="list"><TermsList /></AuthorizedRoute>} />
                            <Route
                                path="/profile-requests"
                                element={<AuthorizedRoute resource="profile-requests" action="list"><ProfileRequestsList /></AuthorizedRoute>}
                            />
                            <Route
                                path="/teacher-applications"
                                element={<AuthorizedRoute resource="teacher-applications" action="list"><TeacherApplicationsList /></AuthorizedRoute>}
                            />
                            <Route path="/activity-log" element={<AuthorizedRoute resource="activity-log" action="list"><ActivityLogPage /></AuthorizedRoute>} />
                            <Route
                                path="/student/report-card"
                                element={<AuthorizedRoute resource="report-card" action="list"><StudentReportCard /></AuthorizedRoute>}
                            />
                            <Route path="/progress" element={<AuthorizedRoute resource="progress" action="list"><StudentProgress /></AuthorizedRoute>} />
                        </Route>
                      </Route>

                      {/* REDIRECT ROOT TO DASHBOARD IF AUTHENTICATED */}
                      <Route
                        element={
                          <Authenticated
                            key="authenticated-root-redirect"
                            fallback={<Outlet />}
                          >
                            <NavigateToResource resource="dashboard" />
                          </Authenticated>
                        }
                      >
                        <Route path="/" element={<LandingPage />} />
                      </Route>

                      <Route
                        element={
                          <Authenticated
                            key="authenticated-outer"
                            fallback={<Outlet />}
                          >
                            <NavigateToResource />
                          </Authenticated>
                        }
                      >
                        <Route path="*" element={<CatchAllNavigate to="/login" />} />
                      </Route>
                    </Routes>
                    <Toaster />
                    <UnsavedChangesNotifier />
                    <DocumentTitleHandler />
                  </TermProvider>
                </SocketProvider>
              </Suspense>
              <RefineKbar />
            </Refine>
          </ErrorBoundary>
        </DevtoolsProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
