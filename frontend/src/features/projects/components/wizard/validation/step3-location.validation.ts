/**
 * Validation result interface
 */
export interface Step3LocationValidationResult {
	isValid: boolean;
	errors: Record<string, string>;
}

/**
 * Validate Step 3: Location
 *
 * Required fields:
 * - areas: At least 1 location area must be selected
 */
export function validateStep3Location(data: {
	areas: number[];
}): Step3LocationValidationResult {
	const errors: Record<string, string> = {};

	if (!data.areas || data.areas.length === 0) {
		errors.areas = "At least one location area is required";
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors,
	};
}
