import { type ComponentType, type ReactNode } from "react";
// Icons
import { ImUsers } from "react-icons/im";
import { RiAdminFill, RiLoginBoxLine } from "react-icons/ri";
import { HiMiniSquares2X2 } from "react-icons/hi2";

// Completed Pages
import Login from "@/pages/Login";

// Pages
import AddressesCRUD from "@/pages/admin/AddressesCRUD";
import AdminDataLists from "@/pages/admin/AdminDataLists";
import AffiliationsCRUD from "@/pages/admin/AffiliationsCRUD";
import BranchesCRUD from "@/pages/admin/BranchesCRUD";
import BusinessAreasCRUD from "@/pages/admin/BusinessAreasCRUD";
import DivisionsCRUD from "@/pages/admin/DivisionsCRUD";
import LocationsCRUD from "@/pages/admin/LocationsCRUD";
import ReportsCRUD from "@/pages/admin/ReportsCRUD";
import ServicesCRUD from "@/pages/admin/ServicesCRUD";
import Dashboard from "@/pages/dash/Dashboard";
import Game from "@/pages/Game";
import Leaderboard from "@/pages/Leaderboard";
import MyStats from "@/pages/MyStats";
import Register from "@/pages/Register";
import Settings from "@/pages/Settings";
import ScienceStaff from "@/pages/staff-profile/ScienceStaff";
import ScienceStaffDetail from "@/pages/staff-profile/ScienceStaffDetail";
import TestEmailPage from "@/pages/test/TestEmailPage";
import TestPlayground from "@/pages/test/TestPlayground";
import MyBusinessArea from "@/pages/business-area/MyBusinessArea";
import HowTo from "@/pages/dash/HowTo";
import { SiReadthedocs } from "react-icons/si";
import { FaBookBookmark } from "react-icons/fa6";
import UserGuide from "@/pages/dash/UserGuide";

