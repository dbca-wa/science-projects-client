import { type ComponentType, lazy } from "react";

// Pages - Auth (lazy loaded)
const Login = lazy(() => import("@/pages/auth/Login"));

// Pages - Dashboard (lazy loaded)
const Dashboard = lazy(() => import("@/pages/dash/Dashboard"));

// Pages - Users (lazy loaded)
const UserListPage = lazy(() => import("@/pages/users/UserListPage"));
const UserCreatePage = lazy(() => import("@/pages/users/UserCreatePage"));
const UserCreateStaffPage = lazy(
	() => import("@/pages/users/UserCreateStaffPage")
);
const UserDetailPage = lazy(() => import("@/pages/users/UserDetailPage"));
const UserEditPage = lazy(() => import("@/pages/users/UserEditPage"));
const MyProfilePage = lazy(() => import("@/pages/users/MyProfilePage"));
const ProfileEditPage = lazy(() => import("@/pages/users/ProfileEditPage"));

// Pages - Projects (lazy loaded)
const ProjectListPage = lazy(() => import("@/pages/projects/ProjectListPage"));
const ProjectCreatePage = lazy(
	() => import("@/pages/projects/ProjectCreatePage")
);
const ProjectCreateWizardPage = lazy(
	() => import("@/pages/projects/ProjectCreateWizardPage")
);
const ProjectDetailPage = lazy(
	() => import("@/pages/projects/ProjectDetailPage")
);
const ProjectMapPage = lazy(() => import("@/pages/projects/ProjectMapPage"));

/**
 * Route Configuration
 *
 * This file defines all application routes. Routes for unimplemented features
 * are commented out to keep the navigation clean.
 */

// Route configuration interface
export interface RouteConfig {
	name: string;
	path: string;
	//  any to allow props
	component: ComponentType<any>; // eslint-disable-line
	requiresAuth: boolean;
	requiresAdmin?: boolean;

	// UI
	showInSidebar?: boolean;
	iconKey?: string;
	tooltipKey?: string;
	section?: string;

	// Breadcrumbs
	showBreadcrumb?: boolean; // Whether to show breadcrumb for this route
	breadcrumbParent?: string; // Path of parent route for breadcrumb trail

	// Behavior/layout
	layoutWrapper?: "content" | "staffProfile" | "none";
	componentProps?: Record<string, any>; //eslint-disable-line
	children?: RouteConfig[];
}

/** ---------------- Auth ---------------- */
export const AUTH_ROUTES: RouteConfig[] = [
	{
		name: "Login",
		path: "/login",
		iconKey: "login",
		component: Login,
		requiresAuth: false,
		showInSidebar: false,
		layoutWrapper: "none",
	},
];

