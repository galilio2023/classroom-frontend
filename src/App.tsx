import { Authenticated, CanAccess, Refine } from "@refinedev/core";
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
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import { dataProvider } from "./providers/data";
import { authProvider } from "./providers/auth";
import { accessControlProvider } from "./providers/access-control";
import Dashboard from "@/pages/dashboard.tsx";
import { Home, BookOpen, Building2, Users, Calendar } from "lucide-react";
import { Layout } from "@/components/refine-ui/layout/layout.tsx";
import SubjectsList from "@/pages/subjects/list.tsx";
import SubjectsCreate from "@/pages/subjects/create.tsx";
import SubjectsEdit from "@/pages/subjects/edit.tsx";
import DepartmentsList from "@/pages/departments/list.tsx";
import DepartmentsCreate from "@/pages/departments/create.tsx";
import DepartmentsEdit from "@/pages/departments/edit.tsx";
import UsersList from "@/pages/users/list.tsx";
import UsersCreate from "@/pages/users/create.tsx";
import UsersEdit from "@/pages/users/edit.tsx";
import ClassesList from "@/pages/classes/list.tsx";
import ClassesCreate from "@/pages/classes/create.tsx";
import ClassesEdit from "@/pages/classes/edit.tsx";
import ClassShow from "@/pages/classes/show.tsx";
import LoginPage from "@/pages/auth/login.tsx";
import RegisterPage from "@/pages/auth/register.tsx";
import UnauthorizedPage from "@/pages/unauthorized.tsx"; // Import the new page
import { SidebarProvider } from "@/components/ui/sidebar";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider>
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
              }}
              resources={[
                {
                  name: "dashboard",
                  list: "/",
                  meta: { label: "Home", icon: <Home /> },
                },
                {
                  name: "subjects",
                  list: "/subjects",
                  create: "/subjects/create",
                  edit: "/subjects/edit/:id",
                  meta: { label: "Subjects", icon: <BookOpen /> },
                },
                {
                  name: "departments",
                  list: "/departments",
                  create: "/departments/create",
                  edit: "/departments/edit/:id",
                  meta: { label: "Departments", icon: <Building2 /> },
                },
                {
                  name: "users",
                  list: "/users",
                  create: "/users/create",
                  edit: "/users/edit/:id",
                  meta: { label: "Users", icon: <Users /> },
                },
                {
                  name: "classes",
                  list: "/classes",
                  create: "/classes/create",
                  edit: "/classes/edit/:id",
                  show: "/classes/show/:id",
                  meta: { label: "Classes", icon: <Calendar /> },
                },
              ]}
            >
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
                      <SidebarProvider>
                        <Layout>
                          <Outlet />
                        </Layout>
                      </SidebarProvider>
                    </Authenticated>
                  }
                >
                  <Route
                    index
                    element={
                      <CanAccess resource="dashboard" action="list" fallback={<UnauthorizedPage />}>
                        <Dashboard />
                      </CanAccess>
                    }
                  />
                  <Route path="subjects">
                    <Route index element={<CanAccess resource="subjects" action="list" fallback={<UnauthorizedPage />}><SubjectsList /></CanAccess>} />
                    <Route path="create" element={<CanAccess resource="subjects" action="create" fallback={<UnauthorizedPage />}><SubjectsCreate /></CanAccess>} />
                    <Route path="edit/:id" element={<CanAccess resource="subjects" action="edit" fallback={<UnauthorizedPage />}><SubjectsEdit /></CanAccess>} />
                  </Route>
                  <Route path="departments">
                    <Route index element={<CanAccess resource="departments" action="list" fallback={<UnauthorizedPage />}><DepartmentsList /></CanAccess>} />
                    <Route path="create" element={<CanAccess resource="departments" action="create" fallback={<UnauthorizedPage />}><DepartmentsCreate /></CanAccess>} />
                    <Route path="edit/:id" element={<CanAccess resource="departments" action="edit" fallback={<UnauthorizedPage />}><DepartmentsEdit /></CanAccess>} />
                  </Route>
                  <Route path="users">
                    <Route index element={<CanAccess resource="users" action="list" fallback={<UnauthorizedPage />}><UsersList /></CanAccess>} />
                    <Route path="create" element={<CanAccess resource="users" action="create" fallback={<UnauthorizedPage />}><UsersCreate /></CanAccess>} />
                    <Route path="edit/:id" element={<CanAccess resource="users" action="edit" fallback={<UnauthorizedPage />}><UsersEdit /></CanAccess>} />
                  </Route>
                  <Route path="classes">
                    <Route index element={<CanAccess resource="classes" action="list" fallback={<UnauthorizedPage />}><ClassesList /></CanAccess>} />
                    <Route path="create" element={<CanAccess resource="classes" action="create" fallback={<UnauthorizedPage />}><ClassesCreate /></CanAccess>} />
                    <Route path="edit/:id" element={<CanAccess resource="classes" action="edit" fallback={<UnauthorizedPage />}><ClassesEdit /></CanAccess>} />
                    <Route path="show/:id" element={<CanAccess resource="classes" action="show" fallback={<UnauthorizedPage />}><ClassShow /></CanAccess>} />
                  </Route>
                </Route>
              </Routes>

              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
          </DevtoolsProvider>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
