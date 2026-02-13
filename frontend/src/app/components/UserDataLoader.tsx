import { useCurrentUser } from "@/features/auth/hooks/useAuth";

/**
 * UserDataLoader - Loads user data when authenticated
 * This component should be rendered at the app level to ensure
 * user data is available throughout the application
 *
 * It automatically fetches user data when the user is authenticated
 * and updates the auth store via the useCurrentUser hook
 */
export const UserDataLoader = ({ children }: { children: React.ReactNode }) => {
	// This hook will automatically fetch user data when authenticated
	// and update the auth store via its useEffect
	useCurrentUser();

	return <>{children}</>;
};
