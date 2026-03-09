/**
 * Error message extraction utilities
 *
 * Provides user-friendly error messages by:
 * - Stripping HTML tags from error responses
 * - Extracting meaningful messages from API errors
 * - Limiting message length
 * - Providing fallback messages
 */

/**
 * Extracts a user-friendly error message from an Error object
 *
 * Handles:
 * - HTML error responses (strips tags)
 * - JSON error responses (extracts message)
 * - Network errors
 * - Generic errors
 *
 * @param error - The error object from API call
 * @param fallback - Fallback message if extraction fails
 * @returns User-friendly error message (max 200 characters)
 */
export function extractUserFriendlyMessage(
	error: Error,
	fallback: string = "An error occurred. Please try again."
): string {
	try {
		// Check if error has response data (Axios error)
		const axiosError = error as Error & { response?: { data?: unknown } };

		if (axiosError.response?.data) {
			const data = axiosError.response.data;

			// Handle JSON error response
			if (typeof data === "object" && data !== null) {
				// Try common error message fields
				const dataObj = data as Record<string, unknown>;
				const message =
					dataObj.message ||
					dataObj.error ||
					dataObj.detail ||
					(Array.isArray(dataObj.non_field_errors)
						? dataObj.non_field_errors[0]
						: null);

				if (message && typeof message === "string") {
					return stripHtmlAndLimit(message);
				}
			}

			// Handle HTML error response
			if (typeof data === "string") {
				return stripHtmlAndLimit(data);
			}
		}

		// Handle error message directly
		if (error.message) {
			return stripHtmlAndLimit(error.message);
		}

		// Fallback
		return fallback;
	} catch {
		return fallback;
	}
}

/**
 * Strips HTML tags from a string and limits length
 * Uses DOMParser for robust HTML handling including incomplete tags
 *
 * @param text - Text that may contain HTML
 * @returns Plain text, max 200 characters
 */
function stripHtmlAndLimit(text: string): string {
	try {
		// Parse HTML safely using DOMParser
		const parser = new DOMParser();
		const doc = parser.parseFromString(text, "text/html");

		// Extract text content (automatically strips all tags including incomplete ones)
		const stripped = doc.body.textContent || "";

		// Trim whitespace
		const trimmed = stripped.trim();

		// Limit length
		if (trimmed.length > 200) {
			return trimmed.substring(0, 197) + "...";
		}

		return trimmed;
	} catch {
		// Fallback: remove all < characters for safety
		const stripped = text.replace(/</g, "");
		const trimmed = stripped.trim();

		if (trimmed.length > 200) {
			return trimmed.substring(0, 197) + "...";
		}

		return trimmed;
	}
}

/**
 * Checks if a string contains HTML tags
 *
 * @param text - Text to check
 * @returns True if HTML tags found
 */
export function containsHtml(text: string): boolean {
	return /<[^>]*>/g.test(text);
}

/**
 * Gets a user-friendly message for common HTTP status codes
 *
 * @param statusCode - HTTP status code
 * @returns User-friendly message
 */
export function getStatusMessage(statusCode: number): string {
	const messages: Record<number, string> = {
		400: "Invalid request. Please check your input.",
		401: "You are not authorised. Please log in.",
		403: "You don't have permission to perform this action.",
		404: "The requested resource was not found.",
		409: "This action conflicts with existing data.",
		422: "The data provided is invalid.",
		500: "Server error. Please try again later.",
		502: "Service temporarily unavailable.",
		503: "Service temporarily unavailable.",
	};

	return messages[statusCode] || "An error occurred. Please try again.";
}

/**
 * Gets error message from unknown error type
 *
 * @param error - Unknown error object
 * @returns Error message string
 */
export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === "string") {
		return error;
	}
	return "An unknown error occurred";
}
