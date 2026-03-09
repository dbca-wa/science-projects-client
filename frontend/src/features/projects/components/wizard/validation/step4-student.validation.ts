import type { CreateProjectFormData } from "@/app/stores/derived/create-project-wizard.store";

export interface Step4StudentValidationResult {
	isValid: boolean;
	errors: Record<string, string>;
}

/**
 * Validate Step 4: Student Details
 *
 * Required fields:
 * - organisation: At least one organisation
 * - level: Student level
 */
export function validateStep4Student(
	formData: CreateProjectFormData
): Step4StudentValidationResult {
	const errors: Record<string, string> = {};

	// Validate organisation (required)
	if (!formData.organisation || formData.organisation.trim() === "") {
		errors.organisation = "At least one organisation is required";
	}

	// Validate level (required)
	if (!formData.level || formData.level.trim() === "") {
		errors.level = "Student level is required";
	}

	const isValid = Object.keys(errors).length === 0;

	return { isValid, errors };
}
