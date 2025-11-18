import { type ReactNode, type ComponentType, createElement } from "react";
import { type RouteObject } from "react-router-dom";

// Icons
import {
  AiOutlineFundProjectionScreen,
} from "react-icons/ai";
import { FaBookBookmark, FaUsers } from "react-icons/fa6";
import { FiUserPlus } from "react-icons/fi";
import { HiDocumentDuplicate } from "react-icons/hi";
import { HiMiniSquares2X2 } from "react-icons/hi2";
import { ImUsers } from "react-icons/im";
import { MdOutlineAccessTimeFilled } from "react-icons/md";
import { PiBookOpenTextFill } from "react-icons/pi";
import { RiAdminFill } from "react-icons/ri";
import { SiReadthedocs } from "react-icons/si";
import { TbLayoutGridAdd } from "react-icons/tb";

// Page Components
import { Dashboard } from "@/pages/dash/Dashboard";
import { HowTo } from "@/pages/dash/HowTo";
import { UserGuide } from "@/pages/dash/UserGuide";
import { Projects } from "@/pages/projects/Projects";
import { CreateProject } from "@/pages/projects/CreateProject";
import { ProjectDetail } from "@/pages/projects/ProjectDetail";
import ProjectsMap from "@/pages/projects/ProjectsMap";
import { Users } from "@/pages/users/Users";
import { CreateUser } from "@/pages/users/CreateUser";
import { AccountEdit } from "@/pages/users/AccountEdit";
import { Reports } from "@/pages/reports/Reports";
import { CurrentReport } from "@/pages/reports/CurrentReport";
import { MyBusinessArea } from "@/pages/business-area/MyBusinessArea";
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
import { ScienceStaff } from "@/pages/staff-profile/ScienceStaff";
import ScienceStaffDetail from "@/pages/staff-profile/ScienceStaffDetail";
import { TestEmailPage } from "@/pages/test/TestEmailPage";
import { TestPlayground } from "@/pages/test/TestPlayground";
import { Login } from "@/features/auth/components/Login";

/**
 * Route configuration interface matching Cannabis pattern
 */
export interface RouteConfig {
  /** Display name for the route */
  name: string;
  /** URL path for the route */
  path: string;
  /** Icon component for inactive state */
  icon: ReactNode;
  /** Icon component for active state */
  activeIcon?: ReactNode;
  /** Tooltip content to display on hover */
  tooltipContent?: ReactNode;
  /** Whether this route is only accessible to admins */
  adminOnly: boolean;
  /** Whether this route should appear in the sidebar navigation */
  showInSidebar: boolean;
  /** Section grouping for sidebar (e.g., "Projects", "Users") */
  section?: string;
  /** Page component (not lazy-loaded in config, will be lazy-loaded in router) */
  component: ComponentType<any>;
  /** Child routes */
  children?: RouteConfig[];
  /** Whether this route requires authentication */
  requiresAuth?: boolean;
  /** Custom wrapper component (e.g., AdminOnlyPage, LayoutCheckWrapper) */
  wrapper?: "admin" | "layoutCheck" | "staffProfile";
  /** Props to pass to the component */
  componentProps?: Record<string, any>;
}

/**
 * Centralized route configuration for SPMS application
 * Following Cannabis pattern for maintainability and type safety
 */
