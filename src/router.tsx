import { Navigate, createBrowserRouter } from "react-router-dom";
import { Root } from "./components/Base/Root";
import { AddressesCRUD } from "./components/Pages/Admin/AddressesCRUD";
import { AdminDataLists } from "./components/Pages/Admin/AdminDataLists";
import { AffiliationsCRUD } from "./components/Pages/Admin/AffiliationsCRUD";
import { BranchesCRUD } from "./components/Pages/Admin/BranchesCRUD";
import { BusinessAreasCRUD } from "./components/Pages/Admin/BusinessAreasCRUD";
import { DivisionsCRUD } from "./components/Pages/Admin/DivisionsCRUD";
import { LocationsCRUD } from "./components/Pages/Admin/LocationsCRUD";
import { ReportsCRUD } from "./components/Pages/Admin/ReportsCRUD";
import { ServicesCRUD } from "./components/Pages/Admin/ServicesCRUD";
import { MyBusinessArea } from "./components/Pages/MyBusinessArea/MyBusinessArea";
import { UserGuide } from "./components/Pages/UserGuide/UserGuide";
import { AdminOnlyPage } from "./components/Wrappers/AdminOnlyPage";
import { ContentWrapper } from "./components/Wrappers/ContentWrapper";
import { LayoutCheckWrapper } from "./components/Wrappers/LayoutCheckWrapper";
import { ProtectedPage } from "./components/Wrappers/ProtectedPage";
import { AccountEdit } from "./routes/AccountEdit";
import { CreateProject } from "./routes/CreateProject";
import { CreateUser } from "./routes/CreateUser";
import { CurrentReport } from "./routes/CurrentReport";
import { Dashboard } from "./routes/Dashboard";
import { ErrorHandler } from "./routes/ErrorHandler";
import { HowTo } from "./routes/HowTo";
import { Login } from "./routes/Login";
import { ProjectDetail } from "./routes/ProjectDetail";
import { Projects } from "./routes/Projects";
import { Reports } from "./routes/Reports";
import { ScienceStaff } from "./routes/ScienceStaff";
import ScienceStaffDetail from "./routes/ScienceStaffDetail";
import { TestEmailPage } from "./routes/TestEmailPage";
import { TestPlayground } from "./routes/TestPlayground";
import { Users } from "./routes/Users";
import { ScienceStaffLayout } from "./components/StaffProfiles/ScienceStaffLayout";
import { error } from "console";
import ProjectsMap from "./routes/ProjectsMap";
import ErrorBoundary from "./components/Base/ErrorBoundary";
import ErrorPage from "./components/Base/ErrorPage";

const inAppRouteArray = [
  // Login
  {
    path: "login",
    element: <Login />,
  },

  {
    path: "projects/map",
    element: <ProjectsMap />,
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

      {
        path: "my_business_area",
        element: (
          <ContentWrapper>
            <MyBusinessArea />
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
        path: "crud/test",
        element: (
          <ContentWrapper>
            <AdminOnlyPage>
              <TestPlayground />
            </AdminOnlyPage>
          </ContentWrapper>
        ),
      },
      {
        path: "crud/data",
        element: (
          <ContentWrapper>
            <AdminOnlyPage>
              <AdminDataLists />
            </AdminOnlyPage>
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
            <AdminOnlyPage>
              <CurrentReport />
            </AdminOnlyPage>
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
        path: "projects/:projectPk/overview",
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
        path: "guide",
        element: (
          <ContentWrapper>
            <UserGuide />
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
];

const staffProfilesAppArray = [
  {
    path: "/staff",
    element: (
      <ScienceStaffLayout>
        <ScienceStaff />
      </ScienceStaffLayout>
    ),
    // errorElement: <ErrorHandler />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/staff/:staffProfilePk",
    element: (
      <ScienceStaffLayout>
        <ScienceStaffDetail />
      </ScienceStaffLayout>
    ),
    errorElement: <ErrorPage />,
  },
];

export const router = createBrowserRouter(
  [...inAppRouteArray, ...staffProfilesAppArray],
  {
    future: {
      v7_fetcherPersist: true,
      v7_relativeSplatPath: true,
    },
  },
);
