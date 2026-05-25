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
import {
	formatAuthors,
	getAuthorEntries,
} from "../../utils/authors/authors.utils";
import { formatYearRange } from "../../utils/year.utils";
import { sanitizeInput } from "@/shared/utils/sanitise.utils";
import { Info, Building2, Calendar, Layers } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useCurrentUser } from "@/features/auth";
import { useCaretakerPermissions } from "@/shared/hooks/useCaretakerPermissions";
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
import { HideProjectModal } from "../modals/HideProjectModal";

interface OverviewTabProps {
	project: IProjectData;
	details: IExtendedProjectDetails;
	members: IProjectMember[] | null;
	documents?: IProjectDocuments | null;
}

export const OverviewTab = ({
	project,
	details: _details,
	members,
	documents,
}: OverviewTabProps) => {
	// Get current user for permission checks
	const { data: currentUser } = useCurrentUser();
	const caretakerPerms = useCaretakerPermissions();

	// Compute role-based permissions for deletion
	const isProjectLead = useMemo(() => {
		if (!currentUser || !members) return false;
		return members.some((m) => m.is_leader && m.user.id === currentUser.id);
	}, [currentUser, members]);

	const isBaLead = useMemo(() => {
		if (!currentUser || !project.business_area?.leader) return false;
		return currentUser.id === project.business_area.leader;
	}, [currentUser, project.business_area]);

	const userIsCaretakerOfProjectLeader = useMemo(() => {
		return caretakerPerms.canActAsProjectLead(project);
	}, [caretakerPerms, project]);

	const userIsCaretakerOfBaLeader = useMemo(() => {
		if (!project.business_area) return false;
		return caretakerPerms.canActAsBusinessAreaLead(project.business_area);
	}, [caretakerPerms, project.business_area]);

	// Determine if user can directly delete (vs request deletion)
	const canDirectDelete = useMemo(() => {
		if (!currentUser) return false;
		if (currentUser.is_superuser) return true;
		if (isBaLead || userIsCaretakerOfBaLeader) return true;
		if (isProjectLead || userIsCaretakerOfProjectLeader) {
			const createdAt = new Date(project.created_at);
			const sevenDaysAgo = new Date();
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
			return createdAt >= sevenDaysAgo;
		}
		return false;
	}, [
		currentUser,
		isBaLead,
		userIsCaretakerOfBaLeader,
		isProjectLead,
		userIsCaretakerOfProjectLeader,
		project.created_at,
	]);

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
	const [isHideProjectModalOpen, setIsHideProjectModalOpen] = useState(false);

	// Sanitise title to remove HTML tags (including bold)
	const plainTextTitle = sanitizeInput(project.title);

	// Format authors from team members
	const authorEntries = getAuthorEntries(members || []);
	const authorsDisplay = formatAuthors(members || []);

	// Format year range
	const yearDisplay = formatYearRange(project.start_date, project.end_date);

	// Check if project is external
	const isExternal = project.kind === "external";
	const externalDetails =
		isExternal && _details?.external && !Array.isArray(_details.external)
			? (_details.external as IExternalProjectDetails)
			: null;

	const canEdit = canEditProject(currentUser ?? null, project, members);

	// Cancel deletion request hook
	const cancelDeletionRequestMutation = useCancelDeletionRequest(project.id);

	// Modal handlers
	const handleCreateStudentReport = () => setIsCreateStudentReportOpen(true);
	const handleCreateProgressReport = () => setIsCreateProgressReportOpen(true);

	const handleCreateConceptPlan = async () => {
		try {
			const { apiClient } =
				await import("@/shared/services/api/client.service");
			await apiClient.post("documents/spawn", {
				project: project.id,
				kind: "concept",
			});
			const { toast } = await import("sonner");
			toast.success("Concept plan created");
			window.location.reload();
		} catch {
			const { toast } = await import("sonner");
			toast.error("Failed to create concept plan");
		}
	};
	const handleSuspendProject = () => setIsSuspendModalOpen(true);
	const handleUnsuspendProject = () => setIsSuspendModalOpen(true); // Same modal
	const handleCloseProject = () => setIsClosureModalOpen(true);
	const handleReopenProject = () => setIsReopenModalOpen(true);
	const handleSetStatus = () => setIsSetStatusModalOpen(true);
	const handleDeleteProject = () => setIsDeleteModalOpen(true);
	const handleRequestDeletion = () => setIsRequestDeleteModalOpen(true);
	const handleHideProject = () => setIsHideProjectModalOpen(true);

	// Determine if the project is hidden from the current user's staff profile
	const isHiddenFromProfile =
		currentUser && project.hidden_from_staff_profiles
			? project.hidden_from_staff_profiles.includes(currentUser.id)
			: false;

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

							{(authorsDisplay ||
								authorEntries.some((e) => e.hasInvalidName)) && (
								<p className="mt-2 text-md font-normal text-gray-500 dark:text-gray-500">
									{authorsDisplay}
									{authorsDisplay &&
										authorEntries.some((e) => e.hasInvalidName) &&
										", "}
									{authorEntries
										.filter((e) => e.hasInvalidName)
										.map((entry, idx) => (
											<span key={entry.userId}>
												{idx > 0 && ", "}
												<Tooltip>
													<TooltipTrigger asChild>
														<button
															type="button"
															className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-600 text-white cursor-pointer hover:bg-red-700 transition-colors"
															onClick={() => {
																document
																	.getElementById("project-team-section")
																	?.scrollIntoView({ behavior: "smooth" });
															}}
														>
															{entry.text}
														</button>
													</TooltipTrigger>
													<TooltipContent>
														<p>
															This user has no name set. Click to scroll to the
															team section and fix it.
														</p>
													</TooltipContent>
												</Tooltip>
											</span>
										))}
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
							members={members}
						/>
						<ProjectActionsDropdown
							project={project}
							documents={documents}
							currentUser={currentUser ?? null}
							members={members}
							isBaLead={isBaLead}
							userIsCaretakerOfBaLeader={userIsCaretakerOfBaLeader}
							isProjectLead={isProjectLead}
							userIsCaretakerOfProjectLeader={userIsCaretakerOfProjectLeader}
							onCreateConceptPlan={handleCreateConceptPlan}
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
							onHideProject={handleHideProject}
							isHiddenFromProfile={isHiddenFromProfile}
						/>
					</div>
				</div>
			</ProjectSection>

			{/* Description Section - Separate ProjectSection */}
			<ProjectSection className="p-6">
				{/* Description — always show the project summary */}
				<div className="mb-6">
					<InlineSaveEditor
						contentType="project-description"
						entityId={project.id}
						initialContent={project.description || ""}
						canEdit={canEdit}
						label="Description"
						placeholder="Enter project description..."
						emptyMessage="No description available."
						toolbar="simple"
					/>
				</div>

				{/* Aims — only for external projects */}
				{isExternal && externalDetails && (
					<div className="mb-6">
						<InlineSaveEditor
							contentType="external-project-aims"
							entityId={externalDetails.id}
							initialContent={externalDetails.aims || ""}
							canEdit={canEdit}
							label="Aims"
							placeholder="Enter project aims..."
							emptyMessage="No aims available."
							toolbar="simple"
						/>
					</div>
				)}

				{/* Keywords Section - Self-contained component */}
				<ProjectKeywordsSection
					projectId={project.id}
					keywords={project.keywords}
					canEdit={canEdit}
				/>
			</ProjectSection>

			{/* Project Team Section */}
			<ProjectSection className="p-6" id="project-team-section">
				<ProjectTeamSection
					projectId={project.id}
					canManageTeam={canManageTeam}
					projectKind={project.kind}
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
				statusBeforeSuspend={project.status_before_suspend}
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

			{/* Delete Project Modal — users who can directly delete */}
			{canDirectDelete && (
				<DeleteProjectModal
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					projectId={project.id}
				/>
			)}

			{/* Request Delete Project Modal — users who cannot directly delete */}
			{!canDirectDelete && (
				<RequestDeleteProjectModal
					isOpen={isRequestDeleteModalOpen}
					onClose={() => setIsRequestDeleteModalOpen(false)}
					projectId={project.id}
				/>
			)}

			{/* Hide/Show Project from Staff Profile Modal */}
			<HideProjectModal
				isOpen={isHideProjectModalOpen}
				onClose={() => setIsHideProjectModalOpen(false)}
				projectId={project.id}
				isCurrentlyHidden={isHiddenFromProfile}
			/>
		</div>
	);
};