export const ROUTES_CONFIG: RouteConfig[] = [
  // Dashboard / Home
  {
    name: "Dashboard",
    path: "/",
    icon: <HiMiniSquares2X2 />,
    tooltipContent: <p>View your dashboard</p>,
    adminOnly: false,
    showInSidebar: false, // Home button is separate in sidebar
    requiresAuth: true,
    component: Dashboard,
  },

  // Projects
  {
    name: "Projects",
    path: "/projects",
    icon: <AiOutlineFundProjectionScreen />,
    activeIcon: <HiMiniSquares2X2 />,
    tooltipContent: <p>Manage science projects</p>,
    adminOnly: false,
    showInSidebar: true,
    section: "Projects",
    requiresAuth: true,
    component: Projects,
    children: [
      {
        name: "Add Project",
        path: "/projects/add",
        icon: <TbLayoutGridAdd />,
        tooltipContent: <p>Create a new project</p>,
        adminOnly: false,
        showInSidebar: true,
        requiresAuth: true,
        component: CreateProject,
      },
      {
        name: "Project Map",
        path: "/projects/map",
        icon: <HiMiniSquares2X2 />,
        tooltipContent: <p>View projects on map</p>,
        adminOnly: false,
        showInSidebar: false,
        requiresAuth: true,
        component: ProjectsMap,
      },
      {
        name: "Project Detail",
        path: "/projects/:projectPk/overview",
        icon: <HiMiniSquares2X2 />,
        adminOnly: false,
        showInSidebar: false,
        requiresAuth: true,
        component: ProjectDetail,
        componentProps: { selectedTab: "overview" },
      },
      {
        name: "Project Concept",
        path: "/projects/:projectPk/concept",
        icon: <HiMiniSquares2X2 />,
        adminOnly: false,
        showInSidebar: false,
        requiresAuth: true,
        component: ProjectDetail,
        componentProps: { selectedTab: "concept" },
      },
      {
        name: "Project Plan",
        path: "/projects/:projectPk/project",
        icon: <HiMiniSquares2X2 />,
        adminOnly: false,
        showInSidebar: false,
        requiresAuth: true,
        component: ProjectDetail,
        componentProps: { selectedTab: "project" },
      },
      {
        name: "Project Progress",
        path: "/projects/:projectPk/progress",
        icon: <HiMiniSquares2X2 />,
        adminOnly: false,
        showInSidebar: false,
        requiresAuth: true,
        component: ProjectDetail,
        componentProps: { selectedTab: "progress" },
      },
      {
        name: "Project Student",
        path: "/projects/:projectPk/student",
        icon: <HiMiniSquares2X2 />,
        adminOnly: false,
        showInSidebar: false,
        requiresAuth: true,
        component: ProjectDetail,
        componentProps: { selectedTab: "student" },
      },
      {
        name: "Project Closure",
        path: "/projects/:projectPk/closure",
        icon: <HiMiniSquares2X2 />,
        adminOnly: false,
        showInSidebar: false,
        requiresAuth: true,
        component: ProjectDetail,
        componentProps: { selectedTab: "closure" },
      },
    ],
  },

  // Users
  {
    name: "Users",
    path: "/users",
    icon: <ImUsers />,
    activeIcon: <FaUsers />,
    tooltipContent: <p>Manage users</p>,
    adminOnly: false,
    showInSidebar: true,
    section: "Users",
    requiresAuth: true,
    component: Users,
    children: [
      {
        name: "Add User",
        path: "/users/add",
        icon: <FiUserPlus />,
        tooltipContent: <p>Create a new user</p>,
        adminOnly: false,
        showInSidebar: true,
        requiresAuth: true,
        component: CreateUser,
      },
      {
        name: "My Account",
        path: "/users/me",
        icon: <ImUsers />,
        tooltipContent: <p>Edit your account</p>,
        adminOnly: false,
        showInSidebar: false,
        requiresAuth: true,
        component: AccountEdit,
      },
    ],
  },

  // Reports
  {
    name: "Reports",
    path: "/reports",
    icon: <HiDocumentDuplicate />,
    activeIcon: <PiBookOpenTextFill />,
    tooltipContent: <p>View and manage reports</p>,
    adminOnly: false,
    showInSidebar: true,
    section: "ARAR",
    requiresAuth: true,
    component: Reports,
    children: [
      {
        name: "Latest Report",
        path: "/reports/current",
        icon: <MdOutlineAccessTimeFilled />,
        tooltipContent: <p>View current annual report</p>,
        adminOnly: true,
        showInSidebar: true,
        section: "ARAR",
        requiresAuth: true,
        wrapper: "admin",
        component: CurrentReport,
      },
    ],
  },

  // Business Area
  {
    name: "My Business Area",
    path: "/my_business_area",
    icon: <HiMiniSquares2X2 />,
    tooltipContent: <p>Manage your business area</p>,
    adminOnly: false,
    showInSidebar: false,
    requiresAuth: true,
    component: MyBusinessArea,
  },

  // Guide
  {
    name: "Quick Guide",
    path: "/guide",
    icon: <SiReadthedocs />,
    activeIcon: <FaBookBookmark />,
    tooltipContent: <p>User guide and documentation</p>,
    adminOnly: false,
    showInSidebar: true,
    section: "Guide",
    requiresAuth: true,
    component: UserGuide,
  },

  // How To
  {
    name: "How To",
    path: "/howto",
    icon: <SiReadthedocs />,
    tooltipContent: <p>How-to guides</p>,
    adminOnly: false,
    showInSidebar: false,
    requiresAuth: true,
    wrapper: "layoutCheck",
    component: HowTo,
  },

  // Admin
  {
    name: "Admin",
    path: "/crud",
    icon: <RiAdminFill />,
    tooltipContent: <p>Administrative functions</p>,
    adminOnly: true,
    showInSidebar: true,
    section: "Admin",
    requiresAuth: true,
    component: Dashboard,
    componentProps: { activeTab: 2 },
    children: [
      {
        name: "Admin Data",
        path: "/crud/data",
        icon: <RiAdminFill />,
        tooltipContent: <p>Manage data</p>,
        adminOnly: true,
        showInSidebar: false,
        requiresAuth: true,
        wrapper: "admin",
        component: AdminDataLists,
      },
      {
        name: "Admin Reports",
        path: "/crud/reports",
        icon: <RiAdminFill />,
        tooltipContent: <p>Manage reports</p>,
        adminOnly: true,
        showInSidebar: false,
        requiresAuth: true,
        wrapper: "admin",
        component: ReportsCRUD,
      },
      {
        name: "Admin Business Areas",
        path: "/crud/businessareas",
        icon: <RiAdminFill />,
        tooltipContent: <p>Manage business areas</p>,
        adminOnly: true,
        showInSidebar: false,
        requiresAuth: true,
        wrapper: "admin",
        component: BusinessAreasCRUD,
      },
      {
        name: "Admin Services",
        path: "/crud/services",
        icon: <RiAdminFill />,
        tooltipContent: <p>Manage services</p>,
        adminOnly: true,
        showInSidebar: false,
        requiresAuth: true,
        wrapper: "admin",
        component: ServicesCRUD,
      },
      {
        name: "Admin Divisions",
        path: "/crud/divisions",
        icon: <RiAdminFill />,
        tooltipContent: <p>Manage divisions</p>,
        adminOnly: true,
        showInSidebar: false,
        requiresAuth: true,
        wrapper: "admin",
        component: DivisionsCRUD,
      },
      {
        name: "Admin Locations",
        path: "/crud/locations",
        icon: <RiAdminFill />,
        tooltipContent: <p>Manage locations</p>,
        adminOnly: true,
        showInSidebar: false,
        requiresAuth: true,
        wrapper: "admin",
        component: LocationsCRUD,
      },
      {
        name: "Admin Affiliations",
        path: "/crud/affiliations",
        icon: <RiAdminFill />,
        tooltipContent: <p>Manage affiliations</p>,
        adminOnly: true,
        showInSidebar: false,
        requiresAuth: true,
        wrapper: "admin",
        component: AffiliationsCRUD,
      },
      {
        name: "Admin Addresses",
        path: "/crud/addresses",
        icon: <RiAdminFill />,
        tooltipContent: <p>Manage addresses</p>,
        adminOnly: true,
        showInSidebar: false,
        requiresAuth: true,
        wrapper: "admin",
        component: AddressesCRUD,
      },
      {
        name: "Admin Branches",
        path: "/crud/branches",
        icon: <RiAdminFill />,
        tooltipContent: <p>Manage branches</p>,
        adminOnly: true,
        showInSidebar: false,
        requiresAuth: true,
        wrapper: "admin",
        component: BranchesCRUD,
      },
      {
        name: "Admin Emails",
        path: "/crud/emails",
        icon: <RiAdminFill />,
        tooltipContent: <p>Test email templates</p>,
        adminOnly: true,
        showInSidebar: false,
        requiresAuth: true,
        wrapper: "admin",
        component: TestEmailPage,
      },
      {
        name: "Admin Test",
        path: "/crud/test",
        icon: <RiAdminFill />,
        tooltipContent: <p>Test playground</p>,
        adminOnly: true,
        showInSidebar: false,
        requiresAuth: true,
        wrapper: "admin",
        component: TestPlayground,
      },
    ],
  },

  // Patch Notes
  {
    name: "Patch Notes",
    path: "/patchnotes",
    icon: <HiMiniSquares2X2 />,
    tooltipContent: <p>View patch notes</p>,
    adminOnly: false,
    showInSidebar: false,
    requiresAuth: true,
    component: PatchNotesPage,
  },

  // Staff Profiles (Public)
  {
    name: "Science Staff",
    path: "/staff",
    icon: <ImUsers />,
    tooltipContent: <p>Browse science staff profiles</p>,
    adminOnly: false,
    showInSidebar: false,
    requiresAuth: false,
    wrapper: "staffProfile",
    component: ScienceStaff,
  },
  {
    name: "Staff Profile Detail",
    path: "/staff/:staffProfilePk",
    icon: <ImUsers />,
    tooltipContent: <p>View staff profile</p>,
    adminOnly: false,
    showInSidebar: false,
    requiresAuth: false,
    wrapper: "staffProfile",
    component: ScienceStaffDetail,
  },

  // Auth
  {
    name: "Login",
    path: "/login",
    icon: <ImUsers />,
    tooltipContent: <p>Login to SPMS</p>,
    adminOnly: false,
    showInSidebar: false,
    requiresAuth: false,
    component: Login,
  },
];

