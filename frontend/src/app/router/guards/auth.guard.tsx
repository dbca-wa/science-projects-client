import { Navigate, useLocation } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "@/app/stores/root.store";

/**
 * Protected Route Guard
 * Redirects to login if user is not authenticated
 */
export const ProtectedRoute = observer(
	({ children }: { children: React.ReactNode }) => {
		const { authStore } = useStore();
		const location = useLocation();

		if (!authStore.isAuthenticated) {
			// Redirect to login, but save the location they were trying to access
			return <Navigate to="/login" state={{ from: location }} replace />;
		}

		return <>{children}</>;
	}
);
