import { useAuthStore } from "@/app/stores/useStore";
import {
	getSSOMe,
	logInOrdinary,
	logOut,
} from "@/features/auth/services/auth.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate, useLocation, type Location } from "react-router";
import { toast } from "sonner";
import type { LoginFormData } from "../types";

export const authKeys = {
	all: ["auth"] as const,
	user: () => [...authKeys.all, "user"] as const,
};

interface LoginRedirectState {
	from: Location;
}

/**
 * Hook for fetching current user data
 * - Only enabled when authenticated
 * - Updates auth store with user data on success
 * - Appropriate stale time for user data
 */
export const useCurrentUser = () => {
	const authStore = useAuthStore();

	const query = useQuery({
		queryKey: authKeys.user(),
		queryFn: getSSOMe,
		enabled: authStore.isAuthenticated,
		staleTime: 5 * 60_000, // 5 minutes
		retry: false, // Don't retry on 401
	});

	// Update auth store with user data on successful fetch
	useEffect(() => {
		if (query.data) {
			authStore.setUser((query.data as any));
		} else if (query.isError) {
			// Handle error case - clear user data
			authStore.setUser(null);
		}
	}, [query.data, query.isError, authStore]);

	return query;
};

/**
 * Hook for login mutation
 * - Handles success by updating auth store
 * - Shows toast notifications for errors
 * - Navigates to saved location or dashboard on success
 */
export const useLogin = () => {
	const authStore = useAuthStore();
	const qc = useQueryClient();
	const navigate = useNavigate();
	const location = useLocation();

	return useMutation({
		mutationFn: (vars: LoginFormData) => logInOrdinary(vars),
		onSuccess: async () => {
			// Cookies are set by the API response
			authStore.login();
			toast.success("Logged in successfully");

			// Ensure we fetch the user immediately
			await qc.invalidateQueries({ queryKey: authKeys.user() });

			// Optionally wait until a fresh /me is in cache
			try {
				await qc.ensureQueryData({
					queryKey: authKeys.user(),
					queryFn: getSSOMe,
				});
			} catch {
				// If /me fails, we'll handle it in the next render
			}

			// Check for saved location from redirect state
			// If user was redirected to login, navigate back to original location
			// Otherwise, navigate to dashboard
			const from = (location.state as LoginRedirectState)?.from?.pathname || "/";
			navigate(from, { replace: true });
		},
		//eslint-disable-next-line
		onError: (err: any) => {
			toast.error(err?.message ?? "Login failed");
		},
	});
};

/**
 * Hook for logout mutation
 * - Clears auth store on success
 * - Invalidates TanStack Query cache
 * - Navigates to login page
 */
export const useLogout = () => {
	const authStore = useAuthStore();
	const qc = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: logOut,
		onSuccess: () => {
			// Clear auth store
			authStore.logout();
			
			// Clear all TanStack Query cache
			qc.clear();
			
			toast.success("Logged out successfully");
			
			// Navigate to login page
			navigate("/login");
		},
	});
};
