import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { useProjectWizardStore } from "@/app/stores/store-context";
import { useCreateProject } from "@/features/projects/hooks/useCreateProject";
import { useWizardNavigation } from "@/features/projects/hooks/useWizardNavigation";
import { useWizardPersistence } from "@/features/projects/hooks/useWizardPersistence";
import { Stepper } from "@/shared/components/ui/stepper";
import { ProgressBar } from "@/features/projects/components/wizard/ProgressBar";
import { WizardStep } from "@/features/projects/components/wizard/WizardStep";
import { WizardNavigation } from "@/features/projects/components/wizard/WizardNavigation";
import { BaseInformationStep } from "@/features/projects/components/wizard-steps/BaseInformationStep";
import { ProjectDetailsStep } from "@/features/projects/components/wizard-steps/ProjectDetailsStep";
import { LocationStep } from "@/features/projects/components/wizard-steps/LocationStep";
import { ExternalDetailsStep } from "@/features/projects/components/wizard-steps/ExternalDetailsStep";
import { StudentDetailsStep } from "@/features/projects/components/wizard-steps/StudentDetailsStep";
import { ArrowLeft, Info, X } from "lucide-react";
import { PROJECT_KIND_COLORS } from "@/shared/constants/project-colors";
import type { ProjectKind } from "@/shared/types/project.types";
import { Button } from "@/shared/components/ui/button";
import { PageTransition } from "@/shared/components/PageTransition";

const PROJECT_TYPE_NAMES: Record<ProjectKind, string> = {
	science: "Science Project",
	core_function: "Core Function",
	student: "Student Project",
	external: "External Partnership",
};

