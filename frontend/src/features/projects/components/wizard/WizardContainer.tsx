import { observer } from "mobx-react-lite";
import { useCreateProjectWizardStore } from "@/app/stores/store-context";
import { WizardStepper } from "./WizardStepper.tsx";
import { WizardLayout } from "./WizardLayout.tsx";
import { WizardNavigation } from "./WizardNavigation.tsx";
import { WizardFormPanel } from "./WizardFormPanel.tsx";
import { WizardPreviewPanel } from "./WizardPreviewPanel.tsx";

interface WizardContainerProps {
	onComplete: (projectId: number) => void;
	onCancel: () => void;
}

/**
 * WizardContainer - Main container that orchestrates the wizard flow
 *
 * Features:
 * - Step progression logic
 * - Validation orchestration
 * - Responsive layout management
 * - Preview toggle state
 * - Connects all wizard components
 */
export const WizardContainer = observer(
	({ onComplete, onCancel }: WizardContainerProps) => {
		const store = useCreateProjectWizardStore();

		const handleBack = () => {
			store.previousStep();
		};

		const handleContinue = () => {
			if (store.isLastStep) {
				// Handle submission
				handleSubmit();
			} else {
				store.nextStep();
			}
		};

		const handleSubmit = async () => {
			// Validate all steps before submission
			const isValid = store.validateAllSteps();
			if (!isValid) {
				return;
			}

			store.setSubmitting(true);

			try {
				// TODO: Implement actual project creation API call
				// For now, just simulate success
				await new Promise((resolve) => setTimeout(resolve, 1000));

				// Clear draft on success
				store.clearDraft();

				// Call onComplete with mock project ID
				onComplete(1);
			} catch (error) {
				console.error("Failed to create project", error);
				store.setError(
					error instanceof Error ? error.message : "Failed to create project"
				);
			} finally {
				store.setSubmitting(false);
			}
		};

		const handleTogglePreview = () => {
			store.togglePreview();
		};

		const handleStepClick = (stepIndex: number) => {
			store.goToStep(stepIndex);
		};

		return (
			<div className="flex flex-col h-full">
				{/* Stepper */}
				<div className="mb-6">
					<WizardStepper
						currentStep={store.state.currentStep}
						totalSteps={store.totalSteps}
						completedSteps={store.state.completedSteps}
						projectKind={store.state.projectKind}
						onStepClick={handleStepClick}
					/>
				</div>

				{/* Main content area with layout */}
				<div className="flex-1 overflow-hidden">
					<WizardLayout
						formPanel={
							<WizardFormPanel
								currentStep={store.state.currentStep}
								projectKind={store.state.projectKind}
							/>
						}
						previewPanel={
							<WizardPreviewPanel
								formData={store.state.formData}
								projectKind={store.state.projectKind}
							/>
						}
						showPreview={store.state.showPreview}
						onTogglePreview={handleTogglePreview}
					/>
				</div>

				{/* Navigation */}
				<div className="mt-6 pt-6 border-t">
					<WizardNavigation
						onBack={handleBack}
						onNext={handleContinue}
						onCancel={onCancel}
						canGoBack={store.canGoBack}
						canGoNext={store.canGoForward}
						isLastStep={store.isLastStep}
						isSubmitting={store.state.isSubmitting}
					/>
				</div>
			</div>
		);
	}
);

WizardContainer.displayName = "WizardContainer";
