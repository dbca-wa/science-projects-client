import { createBrowserRouter, Navigate } from "react-router";
import { ROUTES_CONFIG } from "@/config/routes.config";
import { ProtectedRoute } from "./guards/auth.guard";
import AppLayout from "@/shared/components/layout/AppLayout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

/**
 * Generate router from configuration
 */
const generateRouter = () => {
	return createBrowserRouter([
		// Auth routes (no layout)
		{
			path: "/login",
			element: <Login />,
		},
		{
			path: "/register",
			element: <Register />,
		},

		// All other routes use the layout
		{
			path: "/",
			element: <AppLayout />,
			children: ROUTES_CONFIG.filter(
				(r) => r.path !== "/login" && r.path !== "/register"
			).map((route) => {
				const element = <route.component />;

				return {
					path: route.path === "/" ? "" : route.path,
					element: route.requiresAuth ? (
						<ProtectedRoute>{element}</ProtectedRoute>
					) : (
						element
					),
				};
			}),
		},

		// Catch-all redirect
		{
			path: "*",
			element: <Navigate to="/" replace />,
		},
	]);
};

export const router = generateRouter();
