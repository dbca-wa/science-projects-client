import { useParams, useNavigate } from "react-router";
import { useEffect, useState, useRef } from "react";
import { observer } from "mobx-react-lite";
import { useProject } from "@/features/projects/hooks/useProject";
import { useUpdateProject } from "@/features/projects/hooks/useUpdateProject";
import { useCurrentUser } from "@/features/auth";
import { useWindowSize } from "@/shared/hooks/useWindowSize";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { canEditProject } from "@/features/projects/utils/permissions";
import { EditProjectForm } from "@/features/projects/components/form/EditProjectForm";
import type { EditProjectFormData } from "@/features/projects/types/project.types";
import { AutoBreadcrumb } from "@/shared/components/navigation/AutoBreadcrumb";
import { sanitizeInput } from "@/shared/utils/sanitise.utils";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/shared/components/PageTransition";
import { inlineEditStore } from "@/app/stores/InlineEditStore";

const EditProjectPage = observer(() => {
	useDocumentTitle("Edit Project");
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { data, isLoading, error } = useProject(id);
	const { data: currentUser } = useCurrentUser();
	const updateMutation = useUpdateProject();
	const { width } = useWindowSize();
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const formContainerRef = useRef<HTMLDivElement>(null);

	// Check permissions
	const hasEditPermission =
		currentUser && data?.project
			? canEditProject(currentUser, data.project, data.members)
			: false;

	// Register form dirty state with InlineEditStore for global NavigationBlocker
	useEffect(() => {
		if (hasUnsavedChanges) {
			inlineEditStore.registerEditor({
				contentType: "project-edit-form" as never,
				entityId: Number(id) || 0,
				originalContent: "clean",
				elementRef: formContainerRef.current,
			});
			inlineEditStore.updateCurrentContent(
				"project-edit-form" as never,
				Number(id) || 0,
				"dirty"
			);
		} else {
			inlineEditStore.unregisterEditor(
				"project-edit-form" as never,
				Number(id) || 0
			);
		}
		return () => {
			inlineEditStore.unregisterEditor(
				"project-edit-form" as never,
				Number(id) || 0
			);
		};
	}, [hasUnsavedChanges, id]);

	// Redirect if unauthorized
	useEffect(() => {
		if (!isLoading && data && currentUser && !hasEditPermission) {
			toast.error("You don't have permission to edit this project");
			navigate(`/projects/${id}`);
		}
	}, [isLoading, data, currentUser, hasEditPermission, navigate, id]);

	// Handle form submission
	const handleSubmit = (formData: EditProjectFormData) => {
		if (!id || !data) return;

		const { details } = data;

		// Determine detail IDs for related model updates
		const detailId = details.base?.id;

		let externalDetailId: number | undefined;
		if (details.external && !Array.isArray(details.external)) {
			externalDetailId = details.external.id;
		}

		let studentDetailId: number | undefined;
		if (details.student && !Array.isArray(details.student)) {
			studentDetailId = details.student.id;
		}

		updateMutation.mutate(
			{
				id: Number(id),
				data: formData,
				detailId,
				externalDetailId,
				studentDetailId,
			},
			{
				onSuccess: () => {
					// Unregister from InlineEditStore BEFORE navigating
					// to prevent the navigation blocker from firing
					setHasUnsavedChanges(false);
					inlineEditStore.unregisterEditor(
						"project-edit-form" as never,
						Number(id) || 0
					);
					toast.success("Project updated successfully");
					navigate(`/projects/${id}`);
				},
				onError: (error: Error) => {
					toast.error(error.message || "Failed to update project");
				},
			}
		);
	};

	// Handle cancel
	const handleCancel = () => {
		inlineEditStore.unregisterEditor(
			"project-edit-form" as never,
			Number(id) || 0
		);
		navigate(`/projects/${id}/overview`);
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center space-y-4">
					<Loader2 className="size-12 mx-auto animate-spin text-blue-600" />
					<div className="text-lg font-medium text-muted-foreground">
						Loading project...
					</div>
				</div>
			</div>
		);
	}

	// Error state
	if (error || !data) {
		return (
			<div className="w-full">
				<AutoBreadcrumb
					overrideItems={[
						{ title: "Projects", link: "/projects" },
						{ title: "Edit" },
					]}
				/>
				<Alert variant="destructive">
					<AlertCircle className="size-4" />
					<AlertDescription>
						{error instanceof Error ? error.message : "Failed to load project"}
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	const { project, details } = data;

	// For very small screens (< 350px), use project ID instead of title
	const useProjectId = width < 350;
	const projectDisplayName = useProjectId
		? `Project #${project.id}`
		: sanitizeInput(project.title);

	return (
		<PageTransition>
			<div className="w-full">
				{/* Breadcrumb */}
				<AutoBreadcrumb
					overrideItems={[
						{ title: "Projects", link: "/projects" },
						{ title: projectDisplayName, link: `/projects/${id}/overview` },
						{ title: "Edit" },
					]}
				/>

				{/* Page Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-2">Edit Project</h1>
					<p className="text-muted-foreground">
						Update project information and settings
					</p>
				</div>

				{/* Edit Form */}
				<div ref={formContainerRef}>
					<EditProjectForm
						project={project}
						details={details}
						onSubmit={handleSubmit}
						onCancel={handleCancel}
						isLoading={updateMutation.isPending}
						onDirtyChange={setHasUnsavedChanges}
					/>
				</div>
			</div>
		</PageTransition>
	);
});

export default EditProjectPage;
