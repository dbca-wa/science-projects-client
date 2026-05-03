import {
	FileText,
	Pause,
	Play,
	XCircle,
	CheckCircle,
	Settings,
	Trash2,
	ChevronDown,
	EyeOff,
	Eye,
} from "lucide-react";
import { useMemo } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import type {
	IProjectData,
	IProjectDocuments,
} from "@/shared/types/project.types";
import type { IUserMe } from "@/shared/types/user.types";
import { canEditProject } from "@/features/projects/utils/permissions";
import { isDocumentTypeAllowed } from "@/features/projects/constants/allowedDocumentTypes";

interface ProjectActionsDropdownProps {
	project: IProjectData;
	documents?: IProjectDocuments | null;
	currentUser: IUserMe | null;
	isBaLead?: boolean;
	userIsCaretakerOfBaLeader?: boolean;
	isProjectLead?: boolean;
	userIsCaretakerOfProjectLeader?: boolean;
	onCreateStudentReport?: () => void;
	onCreateConceptPlan?: () => void;
	onCreateProgressReport?: () => void;
	onSuspendProject?: () => void;
	onUnsuspendProject?: () => void;
	onCloseProject?: () => void;
	onReopenProject?: () => void;
	onSetStatus?: () => void;
	onDeleteProject?: () => void;
	onRequestDeletion?: () => void;
	onCancelDeletionRequest?: () => void;
	onHideProject?: () => void;
	isHiddenFromProfile?: boolean;
}