/**
 * Redirect configurations for legacy routes
 */
export const ROUTE_REDIRECTS = [
  { from: "/dashboard", to: "/" },
  { from: "/reports/browse", to: "/reports" },
  { from: "/projects/browse", to: "/projects" },
  { from: "/users/browse", to: "/users" },
];

/**
 * Sidebar item interface for navigation
 */
export interface SidebarItem {
  name: string;
  path: string;
  icon: ReactNode;
  activeIcon?: ReactNode;
  tooltipContent?: ReactNode;
  section?: string;
  adminOnly: boolean;
}

/**
 * Get sidebar items from route configuration
 * Filters routes that should be shown in sidebar
 * @param isAdmin - Whether the current user is an admin
 * @returns Array of sidebar items
 */
export const getSidebarItems = (isAdmin: boolean = false): SidebarItem[] => {
  const items: SidebarItem[] = [];

  const processRoute = (route: RouteConfig) => {
    // Only include routes that should be shown in sidebar
    if (route.showInSidebar) {
      // Skip admin-only routes if user is not admin
      if (route.adminOnly && !isAdmin) {
        return;
      }

      items.push({
        name: route.name,
        path: route.path,
        icon: route.icon,
        activeIcon: route.activeIcon,
        tooltipContent: route.tooltipContent,
        section: route.section,
        adminOnly: route.adminOnly,
      });
    }

    // Process children recursively
    if (route.children) {
      route.children.forEach(processRoute);
    }
  };

  ROUTES_CONFIG.forEach(processRoute);
  return items;
};

