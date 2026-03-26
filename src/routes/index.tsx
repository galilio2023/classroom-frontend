import React, { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Authenticated } from "@refinedev/core";
import { CatchAllNavigate, NavigateToResource } from "@refinedev/react-router";
import { Outlet, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/refine-ui/layout/layout";
import { AuthorizedRoute } from "@/components/authorized-route";
import { VerificationGuard } from "@/components/verification-guard";
import { SocketProvider } from "@/contexts/socket-context";
import { TermProvider } from "@/contexts/term-context";
import { Loader2 } from "lucide-react";

// Lazy Load Pages
const Dashboard = React.lazy(() => import("@/features/dashboard/pages/index"));
const LoginPage = React.lazy(() => import("@/pages/auth/login"));
const RegisterPage = React.lazy(() => import("@/pages/auth/register"));
const PendingVerification = React.lazy(() => import("@/pages/auth/pending-verification"));
const UnauthorizedPage = React.lazy(() => import("@/pages/unauthorized"));

const ClassesList = React.lazy(() => import("@/features/classes/pages/list"));
const ClassShow = React.lazy(() => import("@/features/classes/pages/show"));
const CreateClass = React.lazy(() => import("@/features/classes/pages/create"));
const EditClass = React.lazy(() => import("@/features/classes/pages/edit"));
const LessonReader = React.lazy(() => import("@/features/classes/pages/lesson-reader"));

const UsersList = React.lazy(() => import("@/features/users/pages/list"));
const ShowUser = React.lazy(() => import("@/features/users/pages/show"));
const CreateUser = React.lazy(() => import("@/features/users/pages/create"));
const EditUser = React.lazy(() => import("@/features/users/pages/edit"));

// FEATURE: ASSIGNMENTS
const AssignmentsList = React.lazy(() => import("@/features/assignments/pages/list-page"));
const CreateAssignment = React.lazy(() =>
  import("@/features/assignments/pages/create").then((m) => ({
    default: m.AssignmentCreate,
  }))
);
const AssignmentShow = React.lazy(() => import("@/features/assignments/pages/show"));

const SubmissionsList = React.lazy(() => import("@/pages/submissions/list-page"));
const SubmissionShow = React.lazy(() => import("@/pages/submissions/show"));

const AttendanceList = React.lazy(() => import("@/pages/attendance/list"));
const EnrollmentList = React.lazy(() => import("@/pages/enrollments/list"));
const DiscussionsList = React.lazy(() => import("@/pages/discussions/list"));

const QuizzesList = React.lazy(() => import("@/features/quizzes/pages/list"));
const CreateQuiz = React.lazy(() => import("@/features/quizzes/pages/create"));
const QuizShow = React.lazy(() => import("@/features/quizzes/pages/show"));

const ModulesList = React.lazy(() => import("@/pages/modules/list"));
const ResourcesList = React.lazy(() => import("@/pages/resources/list"));

const DepartmentsList = React.lazy(() => import("@/pages/departments/list"));
const CreateDepartment = React.lazy(() => import("@/pages/departments/create"));
const EditDepartment = React.lazy(() => import("@/pages/departments/edit"));

const SubjectsList = React.lazy(() => import("@/pages/subjects/list"));
const CreateSubject = React.lazy(() => import("@/pages/subjects/create"));
const EditSubject = React.lazy(() => import("@/pages/subjects/edit"));

const CalendarPage = React.lazy(() => import("@/pages/calendar"));
const NotificationsPage = React.lazy(() => import("@/pages/notifications/list"));
const AiAssistantPage = React.lazy(() => import("@/features/ai/pages/ai-assistant"));
const AiStudyLabPage = React.lazy(() => import("@/features/ai/pages/ai-study-lab"));
const AiHistoryList = React.lazy(() => import("@/features/ai/pages/history-list"));
const AiHistoryShow = React.lazy(() => import("@/features/ai/pages/history-show"));
const MessagesPage = React.lazy(() => import("@/pages/messages/index"));
const ProjectGroupsPage = React.lazy(() => import("@/pages/project-groups/index"));
const ShowProjectGroup = React.lazy(() => import("@/pages/project-groups/show"));
const GlobalLibraryPage = React.lazy(() => import("@/pages/library/index"));
const TermsList = React.lazy(() => import("@/pages/terms/list"));
const ProfileRequestsList = React.lazy(() => import("@/pages/profile-requests/list"));
const StudyPlanner = React.lazy(() => import("@/features/ai/pages/study-planner"));
const TeacherApplicationsList = React.lazy(() => import("@/pages/teacher-applications/list"));
const ActivityLogPage = React.lazy(() => import("@/pages/dashboard/activity-log"));
const AIGovernanceList = React.lazy(() => import("@/features/ai/pages/ai-governance-list"));
const StudentReportCard = React.lazy(() => import("@/pages/student/report-card"));
const StudentProgress = React.lazy(() => import("@/pages/progress/list"));
const TeacherChannelPage = React.lazy(() => import("@/pages/teacher-channel/index"));
const StudentPortfolio = React.lazy(() => import("@/features/users/pages/portfolio"));
const SettingsEditPage = React.lazy(() => import("@/pages/settings/edit"));
const TeacherSubscriptionsList = React.lazy(() => import("@/pages/teacher-subscriptions/list"));
const MyTeachersList = React.lazy(() => import("@/pages/my-teachers/list"));
const DiscoveryPage = React.lazy(() => import("@/pages/discovery/index"));

const LandingPage = React.lazy(() => import("@/pages/landing"));
const PricingPage = React.lazy(() => import("@/pages/pricing"));
const PublicLayout = React.lazy(() =>
  import("@/components/public-ui/layout").then((m) => ({
    default: m.PublicLayout,
  }))
);

const Loading = () => (
  <div className="flex h-dvh items-center justify-center">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
);

const ErrorComponent = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col h-dvh items-center justify-center space-y-4">
      <h1 className="text-4xl font-bold">{t("common.errorPage.title")}</h1>
      <p className="text-muted-foreground">{t("common.errorPage.desc")}</p>
      <a href="/dashboard" className="text-primary hover:underline font-medium">
        {t("common.errorPage.back")}
      </a>
    </div>
  );
};