// Route configuration interface
export interface RouteConfig {
	// Required
	name: string;
	path: string;
	component: ComponentType;
	// Additional
	showInSidebar?: boolean;
	tooltipContent?: ReactNode;
	icon?: ReactNode;
	section?: string;
	children?: RouteConfig[];
	authWrapper: "public" | "authenticated" | "admin"; // Custom wrapper component (e.g.,ProtectedPage, AdminOnlyPage, LayoutCheckWrapper)
	componentProps?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

// #region Main App ================================================================

// Admin Routes
export const ADMIN_ROUTES: RouteConfig[] = [
	{
		name: "Admin",
		path: "/crud",
		icon: <RiAdminFill />,
		tooltipContent: <p>Administrative functions</p>,
		showInSidebar: true,
		section: "Admin",
		authWrapper: "admin",
		requiresAuth: true,
		component: Dashboard,
		componentProps: { activeTab: 2 },
		children: [
			{
				name: "Admin Data",
				path: "/crud/data",
				icon: <RiAdminFill />,
				tooltipContent: <p>Manage data</p>,
				showInSidebar: false,
				authWrapper: "admin",
				component: AdminDataLists,
			},
			{
				name: "Admin Reports",
				path: "/crud/reports",
				icon: <RiAdminFill />,
				tooltipContent: <p>Manage reports</p>,
				showInSidebar: false,
				authWrapper: "admin",
				component: ReportsCRUD,
			},
			{
				name: "Admin Business Areas",
				path: "/crud/businessareas",
				icon: <RiAdminFill />,
				tooltipContent: <p>Manage business areas</p>,
				showInSidebar: false,
				authWrapper: "admin",
				component: BusinessAreasCRUD,
			},
			{
				name: "Admin Services",
				path: "/crud/services",
				icon: <RiAdminFill />,
				tooltipContent: <p>Manage services</p>,
				showInSidebar: false,
				authWrapper: "admin",
				component: ServicesCRUD,
			},
			{
				name: "Admin Divisions",
				path: "/crud/divisions",
				icon: <RiAdminFill />,
				tooltipContent: <p>Manage divisions</p>,
				showInSidebar: false,
				authWrapper: "admin",
				component: DivisionsCRUD,
			},
			{
				name: "Admin Locations",
				path: "/crud/locations",
				icon: <RiAdminFill />,
				tooltipContent: <p>Manage locations</p>,
				showInSidebar: false,
				authWrapper: "admin",
				component: LocationsCRUD,
			},
			{
				name: "Admin Affiliations",
				path: "/crud/affiliations",
				icon: <RiAdminFill />,
				tooltipContent: <p>Manage affiliations</p>,
				showInSidebar: false,
				authWrapper: "admin",
				component: AffiliationsCRUD,
			},
			{
				name: "Admin Addresses",
				path: "/crud/addresses",
				icon: <RiAdminFill />,
				tooltipContent: <p>Manage addresses</p>,
				showInSidebar: false,
				authWrapper: "admin",
				component: AddressesCRUD,
			},
			{
				name: "Admin Branches",
				path: "/crud/branches",
				icon: <RiAdminFill />,
				tooltipContent: <p>Manage branches</p>,
				showInSidebar: false,
				authWrapper: "admin",
				component: BranchesCRUD,
			},
			{
				name: "Admin Emails",
				path: "/crud/emails",
				icon: <RiAdminFill />,
				tooltipContent: <p>Test email templates</p>,
				showInSidebar: false,
				authWrapper: "admin",
				component: TestEmailPage,
			},
			{
				name: "Admin Test",
				path: "/crud/test",
				icon: <RiAdminFill />,
				tooltipContent: <p>Test playground</p>,
				showInSidebar: false,
				authWrapper: "admin",
				component: TestPlayground,
			},
		],
	},
];

// Business Area Routes
export const BUSINESS_AREA_ROUTES: RouteConfig[] = [
	{
		name: "My Business Area",
		path: "/my_business_area",
		icon: <HiMiniSquares2X2 />,
		tooltipContent: <p>Manage your business area</p>,
		authWrapper: "authenticated",
		component: MyBusinessArea,
	},
];

// Dashboard Routes
export const DASHBOARD_ROUTES: RouteConfig[] = [
	{
		authWrapper: "authenticated",
		name: "Dashboard",
		path: "/",
		icon: <HiMiniSquares2X2 />,
		tooltipContent: <p>View your dashboard</p>,
		showInSidebar: false, // Home button is separate in sidebar
		component: Dashboard,
	},
	{
		authWrapper: "authenticated",
		name: "How To",
		path: "/howto",
		icon: <SiReadthedocs />,
		tooltipContent: <p>How-to guides</p>,
		showInSidebar: false,
		component: HowTo,
	},
	{
		authWrapper: "authenticated",
		name: "Quick Guide",
		path: "/guide",
		icon: <SiReadthedocs />,
		tooltipContent: <p>User guide and documentation</p>,
		showInSidebar: true,
		section: "Guide",
		component: UserGuide,
	},
];

// Error Routes
export const ERROR_ROUTES: RouteConfig[] = [
	{
		authWrapper: "authenticated",
		name: "Not Found",
		path: "/guide",
		icon: <SiReadthedocs />,
		tooltipContent: <p>User guide and documentation</p>,
		showInSidebar: true,
		section: "Guide",
		component: UserGuide,
	},
	{
		authWrapper: "authenticated",
		name: "Quick Guide",
		path: "/guide",
		icon: <SiReadthedocs />,
		tooltipContent: <p>User guide and documentation</p>,
		showInSidebar: true,
		section: "Guide",
		component: UserGuide,
	},
];

// Project Routes
export const PROJECT_ROUTES: RouteConfig[] = [];

// Report Routes
export const REPORT_ROUTES: RouteConfig[] = [];

// Test Routes
export const TEST_ROUTES: RouteConfig[] = [];

// User Routes
export const USER_ROUTES: RouteConfig[] = [];

// #endregion ============================================================================

// #region Science Profiles App ===============================================

export const STAFF_PROFILE_ROUTES: RouteConfig[] = [
	{
		name: "Science Staff",
		path: "/staff",
		icon: <ImUsers />,
		tooltipContent: <p>Browse science staff profiles</p>,
		authWrapper: "public",
		component: ScienceStaff,
	},
	{
		name: "Staff Profile Detail",
		path: "/staff/:staffProfilePk",
		icon: <ImUsers />,
		tooltipContent: <p>View staff profile</p>,
		authWrapper: "public",
		component: ScienceStaffDetail,
	},
];

// #endregion ===========================================================================

// #region Application routes configuration ==================================

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

// #endregion =====================================================================

// #region Helpers ===============================================================

// Helper function to get routes to show in sidebar navigation
export const getSidebarRoutes = (): RouteConfig[] => {
	return ROUTES_CONFIG.filter((route) => route.showInSidebar);
};

// Helper function to check if a route requires authentication
export const isProtectedRoute = (path: string): boolean => {
	const route = ROUTES_CONFIG.find((r) => r.path === path);
	return route?.requiresAuth ?? true;
};

// #endregion ====================================================================
