import type {
	IUsernameLoginVariables,
	IUsernameLoginSuccess,
} from "@/features/auth/types";
import { apiClient } from "@/shared/services/api/client.service";
import { AUTH_ENDPOINTS } from "./auth.endpoints";
import type { IUserData } from "@/shared/types/user.types";

/**
 * Login with username and password
 */
export const logInOrdinary = async ({
	username,
	password,
}: IUsernameLoginVariables): Promise<IUsernameLoginSuccess> => {
	const response = await apiClient.post<IUsernameLoginSuccess>(
		AUTH_ENDPOINTS.LOGIN,
		{ username, password }
	);

	if (!response.ok) {
		throw new Error("Please check your credentials and try again.");
	}

	return response;
};

/**
 * Logout current user
 */
export const logOut = async () => {
	return apiClient.post<{ ok: string }>(AUTH_ENDPOINTS.LOGOUT);
};

/**
 * Get current user via SSO
 */
export const getSSOMe = async () => {
	return apiClient.get<IUserData>(AUTH_ENDPOINTS.ME);
};
