import type { CreateProjectFormData } from "@/app/stores/derived/create-project-wizard.store";

export interface Step4ExternalValidationResult {
	isValid: boolean;
	errors: Record<string, string>;
}

/**
 * Validate Step 4: External Details
 *
 * Required fields:
 * - collaboration_with: At least one collaboration partner
 *
 * Optional fields:
 * - budget
 * - external_description
 * - aims
 */
export function validateStep4External(
	formData: CreateProjectFormData
): Step4ExternalValidationResult {
	const errors: Record<string, string> = {};

	// Validate collaboration_with (required)
	if (
		!formData.collaboration_with ||
		formData.collaboration_with.trim() === ""
	) {
		errors.collaboration_with =
			"At least one collaboration partner is required";
	}

	const isValid = Object.keys(errors).length === 0;

	return { isValid, errors };
}
