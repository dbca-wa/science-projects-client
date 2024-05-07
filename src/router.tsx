import {
  createRoute,
  createRootRoute,
  createRouter,
  // Navigate,
} from "@tanstack/react-router";
import { Root } from "./components/Base/Root";
import { AddressesCRUD } from "./components/Pages/Admin/AddressesCRUD";
import { AffiliationsCRUD } from "./components/Pages/Admin/AffiliationsCRUD";
import { BranchesCRUD } from "./components/Pages/Admin/BranchesCRUD";
import { BusinessAreasCRUD } from "./components/Pages/Admin/BusinessAreasCRUD";
import { DivisionsCRUD } from "./components/Pages/Admin/DivisionsCRUD";
import { LocationsCRUD } from "./components/Pages/Admin/LocationsCRUD";
import { ReportsCRUD } from "./components/Pages/Admin/ReportsCRUD";
import { ServicesCRUD } from "./components/Pages/Admin/ServicesCRUD";
import { UserFeedbackPage } from "./components/Pages/Admin/UserFeedbackPage";
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
import { Tasks } from "./routes/Tasks";
import { TestEmailPage } from "./routes/TestEmailPage";
import { Users } from "./routes/Users";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

// +++++++++++++++++++++++++++++++++SETUP+++++++++++++++++++++++++++++++++
// Create a new router instance
const rootRoute = createRootRoute({
  component: () => (
    <>
      <ProtectedPage>
        <Root />
      </ProtectedPage>
      <TanStackRouterDevtools />
    </>
  ),
  errorComponent: () => <ErrorHandler />,
});

// +++++++++++++++++++++++++++++++++BASE_ROUTES+++++++++++++++++++++++++++++++++
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "login",
  component: () => <Login />,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <ContentWrapper>
      <Dashboard />
    </ContentWrapper>
  ),
});

// REPORTS-----------------------------------------------------------------------
const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "reports",
  component: () => (
    <ContentWrapper>
      <Reports />
    </ContentWrapper>
  ),
});

const currentReportRoute = createRoute({
  getParentRoute: () => reportsRoute,
  path: "current",
  component: () => (
    <ContentWrapper>
      <CurrentReport />
    </ContentWrapper>
  ),
});
// PROJECTS-----------------------------------------------------------------------
const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "projects",
  component: () => (
    <ContentWrapper>
      <Projects />
    </ContentWrapper>
  ),
});

const addProjectRoute = createRoute({
  getParentRoute: () => projectsRoute,
  path: "add",
  component: () => (
    <ContentWrapper>
      <CreateProject />
    </ContentWrapper>
  ),
});

const projectDetailRoute = createRoute({
  getParentRoute: () => projectsRoute,
  path: "$projectPk",
  component: () => (
    <ContentWrapper>
      <ProjectDetail selectedTab="overview" />
    </ContentWrapper>
  ),
});

const projectDetailConceptPlanRoute = createRoute({
  getParentRoute: () => projectDetailRoute,
  path: "concept",
  component: () => (
    <ContentWrapper>
      <ProjectDetail selectedTab="concept" />
    </ContentWrapper>
  ),
});

const projectDetailProjectPlanRoute = createRoute({
  getParentRoute: () => projectDetailRoute,
  path: "project",
  component: () => (
    <ContentWrapper>
      <ProjectDetail selectedTab="project" />
    </ContentWrapper>
  ),
});

const projectDetailProgressReportRoute = createRoute({
  getParentRoute: () => projectDetailRoute,
  path: "progress",
  component: () => (
    <ContentWrapper>
      <ProjectDetail selectedTab="progress" />
    </ContentWrapper>
  ),
});

const projectDetailStudentReportRoute = createRoute({
  getParentRoute: () => projectDetailRoute,
  path: "student",
  component: () => (
    <ContentWrapper>
      <ProjectDetail selectedTab="student" />
    </ContentWrapper>
  ),
});

const projectDetailClosureRoute = createRoute({
  getParentRoute: () => projectDetailRoute,
  path: "closure",
  component: () => (
    <ContentWrapper>
      <ProjectDetail selectedTab="closure" />
    </ContentWrapper>
  ),
});

// USERS-----------------------------------------------------------------------
const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "users",
  component: () => (
    <ContentWrapper>
      <Users />
    </ContentWrapper>
  ),
});

const userAddRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: "add",
  component: () => (
    <ContentWrapper>
      <CreateUser />
    </ContentWrapper>
  ),
});

const userMyAccountRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: "me",
  component: () => (
    <ContentWrapper>
      <AccountEdit />
    </ContentWrapper>
  ),
});

// HOWTO-----------------------------------------------------------------------
const howtoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "howto",
  component: () => (
    <ContentWrapper>
      <LayoutCheckWrapper>
        <HowTo />
      </LayoutCheckWrapper>
    </ContentWrapper>
  ),
});

