import { sanitizeInput, sanitizeRichText } from "./sanitize.utils";

/**
 * Sanitizes string values in an object recursively.
 * - Plain text fields are sanitized with sanitizeInput (removes all HTML)
 * - Rich text fields (specified in richTextFields) are sanitized with sanitizeRichText
 * - Other types (numbers, booleans, null, undefined) are left unchanged
 *
 * @param data - The form data object to sanitize
 * @param richTextFields - Array of field names that contain rich text (HTML) content
 * @returns Sanitized form data
 *
 * @example
 * ```ts
 * const formData = {
 *   name: '<script>alert("XSS")</script>John',
 *   about: '<p>Hello <strong>world</strong></p>',
 *   age: 25
 * };
 *
 * const sanitized = sanitizeFormData(formData, ['about']);
 * // Returns: {
 * //   name: 'John',
 * //   about: '<p>Hello <strong>world</strong></p>',
 * //   age: 25
 * // }
 * ```
 */
export function sanitizeFormData<T extends Record<string, unknown>>(
	data: T,
	richTextFields: string[] = []
): T {
	const sanitized = { ...data };

	for (const key in sanitized) {
		const value = sanitized[key];

		// Skip non-string values
		if (typeof value !== "string") {
			continue;
		}

		// Sanitize rich text fields with sanitizeRichText (allows safe HTML)
		if (richTextFields.includes(key)) {
			sanitized[key] = sanitizeRichText(value) as T[Extract<keyof T, string>];
		} else {
			// Sanitize plain text fields with sanitizeInput (removes all HTML)
			sanitized[key] = sanitizeInput(value) as T[Extract<keyof T, string>];
		}
	}

	return sanitized;
}

/**
 * List of common rich text field names that should preserve HTML formatting.
 * These fields will be sanitized with sanitizeRichText instead of sanitizeInput.
 */
export const COMMON_RICH_TEXT_FIELDS = [
	"about",
	"expertise",
	"description",
	"content",
	"bio",
	"notes",
	"comments",
	"message",
] as const;
