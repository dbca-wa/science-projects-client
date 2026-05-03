import { type ComponentType, lazy } from "react";

// Pages - Auth (lazy loaded)
const Login = lazy(() => import("@/pages/auth/Login"));

// Pages - Dashboard (lazy loaded)
const Dashboard = lazy(() => import("@/pages/dash/Dashboard"));
const UserGuide = lazy(() => import("@/pages/dash/KnowledgeBasePage"));
const KnowledgeBaseCategoryPage = lazy(
	() => import("@/pages/dash/KnowledgeBaseCategoryPage")
);

// Pages - Users (lazy loaded)
const UserListPage = lazy(() => import("@/pages/users/UserListPage"));
const UserCreatePage = lazy(() => import("@/pages/users/UserCreatePage"));
const UserCreateStaffPage = lazy(
	() => import("@/pages/users/UserCreateStaffPage")
);
const InviteUserPage = lazy(() => import("@/pages/users/InviteUserPage"));
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
const EditProjectPage = lazy(() => import("@/pages/projects/EditProjectPage"));
const ProjectMapPage = lazy(() => import("@/pages/projects/ProjectMapPage"));

// Pages - Reports (lazy loaded)
const PublishedReportsPage = lazy(
	() => import("@/pages/reports/PublishedReportsPage")
);
const LatestReportPage = lazy(() => import("@/pages/reports/LatestReportPage"));
const BusinessAreaLeadPage = lazy(
	() => import("@/pages/reports/BusinessAreaLeadPage")
);
const BusinessAreaEditLeadPage = lazy(
	() => import("@/pages/reports/BusinessAreaEditPage")
);
const MyDivisionPage = lazy(() => import("@/pages/reports/MyDivisionPage"));

// Pages - Admin (lazy loaded)
const BranchesPage = lazy(() => import("@/pages/admin/BranchesPage"));
const AddressesPage = lazy(() => import("@/pages/admin/AddressesPage"));
const AffiliationsPage = lazy(() => import("@/pages/admin/AffiliationsPage"));
const BusinessAreasPage = lazy(() => import("@/pages/admin/BusinessAreasPage"));
const BusinessAreaAddPage = lazy(
	() => import("@/pages/admin/BusinessAreaAddPage")
);
const BusinessAreaEditPage = lazy(
	() => import("@/pages/admin/BusinessAreaEditPage")
);
const DivisionsPage = lazy(() => import("@/pages/admin/DivisionsPage"));
const LocationsPage = lazy(() => import("@/pages/admin/LocationsPage"));
const ServicesPage = lazy(() => import("@/pages/admin/ServicesPage"));
const ReportInfoPage = lazy(() => import("@/pages/admin/ReportInfoPage"));
const DataListsPage = lazy(() => import("@/pages/admin/DataListsPage"));
const EmailsPage = lazy(() => import("@/pages/admin/EmailsPage"));
const AdminTestPage = lazy(() => import("@/pages/admin/AdminTestPage"));
const NewCyclePage = lazy(() => import("@/pages/admin/NewCyclePage"));

