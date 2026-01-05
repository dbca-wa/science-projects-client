import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import type { LoginRequest, RegisterRequest } from "../services/auth.service";
import { useStore } from "@/app/stores/useStore";
import { toast } from "sonner";

// Temporary mock flag - set to true to test without backend
const USE_MOCK = true;

// Mock delay to simulate network request
const mockDelay = (ms: number = 1000) =>
	new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Query key factory for auth-related queries
 * Provides consistent, type-safe query keys
 */
export const authKeys = {
	all: ["auth"] as const,
	user: () => [...authKeys.all, "user"] as const,
};

/**
 * Hook to fetch current user
 * Uses useQuery for data fetching with automatic caching
 */
export const useCurrentUser = () => {
	const { authStore } = useStore();

	return useQuery({
		queryKey: authKeys.user(),
		queryFn: authService.getCurrentUser,
		enabled: authStore.isAuthenticated, // Only run query if user is logged in
		staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
	});
};

/**
 * Hook for login mutation
 * Uses useMutation for one-time operations that modify server state
 */
export const useLogin = () => {
	const { authStore } = useStore();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (credentials: LoginRequest) => {
			if (USE_MOCK) {
				// Mock implementation
				await mockDelay(1000);

				// Simulate validation
				if (credentials.email === "error@test.com") {
					throw new Error("Invalid credentials");
				}

				// Return mock user
				return {
					user: {
						id: "1",
						email: credentials.email,
						username: credentials.email.split("@")[0],
					},
					token: "mock-jwt-token-" + Date.now(),
				};
			}

			// Real implementation (when backend is ready)
			return authService.login(credentials);
		},
		onSuccess: (data) => {
			authStore.login(data.user, data.token);
			queryClient.invalidateQueries({ queryKey: authKeys.user() });
			toast.success("Logged in successfully!");
		},
		onError: (error: any) => {
			toast.error(error.message || "Login failed");
		},
	});
};

/**
 * Hook for register mutation
 */
export const useRegister = () => {
	const { authStore } = useStore();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (userData: RegisterRequest) => {
			if (USE_MOCK) {
				// Mock implementation
				await mockDelay(1000);

				// Simulate validation
				if (userData.email === "taken@test.com") {
					throw new Error("Email already exists");
				}

				// Return mock user
				return {
					user: {
						id: "1",
						email: userData.email,
						username: userData.username,
					},
					token: "mock-jwt-token-" + Date.now(),
				};
			}

			// Real implementation (when backend is ready)
			return authService.register(userData);
		},
		onSuccess: (data) => {
			authStore.login(data.user, data.token);
			queryClient.invalidateQueries({ queryKey: authKeys.user() });
			toast.success("Account created successfully!");
		},
		onError: (error: any) => {
			toast.error(error.message || "Registration failed");
		},
	});
};

/**
 * Hook for logout mutation
 */
export const useLogout = () => {
	const { authStore } = useStore();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: authService.logout,
		onSuccess: () => {
			authStore.logout();
			queryClient.clear(); // Clear all cached data on logout
			toast.success("Logged out successfully!");
		},
	});
};
