import { apiClient } from "@/shared/lib/api-client";
import type { ApiResponse } from "@/shared/types/api.types";
import type { User } from "@/app/stores/auth.store";

// Login request payload

export interface LoginRequest {
	email: string;
	password: string;
}

// Login response

export interface LoginResponse {
	user: User;
	token: string;
}

// Register request payload

export interface RegisterRequest {
	username: string;
	email: string;
	password: string;
}

/**
 * Authentication service
 * All methods return promises that TanStack Query will consume
 */
export const authService = {
	// Login user
	async login(credentials: LoginRequest): Promise<LoginResponse> {
		const response = await apiClient.post<ApiResponse<LoginResponse>>(
			"/auth/login",
			credentials
		);
		return response.data.data;
	},

	// Register new user
	async register(userData: RegisterRequest): Promise<LoginResponse> {
		const response = await apiClient.post<ApiResponse<LoginResponse>>(
			"/auth/register",
			userData
		);
		return response.data.data;
	},

	// Logout user
	async logout(): Promise<void> {
		await apiClient.post("/auth/logout");
	},

	// Get current user
	async getCurrentUser(): Promise<User> {
		const response = await apiClient.get<ApiResponse<User>>("/auth/me");
		return response.data.data;
	},

	// Update user profile
	async updateProfile(userData: Partial<User>): Promise<User> {
		const response = await apiClient.patch<ApiResponse<User>>(
			"/auth/profile",
			userData
		);
		return response.data.data;
	},
};
