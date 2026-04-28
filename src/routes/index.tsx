import React, { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Authenticated } from "@refinedev/core";
import { CatchAllNavigate, NavigateToResource } from "@refinedev/react-router";
import { Outlet, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/refine/layout/layout";
import { AuthorizedRoute } from "@/components/guards/authorized-route";
import { VerificationGuard } from "@/components/guards/verification-guard";
import { SocketProvider } from "@/contexts/socket-context";
import { TermProvider } from "@/contexts/term-context";
import { JobProvider } from "@/contexts/job-context";
import { Loader2 } from "lucide-react";

// Lazy Load Pages
const Dashboard = React.lazy(() => import("@/features/dashboard/pages/index"));
const LoginPage = React.lazy(() => import("@/features/auth/pages/login"));
const RegisterPage = React.lazy(() => import("@/features/auth/pages/register"));
const PendingVerification = React.lazy(() => import("@/features/auth/pages/pending-verification"));
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

const SubmissionsList = React.lazy(
  () => import("@/features/assignments/pages/submissions/list-page")
);
const SubmissionShow = React.lazy(() => import("@/features/assignments/pages/submissions/show"));

const AttendanceList = React.lazy(() => import("@/features/attendance/pages/list"));
const EnrollmentList = React.lazy(() => import("@/features/classes/pages/enrollments/list"));
const DiscussionsList = React.lazy(() => import("@/features/engagement/pages/discussions/list"));
const AnnouncementsList = React.lazy(
  () => import("@/features/engagement/pages/announcements/list")
);
const CreateAnnouncement = React.lazy(
  () => import("@/features/engagement/pages/announcements/create")
);
const CalendarPage = React.lazy(() => import("@/features/engagement/pages/calendar"));
const NotificationsPage = React.lazy(
  () => import("@/features/engagement/pages/notifications/list")
);

const QuizzesList = React.lazy(() => import("@/features/quizzes/pages/list"));
const CreateQuiz = React.lazy(() => import("@/features/quizzes/pages/create"));
const QuizShow = React.lazy(() => import("@/features/quizzes/pages/show"));

const ModulesList = React.lazy(() => import("@/features/classes/pages/modules/list"));
const ResourcesList = React.lazy(() => import("@/features/classes/pages/resources/list"));

const DepartmentsList = React.lazy(() => import("@/features/academic/pages/departments/list"));
const CreateDepartment = React.lazy(() => import("@/features/academic/pages/departments/create"));
const EditDepartment = React.lazy(() => import("@/features/academic/pages/departments/edit"));

const SubjectsList = React.lazy(() => import("@/features/academic/pages/subjects/list"));
const CreateSubject = React.lazy(() => import("@/features/academic/pages/subjects/create"));
const EditSubject = React.lazy(() => import("@/features/academic/pages/subjects/edit"));

const TermsList = React.lazy(() => import("@/features/academic/pages/terms/list"));
const AiAssistantPage = React.lazy(() => import("@/features/ai/pages/ai-assistant"));
const AiStudyLabPage = React.lazy(() => import("@/features/ai/pages/ai-study-lab"));
const MemoryLabPage = React.lazy(() => import("@/features/ai/pages/memory-lab"));
const AiHistoryList = React.lazy(() => import("@/features/ai/pages/history-list"));
const AiHistoryShow = React.lazy(() => import("@/features/ai/pages/history-show"));
const MessagesPage = React.lazy(() => import("@/features/engagement/pages/messages/index"));
const ProjectGroupsPage = React.lazy(
  () => import("@/features/engagement/pages/project-groups/index")
);
const ShowProjectGroup = React.lazy(
  () => import("@/features/engagement/pages/project-groups/show")
);
const GlobalLibraryPage = React.lazy(() => import("@/features/academic/pages/library/index"));
const ProfileRequestsList = React.lazy(
  () => import("@/features/users/pages/profile-requests/list")
);
const StudyPlanner = React.lazy(() => import("@/features/ai/pages/study-planner"));
const StudentPersonaSettings = React.lazy(
  () => import("@/features/users/pages/student/persona-settings")
);
const PeerReviewBoard = React.lazy(() => import("@/features/assignments/pages/peer-review-board"));
const TeacherApplicationsList = React.lazy(
  () => import("@/features/users/pages/teacher-applications/list")
);
const BadgesList = React.lazy(() => import("@/features/users/pages/badges/list"));
const CreateBadge = React.lazy(() => import("@/features/users/pages/badges/create"));
const ActivityLogPage = React.lazy(() => import("@/features/dashboard/pages/activity-log"));
const SchoolAdminDashboard = React.lazy(() => import("@/features/schools/pages/dashboard"));
const AIGovernanceList = React.lazy(() => import("@/features/ai/pages/ai-governance-list"));
const PendingApprovals = React.lazy(() => import("@/features/ai/pages/pending-approvals"));
const AIMetrics = React.lazy(() => import("@/features/ai/pages/ai-metrics"));
const AdminImportPage = React.lazy(() => import("@/features/schools/pages/import"));
const ApprovalsPage = React.lazy(() => import("@/features/schools/pages/approvals"));

// FEATURE: ACADEMIC
const AcademicYearsList = React.lazy(() => import("@/features/academic/pages/years/list"));
const AcademicYearPlannerPage = React.lazy(
  () => import("@/features/academic/pages/years/AcademicYearPlanner")
);
const DeptSemesterPlannerPage = React.lazy(
  () => import("@/features/academic/pages/departments/DeptSemesterPlanner")
);
const BellSchedulePage = React.lazy(
  () => import("@/features/academic/pages/timetable/bell-schedule")
);
const TeacherSchedulePage = React.lazy(
  () => import("@/features/academic/pages/timetable/teacher-schedule")
);
const LecturerWeeklySchedulePage = React.lazy(
  () => import("@/features/academic/pages/timetable/lecturer-schedule-view")
);
const ExamSchedulePage = React.lazy(
  () => import("@/features/academic/pages/timetable/exam-schedule")
);
const LectureSchedulePage = React.lazy(
  () => import("@/features/academic/pages/timetable/lecture-schedule")
);

// FEATURE: ONBOARDING
const SelectSuitePage = React.lazy(() => import("@/features/onboarding/pages/SelectSuitePage"));

const StudentReportCard = React.lazy(() => import("@/features/users/pages/student/report-card"));
const StudentProgress = React.lazy(() => import("@/features/users/pages/progress/list"));
const TeacherChannelPage = React.lazy(() => import("@/features/users/pages/teacher-channel/index"));
const StudentPortfolio = React.lazy(() => import("@/features/users/pages/portfolio"));
const SettingsEditPage = React.lazy(() => import("@/features/users/pages/settings/edit"));
const MonetizationSettings = React.lazy(
  () => import("@/features/users/pages/settings/monetization")
);

const TeacherSubscriptionsList = React.lazy(
  () => import("@/features/users/pages/teacher-subscriptions/list")
);
const MyTeachersList = React.lazy(() => import("@/features/users/pages/my-teachers/list"));
const DiscoveryPage = React.lazy(() => import("@/features/academic/pages/discovery/index"));
const PublicClassesPage = React.lazy(
  () => import("@/features/academic/pages/discovery/classes-list")
);
const PublicClassPreview = React.lazy(() =>
  import("@/features/academic/pages/discovery/class-preview").then((m) => ({
    default: m.PublicClassPreview,
  }))
);

const ParentDashboard = React.lazy(() =>
  import("@/features/parents/pages/dashboard").then((m) => ({ default: m.ParentDashboard }))
);
const ChildRiskReport = React.lazy(() =>
  import("@/features/parents/pages/child-risk-report").then((m) => ({ default: m.ChildRiskReport }))
);

const LandingPage = React.lazy(() => import("@/pages/landing"));
const PricingPage = React.lazy(() => import("@/pages/pricing"));
const PublicLayout = React.lazy(() =>
  import("@/features/engagement/components/layout").then((m) => ({
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

import { useCapabilities } from "@/hooks/use-capabilities";
import { OnboardingGuard } from "@/features/onboarding/components/onboarding-guard";

export const AppRouter = () => {
  const { isSchoolMode, isFacultyMode, isStaff, isAdmin } = useCapabilities();
  const isInstitutional = isSchoolMode || isFacultyMode;

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/discovery">
            <Route index element={<DiscoveryPage />} />
            <Route path="classes">
              <Route index element={<PublicClassesPage />} />
              <Route path=":id" element={<PublicClassPreview />} />
            </Route>
          </Route>
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
              <JobProvider>
                <SocketProvider>
                  <TermProvider>
                    <Outlet />
                  </TermProvider>
                </SocketProvider>
              </JobProvider>
            </Authenticated>
          }
        >
          <Route path="/onboarding/select-suite" element={<SelectSuitePage />} />
          <Route path="/pending-verification" element={<PendingVerification />} />
          <Route
            element={
              <OnboardingGuard>
                <VerificationGuard>
                  <Layout>
                    <Outlet />
                  </Layout>
                </VerificationGuard>
              </OnboardingGuard>
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
              path="/school/dashboard"
              element={
                <AuthorizedRoute resource="school-dashboard" action="list">
                  <SchoolAdminDashboard />
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
              path="/memory-lab"
              element={
                <AuthorizedRoute resource="memory-lab" action="list">
                  <MemoryLabPage />
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
            <Route
              path="/ai-personalization"
              element={
                <AuthorizedRoute resource="portfolio" action="edit">
                  <StudentPersonaSettings />
                </AuthorizedRoute>
              }
            />
            <Route
              path="/peer-reviews"
              element={
                <AuthorizedRoute resource="peer-reviews" action="list">
                  <PeerReviewBoard />
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
                <AuthorizedRoute resource="my-classes" action="list">
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
            <Route path="/announcements">
              <Route
                index
                element={
                  <AuthorizedRoute resource="announcements" action="list">
                    <AnnouncementsList />
                  </AuthorizedRoute>
                }
              />
              <Route
                path="create"
                element={
                  <AuthorizedRoute resource="announcements" action="create">
                    <CreateAnnouncement />
                  </AuthorizedRoute>
                }
              />
            </Route>
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
              path="/followed-teachers"
              element={
                <AuthorizedRoute resource="my-classes" action="list">
                  <TeacherSubscriptionsList />
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

            {/* INSTITUTIONAL (School/Faculty Mode Only) */}
            {isInstitutional ? (
              <>
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
                    path="planner"
                    element={
                      <AuthorizedRoute resource="departments" action="list">
                        <DeptSemesterPlannerPage />
                      </AuthorizedRoute>
                    }
                  />{" "}
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
                  path="/academic-years"
                  element={
                    <AuthorizedRoute resource="academic-years" action="list">
                      <AcademicYearsList />
                    </AuthorizedRoute>
                  }
                />
                <Route
                  path="/academic-years/planner"
                  element={
                    <AuthorizedRoute resource="academic-years" action="list">
                      <AcademicYearPlannerPage />
                    </AuthorizedRoute>
                  }
                />
                <Route
                  path="/timetable/bell"
                  element={
                    <AuthorizedRoute resource="timetable" action="list">
                      <BellSchedulePage />
                    </AuthorizedRoute>
                  }
                />
                <Route
                  path="/timetable/teacher"
                  element={
                    <AuthorizedRoute resource="timetable" action="list">
                      <TeacherSchedulePage />
                    </AuthorizedRoute>
                  }
                />
                <Route
                  path="/timetable/lecture"
                  element={
                    <AuthorizedRoute resource="timetable" action="list">
                      <LectureSchedulePage />
                    </AuthorizedRoute>
                  }
                />
                <Route
                  path="/timetable/lecturer-weekly"
                  element={
                    <AuthorizedRoute resource="timetable" action="list">
                      <LecturerWeeklySchedulePage />
                    </AuthorizedRoute>
                  }
                />
                <Route
                  path="/timetable/exam"
                  element={
                    <AuthorizedRoute resource="timetable" action="list">
                      <ExamSchedulePage />
                    </AuthorizedRoute>
                  }
                />
                <Route
                  path="/academic-terms"
                  element={
                    <AuthorizedRoute resource="academic-terms" action="list">
                      <TermsList />
                    </AuthorizedRoute>
                  }
                />
                <Route
                  path="/admin/import"
                  element={
                    <AuthorizedRoute resource="admin-import" action="list">
                      <AdminImportPage />
                    </AuthorizedRoute>
                  }
                />
                <Route
                  path="/admin/approvals"
                  element={
                    <AuthorizedRoute resource="admin-approvals" action="list">
                      <ApprovalsPage />
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
                  path="/ai-metrics"
                  element={
                    <AuthorizedRoute resource="ai-metrics" action="list">
                      <AIMetrics />
                    </AuthorizedRoute>
                  }
                />
              </>
            ) : (
              <>
                <Route path="/departments" element={<CatchAllNavigate to="/dashboard" />} />
                <Route path="/subjects" element={<CatchAllNavigate to="/dashboard" />} />
                <Route path="/terms" element={<CatchAllNavigate to="/dashboard" />} />
                <Route path="/admin/import" element={<CatchAllNavigate to="/dashboard" />} />
                <Route path="/admin/approvals" element={<CatchAllNavigate to="/dashboard" />} />
                <Route path="/ai-governance" element={<CatchAllNavigate to="/dashboard" />} />
                <Route path="/ai-metrics" element={<CatchAllNavigate to="/dashboard" />} />
              </>
            )}
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

            <Route
              path="/parent/dashboard"
              element={
                <AuthorizedRoute resource="guardian-portal" action="list">
                  <ParentDashboard />
                </AuthorizedRoute>
              }
            />
            <Route
              path="/parent/child/:id"
              element={
                <AuthorizedRoute resource="guardian-portal" action="show">
                  <ChildRiskReport />
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
            <Route
              path="/settings/monetization"
              element={
                <AuthorizedRoute resource="settings" action="edit">
                  <MonetizationSettings />
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
};
