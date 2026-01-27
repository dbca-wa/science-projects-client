import { useCallback, useMemo } from "react";
import { useProjectWizardStore } from "@/app/stores/store-context";

/**
 * Validation errors for a step
 */
export interface StepValidationErrors {
	[fieldName: string]: string;
}

/**
 * Validation result for a step
 */
export interface StepValidationResult {
	isValid: boolean;
	errors: StepValidationErrors;
}

/**
 * Hook for wizard form validation
 * 
 * Provides validation logic for each step of the wizard.
 * Validates required fields, formats, and business rules.
 * 
 * @returns Validation functions and state
 */
export const useWizardValidation = () => {
	const wizardStore = useProjectWizardStore();
	const formData = wizardStore.state.formData;
	const projectKind = wizardStore.state.projectKind;

	/**
	 * Validate Base Information Step (Step 0)
	 */
	const validateBaseInformation = useCallback((): StepValidationResult => {
		const errors: StepValidationErrors = {};
		const data = formData.baseInformation;

		// Title is required (max 150 chars)
		if (!data.title || data.title.trim().length === 0) {
			errors.title = "Title is required";
		} else if (data.title.length > 150) {
			errors.title = "Title must be 150 characters or less";
		}

		// Keywords are required (at least one)
		if (!data.keywords || data.keywords.length === 0) {
			errors.keywords = "At least one keyword is required";
		}

		// Description is required
		if (!data.description || data.description.trim().length === 0) {
			errors.description = "Project summary is required";
		}

		return {
			isValid: Object.keys(errors).length === 0,
			errors,
		};
	}, [formData.baseInformation]);

	/**
	 * Validate Project Details Step (Step 1)
	 */
	const validateProjectDetails = useCallback((): StepValidationResult => {
		const errors: StepValidationErrors = {};
		const data = formData.projectDetails;

		// Start date is required
		if (!data.start_date) {
			errors.start_date = "Start date is required";
		}

		// End date is required
		if (!data.end_date) {
			errors.end_date = "End date is required";
		}

		// End date must be after start date
		if (data.start_date && data.end_date && data.end_date <= data.start_date) {
			errors.end_date = "End date must be after start date";
		}

		// Business area is required
		if (!data.business_area) {
			errors.business_area = "Business area is required";
		}

		// Project leader is required
		if (!data.project_leader) {
			errors.project_leader = "Project leader is required";
		}

		// Data custodian is required
		if (!data.data_custodian) {
			errors.data_custodian = "Data custodian is required";
		}

		return {
			isValid: Object.keys(errors).length === 0,
			errors,
		};
	}, [formData.projectDetails]);

	/**
	 * Validate Location Step (Step 2)
	 */
	const validateLocation = useCallback((): StepValidationResult => {
		const errors: StepValidationErrors = {};
		const data = formData.location;

		// At least one location is required
		if (!data.areas || data.areas.length === 0) {
			errors.areas = "At least one location is required";
		}

		return {
			isValid: Object.keys(errors).length === 0,
			errors,
		};
	}, [formData.location]);

	/**
	 * Validate External Details Step (Step 3 for external projects)
	 */
	const validateExternalDetails = useCallback((): StepValidationResult => {
		const errors: StepValidationErrors = {};
		const data = formData.externalDetails;

		if (!data) {
			return { isValid: true, errors: {} };
		}

		// Collaboration with is required
		if (!data.collaboration_with || data.collaboration_with.trim().length === 0) {
			errors.collaboration_with = "At least one collaboration partner is required";
		}

		// Budget, description, and aims are optional

		return {
			isValid: Object.keys(errors).length === 0,
			errors,
		};
	}, [formData.externalDetails]);

	/**
	 * Validate Student Details Step (Step 3 for student projects)
	 */
	const validateStudentDetails = useCallback((): StepValidationResult => {
		const errors: StepValidationErrors = {};
		const data = formData.studentDetails;

		if (!data) {
			return { isValid: true, errors: {} };
		}

		// Organisation is required
		if (!data.organisation || data.organisation.trim().length === 0) {
			errors.organisation = "Organisation is required";
		}

		// Level is required
		if (!data.level || data.level.trim().length === 0) {
			errors.level = "Level is required";
		}

		return {
			isValid: Object.keys(errors).length === 0,
			errors,
		};
	}, [formData.studentDetails]);

	/**
	 * Validate a specific step by index
	 */
	const validateStep = useCallback(
		(stepIndex: number): StepValidationResult => {
			switch (stepIndex) {
				case 0:
					return validateBaseInformation();
				case 1:
					return validateProjectDetails();
				case 2:
					return validateLocation();
				case 3:
					// Step 3 is conditional based on project kind
					if (projectKind === "external") {
						return validateExternalDetails();
					} else if (projectKind === "student") {
						return validateStudentDetails();
					}
					return { isValid: true, errors: {} };
				default:
					return { isValid: true, errors: {} };
			}
		},
		[
			validateBaseInformation,
			validateProjectDetails,
			validateLocation,
			validateExternalDetails,
			validateStudentDetails,
			projectKind,
		]
	);

	/**
	 * Validate the current step
	 */
	const validateCurrentStep = useCallback((): StepValidationResult => {
		return validateStep(wizardStore.state.currentStep);
	}, [validateStep, wizardStore.state.currentStep]);

	/**
	 * Validate all steps
	 */
	const validateAllSteps = useCallback((): boolean => {
		const totalSteps = wizardStore.totalSteps;
		
		for (let i = 0; i < totalSteps; i++) {
			const result = validateStep(i);
			if (!result.isValid) {
				return false;
			}
		}
		
		return true;
	}, [validateStep, wizardStore.totalSteps]);

	/**
	 * Check if current step is valid (memoized)
	 */
	const isCurrentStepValid = useMemo(() => {
		const result = validateCurrentStep();
		return result.isValid;
	}, [validateCurrentStep]);

	/**
	 * Get current step errors (memoized)
	 */
	const currentStepErrors = useMemo(() => {
		const result = validateCurrentStep();
		return result.errors;
	}, [validateCurrentStep]);

	return {
		// Validation functions
		validateStep,
		validateCurrentStep,
		validateAllSteps,
		validateBaseInformation,
		validateProjectDetails,
		validateLocation,
		validateExternalDetails,
		validateStudentDetails,
		
		// Validation state
		isCurrentStepValid,
		currentStepErrors,
	};
};
