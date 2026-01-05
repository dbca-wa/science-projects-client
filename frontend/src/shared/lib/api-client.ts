import axios, { type AxiosError, type AxiosResponse } from "axios";
import { rootStore } from "@/app/stores/store-context";

/**
 * Axios instance configured for our API
 */
export const apiClient = axios.create({
	baseURL:
		import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1",
	timeout: 10000, // 10 second timeout
	headers: {
		"Content-Type": "application/json",
	},
});

/**
 * Request interceptor to add auth token to all requests
 */
apiClient.interceptors.request.use(
	(config) => {
		const token = rootStore.authStore.token;

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

/**
 * Response interceptor for centralised error handling
 */
apiClient.interceptors.response.use(
	(response: AxiosResponse) => {
		// Return successful responses as-is
		return response;
	},
	(error: AxiosError) => {
		// Handle different error scenarios
		if (error.response) {
			// Server responded with error status
			const status = error.response.status;

			switch (status) {
				case 401:
					// Unauthorized - token expired or invalid
					rootStore.authStore.logout();
					window.location.href = "/login";
					break;
				case 403:
					// Forbidden
					console.error("Access forbidden");
					break;
				case 404:
					// Not found
					console.error("Resource not found");
					break;
				case 500:
					// Server error
					console.error("Server error occurred");
					break;
				default:
					console.error(`Error ${status}:`, error.response.data);
			}
		} else if (error.request) {
			// Request made but no response received
			console.error("No response from server");
		} else {
			// Error setting up the request
			console.error("Request error:", error.message);
		}

		return Promise.reject(error);
	}
);
