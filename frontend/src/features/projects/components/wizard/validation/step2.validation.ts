import type {
	CreateProjectFormData,
	StepValidation,
} from "@/app/stores/derived/create-project-wizard.store";

/**
 * Validate Step 2: Project Details
 *
 * Required fields:
 * - business_area: Must be a valid number > 0
 * - start_date: Must be a non-empty string
 * - project_leader: Must be a valid number
 *
 * Optional fields:
 * - service: Can be null or a valid number
 * - end_date: Can be null or must be after start_date
 * - data_custodian: Can be null or a valid number
 */
export function validateStep2(formData: CreateProjectFormData): StepValidation {
	const errors: Record<string, string> = {};

	// Validate business area (required)
	if (!formData.business_area || formData.business_area <= 0) {
		errors.business_area = "Business area is required";
	}

	// Validate start date (required)
	if (!formData.start_date || formData.start_date.trim() === "") {
		errors.start_date = "Start date is required";
	}

	// Validate end date (optional, but must be after start date if provided)
	if (formData.end_date && formData.start_date) {
		const startDate = new Date(formData.start_date);
		const endDate = new Date(formData.end_date);

		if (endDate < startDate) {
			errors.end_date = "End date must be after start date";
		}
	}

	// Validate project leader (required)
	if (!formData.project_leader) {
		errors.project_leader = "Project leader is required";
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors,
	};
}
