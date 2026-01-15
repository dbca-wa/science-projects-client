import { type ComponentType } from "react";

// Pages - Auth
import Login from "@/pages/auth/Login";

// Pages - Dashboard
import Dashboard from "@/pages/dash/Dashboard";
import HowTo from "@/pages/dash/HowTo";
import UserGuide from "@/pages/dash/UserGuide";

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
	{
		name: "How To",
		path: "/howto",
		iconKey: "docs",
		component: HowTo,
		requiresAuth: true,
		showInSidebar: false,
		layoutWrapper: "layoutCheck",
	},
];

/** ---------------- Combined ---------------- */
export const ALL_ROUTES: RouteConfig[] = [
	...AUTH_ROUTES,
	...DASHBOARD_ROUTES,
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
