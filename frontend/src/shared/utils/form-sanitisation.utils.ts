import { sanitizeInput, sanitizeRichText } from "./sanitise.utils";

/**
 * Sanitises string values in an object recursively.
 * - Plain text fields are sanitised with sanitizeInput (removes all HTML)
 * - Rich text fields (specified in richTextFields) are sanitised with sanitizeRichText
 * - Other types (numbers, booleans, null, undefined) are left unchanged
 *
 * @param data - The form data object to sanitise
 * @param richTextFields - Array of field names that contain rich text (HTML) content
 * @returns Sanitised form data
 *
 * @example
 * ```ts
 * const formData = {
 *   name: '<script>alert("XSS")</script>John',
 *   about: '<p>Hello <strong>world</strong></p>',
 *   age: 25
 * };
 *
 * const sanitised = sanitiseFormData(formData, ['about']);
 * // Returns: {
 * //   name: 'John',
 * //   about: '<p>Hello <strong>world</strong></p>',
 * //   age: 25
 * // }
 * ```
 */
export function sanitiseFormData<T extends Record<string, unknown>>(
	data: T,
	richTextFields: string[] = []
): T {
	const sanitised = { ...data };

	for (const key in sanitised) {
		const value = sanitised[key];

		// Skip non-string values
		if (typeof value !== "string") {
			continue;
		}

		// Sanitise rich text fields with sanitizeRichText (allows safe HTML)
		if (richTextFields.includes(key)) {
			sanitised[key] = sanitizeRichText(value) as T[Extract<keyof T, string>];
		} else {
			// Sanitise plain text fields with sanitizeInput (removes all HTML)
			sanitised[key] = sanitizeInput(value) as T[Extract<keyof T, string>];
		}
	}

	return sanitised;
}

/**
 * List of common rich text field names that should preserve HTML formatting.
 * These fields will be sanitised with sanitizeRichText instead of sanitizeInput.
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
