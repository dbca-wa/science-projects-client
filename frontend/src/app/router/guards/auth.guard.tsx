import { useMemo } from "react";
import { Navigate, useLocation } from "react-router";
import { observer } from "mobx-react-lite";
import { useAuthStore } from "@/app/stores/store-context";
import { useDivisions } from "@/shared/hooks/queries/useDivisions";
import { useCurrentUser } from "@/features/auth";
import { toast } from "sonner";

/** Division slugs that grant AR admin access to key stakeholders */
const AR_ENABLED_DIVISION_SLUGS = ["BCS"];

/**
 * Protected Route Guard
 * - Checks if auth store is initialised
 * - Shows loading spinner while initialising
 * - Redirects to login if not authenticated
 * - Preserves original location in redirect state
 * - Renders children if authenticated
 */
export const ProtectedRoute = observer(
	({ children }: { children: React.ReactNode }) => {
		const authStore = useAuthStore();
		const location = useLocation();

		// Show loading spinner while initialising from cookies
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

/**
 * Inner component that checks key_stakeholder status using hooks.
 * Separated from the observer wrapper so hooks can be called unconditionally.
 */
// eslint-disable-next-line react-refresh/only-export-components
const KeyStakeholderCheck = ({ children }: { children: React.ReactNode }) => {
	const { data: currentUser } = useCurrentUser();
	const { data: divisions, isLoading } = useDivisions();

	const isKeyStakeholder = useMemo(() => {
		if (!currentUser || !divisions) return false;
		return divisions.some(
			(d) =>
				AR_ENABLED_DIVISION_SLUGS.includes(d.slug) &&
				d.key_stakeholder?.id === currentUser.id
		);
	}, [currentUser, divisions]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	if (!isKeyStakeholder) {
		toast.error("You don't have permission to access this page");
		return <Navigate to="/" replace />;
	}

	return <>{children}</>;
};

/**
 * Admin or Key Stakeholder Route Guard
 * Allows access if user is superuser OR key_stakeholder of an AR-enabled division.
 * Used for AR admin pages (batch approve, new cycle, report info).
 */
export const AdminOrKeyStakeholderRoute = observer(
	({ children }: { children: React.ReactNode }) => {
		const authStore = useAuthStore();
		const location = useLocation();

		if (!authStore.isAuthenticated) {
			return <Navigate to="/login" state={{ from: location }} replace />;
		}

		if (!authStore.user) {
			return (
				<div className="min-h-screen flex items-center justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
				</div>
			);
		}

		// Superusers always have access
		if (authStore.isSuperuser) {
			return <>{children}</>;
		}

		// Check if user is key_stakeholder of an AR-enabled division
		return <KeyStakeholderCheck>{children}</KeyStakeholderCheck>;
	}
);

AdminOrKeyStakeholderRoute.displayName = "AdminOrKeyStakeholderRoute";
