import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { useProjectWizardStore } from "@/app/stores/store-context";
import { WizardContainer } from "@/features/projects/components/wizard/WizardContainer";
import { useWizardPersistence } from "@/features/projects/hooks/useWizardPersistence";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PROJECT_KIND_COLORS } from "@/shared/constants/project-colors";
import { FormPreviewToggle } from "@/shared/components/layout/FormPreviewToggle";
import type { ProjectKind } from "@/shared/types/project.types";
import { PageTransition } from "@/shared/components/PageTransition";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { toast } from "sonner";

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
	const projectKind = searchParams.get("kind") as ProjectKind | null;
	const { clearDraft, restoreDraft } = useWizardPersistence();

	// Gate rendering until draft restoration is complete so that step
	// components mount with the correct initial values (especially RTEs
	// which use React.memo and only read initialValue on first mount).
	const [isReady, setIsReady] = useState(false);

	// Dynamic document title based on project type
	const projectTypeName = projectKind
		? PROJECT_TYPE_NAMES[projectKind]
		: "Project";
	useDocumentTitle(`Create ${projectTypeName}`);

	// Initialise wizard store with project kind and restore draft
	useEffect(() => {
		if (projectKind && PROJECT_TYPE_NAMES[projectKind]) {
			wizardStore.setProjectKind(projectKind);

			const restore = async () => {
				const restored = await restoreDraft();
				if (restored) {
					// Re-validate all steps from stored data (components haven't mounted yet)
					const firstInvalidStep = wizardStore.revalidateAllStepsFromData();

					// Navigate to the first invalid step, or stay on the restored step
					if (firstInvalidStep >= 0) {
						wizardStore.goToStep(firstInvalidStep);
					}

					const hasImage =
						wizardStore.state.formData.baseInformation.image !== null;
					if (hasImage) {
						toast.info("Draft restored", {
							description:
								"Your previous work has been restored, including the project image",
							duration: 5000,
						});
					} else {
						toast.info("Draft restored", {
							description: "Your previous work has been restored",
						});
					}
				}
				// Mark as ready — step components will mount
				setIsReady(true);
			};
			void restore();
		} else {
			setIsReady(true);
		}
	}, [projectKind, wizardStore, restoreDraft]);

	// Redirect if no project kind
	if (!projectKind || !PROJECT_TYPE_NAMES[projectKind]) {
		navigate("/projects/create");
		return null;
	}

	const handleComplete = (projectId: number) => {
		toast.success("Project created successfully");

		// Clear persisted draft and reset store to prevent duplicate submissions
		clearDraft();
		wizardStore.resetWizard();

		// Navigate to the project page with confetti trigger
		navigate(`/projects/${projectId}/overview`, {
			state: { showSuccessAnimation: true },
		});
	};

	const handleCancel = () => {
		clearDraft();
		wizardStore.resetWizard();
		navigate("/projects/create");
	};

	const projectColor = PROJECT_KIND_COLORS[projectKind];
	const thisYear = new Date().getFullYear();

	return (
		<PageTransition>
			<div className="w-full px-4 sm:px-6 py-4 sm:py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
					<div className="flex items-center justify-between gap-4">
						{/* Left: Title with step badge */}
						<div className="flex items-center gap-3 min-w-0 flex-1">
							<div
								className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg text-xl sm:text-2xl font-bold text-white shadow-md flex-shrink-0"
								style={{ backgroundColor: projectColor }}
							>
								{wizardStore.state.currentStep + 1}
							</div>
							<div className="min-w-0 flex-1">
								<h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
									Create {PROJECT_TYPE_NAMES[projectKind]} - {thisYear}
								</h1>
								<p className="text-sm sm:text-base text-muted-foreground">
									Step {wizardStore.state.currentStep + 1} of{" "}
									{wizardStore.totalSteps}
								</p>
							</div>
						</div>

						{/* Right: Preview toggle */}
						<FormPreviewToggle
							showPreview={wizardStore.state.showPreview}
							onShowForm={() => wizardStore.setShowPreview(false)}
							onShowPreview={() => wizardStore.setShowPreview(true)}
						/>
					</div>
				</div>

				{isReady ? (
					<WizardContainer
						onComplete={handleComplete}
						onCancel={handleCancel}
					/>
				) : (
					<div className="flex items-center justify-center py-20">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				)}
			</div>
		</PageTransition>
	);
});

export default ProjectCreateWizardPage;