const ProjectCreateWizardPage = observer(() => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const wizardStore = useProjectWizardStore();
	const createProjectMutation = useCreateProject();
	const wizardNavigation = useWizardNavigation();
	const { clearDraft, hasDraft } = useWizardPersistence();
	const projectKind = searchParams.get("kind") as ProjectKind | null;
	const [direction, setDirection] = useState<"forward" | "backward">("forward");
	const [showDraftNotification, setShowDraftNotification] = useState(false);

	// Check for draft on mount
	useEffect(() => {
		if (hasDraft()) {
			setShowDraftNotification(true);
		}
	}, [hasDraft]);

	// Initialize wizard store with project kind
	useEffect(() => {
		if (projectKind && PROJECT_TYPE_NAMES[projectKind]) {
			wizardStore.setProjectKind(projectKind);
		}
	}, [projectKind, wizardStore]);

	// Redirect if no project kind
	if (!projectKind || !PROJECT_TYPE_NAMES[projectKind]) {
		navigate("/projects/create");
		return null;
	}

	// Define steps based on project kind
	const baseSteps = [
		{ label: "Base Information", shortLabel: "Base Info" },
		{ label: "Project Details", shortLabel: "Details" },
		{ label: "Location", shortLabel: "Location" },
	];

	// Add conditional step for external or student projects
	const steps =
		projectKind === "external"
			? [...baseSteps, { label: "External Details", shortLabel: "External" }]
			: projectKind === "student"
				? [...baseSteps, { label: "Student Details", shortLabel: "Student" }]
				: baseSteps;

	const handleNext = () => {
		if (wizardStore.state.currentStep < wizardStore.totalSteps - 1) {
			// Validate and navigate to next step
			const success = wizardNavigation.goToNextStep();
			if (success) {
				setDirection("forward");
			}
		} else {
			// Last step - validate and submit project
			const success = wizardNavigation.goToNextStep();
			if (success) {
				handleSubmit();
			}
		}
	};

	const handleSubmit = async () => {
		const formData = wizardStore.state.formData;
		
		// Set submitting state
		wizardStore.setSubmitting(true);

		try {
			// Transform wizard data to API format
			const projectData: Record<string, unknown> = {
				// Base Information
				title: formData.baseInformation.title,
				description: formData.baseInformation.description,
				keywords: formData.baseInformation.keywords.join(", "),
				kind: wizardStore.state.projectKind,
				
				// Project Details
				start_date: formData.projectDetails.start_date,
				end_date: formData.projectDetails.end_date,
				business_area: formData.projectDetails.business_area,
				data_custodian: formData.projectDetails.data_custodian,
				project_leader: formData.projectDetails.project_leader,
				
				// Location
				areas: formData.location.areas,
			};

			// Add image if provided
			if (formData.baseInformation.image) {
				projectData.image = formData.baseInformation.image;
			}

			// Add departmental service if provided
			if (formData.projectDetails.departmental_service) {
				projectData.departmental_service = formData.projectDetails.departmental_service;
			}

			// Add external details if external project
			if (wizardStore.state.projectKind === "external" && formData.externalDetails) {
				projectData.external = {
					collaboration_with: formData.externalDetails.collaboration_with,
					budget: formData.externalDetails.budget,
					description: formData.externalDetails.external_description,
					aims: formData.externalDetails.aims,
				};
			}

			// Add student details if student project
			if (wizardStore.state.projectKind === "student" && formData.studentDetails) {
				projectData.student = {
					organisation: formData.studentDetails.organisation,
					level: formData.studentDetails.level,
				};
			}

			// Submit the project
			const createdProject = await createProjectMutation.mutateAsync(projectData);

			// Clear draft and reset wizard
			clearDraft();
			wizardStore.resetWizard();
			
			// Navigate to project detail page with success flag
			navigate(`/projects/${createdProject.id}/overview`, {
				state: { showSuccessAnimation: true },
			});
		} catch (error) {
			console.error("Failed to create project:", error);
			// Error toast is handled by the mutation hook
		} finally {
			wizardStore.setSubmitting(false);
		}
	};

	const handleBack = () => {
		setDirection("backward");
		wizardNavigation.goToPreviousStep();
	};

	const handleCancel = () => {
		// TODO: Show confirmation dialog
		clearDraft();
		wizardNavigation.resetWizard();
		navigate("/projects/create");
	};

	const projectColor = PROJECT_KIND_COLORS[projectKind];
	const currentStep = wizardStore.state.currentStep;

	return (
		<PageTransition>
		<div className="container mx-auto max-w-5xl px-4 sm:px-6 py-4 sm:py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* Header */}
			<div className="mb-6 sm:mb-8">
				<button
					onClick={handleCancel}
					className="mb-3 sm:mb-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					<ArrowLeft className="h-4 w-4" />
					<span className="hidden sm:inline">Back to project types</span>
					<span className="sm:hidden">Back</span>
				</button>
				<div className="flex items-center gap-3">
					<div
						className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg text-xl sm:text-2xl font-bold text-white shadow-md flex-shrink-0"
						style={{ backgroundColor: projectColor }}
					>
						{currentStep + 1}
					</div>
					<div className="min-w-0 flex-1">
						<h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
							Create {PROJECT_TYPE_NAMES[projectKind]}
						</h1>
						<p className="text-sm sm:text-base text-muted-foreground">
							<span className="hidden sm:inline">{steps[currentStep].label}</span>
							<span className="sm:hidden">{steps[currentStep].shortLabel}</span>
							{" "}• Step {currentStep + 1} of {wizardStore.totalSteps}
						</p>
					</div>
				</div>
			</div>

			{/* Draft Notification */}
			{showDraftNotification && (
				<div className="mb-6 sm:mb-8 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
					<div className="flex items-start gap-3">
						<div className="flex-shrink-0">
							<Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
						</div>
						<div className="flex-1 min-w-0">
							<h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
								Draft Restored
							</h3>
							<p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
								Your previous progress has been restored. You can continue where you left off or start fresh.
							</p>
						</div>
						<div className="flex-shrink-0 flex gap-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									clearDraft();
									wizardStore.resetWizard();
									setShowDraftNotification(false);
								}}
								className="text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
							>
								Clear Draft
							</Button>
							<button
								onClick={() => setShowDraftNotification(false)}
								className="text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Progress Bar */}
			<div className="mb-6 sm:mb-8">
				<ProgressBar
					currentStep={currentStep}
					totalSteps={wizardStore.totalSteps}
					color={projectColor}
				/>
			</div>

			{/* Stepper - Hide on mobile, show on tablet+ */}
			<div className="mb-6 sm:mb-8 hidden sm:block">
				<Stepper
					steps={steps}
					currentStep={currentStep}
					completedSteps={wizardStore.state.completedSteps}
					onStepClick={(stepIndex) => {
						wizardNavigation.goToStep(stepIndex);
					}}
					orientation="horizontal"
				/>
			</div>

			{/* Step Content */}
			<div className="mb-6 sm:mb-8 min-h-[300px] sm:min-h-[400px] rounded-xl border bg-card p-4 sm:p-6 md:p-8 shadow-sm">
				<WizardStep
					title={steps[currentStep].label}
					isActive={true}
					direction={direction}
				>
					{currentStep === 0 && <BaseInformationStep />}
					{currentStep === 1 && <ProjectDetailsStep />}
					{currentStep === 2 && <LocationStep />}
					{currentStep === 3 && projectKind === "external" && <ExternalDetailsStep />}
					{currentStep === 3 && projectKind === "student" && <StudentDetailsStep />}
				</WizardStep>
			</div>

			{/* Navigation */}
			<WizardNavigation
				onBack={handleBack}
				onNext={handleNext}
				onCancel={handleCancel}
				canGoBack={wizardNavigation.canGoToPreviousStep}
				canGoNext={wizardNavigation.canGoToNextStep}
				isLastStep={currentStep === wizardStore.totalSteps - 1}
				isSubmitting={wizardStore.state.isSubmitting}
				primaryColor={projectColor}
			/>
		</div>
		</PageTransition>
	);
});

export default ProjectCreateWizardPage;