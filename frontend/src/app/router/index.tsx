import { createBrowserRouter, Navigate } from "react-router";
import { ROUTES_CONFIG } from "@/config/routes.config";
import { ProtectedRoute } from "./guards/auth.guard";

// We will create this file soon
import AppLayout from "@/shared/components/layout/AppLayout";

/**
 * Generate router from configuration
 */
const generateRouter = () => {
	// Separate public and protected routes
	const publicRoutes = ROUTES_CONFIG.filter((r) => !r.requiresAuth);
	const protectedRoutes = ROUTES_CONFIG.filter((r) => r.requiresAuth);

	return createBrowserRouter([
		// Public routes (no layout)
		...publicRoutes.map((route) => ({
			path: route.path,
			element: <route.component />,
		})),

		// Protected routes (with layout)
		{
			path: "/",
			element: (
				<ProtectedRoute>
					<AppLayout />
				</ProtectedRoute>
			),
			children: protectedRoutes.map((route) => ({
				path: route.path === "/" ? "" : route.path,
				element: <route.component />,
			})),
		},

		// Catch-all redirect
		{
			path: "*",
			element: <Navigate to="/" replace />,
		},
	]);
};

export const router = generateRouter();