// TASKS-----------------------------------------------------------------------
const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "tasks",
  component: () => (
    <ContentWrapper>
      <LayoutCheckWrapper>
        <Tasks />
      </LayoutCheckWrapper>
    </ContentWrapper>
  ),
});

// +++++++++++++++++++++++++++++++++ADMIN_ROUTES+++++++++++++++++++++++++++++++++
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crud",
  component: () => (
    <ContentWrapper>
      <Dashboard activeTab={2} />
    </ContentWrapper>
  ),
});

const reportsAdminRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "reports",
  component: () => (
    <ContentWrapper>
      <AdminOnlyPage>
        <ReportsCRUD />
      </AdminOnlyPage>
    </ContentWrapper>
  ),
});

const businessAreasAdminRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "businessareas",
  component: () => (
    <ContentWrapper>
      <AdminOnlyPage>
        <BusinessAreasCRUD />
      </AdminOnlyPage>
    </ContentWrapper>
  ),
});

const servicesAdminRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "services",
  component: () => (
    <ContentWrapper>
      <AdminOnlyPage>
        <ServicesCRUD />
      </AdminOnlyPage>
    </ContentWrapper>
  ),
});

const divisionsAdminRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "divisions",
  component: () => (
    <ContentWrapper>
      <AdminOnlyPage>
        <DivisionsCRUD />
      </AdminOnlyPage>
    </ContentWrapper>
  ),
});

const locationsAdminRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "locations",
  component: () => (
    <ContentWrapper>
      <AdminOnlyPage>
        <LocationsCRUD />
      </AdminOnlyPage>
    </ContentWrapper>
  ),
});

const affiliationsAdminRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "affiliations",
  component: () => (
    <ContentWrapper>
      <AdminOnlyPage>
        <AffiliationsCRUD />
      </AdminOnlyPage>
    </ContentWrapper>
  ),
});

const addressesAdminRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "addresses",
  component: () => (
    <ContentWrapper>
      <AdminOnlyPage>
        <AddressesCRUD />
      </AdminOnlyPage>
    </ContentWrapper>
  ),
});

const branchesAdminRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "branches",
  component: () => (
    <ContentWrapper>
      <AdminOnlyPage>
        <BranchesCRUD />
      </AdminOnlyPage>
    </ContentWrapper>
  ),
});

const emailAdminRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "emails",
  component: () => (
    <ContentWrapper>
      <AdminOnlyPage>
        <TestEmailPage />
      </AdminOnlyPage>
    </ContentWrapper>
  ),
});

const feedbackAdminRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "feedback",
  component: () => (
    <ContentWrapper>
      <AdminOnlyPage>
        <UserFeedbackPage />
      </AdminOnlyPage>
    </ContentWrapper>
  ),
});

// +++++++++++++++++++++++++++++++++REDIRECTS+++++++++++++++++++++++++++++++++

// const dashReroute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: "dashboard",
//   component: () => {
//     <Navigate to={homeRoute} />;
//   },
// });

// const reportsBrowseReroute = createRoute({
//   getParentRoute: () => reportsRoute,
//   path: "browse",
//   component: () => {
//     <Navigate to={reportsRoute} />;
//   },
// });

// const projectsBrowseReroute = createRoute({
//   getParentRoute: () => projectsRoute,
//   path: "browse",
//   component: () => {
//     <Navigate to={projectsRoute} />;
//   },
// });

// const usersBrowseReroute = createRoute({
//   getParentRoute: () => usersRoute,
//   path: "browse",
//   component: () => {
//     <Navigate to={usersRoute} />;
//   },
// });

// TANSTACK ROUTER CONFIG=========================================

// Add to route tree
export const routeTree = rootRoute.addChildren([
  loginRoute,
  homeRoute,
  reportsRoute.addChildren([currentReportRoute]),
  projectsRoute.addChildren([addProjectRoute]),
  projectDetailRoute.addChildren([
    projectDetailConceptPlanRoute,
    projectDetailProjectPlanRoute,
    projectDetailProgressReportRoute,
    projectDetailStudentReportRoute,
    projectDetailClosureRoute,
  ]),
  usersRoute.addChildren([userAddRoute, userMyAccountRoute]),
  adminRoute.addChildren([
    reportsAdminRoute,
    businessAreasAdminRoute,
    servicesAdminRoute,
    divisionsAdminRoute,
    locationsAdminRoute,
    affiliationsAdminRoute,
    addressesAdminRoute,
    branchesAdminRoute,
    emailAdminRoute,
    feedbackAdminRoute,
  ]),
  howtoRoute,
  tasksRoute,
  // dashReroute,
  // reportsBrowseReroute,
  // projectsBrowseReroute,
  // usersBrowseReroute,
]);

// Create Router
export const router = createRouter({
  routeTree,
  // defaultPreload: "intent",
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
