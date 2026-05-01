import type { ProjectWizardStore } from "@/app/stores/derived/project-wizard.store";

/**
 * Determines whether a validation error should be displayed for a given field.
 *
 * Errors are always computed, but only rendered when the user has interacted:
 * either by clicking Continue on the step, or by focusing then blurring the field.
 */
export const shouldShowError = (
	wizardStore: ProjectWizardStore,
	fieldName: string,
	stepIndex: number
): boolean => {
	return (
		wizardStore.state.touchedSteps.has(stepIndex) ||
		wizardStore.state.touchedFields.has(fieldName)
	);
};
