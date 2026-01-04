import { type ReactNode, type ComponentType } from "react";
/**
 * Visit https://react-icons.github.io/react-icons/ to search for an icon of your liking
 */
import { HiCog6Tooth } from "react-icons/hi2";
import { RiLoginBoxLine, RiUserAddLine } from "react-icons/ri";
import { IoGameController } from "react-icons/io5";
import { FaTrophy, FaChartLine } from "react-icons/fa";

// Pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Game from "@/pages/Game";
import Leaderboard from "@/pages/Leaderboard";
import MyStats from "@/pages/MyStats";
import Settings from "@/pages/Settings";

/**
 * Route configuration interface
 */
export interface RouteConfig {
	name: string;
	path: string;
	icon?: ReactNode;
	component: ComponentType;
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
		name: "Play",
		path: "/",
		icon: <IoGameController />,
		component: Game,
		requiresAuth: false, // Game is public but shows different features when logged in
		showInSidebar: true,
	},
	{
		name: "Leaderboard",
		path: "/leaderboard",
		icon: <FaTrophy />,
		component: Leaderboard,
		requiresAuth: false, // Leaderboard is public
		showInSidebar: true,
	},
	{
		name: "My Stats",
		path: "/stats",
		icon: <FaChartLine />,
		component: MyStats,
		requiresAuth: true, // Only logged in users can see their stats
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
