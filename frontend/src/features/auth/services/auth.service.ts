import type {
	LoginFormData,
	IUsernameLoginSuccess,
} from "@/features/auth/types";
import { apiClient, type ApiError } from "@/shared/services/api/client.service";
import { AUTH_ENDPOINTS } from "./auth.endpoints";
import type { IUserMe } from "@/shared/types/user.types";

const INVALID_CREDENTIALS_MESSAGE =
	"Please check your credentials and try again.";

const isApiError = (error: unknown): error is ApiError =>
	typeof error === "object" && error !== null && "status" in error;

/**
 * Login with username and password.
 * Fetches a fresh CSRF cookie first (in case the session was cleared).
 */
export const logInOrdinary = async ({
	username,
	password,
}: LoginFormData): Promise<IUsernameLoginSuccess> => {
	// Ensure a CSRF cookie exists before POSTing
	await apiClient.get(AUTH_ENDPOINTS.LOGIN);

	let response: IUsernameLoginSuccess;
	try {
		response = await apiClient.post<IUsernameLoginSuccess>(
			AUTH_ENDPOINTS.LOGIN,
			{ username, password }
		);
	} catch (error) {
		// The API returns 400 for invalid credentials. Surface a single,
		// non-revealing message; network and server errors propagate unchanged.
		if (isApiError(error) && error.status === 400) {
			throw new Error(INVALID_CREDENTIALS_MESSAGE, { cause: error });
		}
		throw error;
	}

	// Defensive: a 2xx response should always carry `ok`.
	if (!response.ok) {
		throw new Error(INVALID_CREDENTIALS_MESSAGE);
	}

	return response;
};

/**
 * Logout current user.
 * In production, the backend returns a logoutUrl from the SSO gateway
 * that must be navigated to in order to terminate the SSO session.
 */
export const logOut = async () => {
	return apiClient.post<{ ok?: string; logoutUrl?: string }>(
		AUTH_ENDPOINTS.LOGOUT
	);
};

/**
 * Get current user via SSO
 */
export const getSSOMe = async () => {
	return apiClient.get<IUserMe>(AUTH_ENDPOINTS.ME);
};
