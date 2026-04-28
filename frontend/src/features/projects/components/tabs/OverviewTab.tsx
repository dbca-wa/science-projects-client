import type {
	IProjectData,
	IExtendedProjectDetails,
	IProjectMember,
	IExternalProjectDetails,
	IProjectDocuments,
} from "@/shared/types/project.types";
import { ProjectImageWithTag } from "../images/ProjectImageWithTag";
import { ProjectStatusBadge } from "@/shared/components/projects/ProjectStatusBadge";
import { ProjectKindBadge } from "@/shared/components/projects/ProjectKindBadge";
import { DatasetReviewLink } from "../DatasetReviewLink";
import { EditProjectButton } from "../overview/EditProjectButton";
import { ProjectActionsDropdown } from "../overview/ProjectActionsDropdown";
import { ProjectSection } from "@/shared/components/ProjectSection";
import { InlineSaveEditor } from "@/shared/components/editor/InlineSaveEditor";
import { ProjectKeywordsSection } from "../keywords/ProjectKeywordsSection";
import { formatAuthors } from "../../utils/authors/authors.utils";
import { formatYearRange } from "../../utils/year.utils";
import { sanitizeInput } from "@/shared/utils/sanitise.utils";
import { Info, Building2, Calendar, Layers } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCurrentUser } from "@/features/auth";
import { canEditProject } from "@/shared/utils/project-permissions.utils";
import { checkTeamManagementPermissions } from "../../utils/permissions/team-permissions.utils";
import { ProjectTeamSection } from "../team/ProjectTeamSection";
import { ExternalProjectSections } from "../overview/ExternalProjectSections";
import { StudentProjectSections } from "../overview/StudentProjectSections";
import { useCancelDeletionRequest } from "../../hooks/useCancelDeletionRequest";
import { CreateStudentReportModal } from "../modals/CreateStudentReportModal";
import { CreateProgressReportModal } from "../modals/CreateProgressReportModal";
import { ProjectSuspensionModal } from "../modals/ProjectSuspensionModal";
import { ProjectClosureModal } from "../modals/ProjectClosureModal";
import { ReopenProjectModal } from "../modals/ReopenProjectModal";
import { SetProjectStatusModal } from "../modals/SetProjectStatusModal";
import { DeleteProjectModal } from "../modals/DeleteProjectModal";
import { RequestDeleteProjectModal } from "../modals/RequestDeleteProjectModal";

interface OverviewTabProps {
	project: IProjectData;
	details: IExtendedProjectDetails;
	members: IProjectMember[] | null;
	documents?: IProjectDocuments | null;
}

