import { Navigate, createBrowserRouter } from "react-router-dom";
import { Root } from "./components/Base/Root";
import { Login } from "./routes/Login";
import { ProtectedPage } from "./components/Wrappers/ProtectedPage";
import { ContentWrapper } from "./components/Wrappers/ContentWrapper";
import { Dashboard } from "./routes/Dashboard";
import { AdminOnlyPage } from "./components/Wrappers/AdminOnlyPage";
import { ReportsCRUD } from "./components/Pages/Admin/ReportsCRUD";
import { BusinessAreasCRUD } from "./components/Pages/Admin/BusinessAreasCRUD";
import { ServicesCRUD } from "./components/Pages/Admin/ServicesCRUD";
import { DivisionsCRUD } from "./components/Pages/Admin/DivisionsCRUD";
import { LocationsCRUD } from "./components/Pages/Admin/LocationsCRUD";
import { AffiliationsCRUD } from "./components/Pages/Admin/AffiliationsCRUD";
import { AddressesCRUD } from "./components/Pages/Admin/AddressesCRUD";
import { BranchesCRUD } from "./components/Pages/Admin/BranchesCRUD";
import { TestEmailPage } from "./routes/TestEmailPage";
import { UserFeedbackPage } from "./components/Pages/Admin/UserFeedbackPage";
import { Reports } from "./routes/Reports";
import { CurrentReport } from "./routes/CurrentReport";
import { Projects } from "./routes/Projects";
import { CreateProject } from "./routes/CreateProject";
import { ProjectDetail } from "./routes/ProjectDetail";
import { Users } from "./routes/Users";
import { CreateUser } from "./routes/CreateUser";
import { AccountEdit } from "./routes/AccountEdit";
import { LayoutCheckWrapper } from "./components/Wrappers/LayoutCheckWrapper";
import { HowTo } from "./routes/HowTo";
import { Tasks } from "./routes/Tasks";
import { ErrorHandler } from "./routes/ErrorHandler";

export const router = createBrowserRouter([
  // Login
  {
    path: "login",
    element: <Login />,
  },

  {
    path: "/",
    element: (
      <ProtectedPage>
        <Root />
      </ProtectedPage>
    ),
    errorElement: <ErrorHandler />,
    children: [
      // Sidebar Routes
      {
        path: "",
        element: (
          <ContentWrapper>
            <Dashboard />
          </ContentWrapper>
        ),
      },

      // ADMIN
      {
        path: "crud",
        element: (
          <ContentWrapper>
            <Dashboard activeTab={2} />
          </ContentWrapper>
        ),
      },
      {
        path: "crud/reports",
        element: (
          <ContentWrapper>
            <AdminOnlyPage>
              <ReportsCRUD />
            </AdminOnlyPage>
          </ContentWrapper>
        ),
      },
      {
        path: "crud/businessareas",
        element: (
          <ContentWrapper>
            <AdminOnlyPage>
              <BusinessAreasCRUD />
            </AdminOnlyPage>
          </ContentWrapper>
        ),
      },
      {
        path: "crud/services",
        element: (
          <ContentWrapper>
            <AdminOnlyPage>
              <ServicesCRUD />
            </AdminOnlyPage>
          </ContentWrapper>
        ),
      },
      {
        path: "crud/divisions",
        element: (
          <ContentWrapper>
            <AdminOnlyPage>
              <DivisionsCRUD />
            </AdminOnlyPage>
          </ContentWrapper>
        ),
      },
      {
        path: "crud/locations",
        element: (
          <ContentWrapper>
            <AdminOnlyPage>
              <LocationsCRUD />
            </AdminOnlyPage>
          </ContentWrapper>
        ),
      },
      {
        path: "crud/affiliations",
        element: (
          <ContentWrapper>
            <AdminOnlyPage>
              <AffiliationsCRUD />
            </AdminOnlyPage>
          </ContentWrapper>
        ),
      },
      {
        path: "crud/addresses",
        element: (
          <ContentWrapper>
            <AdminOnlyPage>
              <AddressesCRUD />
            </AdminOnlyPage>
          </ContentWrapper>
        ),
      },
      {
        path: "crud/branches",
        element: (
          <ContentWrapper>
            <AdminOnlyPage>
              <BranchesCRUD />
            </AdminOnlyPage>
          </ContentWrapper>
        ),
      },

      {
        path: "crud/emails",
        element: (
          <ContentWrapper>
            <AdminOnlyPage>
              <TestEmailPage />
            </AdminOnlyPage>
          </ContentWrapper>
        ),
      },

      // Feedback
      {
        path: "crud/feedback",
        element: (
          <ContentWrapper>
            <AdminOnlyPage>
              <UserFeedbackPage />
            </AdminOnlyPage>
          </ContentWrapper>
        ),
      },

      // Reports
      {
        path: "reports",

        element: (
          <ContentWrapper>
            <Reports />
          </ContentWrapper>
        ),
      },
      {
        path: "reports/current", // change to :year
        element: (
          <ContentWrapper>
            <CurrentReport />
          </ContentWrapper>
        ),
      },
      // Projects
      {
        path: "projects",
        element: (
          <ContentWrapper>
            <Projects />
          </ContentWrapper>
        ),
      },
      {
        path: "projects/add",
        element: (
          <ContentWrapper>
            <CreateProject />
          </ContentWrapper>
        ),
      },
      {
        path: "projects/:projectPk",
        element: (
          <ContentWrapper>
            <ProjectDetail selectedTab="overview" />
          </ContentWrapper>
        ),
      },
      {
        path: "projects/:projectPk/concept",
        element: (
          <ContentWrapper>
            <ProjectDetail selectedTab="concept" />
          </ContentWrapper>
        ),
      },
      {
        path: "projects/:projectPk/project",
        element: (
          <ContentWrapper>
            <ProjectDetail selectedTab="project" />
          </ContentWrapper>
        ),
      },
      {
        path: "projects/:projectPk/progress",
        element: (
          <ContentWrapper>
            <ProjectDetail selectedTab="progress" />
          </ContentWrapper>
        ),
      },
      {
        path: "projects/:projectPk/student",
        element: (
          <ContentWrapper>
            <ProjectDetail selectedTab="student" />
          </ContentWrapper>
        ),
      },
      {
        path: "projects/:projectPk/closure",
        element: (
          <ContentWrapper>
            <ProjectDetail selectedTab="closure" />
          </ContentWrapper>
        ),
      },
      // Users
      {
        path: "users",
        element: (
          <ContentWrapper>
            <Users />
          </ContentWrapper>
        ),
      },
      {
        path: "users/add",
        element: (
          <ContentWrapper>
            <CreateUser />
          </ContentWrapper>
        ),
      },
      {
        path: "users/me",
        element: (
          <ContentWrapper>
            <AccountEdit />
          </ContentWrapper>
        ),
      },
      // Other
      {
        path: "howto",
        element: (
          <ContentWrapper>
            <LayoutCheckWrapper>
              <HowTo />
            </LayoutCheckWrapper>
          </ContentWrapper>
        ),
      },
      {
        path: "tasks",
        element: (
          <ContentWrapper>
            <LayoutCheckWrapper>
              <Tasks />
            </LayoutCheckWrapper>
          </ContentWrapper>
        ),
      },

      // REDIRECTS
      {
        path: "dashboard",
        element: <Navigate to="/" replace />,
      },
      {
        path: "reports/browse",
        element: <Navigate to="/reports" replace />,
      },
      {
        path: "projects/browse",
        element: <Navigate to="/projects" replace />,
      },
      {
        path: "users/browse",
        element: <Navigate to="/users" replace />,
      },
    ],
  },
]);
