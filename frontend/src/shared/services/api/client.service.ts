import axios, {
	type AxiosInstance,
	type AxiosRequestConfig,
	type AxiosResponse,
	type AxiosError,
} from "axios";
import Cookie from "js-cookie";
import { logger } from "@/shared/services/logger.service";
import { API_CONFIG } from "./config";
import type { DjangoErrorResponse } from "@/shared/types/api.types";
import {
	isDjangoDetailError,
	isDjangoNonFieldErrors,
	isDjangoFieldErrors,
} from "@/shared/types/api.types";

export interface ApiError {
	message: string;
	status: number;
	fieldErrors?: Record<string, string[]>;
}

export class ApiClientService {
	private client: AxiosInstance;
	private onUnauthorized: (() => void) | null = null;

	constructor() {
		this.client = axios.create({
			baseURL: API_CONFIG.BASE_URL,
			timeout: API_CONFIG.TIMEOUT,
			headers: { "Content-Type": "application/json" },
			withCredentials: true,
		});

		this.setupInterceptors();
	}

	private setupInterceptors(): void {
		// Request interceptor to add CSRF token
		this.client.interceptors.request.use(
			(config) => {
				const csrfToken = Cookie.get("spmscsrf");

				if (csrfToken) {
					config.headers["X-CSRFToken"] = csrfToken;
				} else {
					// Clean up old cookies if CSRF token is missing
					Cookie.remove("csrf");
					Cookie.remove("sessionid");
				}

				return config;
			},
			(error) => {
				return Promise.reject(error);
			}
		);

		// Response interceptor for error handling
		this.client.interceptors.response.use(
			(response: AxiosResponse) => response,
			async (error: AxiosError) => {
				if (error.response) {
					const status = error.response.status;

					switch (status) {
						case 401:
							logger.warn(
								"Unauthorised access - triggering logout"
							);
							await this.handleUnauthorized();
							break;
						case 403:
							logger.error("Access forbidden", {
								data: error.response.data,
							});
							break;
						case 404:
							logger.error("Resource not found", {
								data: error.response.data,
							});
							break;
						case 500:
							logger.error("Server error", {
								data: error.response.data,
							});
							break;
						default:
							logger.error(`Error ${status}`, {
								data: error.response.data,
							});
					}
				} else if (error.request) {
					logger.error("No response from server");
				} else {
					logger.error("Request error", { message: error.message });
				}

				throw this.createApiError(error);
			}
		);
	}

	private async handleUnauthorized(): Promise<void> {
		// Clear cookies
		Cookie.remove("spmscsrf");
		Cookie.remove("csrf");
		Cookie.remove("sessionid");

		// Trigger the unauthorized handler if set
		if (this.onUnauthorized) {
			this.onUnauthorized();
		}
	}

	private createApiError(error: AxiosError): ApiError {
		const status = error.response?.status || 0;
		const data = error.response?.data as DjangoErrorResponse | undefined;

		let message = "An error occurred";
		let fieldErrors: Record<string, string[]> | undefined;

		if (data) {
			if (isDjangoDetailError(data)) {
				message = data.detail;
			} else if (isDjangoNonFieldErrors(data)) {
				message = data.non_field_errors[0] ?? message;
			} else if (isDjangoFieldErrors(data)) {
				fieldErrors = {};
				const fieldMessages: string[] = [];

				Object.entries(data).forEach(([field, errors]) => {
					if (errors) {
						const errorArray = Array.isArray(errors)
							? errors
							: [errors];
						fieldErrors![field] = errorArray;
						fieldMessages.push(`${field}: ${errorArray[0]}`);
					}
				});

				if (fieldMessages.length > 0) {
					message = fieldMessages[0];
				}
			} else if (typeof data === "string") {
				message = data;
			}
		}

		return {
			message,
			status,
			fieldErrors,
		};
	}

	// Basic HTTP methods
	async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
		const response = await this.client.get<T>(url, config);
		return response.data;
	}

	async post<T>(
		url: string,
		data?: unknown,
		config?: AxiosRequestConfig
	): Promise<T> {
		const response = await this.client.post<T>(url, data, config);
		return response.data;
	}

	async put<T>(
		url: string,
		data?: unknown,
		config?: AxiosRequestConfig
	): Promise<T> {
		const response = await this.client.put<T>(url, data, config);
		return response.data;
	}

	async patch<T>(
		url: string,
		data?: unknown,
		config?: AxiosRequestConfig
	): Promise<T> {
		const response = await this.client.patch<T>(url, data, config);
		return response.data;
	}

	async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
		const response = await this.client.delete<T>(url, config);
		return response.data;
	}

	// Blob methods for file downloads
	async getBlob(url: string, config?: AxiosRequestConfig): Promise<Blob> {
		const response = await this.client.get(url, {
			...config,
			responseType: "blob",
		});
		return response.data;
	}

	// Configuration methods
	setUnauthorizedHandler(handler: () => void): void {
		this.onUnauthorized = handler;
	}

	// Get the raw axios instance if needed for special cases
	getRawClient(): AxiosInstance {
		return this.client;
	}
}

export const apiClient = new ApiClientService();