export const ProjectActionsDropdown = ({
	project,
	documents,
	currentUser,
	isBaLead,
	userIsCaretakerOfBaLeader,
	isProjectLead,
	userIsCaretakerOfProjectLeader,
	onCreateStudentReport,
	onCreateConceptPlan,
	onCreateProgressReport,
	onSuspendProject,
	onUnsuspendProject,
	onCloseProject,
	onReopenProject,
	onSetStatus,
	onDeleteProject,
	onRequestDeletion,
	onCancelDeletionRequest,
	onHideProject,
	isHiddenFromProfile,
}: ProjectActionsDropdownProps) => {
	// Check if user can manage project
	const hasManagePermission = canEditProject(currentUser, project);

	// Determine if user can directly delete (vs request deletion)
	// NOTE: All hooks must be called before any early returns
	const canDirectDelete = useMemo(() => {
		if (!currentUser) return false;
		// Superusers can always delete
		if (currentUser.is_superuser) return true;
		// BA leads of the project's business area can delete
		if (isBaLead || userIsCaretakerOfBaLeader) return true;
		// Project leads can delete if project was created within last 7 days
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

	// Don't render if user doesn't have permission
	if (!hasManagePermission) {
		return null;
	}

	// Check if project is suspended
	const isSuspended = project.status === "suspended";

	// Check if project is in terminal status (completed, terminated)
	const isTerminalStatus = ["completed", "terminated"].includes(project.status);

	// Check if project can be reopened (has closure document)
	const hasClosureDocument = documents?.project_closure !== null;

	// Check if project is in reopenable status
	const isReopenableStatus = [
		"closure_requested",
		"closing",
		"completed",
		"terminated",
	].includes(project.status);

	// Check if closure document has all three approval stages granted
	const closureApproved =
		documents?.project_closure?.document?.project_lead_approval_granted ===
			true &&
		documents?.project_closure?.document
			?.business_area_lead_approval_granted === true &&
		documents?.project_closure?.document?.directorate_approval_granted === true;

	const canReopen = hasClosureDocument && isReopenableStatus && closureApproved;
	const canClose = !hasClosureDocument && !isReopenableStatus;

	// Check if concept plan can be created
	const canCreateConceptPlan =
		isDocumentTypeAllowed(project.kind, "concept") &&
		!isSuspended &&
		!documents?.concept_plan;

	// Check if progress report can be created
	const conceptPlanApproved =
		documents?.concept_plan?.document?.directorate_approval_granted;
	const projectPlanApproved =
		documents?.project_plan?.document?.directorate_approval_granted;
	const canCreateProgressReport =
		isDocumentTypeAllowed(project.kind, "progressreport") &&
		!isSuspended &&
		(!documents?.concept_plan || conceptPlanApproved) &&
		projectPlanApproved;

	// Check if student report can be created
	const canCreateStudentReport =
		isDocumentTypeAllowed(project.kind, "studentreport") && !isSuspended;

	// Determine if we should show any report button
	const showReportButton =
		canCreateConceptPlan ||
		canCreateStudentReport ||
		isDocumentTypeAllowed(project.kind, "progressreport");

	return (
		<div className="relative">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" aria-label="Project actions">
						<Settings className="h-4 w-4" />
						<span className="hidden xs:inline ml-2">Actions</span>
						<ChevronDown className="ml-2 h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					{/* Only show separator if we have report buttons to show */}
					{showReportButton && (
						<>
							{/* Create Student Report - Only for student projects */}
							{canCreateStudentReport && onCreateStudentReport && (
								<DropdownMenuItem
									onClick={onCreateStudentReport}
									className={isSuspended ? "opacity-50 cursor-not-allowed" : ""}
								>
									<FileText className="mr-2 h-4 w-4" />
									<span>Create Student Report</span>
								</DropdownMenuItem>
							)}

							{/* Create Concept Plan - Only for science/core_function without existing concept plan */}
							{canCreateConceptPlan && onCreateConceptPlan && (
								<DropdownMenuItem onClick={onCreateConceptPlan}>
									<FileText className="mr-2 h-4 w-4" />
									<span>Create Concept Plan</span>
								</DropdownMenuItem>
							)}

							{/* Create Progress Report - Only for kinds that allow progress reports */}
							{isDocumentTypeAllowed(project.kind, "progressreport") &&
								onCreateProgressReport && (
									<DropdownMenuItem
										onClick={
											canCreateProgressReport
												? onCreateProgressReport
												: undefined
										}
										className={
											!canCreateProgressReport
												? "opacity-50 cursor-not-allowed"
												: ""
										}
									>
										<FileText className="mr-2 h-4 w-4" />
										<span>Create Progress Report</span>
									</DropdownMenuItem>
								)}

							<DropdownMenuSeparator />
						</>
					)}

					{/* Suspend/Unsuspend Project */}
					{!isSuspended && onSuspendProject && (
						<DropdownMenuItem
							onClick={isTerminalStatus ? undefined : onSuspendProject}
							className={
								isTerminalStatus ? "opacity-50 cursor-not-allowed" : ""
							}
						>
							<Pause className="mr-2 h-4 w-4" />
							<span>Suspend Project</span>
						</DropdownMenuItem>
					)}

					{isSuspended && onUnsuspendProject && (
						<DropdownMenuItem onClick={onUnsuspendProject}>
							<Play className="mr-2 h-4 w-4" />
							<span>Unsuspend Project</span>
						</DropdownMenuItem>
					)}

					{/* Close Project - Show when allowed for kind, no closure document, and not in reopenable status */}
					{isDocumentTypeAllowed(project.kind, "projectclosure") &&
						canClose &&
						onCloseProject && (
							<DropdownMenuItem onClick={onCloseProject}>
								<XCircle className="mr-2 h-4 w-4" />
								<span>Close Project</span>
							</DropdownMenuItem>
						)}

					{/* Reopen Project - Show when has closure document and in reopenable status */}
					{canReopen && onReopenProject && (
						<DropdownMenuItem onClick={onReopenProject}>
							<CheckCircle className="mr-2 h-4 w-4" />
							<span>Reopen Project</span>
						</DropdownMenuItem>
					)}

					{/* Set Status - Superuser only */}
					{currentUser?.is_superuser && onSetStatus && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={onSetStatus}>
								<Settings className="mr-2 h-4 w-4" />
								<span>Set Status</span>
							</DropdownMenuItem>
						</>
					)}

					{/* Hide/Show from Staff Profile */}
					{onHideProject && (
						<DropdownMenuItem onClick={onHideProject}>
							{isHiddenFromProfile ? (
								<Eye className="mr-2 h-4 w-4" />
							) : (
								<EyeOff className="mr-2 h-4 w-4" />
							)}
							<span>
								{isHiddenFromProfile ? "Show on Profile" : "Hide from Profile"}
							</span>
						</DropdownMenuItem>
					)}

					{/* Delete/Request Deletion */}
					<DropdownMenuSeparator />
					{canDirectDelete && onDeleteProject ? (
						<DropdownMenuItem
							onClick={onDeleteProject}
							className="text-destructive"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							<span>Delete Project</span>
						</DropdownMenuItem>
					) : (
						<DropdownMenuItem
							onClick={
								project.deletion_requested
									? onCancelDeletionRequest
									: onRequestDeletion
							}
						>
							<Trash2 className="mr-2 h-4 w-4" />
							<span>
								{project.deletion_requested
									? "Cancel Deletion Request"
									: "Request Deletion"}
							</span>
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};
