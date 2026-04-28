import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { motion } from "framer-motion";
import { useCreateProjectWizardStore } from "@/app/stores/store-context";
import { WizardContainer } from "@/features/projects/components/wizard/WizardContainer";
import { ArrowLeft } from "lucide-react";
import { PROJECT_KIND_COLORS } from "@/shared/constants/project-colors";
import type { ProjectKind } from "@/shared/types/project.types";
import { PageTransition } from "@/shared/components/PageTransition";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";

const PROJECT_TYPE_NAMES: Record<ProjectKind, string> = {
	science: "Science Project",
	core_function: "Core Function",
	student: "Student Project",
	external: "External Partnership",
};

const ProjectCreateWizardPage = observer(() => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const store = useCreateProjectWizardStore();
	const projectKind = searchParams.get("kind") as ProjectKind | null;

	// Dynamic document title based on project type
	const projectTypeName = projectKind
		? PROJECT_TYPE_NAMES[projectKind]
		: "Project";
	useDocumentTitle(`Create ${projectTypeName}`);

	// Initialise wizard store with project kind and restore from session storage
	useEffect(() => {
		if (projectKind && PROJECT_TYPE_NAMES[projectKind]) {
			store.setProjectKind(projectKind);

			// Try to restore from session storage
			const restored = store.restoreFromSessionStorage();
			if (restored && typeof restored === "object" && restored.success) {
				// Show appropriate toast based on whether image was present
				if (restored.hadImage) {
					toast.info("Draft restored", {
						description:
							"Note: Images are not saved in drafts and will need to be re-uploaded",
						duration: 5000,
					});
				} else {
					toast.info("Draft restored", {
						description: "Your previous work has been restored",
					});
				}
			}
		}

		// Cleanup on unmount
		return () => {
			// Don't clear draft on unmount - let user decide
		};
	}, [projectKind, store]);

	// Redirect if no project kind
	if (!projectKind || !PROJECT_TYPE_NAMES[projectKind]) {
		navigate("/projects/create");
		return null;
	}

	const handleComplete = (projectId: number) => {
		toast.success("Project created successfully", {
			description: "Redirecting to project page...",
		});

		// Clear draft on successful creation
		store.clearDraft();

		// Navigate to project detail page after short delay
		setTimeout(() => {
			navigate(`/projects/${projectId}/overview`);
		}, 1500);
	};

	const handleCancel = () => {
		// Ask user if they want to save draft
		const hasDraft = store.state.isDirty;

		if (hasDraft) {
			const confirmLeave = window.confirm(
				"You have unsaved changes. Do you want to save your draft?"
			);

			if (confirmLeave) {
				store.saveToSessionStorage();
				toast.info("Draft saved", {
					description: "You can resume your work later",
				});
			}
		}

		// Navigate back to project type selector
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
								{store.state.currentStep + 1}
							</div>
							<div className="min-w-0 flex-1">
								<h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
									Create {PROJECT_TYPE_NAMES[projectKind]} - {thisYear}
								</h1>
								<p className="text-sm sm:text-base text-muted-foreground">
									Step {store.state.currentStep + 1} of {store.totalSteps}
								</p>
							</div>
						</div>

						{/* Right: Preview toggle (only on standard screens) */}
						<div className="3xl:hidden shrink-0">
							<div className="relative inline-flex h-11 items-center justify-center rounded-xl p-1.5 bg-gradient-to-br from-blue-50/90 to-indigo-50/90 dark:from-blue-950/40 dark:to-indigo-950/40 backdrop-blur-xl border border-blue-200/60 dark:border-blue-700/40 shadow-lg shadow-blue-100/50 dark:shadow-blue-900/20">
								{/* Sliding background indicator with enhanced glassmorphism */}
								<motion.div
									className="absolute h-8 rounded-lg"
									initial={false}
									animate={{
										x: store.state.showPreview ? "100%" : "0%",
									}}
									transition={{
										type: "spring",
										stiffness: 300,
										damping: 30,
									}}
									style={{
										left: "6px",
										top: "6px",
										width: "calc(50% - 6px)",
										background:
											"linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.2) 100%)",
										backdropFilter: "blur(16px) saturate(180%)",
										WebkitBackdropFilter: "blur(16px) saturate(180%)",
										border: "1px solid rgba(59, 130, 246, 0.3)",
										boxShadow:
											"0 8px 32px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(59, 130, 246, 0.1)",
									}}
								/>

								{/* Form button */}
								<button
									type="button"
									onClick={() => store.setShowPreview(false)}
									className={cn(
										"relative z-10 inline-flex h-8 min-w-[80px] items-center justify-center rounded-lg px-5 text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer",
										!store.state.showPreview
											? "text-blue-600 dark:text-blue-400"
											: "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
									)}
									aria-pressed={!store.state.showPreview}
									aria-label="Show form view"
								>
									Form
								</button>

								{/* Preview button */}
								<button
									type="button"
									onClick={() => store.setShowPreview(true)}
									className={cn(
										"relative z-10 inline-flex h-8 min-w-[80px] items-center justify-center rounded-lg px-5 text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer",
										store.state.showPreview
											? "text-blue-600 dark:text-blue-400"
											: "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
									)}
									aria-pressed={store.state.showPreview}
									aria-label="Show preview"
								>
									Preview
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Wizard Container - handles all wizard UI */}
				<WizardContainer onComplete={handleComplete} onCancel={handleCancel} />
			</div>
		</PageTransition>
	);
});

export default ProjectCreateWizardPage;