/**
 * Generate React Router route children from route configuration
 * Note: This is a helper function. Actual route generation with lazy loading
 * and wrappers is done in the router implementation.
 * @param routes - Array of route configurations
 * @returns Array of RouteObject for React Router
 */
export const generateRouteChildren = (
  routes: RouteConfig[]
): RouteObject[] => {
  return routes.map((route) => {
    const Component = route.component;
    const props = route.componentProps || {};
    
    const routeObject: RouteObject = {
      path: route.path,
      element: createElement(Component, props),
    };

    if (route.children && route.children.length > 0) {
      routeObject.children = generateRouteChildren(route.children);
    }

    return routeObject;
  });
};

/**
 * Get route configuration from sidebar item
 * @param sidebarItem - Sidebar item to find route for
 * @returns Route configuration or undefined
 */
export const getRouteFromSidebarItem = (
  sidebarItem: SidebarItem
): RouteConfig | undefined => {
  const findRoute = (routes: RouteConfig[]): RouteConfig | undefined => {
    for (const route of routes) {
      if (route.path === sidebarItem.path) {
        return route;
      }
      if (route.children) {
        const found = findRoute(route.children);
        if (found) return found;
      }
    }
    return undefined;
  };

  return findRoute(ROUTES_CONFIG);
};

/**
 * Get sidebar item from route path
 * @param path - Route path to find sidebar item for
 * @returns Sidebar item or undefined
 */
export const getSidebarItemFromRoute = (
  path: string,
  isAdmin: boolean = false
): SidebarItem | undefined => {
  const sidebarItems = getSidebarItems(isAdmin);
  return sidebarItems.find((item) => item.path === path);
};

/**
 * Get all routes that match a specific path pattern
 * Useful for finding parent routes or related routes
 * @param pathPattern - Path pattern to match (e.g., "/projects")
 * @returns Array of matching route configurations
 */
export const getRoutesByPattern = (
  pathPattern: string
): RouteConfig[] => {
  const matches: RouteConfig[] = [];

  const findMatches = (routes: RouteConfig[]) => {
    routes.forEach((route) => {
      if (route.path.startsWith(pathPattern)) {
        matches.push(route);
      }
      if (route.children) {
        findMatches(route.children);
      }
    });
  };

  findMatches(ROUTES_CONFIG);
  return matches;
};

/**
 * Check if a route requires admin access
 * @param path - Route path to check
 * @returns True if route requires admin access
 */
export const isAdminRoute = (path: string): boolean => {
  const findRoute = (routes: RouteConfig[]): boolean => {
    for (const route of routes) {
      if (route.path === path) {
        return route.adminOnly;
      }
      if (route.children) {
        const found = findRoute(route.children);
        if (found !== undefined) return found;
      }
    }
    return false;
  };

  return findRoute(ROUTES_CONFIG);
};

/**
 * Check if a route requires authentication
 * @param path - Route path to check
 * @returns True if route requires authentication
 */
export const requiresAuth = (path: string): boolean => {
  const findRoute = (routes: RouteConfig[]): boolean => {
    for (const route of routes) {
      if (route.path === path) {
        return route.requiresAuth ?? true; // Default to true
      }
      if (route.children) {
        const found = findRoute(route.children);
        if (found !== undefined) return found;
      }
    }
    return true; // Default to requiring auth
  };

  return findRoute(ROUTES_CONFIG);
};
