import { Navigate, useLocation } from "react-router";
import { observer } from "mobx-react-lite";
import { useAuthStore } from "@/app/stores/useStore";
import { toast } from "sonner";

/**
 * Protected Route Guard
 * - Checks if auth store is initialized
 * - Shows loading spinner while initializing
 * - Redirects to login if not authenticated
 * - Preserves original location in redirect state
 * - Renders children if authenticated
 */
export const ProtectedRoute = observer(
	({ children }: { children: React.ReactNode }) => {
		const authStore = useAuthStore();
		const location = useLocation();

		// Show loading spinner while initializing from cookies
		if (!authStore.state.initialised) {
			return (
				<div className="min-h-screen flex items-center justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
				</div>
			);
		}

		// Redirect to login if not authenticated, preserving the original location
		if (!authStore.isAuthenticated) {
			return <Navigate to="/login" state={{ from: location }} replace />;
		}

		// Render children if authenticated
		return <>{children}</>;
	}
);

/**
 * Admin-Only Route Guard
 * Redirects to home if user is not an admin
 * Waits for user data to be loaded before checking admin status
 */
export const AdminRoute = observer(
	({ children }: { children: React.ReactNode }) => {
		const authStore = useAuthStore();
		const location = useLocation();

		if (!authStore.isAuthenticated) {
			// Not logged in - redirect to login
			return <Navigate to="/login" state={{ from: location }} replace />;
		}

		// Wait for user data to be loaded
		if (!authStore.user) {
			return (
				<div className="min-h-screen flex items-center justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
				</div>
			);
		}

		if (!authStore.isSuperuser) {
			// Logged in but not admin - redirect to home with message
			toast.error("You don't have permission to access this page");
			return <Navigate to="/" replace />;
		}

		return <>{children}</>;
	}
);

ProtectedRoute.displayName = "ProtectedRoute";
AdminRoute.displayName = "AdminRoute";
