import { type ReactNode, type ComponentType } from "react";
import { HiMiniSquares2X2, HiCog6Tooth } from "react-icons/hi2";
import { RiLoginBoxLine, RiUserAddLine } from "react-icons/ri";

// Pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";

/**
 * Route configuration interface
 */
export interface RouteConfig {
	name: string;
	path: string;
	icon?: ReactNode;
	component: ComponentType<any>;
	requiresAuth: boolean;
	showInSidebar: boolean;
}

/**
 * Application routes configuration
 */
export const ROUTES_CONFIG: RouteConfig[] = [
	// Public routes
	{
		name: "Login",
		path: "/login",
		icon: <RiLoginBoxLine />,
		component: Login,
		requiresAuth: false,
		showInSidebar: false,
	},
	{
		name: "Register",
		path: "/register",
		icon: <RiUserAddLine />,
		component: Register,
		requiresAuth: false,
		showInSidebar: false,
	},

	// Protected routes
	{
		name: "Dashboard",
		path: "/",
		icon: <HiMiniSquares2X2 />,
		component: Dashboard,
		requiresAuth: true,
		showInSidebar: true,
	},
	{
		name: "Settings",
		path: "/settings",
		icon: <HiCog6Tooth />,
		component: Settings,
		requiresAuth: true,
		showInSidebar: true,
	},
];

/**
 * Helper function to get routes to show in sidebar navigation
 */
export const getSidebarRoutes = (): RouteConfig[] => {
	return ROUTES_CONFIG.filter((route) => route.showInSidebar);
};

/**
 * Helper function to check if a route requires authentication
 */
export const isProtectedRoute = (path: string): boolean => {
	const route = ROUTES_CONFIG.find((r) => r.path === path);
	return route?.requiresAuth ?? true;
};
