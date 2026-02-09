import type { AxiosError } from "axios";

// Standard API response wrapper
export interface ApiResponse<T> {
	data: T;
	message?: string;
	success: boolean;
}

// API error response
export interface ApiError {
	message: string;
	errors?: Record<string, string[]>;
	statusCode: number;
}

// Pagination metadata
export interface PaginationMeta {
	page: number;
	pageSize: number;
	totalPages: number;
	totalItems: number;
}

// Paginated API response
export interface PaginatedResponse<T> {
	data: T[];
	meta: PaginationMeta;
}

export type CustomAxiosError = AxiosError<{
	non_field_errors?: string[];
}>;

export interface DjangoDetailError {
	detail: string;
}

export interface DjangoNonFieldErrors {
	non_field_errors: string[];
}

export interface DjangoFieldErrors {
	[field: string]: string | string[];
}

export type DjangoErrorResponse =
	| DjangoDetailError
	| DjangoNonFieldErrors
	| DjangoFieldErrors
	| string;

export function isDjangoDetailError(
	error: DjangoErrorResponse
): error is DjangoDetailError {
	return typeof error === "object" && "detail" in error;
}

export function isDjangoNonFieldErrors(
	error: DjangoErrorResponse
): error is DjangoNonFieldErrors {
	return typeof error === "object" && "non_field_errors" in error;
}

export function isDjangoFieldErrors(
	error: DjangoErrorResponse
): error is DjangoFieldErrors {
	if (typeof error !== "object" || error === null) return false;
	if ("detail" in error || "non_field_errors" in error) return false;
	return Object.keys(error).length > 0;
}
