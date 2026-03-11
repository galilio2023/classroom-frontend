import { Authenticated, Refine } from "@refinedev/core";
import { RefineKbarProvider } from "@refinedev/kbar";

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
import { Layout } from "./components/refine-ui/layout/layout";
import { resources } from "./config/resources";
import { dataProvider } from "./providers/data";
import Dashboard from "./pages/dashboard";
import LoginPage from "./pages/auth/login";
import RegisterPage from "./pages/auth/register";
import { Toaster } from "./components/ui/sonner";
import ClassesList from "./pages/classes/list";
import ClassShow from "./pages/classes/show";
import CreateClass from "./pages/classes/create";
import EditClass from "./pages/classes/edit";
import EditUser from "./pages/users/edit";
import CreateUser from "./pages/users/create";
import ShowUser from "./pages/users/show";
import UsersList from "./pages/users/list";
import PendingVerification from "./pages/auth/pending-verification";
import UnauthorizedPage from "./pages/unauthorized";
import { AssignmentList as AssignmentsList } from "./pages/assignments/list";
import { AssignmentCreate as CreateAssignment } from "./pages/assignments/create";
import AssignmentShow from "./pages/assignments/show";
import SubmissionsList from "./pages/submissions/list-page";
import SubmissionShow from "./pages/submissions/show";
import AttendanceList from "./pages/attendance/list";
import EnrollmentList from "./pages/enrollments/list";
import DiscussionsList from "./pages/discussions/list";
import QuizzesList from "./pages/quizzes/list";
import CreateQuiz from "./pages/quizzes/create";
import QuizShow from "./pages/quizzes/show";
import ModulesList from "./pages/modules/list";
import DepartmentsList from "./pages/departments/list";
import EditDepartment from "./pages/departments/edit";
import CreateDepartment from "./pages/departments/create";
import SubjectsList from "./pages/subjects/list";
import CreateSubject from "./pages/subjects/create";
import EditSubject from "./pages/subjects/edit";
import ResourcesList from "./pages/resources/list";
import CalendarPage from "./pages/calendar";
import NotificationsPage from "./pages/notifications/list";
import AiAssistantPage from "./pages/ai-assistant";
import AiStudyLabPage from "./pages/ai-study-lab";
import MessagesPage from "./pages/messages/index";
import ProjectGroupsPage from "./pages/project-groups/index";
import ShowProjectGroup from "./pages/project-groups/show";
import GlobalLibraryPage from "./pages/library/index";
import TermsList from "./pages/terms/list";
import ProfileRequestsList from "./pages/profile-requests/list";
import { TermProvider } from "./contexts/term-context";
import StudyPlanner from "./pages/study-planner";
import TeacherApplicationsList from "./pages/teacher-applications/list";
import ActivityLogPage from "./pages/dashboard/activity-log";
import StudentReportCard from "./pages/student/report-card";
import StudentProgress from "./pages/progress/list";

// PUBLIC PAGES
import LandingPage from "./pages/landing";
import PricingPage from "./pages/pricing";
import { PublicLayout } from "./components/public-ui/layout";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <TermProvider>
          <Refine
            dataProvider={dataProvider}
            authProvider={authProvider}
            routerProvider={routerBindings}
            notificationProvider={useNotificationProvider}
            resources={resources}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              projectId: "classroom-refine",
            }}
          >
            <Routes>
              {/* PUBLIC ROUTES (Outside Authenticated check) */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/pricing" element={<PricingPage />} />
              </Route>

              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/pending-verification"
                element={<PendingVerification />}
              />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* PROTECTED ROUTES */}
              <Route
                element={
                  <Authenticated
                    key="authenticated-layout"
                    fallback={<CatchAllNavigate to="/login" />}
                  >
                    <Layout>
                      <Outlet />
                    </Layout>
                  </Authenticated>
                }
              >
                {/* Changed index route for logged-in users to /dashboard explicitly to avoid collision with Landing */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/messages" element={<MessagesPage />} /> 
                <Route path="/project-groups">
                  <Route index element={<ProjectGroupsPage />} />
                  <Route path="show/:id" element={<ShowProjectGroup />} />
                </Route>
                <Route path="/library" element={<GlobalLibraryPage />} />

                {/* AI */}
                <Route path="/ai-assistant" element={<AiAssistantPage />} />
                <Route path="/ai-study-lab" element={<AiStudyLabPage />} />
                <Route path="/study-planner" element={<StudyPlanner />} />

                {/* CLASSES */}
                <Route path="/classes">
                  <Route index element={<ClassesList />} />
                  <Route path="create" element={<CreateClass />} />
                  <Route path="edit/:id" element={<EditClass />} />
                  <Route path="show/:id" element={<ClassShow />} />
                </Route>

                {/* ASSIGNMENTS */}
                <Route path="/assignments">
                  <Route index element={<AssignmentsList classId="" />} />
                  <Route path="create" element={<CreateAssignment />} />
                  <Route path="show/:id" element={<AssignmentShow />} />
                </Route>

                {/* SUBMISSIONS */}
                <Route path="/submissions">
                  <Route index element={<SubmissionsList />} />
                  <Route path="show/:id" element={<SubmissionShow />} />
                </Route>

                {/* QUIZZES */}
                <Route path="/quizzes">
                  <Route index element={<QuizzesList />} />
                  <Route path="create" element={<CreateQuiz />} />
                  <Route path="show/:id" element={<QuizShow />} />
                </Route>

                {/* OTHERS */}
                <Route path="/attendance" element={<AttendanceList />} />
                <Route path="/enrollments" element={<EnrollmentList />} />
                <Route path="/discussions" element={<DiscussionsList />} />
                <Route path="/modules" element={<ModulesList />} />
                <Route path="/resources" element={<ResourcesList />} />

                {/* ADMIN */}
                <Route path="/users">
                  <Route index element={<UsersList />} />
                  <Route path="create" element={<CreateUser />} />
                  <Route path="edit/:id" element={<EditUser />} />
                  <Route path="show/:id" element={<ShowUser />} />
                </Route>
                <Route path="/departments">
                  <Route index element={<DepartmentsList />} />
                  <Route path="create" element={<CreateDepartment />} />
                  <Route path="edit/:id" element={<EditDepartment />} />
                </Route>
                <Route path="/subjects">
                  <Route index element={<SubjectsList />} />
                  <Route path="create" element={<CreateSubject />} />
                  <Route path="edit/:id" element={<EditSubject />} />
                </Route>
                <Route path="/admin/terms" element={<TermsList />} />
                <Route
                  path="/profile-requests"
                  element={<ProfileRequestsList />}
                />
                <Route
                  path="/teacher-applications"
                  element={<TeacherApplicationsList />}
                />
                <Route path="/activity-log" element={<ActivityLogPage />} />
                <Route
                  path="/student/report-card"
                  element={<StudentReportCard />}
                />
                <Route path="/progress" element={<StudentProgress />} />
              </Route>

              {/* LOGGED IN REDIRECTS: If user is logged in and hits /, take them to dashboard */}
              <Route
                element={
                  <Authenticated
                    key="authenticated-redirect"
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
            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
            <Toaster />
          </Refine>
        </TermProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
