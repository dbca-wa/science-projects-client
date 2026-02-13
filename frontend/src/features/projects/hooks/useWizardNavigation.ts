import { useCallback } from "react";
import { useProjectWizardStore } from "@/app/stores/store-context";
import { useWizardValidation } from "./useWizardValidation";

/**
 * Hook for wizard navigation with validation
 *
 * Wraps the wizard store's navigation methods with validation logic.
 * Ensures users can only navigate forward if the current step is valid.
 *
 * @returns Navigation functions and state
 */
export const useWizardNavigation = () => {
	const wizardStore = useProjectWizardStore();
	const { validateCurrentStep, validateStep } = useWizardValidation();

	/**
	 * Navigate to the next step (with validation)
	 */
	const goToNextStep = useCallback(() => {
		// Validate current step before allowing navigation
		const validation = validateCurrentStep();

		if (!validation.isValid) {
			// Update validation state in store
			wizardStore.setStepValidation(
				wizardStore.state.currentStep,
				false,
				validation.errors
			);
			return false;
		}

		// Mark current step as valid and completed
		wizardStore.setStepValidation(wizardStore.state.currentStep, true, {});
		wizardStore.markStepCompleted(wizardStore.state.currentStep);

		// Navigate to next step
		wizardStore.goToNextStep();
		return true;
	}, [validateCurrentStep, wizardStore]);

	/**
	 * Navigate to the previous step (no validation required)
	 */
	const goToPreviousStep = useCallback(() => {
		wizardStore.goToPreviousStep();
	}, [wizardStore]);

	/**
	 * Navigate to a specific step (with validation of intermediate steps)
	 */
	const goToStep = useCallback(
		(stepIndex: number) => {
			// Can always go back to completed steps
			if (stepIndex <= wizardStore.state.currentStep) {
				wizardStore.goToStep(stepIndex);
				return true;
			}

			// To go forward, validate all steps between current and target
			for (let i = wizardStore.state.currentStep; i < stepIndex; i++) {
				const validation = validateStep(i);
				if (!validation.isValid) {
					// Update validation state for the invalid step
					wizardStore.setStepValidation(i, false, validation.errors);
					return false;
				}
				// Mark step as valid and completed
				wizardStore.setStepValidation(i, true, {});
				wizardStore.markStepCompleted(i);
			}

			// All intermediate steps are valid, navigate to target
			wizardStore.goToStep(stepIndex);
			return true;
		},
		[validateStep, wizardStore]
	);

	/**
	 * Reset the wizard
	 */
	const resetWizard = useCallback(() => {
		wizardStore.resetWizard();
	}, [wizardStore]);

	/**
	 * Check if can navigate to next step
	 */
	const canGoToNextStep = useCallback(() => {
		if (wizardStore.state.currentStep >= wizardStore.totalSteps - 1) {
			return false;
		}
		const validation = validateCurrentStep();
		return validation.isValid;
	}, [validateCurrentStep, wizardStore]);

	/**
	 * Check if can navigate to previous step
	 */
	const canGoToPreviousStep = useCallback(() => {
		return wizardStore.state.currentStep > 0;
	}, [wizardStore.state.currentStep]);

	return {
		// Navigation functions
		goToNextStep,
		goToPreviousStep,
		goToStep,
		resetWizard,

		// Navigation state
		canGoToNextStep: canGoToNextStep(),
		canGoToPreviousStep: canGoToPreviousStep(),
		currentStep: wizardStore.state.currentStep,
		totalSteps: wizardStore.totalSteps,
		completedSteps: wizardStore.state.completedSteps,
		progressPercentage: wizardStore.progressPercentage,
	};
};