/** ---------------- Dashboard ---------------- */
export const DASHBOARD_ROUTES: RouteConfig[] = [
	{
		name: "Dashboard",
		path: "/",
		iconKey: "dashboard",
		tooltipKey: "dashboard",
		component: Dashboard,
		requiresAuth: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	// Quick Guide - COMMENTED OUT: Page not yet created
	/*
	{
		name: "Quick Guide",
		path: "/guide",
		iconKey: "docs",
		tooltipKey: "guide",
		component: UserGuide,
		requiresAuth: true,
		showInSidebar: true,
		section: "Guide",
		layoutWrapper: "content",
	},
	*/
];

/** ---------------- Users ---------------- */
export const USER_ROUTES: RouteConfig[] = [
	{
		name: "Users",
		path: "/users",
		iconKey: "users",
		tooltipKey: "users",
		component: UserListPage,
		requiresAuth: true,
		showInSidebar: true,
		section: "Users",
		layoutWrapper: "content",
	},
	{
		name: "Add User",
		path: "/users/create",
		iconKey: "userAdd",
		tooltipKey: "users",
		component: UserCreatePage,
		requiresAuth: true,
		showInSidebar: true,
		section: "Users",
		layoutWrapper: "content",
		breadcrumbParent: "/users",
	},
	{
		name: "Add DBCA User (Admin)",
		path: "/users/create-staff",
		iconKey: "userAdd",
		tooltipKey: "users",
		component: UserCreateStaffPage,
		requiresAuth: true,
		requiresAdmin: true,
		showInSidebar: true,
		section: "Users",
		layoutWrapper: "content",
		breadcrumbParent: "/users",
	},
	{
		name: "My Profile",
		path: "/users/me",
		iconKey: "users",
		component: MyProfilePage,
		requiresAuth: true,
		showInSidebar: false,
		layoutWrapper: "content",
		showBreadcrumb: false, // No breadcrumb on profile view
	},
	{
		name: "Caretaker Mode",
		path: "/users/me/caretaker",
		iconKey: "users",
		component: MyProfilePage, // Same component, different tab
		requiresAuth: true,
		showInSidebar: false,
		layoutWrapper: "content",
		showBreadcrumb: false, // Handled by MyProfilePage
	},
	{
		name: "Public Staff Profile",
		path: "/users/me/staff-profile",
		iconKey: "users",
		component: MyProfilePage, // Same component, different tab
		requiresAuth: true,
		showInSidebar: false,
		layoutWrapper: "content",
		showBreadcrumb: false, // Handled by MyProfilePage
	},
	{
		name: "Edit Profile",
		path: "/users/me/profile",
		iconKey: "users",
		component: ProfileEditPage,
		requiresAuth: true,
		showInSidebar: false,
		layoutWrapper: "content",
		showBreadcrumb: true,
		breadcrumbParent: "/users/me", // Back to My Profile
	},
	{
		name: "User Detail",
		path: "/users/:id",
		iconKey: "users",
		component: UserListPage, // Shows sheet overlay
		requiresAuth: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "User Detail Page",
		path: "/users/:id/details",
		iconKey: "users",
		component: UserDetailPage, // Dedicated full page
		requiresAuth: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "Edit User",
		path: "/users/:id/edit",
		iconKey: "users",
		component: UserEditPage,
		requiresAuth: true,
		requiresAdmin: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
];

/** ---------------- Projects ---------------- */
export const PROJECT_ROUTES: RouteConfig[] = [
	{
		name: "Projects",
		path: "/projects",
		iconKey: "projects",
		tooltipKey: "projects",
		component: ProjectListPage,
		requiresAuth: true,
		showInSidebar: true,
		section: "Projects",
		layoutWrapper: "content",
	},
	{
		name: "Map",
		path: "/projects/map",
		iconKey: "map",
		tooltipKey: "map",
		component: ProjectMapPage,
		requiresAuth: true,
		showInSidebar: true,
		section: "Projects",
		layoutWrapper: "content",
		breadcrumbParent: "/projects",
	},
	{
		name: "Create New Project",
		path: "/projects/create",
		iconKey: "projectAdd",
		tooltipKey: "projects",
		component: ProjectCreatePage,
		requiresAuth: true,
		showInSidebar: true,
		section: "Projects",
		layoutWrapper: "content",
		breadcrumbParent: "/projects",
	},
	{
		name: "Create Project Wizard",
		path: "/projects/create/wizard",
		iconKey: "projectAdd",
		component: ProjectCreateWizardPage,
		requiresAuth: true,
		showInSidebar: false,
		layoutWrapper: "content",
		breadcrumbParent: "/projects",
	},
	{
		name: "Project Overview",
		path: "/projects/:id/overview",
		iconKey: "projects",
		component: ProjectDetailPage,
		componentProps: { selectedTab: "overview" },
		requiresAuth: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "Project Concept Plan",
		path: "/projects/:id/concept",
		iconKey: "projects",
		component: ProjectDetailPage,
		componentProps: { selectedTab: "concept" },
		requiresAuth: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "Project Plan",
		path: "/projects/:id/project",
		iconKey: "projects",
		component: ProjectDetailPage,
		componentProps: { selectedTab: "project" },
		requiresAuth: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "Progress Reports",
		path: "/projects/:id/progress",
		iconKey: "projects",
		component: ProjectDetailPage,
		componentProps: { selectedTab: "progress" },
		requiresAuth: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "Student Reports",
		path: "/projects/:id/student",
		iconKey: "projects",
		component: ProjectDetailPage,
		componentProps: { selectedTab: "student" },
		requiresAuth: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "Project Closure",
		path: "/projects/:id/closure",
		iconKey: "projects",
		component: ProjectDetailPage,
		componentProps: { selectedTab: "closure" },
		requiresAuth: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "Edit Project",
		path: "/projects/:id/edit",
		iconKey: "projects",
		component: ProjectDetailPage, // TODO: Create ProjectEditPage
		requiresAuth: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
];

/** ---------------- Reports (NOT YET IMPLEMENTED) ---------------- */
// Uncomment when reports feature is implemented
/*
export const REPORT_ROUTES: RouteConfig[] = [
	{
		name: "Reports",
		path: "/reports",
		iconKey: "reports",
		tooltipKey: "reports",
		component: ReportListPage,
		requiresAuth: true,
		showInSidebar: true,
		section: "ARAR",
		layoutWrapper: "content",
	},
	{
		name: "Current Report",
		path: "/reports/current",
		iconKey: "reports",
		component: CurrentReportPage,
		requiresAuth: true,
		requiresAdmin: true,
		showInSidebar: true,
		section: "ARAR",
		layoutWrapper: "content",
	},
];
*/

/** ---------------- Admin (NOT YET IMPLEMENTED) ---------------- */
// Uncomment when admin features are implemented
/*
export const ADMIN_ROUTES: RouteConfig[] = [
	{
		name: "Admin",
		path: "/admin",
		iconKey: "admin",
		tooltipKey: "admin",
		component: AdminDashboard,
		requiresAuth: true,
		requiresAdmin: true,
		showInSidebar: true,
		section: "Admin",
		layoutWrapper: "content",
	},
];
*/

/** ---------------- Combined ---------------- */
export const ALL_ROUTES: RouteConfig[] = [
	...AUTH_ROUTES,
	...DASHBOARD_ROUTES,
	...USER_ROUTES,
	...PROJECT_ROUTES,
	// Uncomment as features are implemented:
	// ...REPORT_ROUTES,
	// ...ADMIN_ROUTES,
];

/** Flatten helper (kept as-is) */
const flattenRoutes = (routes: RouteConfig[]): RouteConfig[] =>
	routes.reduce<RouteConfig[]>((acc, route) => {
		acc.push(route);
		if (route.children) acc.push(...flattenRoutes(route.children));
		return acc;
	}, []);

export const ALL_FLATTENED_ROUTES = flattenRoutes(ALL_ROUTES);

/** Public vs Protected helpers (consistent names) */
export const ALL_PUBLIC_ROUTES: RouteConfig[] = ALL_FLATTENED_ROUTES.filter(
	(r) => !r.requiresAuth && !r.requiresAdmin
);

export const ALL_ADMIN_ONLY_ROUTES: RouteConfig[] = ALL_FLATTENED_ROUTES.filter(
	(r) => r.requiresAdmin
);

export const ALL_AUTH_ONLY_ROUTES: RouteConfig[] = ALL_FLATTENED_ROUTES.filter(
	(r) => r.requiresAuth
);

/** Optional convenience: everything that needs auth (includes admin) */
export const ALL_PROTECTED_ROUTES: RouteConfig[] = ALL_FLATTENED_ROUTES.filter(
	(r) => r.requiresAuth || r.requiresAdmin
);

/** Sidebar / helpers (unchanged) */
export const getSidebarRoutes = (): RouteConfig[] =>
	ALL_FLATTENED_ROUTES.filter((route) => route.showInSidebar);

export const isProtectedRoute = (path: string): boolean =>
	ALL_FLATTENED_ROUTES.find((r) => r.path === path)?.requiresAuth ?? true;

export const isAdminRoute = (path: string): boolean =>
	ALL_FLATTENED_ROUTES.find((r) => r.path === path)?.requiresAdmin ?? false;

export const getRouteByPath = (path: string): RouteConfig | undefined =>
	ALL_FLATTENED_ROUTES.find((r) => r.path === path);
