import { type ComponentType } from "react";

// Pages - Auth
import Login from "@/pages/auth/Login";

// Pages - Dashboard
import Dashboard from "@/pages/dash/Dashboard";
// import UserGuide from "@/pages/dash/UserGuide"; // Commented out - page not yet created

// Pages - Users
import { UserListPage } from "@/pages/users/UserListPage";
import { UserCreatePage } from "@/pages/users/UserCreatePage";
import { UserCreateStaffPage } from "@/pages/users/UserCreateStaffPage";
import { UserEditPage } from "@/pages/users/UserEditPage";
import { MyProfilePage } from "@/pages/users/MyProfilePage";

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

	// Behavior/layout
	layoutWrapper?: "content" | "layoutCheck" | "staffProfile" | "none";
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
	},
	{
		name: "User Detail",
		path: "/users/:id",
		iconKey: "users",
		component: UserListPage,
		requiresAuth: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "My Profile",
		path: "/users/me",
		iconKey: "users",
		component: MyProfilePage,
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

/** ---------------- Projects (NOT YET IMPLEMENTED) ---------------- */
// Uncomment when projects feature is implemented
/*
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
		name: "Add Project",
		path: "/projects/create",
		iconKey: "projects",
		component: ProjectCreatePage,
		requiresAuth: true,
		showInSidebar: true,
		section: "Projects",
		layoutWrapper: "content",
	},
	{
		name: "Project Detail",
		path: "/projects/:id",
		iconKey: "projects",
		component: ProjectDetailPage,
		requiresAuth: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
];
*/

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
	// Uncomment as features are implemented:
	// ...PROJECT_ROUTES,
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
