import type { ReactNode } from "react";
import { Suspense } from "react";
import { Navigate, createBrowserRouter, type RouteObject } from "react-router";

import { AdminRoute, ProtectedRoute } from "./guards/auth.guard";

import {
	ALL_PROTECTED_ROUTES,
	ALL_PUBLIC_ROUTES,
	type RouteConfig,
} from "./routes.config";

import ErrorHandler from "@/shared/components/errors/ErrorHandler";
import { RouteLoader } from "@/shared/components/RouteLoader";
import { ContentWrapper } from "@/shared/components/layout/ContentWrapper";
import { LayoutCheckWrapper } from "@/shared/components/layout/LayoutCheckWrapper";
import { Root } from "@/shared/components/layout/Root";
import { StaffProfileLayout } from "@/shared/components/layout/staff-profile/StaffProfileLayout";

/** ---------- Auth wrapper ---------- */
const withAuth = (config: RouteConfig, element: ReactNode) => {
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

		case "layoutCheck":
			return (
				<ContentWrapper>
					<LayoutCheckWrapper>{secured}</LayoutCheckWrapper>
				</ContentWrapper>
			);

		case "staffProfile":
			// Staff routes are public, but this still composes correctly if they are later secured/disabled
			return <StaffProfileLayout>{secured}</StaffProfileLayout>;

		case "none":
		default:
			return secured;
	}
};

/** Convert a RouteConfig to a RouteObject
 * If `asChild` is true we:
 *   - make the path relative (strip leading '/')
 *   - turn "/" into an index route under its parent
 */
const toRouteObject = (config: RouteConfig, asChild = false): RouteObject => {
	const Component = config.component;

	const element = withLayout(
		config,
		<Suspense fallback={<RouteLoader />}>
			<Component {...(config.componentProps ?? {})} />
		</Suspense>
	);

	// Normalize child path for nesting under Root
	const rawPath = config.path;
	const path =
		asChild && rawPath.startsWith("/") ? rawPath.slice(1) : rawPath;

	const route: RouteObject =
		asChild && rawPath === "/"
			? { index: true, element } // make Dashboard an index route under Root
			: { path, element };

	if (config.children?.length) {
		route.children = config.children.map((child) =>
			toRouteObject(child, true)
		);
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

			// Legacy redirect for dashboard
			{ path: "dashboard", element: <Navigate to="/" replace /> },
		],
	},
]);