export function OverviewTab({
	project,
	details: _details,
	members,
	documents,
}: OverviewTabProps) {
	// Get current user for permission checks
	const { data: currentUser } = useCurrentUser();

	// Calculate team management permissions
	const canManageTeam = currentUser
		? checkTeamManagementPermissions(currentUser, project, members || [])
				.canManageTeam
		: false;

	// Modal state management
	const [isCreateStudentReportOpen, setIsCreateStudentReportOpen] =
		useState(false);
	const [isCreateProgressReportOpen, setIsCreateProgressReportOpen] =
		useState(false);
	const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
	const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
	const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
	const [isSetStatusModalOpen, setIsSetStatusModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isRequestDeleteModalOpen, setIsRequestDeleteModalOpen] =
		useState(false);

	// Sanitise title to remove HTML tags (including bold)
	const plainTextTitle = sanitizeInput(project.title);

	// Format authors from team members
	const authorsDisplay = formatAuthors(members || []);

	// Format year range
	const yearDisplay = formatYearRange(project.start_date, project.end_date);

	// Check if project is external
	const isExternal = project.kind === "external";
	const externalDetails =
		isExternal && _details?.external && !Array.isArray(_details.external)
			? (_details.external as IExternalProjectDetails)
			: null;

	const canEdit = canEditProject(currentUser ?? null, project);

	// Cancel deletion request hook
	const cancelDeletionRequestMutation = useCancelDeletionRequest(project.id);

	// Modal handlers
	const handleCreateStudentReport = () => setIsCreateStudentReportOpen(true);
	const handleCreateProgressReport = () => setIsCreateProgressReportOpen(true);
	const handleSuspendProject = () => setIsSuspendModalOpen(true);
	const handleUnsuspendProject = () => setIsSuspendModalOpen(true); // Same modal
	const handleCloseProject = () => setIsClosureModalOpen(true);
	const handleReopenProject = () => setIsReopenModalOpen(true);
	const handleSetStatus = () => setIsSetStatusModalOpen(true);
	const handleDeleteProject = () => setIsDeleteModalOpen(true);
	const handleRequestDeletion = () => setIsRequestDeleteModalOpen(true);

	const handleCancelDeletionRequest = () => {
		if (project.deletion_request_id) {
			toast.loading("Cancelling deletion request...");
			cancelDeletionRequestMutation.mutate(project.deletion_request_id);
		}
	};

	// Handle copying title to clipboard
	const handleCopyTitle = async () => {
		try {
			await navigator.clipboard.writeText(plainTextTitle);
			toast.success("Project title copied to clipboard");
		} catch (error) {
			console.error("Failed to copy title:", error);
			toast.error("Failed to copy title to clipboard");
		}
	};

	return (
		<div className="space-y-4">
			{/* Main Project Section - Image and Details */}
			<ProjectSection>
				{/* Grid layout: Image (40%) + Details (60%) */}
				<div className="grid gap-3 p-4 pt-6 px-6 2xl:grid-cols-[minmax(300px,4fr)_5fr] 3xl:grid-cols-[600px_1fr]">
					{/* Left column: Project Image with Tag */}
					<div className="w-full aspect-[25/18]">
						<ProjectImageWithTag
							project={project}
							alt={plainTextTitle}
							className="h-full w-full"
						/>
					</div>

					{/* Right column: Project Details */}
					<div className="px-2 flex flex-col">
						{/* Title and Authors */}
						<div className="pb-3">
							<h2
								className="text-2xl font-semibold mb-2 break-words text-[#62a0f2] dark:text-[#62a0f2] cursor-pointer hover:opacity-80 transition-opacity"
								onClick={handleCopyTitle}
								title="Click to copy title"
							>
								{plainTextTitle}
							</h2>

							{authorsDisplay && (
								<p className="mt-2 text-md font-normal text-gray-500 dark:text-gray-500">
									{authorsDisplay}
								</p>
							)}
						</div>

						{/* Status Badge */}
						<div className="pb-3">
							<div className="flex items-center gap-2 mb-1">
								<Info className="h-5 w-5 text-muted-foreground" />
								<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
									Status
								</p>
							</div>
							<ProjectStatusBadge status={project.status} />
						</div>

						{/* Kind Tag */}
						<div className="pb-3">
							<div className="flex items-center gap-2 mb-1">
								<Layers className="h-5 w-5 text-muted-foreground" />
								<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
									Kind
								</p>
							</div>
							<ProjectKindBadge kind={project.kind} />
						</div>

						{/* Business Area */}
						{project.business_area && (
							<div className="pb-3">
								<div className="flex items-center gap-2 mb-1">
									<Building2 className="h-5 w-5 text-muted-foreground" />
									<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
										Business Area
									</p>
								</div>
								<p className="text-base text-gray-600 dark:text-gray-400">
									{project.business_area.name}
								</p>
							</div>
						)}

						{/* External Project Sections */}
						{project.kind === "external" && externalDetails && (
							<ExternalProjectSections externalDetails={externalDetails} />
						)}

						{/* Student Project Sections */}
						{project.kind === "student" &&
							_details?.student &&
							!Array.isArray(_details.student) && (
								<StudentProjectSections studentDetails={_details.student} />
							)}

						{/* Year */}
						<div className="pb-3">
							<div className="flex items-center gap-2 mb-1">
								<Calendar className="h-5 w-5 text-muted-foreground" />
								<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
									Year
								</p>
							</div>
							<p className="text-base text-gray-600 dark:text-gray-400">
								{yearDisplay}
							</p>
						</div>
					</div>
				</div>

				{/* Full-width buttons section at bottom */}
				<div className="flex flex-col sm:flex-row items-center sm:items-center justify-between px-6 pb-4 pt-2 border-t gap-2">
					<DatasetReviewLink project={project} />
					<div className="flex gap-2">
						<EditProjectButton
							project={project}
							currentUser={currentUser ?? null}
						/>
						<ProjectActionsDropdown
							project={project}
							documents={documents}
							currentUser={currentUser ?? null}
							onCreateStudentReport={handleCreateStudentReport}
							onCreateProgressReport={handleCreateProgressReport}
							onSuspendProject={handleSuspendProject}
							onUnsuspendProject={handleUnsuspendProject}
							onCloseProject={handleCloseProject}
							onReopenProject={handleReopenProject}
							onSetStatus={handleSetStatus}
							onDeleteProject={handleDeleteProject}
							onRequestDeletion={handleRequestDeletion}
							onCancelDeletionRequest={handleCancelDeletionRequest}
						/>
					</div>
				</div>
			</ProjectSection>

			{/* Description Section - Separate ProjectSection */}
			<ProjectSection className="p-6">
				{isExternal && externalDetails ? (
					<>
						{/* External Description */}
						<div className="mb-6">
							<InlineSaveEditor
								contentType="external-project-description"
								entityId={externalDetails.id}
								initialContent={externalDetails.description || ""}
								canEdit={canEdit}
								label="External Description"
								placeholder="Enter external project description..."
								emptyMessage="No external description available."
							/>
						</div>

						{/* External Aims */}
						<div className="mb-6">
							<InlineSaveEditor
								contentType="external-project-aims"
								entityId={externalDetails.id}
								initialContent={externalDetails.aims || ""}
								canEdit={canEdit}
								label="External Aims"
								placeholder="Enter external project aims..."
								emptyMessage="No external aims available."
							/>
						</div>
					</>
				) : (
					<>
						{/* Regular Description */}
						<div className="mb-6">
							<InlineSaveEditor
								contentType="project-description"
								entityId={project.id}
								initialContent={project.description || ""}
								canEdit={canEdit}
								label="Description"
								placeholder="Enter project description..."
								emptyMessage="No description available."
							/>
						</div>
					</>
				)}

				{/* Keywords Section - Self-contained component */}
				<ProjectKeywordsSection
					projectId={project.id}
					keywords={project.keywords}
					canEdit={canEdit}
				/>
			</ProjectSection>

			{/* Project Team Section */}
			<ProjectSection className="p-6">
				<ProjectTeamSection
					projectId={project.id}
					canManageTeam={canManageTeam}
				/>
			</ProjectSection>

			{/* Modal Components */}
			{/* Create Student Report Modal - Student projects only */}
			{project.kind === "student" && (
				<CreateStudentReportModal
					isOpen={isCreateStudentReportOpen}
					onClose={() => setIsCreateStudentReportOpen(false)}
					projectId={project.id}
				/>
			)}

			{/* Create Progress Report Modal - Science/Core Function projects only */}
			{(project.kind === "science" || project.kind === "core_function") && (
				<CreateProgressReportModal
					isOpen={isCreateProgressReportOpen}
					onClose={() => setIsCreateProgressReportOpen(false)}
					project={project}
				/>
			)}

			{/* Project Suspension Modal */}
			<ProjectSuspensionModal
				isOpen={isSuspendModalOpen}
				onClose={() => setIsSuspendModalOpen(false)}
				projectId={project.id}
				currentStatus={project.status}
			/>

			{/* Project Closure Modal */}
			<ProjectClosureModal
				isOpen={isClosureModalOpen}
				onClose={() => setIsClosureModalOpen(false)}
				projectId={project.id}
				projectKind={project.kind}
			/>

			{/* Reopen Project Modal */}
			<ReopenProjectModal
				isOpen={isReopenModalOpen}
				onClose={() => setIsReopenModalOpen(false)}
				projectId={project.id}
			/>

			{/* Set Status Modal - Superuser only */}
			{currentUser?.is_superuser && (
				<SetProjectStatusModal
					isOpen={isSetStatusModalOpen}
					onClose={() => setIsSetStatusModalOpen(false)}
					projectId={project.id}
					currentStatus={project.status}
				/>
			)}

			{/* Delete Project Modal - Superuser only */}
			{currentUser?.is_superuser && (
				<DeleteProjectModal
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					projectId={project.id}
				/>
			)}

			{/* Request Delete Project Modal - Non-superuser */}
			{!currentUser?.is_superuser && (
				<RequestDeleteProjectModal
					isOpen={isRequestDeleteModalOpen}
					onClose={() => setIsRequestDeleteModalOpen(false)}
					projectId={project.id}
				/>
			)}
		</div>
	);
}