export const AppRouter = () => (
  <Suspense fallback={<Loading />}>
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
      </Route>

      {/* AUTH PAGES */}
      <Route
        element={
          <Authenticated key="auth-pages" fallback={<Outlet />}>
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
          <Authenticated key="authenticated-layout" fallback={<CatchAllNavigate to="/login" />}>
            <SocketProvider>
              <TermProvider>
                <Outlet />
              </TermProvider>
            </SocketProvider>
          </Authenticated>
        }
      >
        <Route path="/pending-verification" element={<PendingVerification />} />
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
          <Route path="/ai-history">
            <Route
              index
              element={
                <AuthorizedRoute resource="ai-activity-logs" action="list">
                  <AiHistoryList />
                </AuthorizedRoute>
              }
            />
            <Route
              path="show/:id"
              element={
                <AuthorizedRoute resource="ai-activity-logs" action="show">
                  <AiHistoryShow />
                </AuthorizedRoute>
              }
            />
          </Route>
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
                  <CreateClass />
                </AuthorizedRoute>
              }
            />
            <Route
              path="edit/:id"
              element={
                <AuthorizedRoute resource="classes" action="edit">
                  <EditClass />
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
                <AuthorizedRoute resource="resources" action="show">
                  <LessonReader />
                </AuthorizedRoute>
              }
            />
          </Route>

          {/* ASSIGNMENTS */}
          <Route path="/assignments">
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
                  <CreateAssignment />
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

          {/* SUBMISSIONS */}
          <Route path="/submissions">
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

          {/* QUIZZES */}
          <Route path="/quizzes">
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
                  <CreateQuiz />
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
          </Route>

          {/* OTHERS */}
          <Route
            path="/attendance"
            element={
              <AuthorizedRoute resource="attendance" action="list">
                <AttendanceList />
              </AuthorizedRoute>
            }
          />
          <Route
            path="/enrollments"
            element={
              <AuthorizedRoute resource="enrollments" action="list">
                <EnrollmentList />
              </AuthorizedRoute>
            }
          />
          <Route
            path="/discussions"
            element={
              <AuthorizedRoute resource="discussions" action="list">
                <DiscussionsList />
              </AuthorizedRoute>
            }
          />
          <Route
            path="/modules"
            element={
              <AuthorizedRoute resource="modules" action="list">
                <ModulesList />
              </AuthorizedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <AuthorizedRoute resource="resources" action="list">
                <ResourcesList />
              </AuthorizedRoute>
            }
          />

          {/* TEACHER HUB */}
          <Route
            path="/teacher/channel"
            element={
              <AuthorizedRoute resource="teacher-channel" action="list">
                <TeacherChannelPage />
              </AuthorizedRoute>
            }
          />
          <Route
            path="/teacher/subscriptions"
            element={
              <AuthorizedRoute resource="teacher-subscriptions" action="list">
                <TeacherSubscriptionsList />
              </AuthorizedRoute>
            }
          />

          {/* STUDENT HUB */}
          <Route
            path="/my-teachers"
            element={
              <AuthorizedRoute resource="my-teachers" action="list">
                <MyTeachersList />
              </AuthorizedRoute>
            }
          />
          <Route
            path="/discovery"
            element={
              <AuthorizedRoute resource="teacher-channels" action="list">
                <DiscoveryPage />
              </AuthorizedRoute>
            }
          />

          {/* ADMIN */}
          <Route path="/users">
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
                  <CreateUser />
                </AuthorizedRoute>
              }
            />
            <Route
              path="edit/:id"
              element={
                <AuthorizedRoute resource="users" action="edit">
                  <EditUser />
                </AuthorizedRoute>
              }
            />
            <Route
              path="show/:id"
              element={
                <AuthorizedRoute resource="users" action="show">
                  <ShowUser />
                </AuthorizedRoute>
              }
            />
          </Route>

          <Route path="/departments">
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
                  <CreateDepartment />
                </AuthorizedRoute>
              }
            />
            <Route
              path="edit/:id"
              element={
                <AuthorizedRoute resource="departments" action="edit">
                  <EditDepartment />
                </AuthorizedRoute>
              }
            />
          </Route>
          <Route path="/subjects">
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
                  <CreateSubject />
                </AuthorizedRoute>
              }
            />
            <Route
              path="edit/:id"
              element={
                <AuthorizedRoute resource="subjects" action="edit">
                  <EditSubject />
                </AuthorizedRoute>
              }
            />
          </Route>
          <Route
            path="/admin/terms"
            element={
              <AuthorizedRoute resource="academic-terms" action="list">
                <TermsList />
              </AuthorizedRoute>
            }
          />
          <Route
            path="/profile-requests"
            element={
              <AuthorizedRoute resource="profile-requests" action="list">
                <ProfileRequestsList />
              </AuthorizedRoute>
            }
          />
          <Route
            path="/teacher-applications"
            element={
              <AuthorizedRoute resource="teacher-applications" action="list">
                <TeacherApplicationsList />
              </AuthorizedRoute>
            }
          />
          <Route
            path="/activity-log"
            element={
              <AuthorizedRoute resource="activity-log" action="list">
                <ActivityLogPage />
              </AuthorizedRoute>
            }
          />
          <Route
            path="/ai-governance"
            element={
              <AuthorizedRoute resource="ai-health-reports" action="list">
                <AIGovernanceList />
              </AuthorizedRoute>
            }
          />
          <Route
            path="/student/report-card"
            element={
              <AuthorizedRoute resource="report-card" action="list">
                <StudentReportCard />
              </AuthorizedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <AuthorizedRoute resource="progress" action="list">
                <StudentProgress />
              </AuthorizedRoute>
            }
          />

          <Route path="/portfolio">
            <Route
              index
              element={
                <AuthorizedRoute resource="portfolio" action="list">
                  <StudentPortfolio />
                </AuthorizedRoute>
              }
            />
            <Route
              path=":id"
              element={
                <AuthorizedRoute resource="portfolio" action="show">
                  <StudentPortfolio />
                </AuthorizedRoute>
              }
            />
          </Route>

          <Route
            path="/settings"
            element={
              <AuthorizedRoute resource="settings" action="edit">
                <SettingsEditPage />
              </AuthorizedRoute>
            }
          />
          <Route path="*" element={<ErrorComponent />} />
        </Route>
      </Route>

      {/* REDIRECT ROOT */}
      <Route
        element={
          <Authenticated key="authenticated-root-redirect" fallback={<Outlet />}>
            <NavigateToResource resource="dashboard" />
          </Authenticated>
        }
      >
        <Route path="/" element={<LandingPage />} />
      </Route>

      <Route
        element={
          <Authenticated key="authenticated-outer" fallback={<Outlet />}>
            <NavigateToResource resource="dashboard" />
          </Authenticated>
        }
      >
        <Route path="*" element={<CatchAllNavigate to="/login" />} />
      </Route>
    </Routes>
  </Suspense>
);
