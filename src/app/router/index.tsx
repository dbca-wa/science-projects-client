import { Navigate, createBrowserRouter } from "react-router-dom";

// Layouts, Guards & Boundaries =====================================================

import { ErrorHandler } from "@/shared/components/Base/ErrorHandler";
import { Root } from "@/shared/components/Base/Root";
import { ScienceStaffLayout } from "@/shared/components/StaffProfiles/ScienceStaffLayout";
import { AdminOnlyPage } from "@/shared/components/Wrappers/AdminOnlyPage";
import { ContentWrapper } from "@/shared/components/Wrappers/ContentWrapper";
import { LayoutCheckWrapper } from "@/shared/components/Wrappers/LayoutCheckWrapper";
import { ProtectedPage } from "@/shared/components/Wrappers/ProtectedPage";

// Pages ===========================================================================

// Admin
import { AddressesCRUD } from "@/pages/admin/AddressesCRUD";
import { AdminDataLists } from "@/pages/admin/AdminDataLists";
import { AffiliationsCRUD } from "@/pages/admin/AffiliationsCRUD";
import { BranchesCRUD } from "@/pages/admin/BranchesCRUD";
import { BusinessAreasCRUD } from "@/pages/admin/BusinessAreasCRUD";
import { DivisionsCRUD } from "@/pages/admin/DivisionsCRUD";
import { LocationsCRUD } from "@/pages/admin/LocationsCRUD";
import PatchNotesPage from "@/pages/admin/PatchNotesPage";
import { ReportsCRUD } from "@/pages/admin/ReportsCRUD";
import { ServicesCRUD } from "@/pages/admin/ServicesCRUD";

// Auth
import { Login } from "@/pages/auth/Login";

// Business Area
import { MyBusinessArea } from "@/pages/business-area/MyBusinessArea";

// Dash
import { Dashboard } from "@/pages/dash/Dashboard";
import { HowTo } from "@/pages/dash/HowTo";
import { UserGuide } from "@/pages/dash/UserGuide";

// Errors
import ErrorPage from "@/shared/components/Base/ErrorPage";

// Projects
import { CreateProject } from "@/pages/projects/CreateProject";
import { ProjectDetail } from "@/pages/projects/ProjectDetail";
import { Projects } from "@/pages/projects/Projects";
import ProjectsMap from "@/pages/projects/ProjectsMap";

// Reports
import { CurrentReport } from "@/pages/reports/CurrentReport";
import { Reports } from "@/pages/reports/Reports";

// Staff Profile
import { ScienceStaff } from "@/pages/staff-profile/ScienceStaff";
import ScienceStaffDetail from "@/pages/staff-profile/ScienceStaffDetail";

// Users
import { AccountEdit } from "@/pages/users/AccountEdit";
import { CreateUser } from "@/pages/users/CreateUser";
import { Users } from "@/pages/users/Users";

// Test
import { TestEmailPage } from "@/pages/test/TestEmailPage";
import { TestPlayground } from "@/pages/test/TestPlayground";

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

      {
        path: "patchnotes",
        element: (
          <ContentWrapper>
            <PatchNotesPage />
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
  // {
  //   future: {
  //     v7_fetcherPersist: true,
  //     v7_relativeSplatPath: true,
  //   },
  // },
);
