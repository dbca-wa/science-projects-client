import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { useQueryClient } from "@tanstack/react-query";
import { useProjectWizardStore } from "@/app/stores/store-context";
import { WizardContainer } from "@/features/projects/components/wizard/WizardContainer";
import { useWizardPersistence } from "@/features/projects/hooks/useWizardPersistence";
import type { DraftSource } from "@/features/projects/hooks/useWizardPersistence";
import {
	useDraft,
	useSaveDraft,
	useDeleteDraft,
} from "@/features/projects/hooks/useDraft";
import { clearAllWizardState } from "@/features/projects/utils/wizard-cleanup.utils";
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
	const queryClient = useQueryClient();
	const projectKind = searchParams.get("kind") as ProjectKind | null;

	// Server draft hooks
	const { data: serverDraft, isLoading: isDraftLoading } =
		useDraft(projectKind);
	const saveDraftMutation = useSaveDraft(projectKind);
	const deleteDraftMutation = useDeleteDraft(projectKind);

	// Persistence hook with server integration
	const { restoreDraft } = useWizardPersistence({
		serverDraft: serverDraft ?? null,
		onServerSave: (payload) => saveDraftMutation.mutate(payload),
		onServerDelete: () => deleteDraftMutation.mutate(),
	});

	// Gate rendering until draft restoration is complete so that step
	// components mount with the correct initial values (especially RTEs
	// which use React.memo and only read initialValue on first mount).
	const [isReady, setIsReady] = useState(false);
	const hasRestoredRef = useRef(false);

	// Dynamic document title based on project type
	const projectTypeName = projectKind
		? PROJECT_TYPE_NAMES[projectKind]
		: "Project";
	useDocumentTitle(`Create ${projectTypeName}`);

	// Initialise wizard store with project kind and restore draft.
	// Waits for the server draft query to settle before attempting restore.
	useEffect(() => {
		if (isDraftLoading) return; // Wait for server draft query to finish
		if (hasRestoredRef.current) return; // Prevent double-restoration

		if (projectKind && PROJECT_TYPE_NAMES[projectKind]) {
			hasRestoredRef.current = true;
			wizardStore.setProjectKind(projectKind);

			const restore = async () => {
				const source: DraftSource = await restoreDraft();
				if (source) {
					// Re-validate all steps from stored data (components haven't mounted yet)
					const firstInvalidStep = wizardStore.revalidateAllStepsFromData();

					// Navigate to the first invalid step, or stay on the restored step
					if (firstInvalidStep >= 0) {
						wizardStore.goToStep(firstInvalidStep);
					}

					// Source-specific toast messages
					const sourceLabel =
						source === "server"
							? "from the server"
							: source === "localStorage"
								? "from local storage"
								: "from this session";

					toast.info("Draft restored", {
						description: `Your previous work has been restored ${sourceLabel}`,
						duration: 5000,
					});
				}
				// Mark as ready — step components will mount
				setIsReady(true);
			};
			void restore();
		} else {
			setIsReady(true);
		}
	}, [projectKind, wizardStore, restoreDraft, isDraftLoading]);

	// Redirect if no project kind
	if (!projectKind || !PROJECT_TYPE_NAMES[projectKind]) {
		navigate("/projects/create");
		return null;
	}

	const handleComplete = (projectId: number) => {
		toast.success("Project created successfully");

		// Clear all persistence layers (store, localStorage, sessionStorage, server, query cache)
		clearAllWizardState({
			wizardStore,
			queryClient,
			projectKind: projectKind!,
			deleteServerDraft: () => deleteDraftMutation.mutate(),
		});

		// Navigate to the project page with confetti trigger
		navigate(`/projects/${projectId}/overview`, {
			state: { showSuccessAnimation: true },
		});
	};

	const handleCancel = () => {
		// Clear all persistence layers (store, localStorage, sessionStorage, server, query cache)
		clearAllWizardState({
			wizardStore,
			queryClient,
			projectKind: projectKind!,
			deleteServerDraft: () => deleteDraftMutation.mutate(),
		});
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
