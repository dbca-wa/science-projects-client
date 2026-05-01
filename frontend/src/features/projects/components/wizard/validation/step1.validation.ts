import type { CreateProjectFormData } from "@/app/stores/derived/create-project-wizard.store";

/**
 * Validation result interface
 */
export interface ValidationResult {
	isValid: boolean;
	errors: Record<string, string>;
}

/**
 * Validate Step 1: Base Information
 *
 * Validates:
 * - Title: non-empty, max 500 characters
 * - Description: non-empty
 * - Keywords: at least 1 keyword
 */
export function validateStep1(
	data: Pick<CreateProjectFormData, "title" | "description" | "keywords">
): ValidationResult {
	const errors: Record<string, string> = {};

	// Validate title
	if (!data.title || data.title.trim().length === 0) {
		errors.title = "Title is required";
	} else if (data.title.length > 150) {
		errors.title = "Title must be 150 characters or less";
	}

	// Validate description
	if (!data.description || data.description.trim().length === 0) {
		errors.description = "Description is required";
	}

	// Validate keywords
	if (!data.keywords || data.keywords.length === 0) {
		errors.keywords = "At least one keyword is required";
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors,
	};
}
