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