// Pages - Staff Profiles (lazy loaded)
const StaffDirectoryPage = lazy(
	() => import("@/pages/staff/StaffDirectoryPage")
);
const StaffProfileDetailPage = lazy(
	() => import("@/pages/staff/StaffProfileDetailPage")
);

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
	component: ComponentType<Record<string, unknown>>;
	requiresAuth: boolean;
	requiresAdmin?: boolean;
	requiresKeyStakeholder?: boolean;

	// UI
	showInSidebar?: boolean;
	iconKey?: string;
	tooltipKey?: string;
	section?: string;

	// Breadcrumbs
	showBreadcrumb?: boolean; // Whether to show breadcrumb for this route
	breadcrumbParent?: string; // Path of parent route for breadcrumb trail

	// Behaviour/layout
	layoutWrapper?: "content" | "staffProfile" | "none";
	componentProps?: Record<string, unknown>;
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
		name: "Knowledge Base",
		path: "/guide",
		iconKey: "docs",
		tooltipKey: "guide",
		component: UserGuide,
		requiresAuth: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "Knowledge Base Category",
		path: "/guide/:categorySlug",
		iconKey: "docs",
		component: KnowledgeBaseCategoryPage,
		requiresAuth: true,
		showInSidebar: false,
		layoutWrapper: "content",
		breadcrumbParent: "/guide",
	},
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
		path: "/manage/create-staff",
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
		name: "Invite DBCA User",
		path: "/users/invite",
		iconKey: "userAdd",
		component: InviteUserPage,
		requiresAuth: true,
		showInSidebar: false,
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
		name: "Edit Project",
		path: "/projects/:id/edit",
		iconKey: "projects",
		component: EditProjectPage,
		requiresAuth: true,
		showInSidebar: false,
		layoutWrapper: "content",
		breadcrumbParent: "/projects/:id/overview",
	},
	{
		name: "Project Detail",
		path: "/projects/:id/:tab?",
		iconKey: "projects",
		component: ProjectDetailPage,
		requiresAuth: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
];

