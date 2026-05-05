import { observer } from "mobx-react-lite";
import { useProjectWizardStore } from "@/app/stores/store-context";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WizardStepper } from "./WizardStepper.tsx";
import { WizardLayout } from "./WizardLayout.tsx";
import { WizardNavigation } from "./WizardNavigation.tsx";
import { WizardFormPanel } from "./WizardFormPanel.tsx";
import { WizardPreviewPanel } from "./WizardPreviewPanel.tsx";
import {
	submitWizard,
	type WizardSubmissionData,
} from "../../services/wizard-submission.service";
import { useCurrentUser } from "@/features/auth";
import { FULL_WORKFLOW_KINDS } from "../../../../shared/constants/allowedDocumentTypes.ts";

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
		const wizardStore = useProjectWizardStore();
		const queryClient = useQueryClient();
		const { data: currentUser } = useCurrentUser();

		const handleBack = () => {
			wizardStore.previousStep();
			// Scroll to top so the user sees the previous step from the beginning
			window.scrollTo({ top: 0, behavior: "smooth" });
		};

		const handleContinue = () => {
			// Mark the current step as touched so validation errors display
			if (!wizardStore.isCurrentStepValid) {
				wizardStore.markStepTouched(wizardStore.state.currentStep);
			}

			if (wizardStore.isLastStep) {
				handleSubmit();
			} else {
				// Commit editing state to saved state before advancing
				wizardStore.commitStep();
				wizardStore.nextStep();
				// Scroll to top so the user sees the new step from the beginning
				window.scrollTo({ top: 0, behavior: "smooth" });
			}
		};

		const handleSubmit = async () => {
			// Validate all steps before submission
			const isValid = wizardStore.validateAllSteps();
			if (!isValid) {
				return;
			}

			if (!currentUser?.id) {
				wizardStore.setError("You must be logged in to create a project");
				return;
			}

			// Commit the final step before submission
			wizardStore.commitStep();

			wizardStore.setSubmitting(true);
			const projectKind = wizardStore.state.projectKind!;
			const loadingMessage = FULL_WORKFLOW_KINDS.includes(projectKind)
				? "Creating project and concept plan..."
				: "Creating project...";
			const loadingToastId = toast.loading(loadingMessage);

			try {
				// Use savedFormData as the source of truth for project creation
				const formData = wizardStore.state.savedFormData;
				const currentYear = new Date().getFullYear();

				const submissionData: WizardSubmissionData = {
					// Base information
					title: formData.baseInformation.title,
					description: formData.baseInformation.description,
					keywords: formData.baseInformation.keywords,
					image:
						formData.baseInformation.image instanceof File
							? formData.baseInformation.image
							: null,

					// Project details
					business_area: formData.projectDetails.business_area,
					start_date: formData.projectDetails.start_date,
					end_date: formData.projectDetails.end_date,
					project_leader: formData.projectDetails.project_leader,
					data_custodian: formData.projectDetails.data_custodian,

					// Location
					areas: formData.location.areas,

					// Metadata
					projectKind: wizardStore.state.projectKind!,
					creator: currentUser.id,
					year: currentYear,

					// Team members (from saved layer)
					teamMembers: wizardStore.state.savedTeamMembers,

					// Student details
					organisation: formData.studentDetails?.organisation,
					level: formData.studentDetails?.level,

					// External details
					collaboration_with: formData.externalDetails?.collaboration_with,
					budget: formData.externalDetails?.budget,
					aims: formData.externalDetails?.aims,
				};

				const createdProject = await submitWizard(submissionData);

				toast.dismiss(loadingToastId);

				// Reset the wizard store to prevent duplicate submissions
				wizardStore.resetWizard();

				queryClient.invalidateQueries({ queryKey: ["projects"] });

				onComplete(createdProject.id);
			} catch (error) {
				toast.dismiss(loadingToastId);

				const message =
					error instanceof Error ? error.message : "Failed to create project";
				toast.error(`Could not create project: ${message}`);
				wizardStore.setError(message);
			} finally {
				wizardStore.setSubmitting(false);
			}
		};

		const handleTogglePreview = () => {
			wizardStore.togglePreview();
		};

		const handleStepClick = (stepIndex: number) => {
			wizardStore.goToStep(stepIndex);
			window.scrollTo({ top: 0, behavior: "smooth" });
		};

		return (
			<div className="flex flex-col h-full">
				{/* Stepper */}
				<div className="mb-6">
					<WizardStepper
						currentStep={wizardStore.state.currentStep}
						totalSteps={wizardStore.totalSteps}
						completedSteps={wizardStore.state.completedSteps}
						validation={wizardStore.state.validation}
						projectKind={wizardStore.state.projectKind!}
						onStepClick={handleStepClick}
					/>
				</div>

				{/* Main content area with layout */}
				<div className="flex-1 overflow-hidden">
					<WizardLayout
						formPanel={
							<WizardFormPanel
								currentStep={wizardStore.state.currentStep}
								projectKind={wizardStore.state.projectKind!}
							/>
						}
						previewPanel={
							<WizardPreviewPanel
								formData={wizardStore.state.editingFormData}
								projectKind={wizardStore.state.projectKind}
								teamMembers={wizardStore.state.editingTeamMembers}
							/>
						}
						showPreview={wizardStore.state.showPreview}
						onTogglePreview={handleTogglePreview}
					/>
				</div>

				{/* Navigation */}
				<div className="mt-6 pt-6 border-t">
					<WizardNavigation
						onBack={handleBack}
						onNext={handleContinue}
						onCancel={onCancel}
						canGoBack={wizardStore.canGoBack}
						canGoNext={
							wizardStore.isLastStep
								? wizardStore.isCurrentStepValid &&
									wizardStore.validateAllSteps()
								: wizardStore.canGoForward
						}
						isLastStep={wizardStore.isLastStep}
						isSubmitting={wizardStore.state.isSubmitting}
					/>
				</div>
			</div>
		);
	}
);

WizardContainer.displayName = "WizardContainer";
