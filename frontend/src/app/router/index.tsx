import type { ComponentType, ReactNode } from "react";
import { Suspense } from "react";
import {
	Navigate,
	createBrowserRouter,
	useLocation,
	type RouteObject,
} from "react-router";

import {
	AdminRoute,
	AdminOrKeyStakeholderRoute,
	ProtectedRoute,
} from "./guards/auth.guard";

import {
	ALL_PROTECTED_ROUTES,
	ALL_PUBLIC_ROUTES,
	type RouteConfig,
} from "./routes.config";

import ErrorHandler from "@/shared/components/errors/ErrorHandler";
import { RouteLoader } from "@/shared/components/RouteLoader";
import { ContentWrapper } from "@/shared/components/layout/ContentWrapper";
import { Root } from "@/shared/components/layout/Root";
import { StaffProfileLayout } from "@/shared/components/layout/staff-profile/StaffProfileLayout";

/** ---------- Auth wrapper ---------- */
const withAuth = (config: RouteConfig, element: ReactNode) => {
	if (config.requiresKeyStakeholder) {
		return <AdminOrKeyStakeholderRoute>{element}</AdminOrKeyStakeholderRoute>;
	}
	if (config.requiresAdmin) {
		return <AdminRoute>{element}</AdminRoute>;
	}
	if (config.requiresAuth) {
		return <ProtectedRoute>{element}</ProtectedRoute>;
	}
	return element;
};

/** ---------- Layout wrapper ---------- */
const withLayout = (config: RouteConfig, element: ReactNode) => {
	const secured = withAuth(config, element);

	switch (config.layoutWrapper) {
		case "content":
			return <ContentWrapper>{secured}</ContentWrapper>;

		case "staffProfile":
			return <StaffProfileLayout>{secured}</StaffProfileLayout>;

		case "none":
		default:
			return secured;
	}
};

/**
 * Build a wrapper Component (not a static element) for a route.
 *
 * The wrapper reads `useLocation()` and passes `key={location.pathname}` to
 * the page component. This forces React to treat each URL as a distinct
 * component instance, so back/forward navigation correctly remounts the page
 * and hooks like useParams return updated values.
 *
 * See: https://stackoverflow.com/questions/32261441
 */
const buildRouteComponent = (config: RouteConfig): ComponentType => {
	const PageComponent = config.component;
	const props = config.componentProps ?? {};

	if (config.layoutWrapper === "staffProfile") {
		const Wrapper = () => {
			const location = useLocation();
			const secured = withAuth(
				config,
				<PageComponent key={location.pathname} {...props} />
			);
			return (
				<Suspense fallback={<div className="min-h-screen bg-white" />}>
					<StaffProfileLayout>{secured}</StaffProfileLayout>
				</Suspense>
			);
		};
		Wrapper.displayName = `StaffRoute(${config.name})`;
		return Wrapper;
	}

	// All other routes: layout renders immediately, Suspense wraps the page
	const Wrapper = () => {
		const location = useLocation();
		return withLayout(
			config,
			<Suspense fallback={<RouteLoader />}>
				<PageComponent key={location.pathname} {...props} />
			</Suspense>
		) as React.ReactElement;
	};
	Wrapper.displayName = `Route(${config.name})`;
	return Wrapper;
};

/** Convert a RouteConfig to a RouteObject
 * If `asChild` is true we:
 *   - make the path relative (strip leading '/')
 *   - turn "/" into an index route under its parent
 *
 * Uses the `Component` property instead of `element` so React Router creates
 * a fresh element on each render — fixing back/forward navigation for routes
 * that share the same page component (e.g. project detail tabs).
 */
const toRouteObject = (config: RouteConfig, asChild = false): RouteObject => {
	const RouteComponent = buildRouteComponent(config);

	// Normalise child path for nesting under Root
	const rawPath = config.path;
	const path = asChild && rawPath.startsWith("/") ? rawPath.slice(1) : rawPath;

	const route: RouteObject =
		asChild && rawPath === "/"
			? { index: true, Component: RouteComponent }
			: { path, Component: RouteComponent };

	if (config.children?.length) {
		route.children = config.children.map((child) => toRouteObject(child, true));
	}

	return route;
};

/** ---------- Build router ---------- */
const PUBLIC_ROUTES: RouteObject[] = ALL_PUBLIC_ROUTES.map((r) =>
	toRouteObject(r, false)
);

// All protected pages (includes admin) live under Root so they inherit layout/navigation
const PROTECTED_CHILDREN: RouteObject[] = ALL_PROTECTED_ROUTES.map((r) =>
	toRouteObject(r, true)
);

export const router = createBrowserRouter([
	// Public (no protection)
	...PUBLIC_ROUTES,

	// Protected (everything behind auth, rendered inside Root)
	{
		path: "/",
		element: (
			<ProtectedRoute>
				<Root />
			</ProtectedRoute>
		),
		errorElement: <ErrorHandler />,
		children: [
			...PROTECTED_CHILDREN,

			// Legacy redirects
			{ path: "dashboard", element: <Navigate to="/" replace /> },
			{
				path: "manage/emails",
				element: <Navigate to="/manage/approvers" replace />,
			},
		],
	},
]);