/** ---------------- Reports ---------------- */
export const REPORT_ROUTES: RouteConfig[] = [
	{
		name: "Published Reports",
		path: "/reports",
		iconKey: "reports",
		tooltipKey: "reports",
		component: PublishedReportsPage,
		componentProps: { selectedTab: "official" },
		requiresAuth: true,
		showInSidebar: false,
		section: "ARAR",
		layoutWrapper: "content",
	},
	{
		name: "Published Reports - Drafts",
		path: "/reports/drafts",
		iconKey: "reports",
		component: PublishedReportsPage,
		componentProps: { selectedTab: "drafts" },
		requiresAuth: true,
		showInSidebar: false,
		section: "ARAR",
		layoutWrapper: "content",
	},
	{
		name: "Published Reports - Legacy",
		path: "/reports/legacy",
		iconKey: "reports",
		component: PublishedReportsPage,
		componentProps: { selectedTab: "legacy" },
		requiresAuth: true,
		showInSidebar: false,
		section: "ARAR",
		layoutWrapper: "content",
	},
	{
		name: "Report Details",
		path: "/reports/details",
		iconKey: "reports",
		component: LatestReportPage,
		requiresAuth: true,
		requiresAdmin: true,
		showInSidebar: false,
		section: "ARAR",
		layoutWrapper: "content",
	},
	{
		name: "Report Details - Media",
		path: "/reports/details/media",
		component: LatestReportPage,
		componentProps: { selectedTab: "media" },
		requiresAuth: true,
		requiresAdmin: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "Report Details - Pending",
		path: "/reports/details/pending",
		component: LatestReportPage,
		componentProps: { selectedTab: "pending" },
		requiresAuth: true,
		requiresAdmin: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "Report Details - Approved",
		path: "/reports/details/approved",
		component: LatestReportPage,
		componentProps: { selectedTab: "approved" },
		requiresAuth: true,
		requiresAdmin: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "Report Details - Print Preview",
		path: "/reports/details/preview",
		component: LatestReportPage,
		componentProps: { selectedTab: "preview" },
		requiresAuth: true,
		requiresAdmin: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "My Business Area - Problematic",
		path: "/reports/business-area/problematic",
		component: BusinessAreaLeadPage,
		componentProps: { selectedTab: "problematic" },
		requiresAuth: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "My Business Area - Unapproved",
		path: "/reports/business-area/unapproved",
		component: BusinessAreaLeadPage,
		componentProps: { selectedTab: "unapproved" },
		requiresAuth: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "Edit My Business Area",
		path: "/reports/business-area/edit",
		component: BusinessAreaEditLeadPage,
		requiresAuth: true,
		requiresAdmin: false,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "My Business Area",
		path: "/reports/business-area",
		component: BusinessAreaLeadPage,
		requiresAuth: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "My Division",
		path: "/reports/my-division",
		component: MyDivisionPage,
		requiresAuth: true,
		requiresKeyStakeholder: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
];

/** ---------------- Admin ---------------- */
export const ADMIN_ROUTES: RouteConfig[] = [
	{
		name: "Data Lists",
		path: "/manage/data",
		component: DataListsPage,
		requiresAuth: true,
		requiresAdmin: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "Email",
		path: "/manage/emails",
		component: EmailsPage,
		requiresAuth: true,
		requiresAdmin: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "Admin Test Page",
		path: "/manage/admin-testing",
		component: AdminTestPage,
		requiresAuth: true,
		requiresAdmin: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "Addresses",
		path: "/manage/addresses",
		component: AddressesPage,
		requiresAuth: true,
		requiresAdmin: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "Affiliations",
		path: "/manage/affiliations",
		component: AffiliationsPage,
		requiresAuth: true,
		requiresAdmin: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "Branches",
		path: "/manage/branches",
		component: BranchesPage,
		requiresAuth: true,
		requiresAdmin: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "Add Business Area",
		path: "/manage/business-areas/add",
		component: BusinessAreaAddPage,
		requiresAuth: true,
		requiresAdmin: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "Edit Business Area",
		path: "/manage/business-areas/:id/edit",
		component: BusinessAreaEditPage,
		requiresAuth: true,
		requiresAdmin: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "Business Areas",
		path: "/manage/business-areas",
		component: BusinessAreasPage,
		requiresAuth: true,
		requiresAdmin: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "Divisions",
		path: "/manage/divisions",
		component: DivisionsPage,
		requiresAuth: true,
		requiresAdmin: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "Locations",
		path: "/manage/locations",
		component: LocationsPage,
		requiresAuth: true,
		requiresAdmin: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "Report Info",
		path: "/manage/reports",
		component: ReportInfoPage,
		requiresAuth: true,
		requiresKeyStakeholder: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "Services",
		path: "/manage/services",
		component: ServicesPage,
		requiresAuth: true,
		requiresAdmin: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
	{
		name: "Open New Cycle",
		path: "/manage/new-cycle",
		component: NewCyclePage,
		requiresAuth: true,
		requiresKeyStakeholder: true,
		showInSidebar: false,
		layoutWrapper: "content",
	},
];

/** ---------------- Staff Profiles ---------------- */
export const STAFF_ROUTES: RouteConfig[] = [
	{
		name: "Staff Directory",
		path: "/staff",
		iconKey: "staff",
		tooltipKey: "staff",
		component: StaffDirectoryPage,
		requiresAuth: false,
		showInSidebar: true,
		section: "Staff",
		layoutWrapper: "staffProfile",
	},
	{
		name: "Staff Profile",
		path: "/staff/:staffProfilePk",
		component: StaffProfileDetailPage,
		requiresAuth: false,
		showInSidebar: false,
		layoutWrapper: "staffProfile",
	},
	{
		name: "Staff Profile Projects",
		path: "/staff/:staffProfilePk/projects",
		component: StaffProfileDetailPage,
		requiresAuth: false,
		showInSidebar: false,
		layoutWrapper: "staffProfile",
	},
	{
		name: "Staff Profile CV",
		path: "/staff/:staffProfilePk/background",
		component: StaffProfileDetailPage,
		requiresAuth: false,
		showInSidebar: false,
		layoutWrapper: "staffProfile",
	},
	{
		name: "Staff Profile Publications",
		path: "/staff/:staffProfilePk/publications",
		component: StaffProfileDetailPage,
		requiresAuth: false,
		showInSidebar: false,
		layoutWrapper: "staffProfile",
	},
];

/** ---------------- Combined ---------------- */
export const ALL_ROUTES: RouteConfig[] = [
	...AUTH_ROUTES,
	...DASHBOARD_ROUTES,
	...USER_ROUTES,
	...PROJECT_ROUTES,
	...STAFF_ROUTES,
	...REPORT_ROUTES,
	...ADMIN_ROUTES,
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
