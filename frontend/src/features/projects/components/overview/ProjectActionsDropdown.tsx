import {
	FileText,
	Pause,
	Play,
	XCircle,
	CheckCircle,
	Settings,
	Trash2,
	ChevronDown,
} from "lucide-react";
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

interface ProjectActionsDropdownProps {
	project: IProjectData;
	documents?: IProjectDocuments | null;
	currentUser: IUserMe | null;
	onCreateStudentReport?: () => void;
	onCreateProgressReport?: () => void;
	onSuspendProject?: () => void;
	onUnsuspendProject?: () => void;
	onCloseProject?: () => void;
	onReopenProject?: () => void;
	onSetStatus?: () => void;
	onDeleteProject?: () => void;
	onRequestDeletion?: () => void;
	onCancelDeletionRequest?: () => void;
}

export function ProjectActionsDropdown({
	project,
	documents,
	currentUser,
	onCreateStudentReport,
	onCreateProgressReport,
	onSuspendProject,
	onUnsuspendProject,
	onCloseProject,
	onReopenProject,
	onSetStatus,
	onDeleteProject,
	onRequestDeletion,
	onCancelDeletionRequest,
}: ProjectActionsDropdownProps) {
	// Check if user can manage project
	const hasManagePermission = canEditProject(currentUser, project);

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
		"closed",
		"completed",
		"terminated",
	].includes(project.status);

	const canReopen = hasClosureDocument && isReopenableStatus;
	const canClose = !hasClosureDocument && !isReopenableStatus;

	// Check if progress report can be created
	const conceptPlanApproved =
		documents?.concept_plan?.document?.directorate_approval_granted;
	const projectPlanApproved =
		documents?.project_plan?.document?.directorate_approval_granted;
	const canCreateProgressReport =
		(project.kind === "science" || project.kind === "core_function") &&
		!isSuspended &&
		(!documents?.concept_plan || conceptPlanApproved) &&
		projectPlanApproved;

	// Check if student report can be created
	const canCreateStudentReport = project.kind === "student" && !isSuspended;

	// Determine if we should show any report button
	const showReportButton =
		canCreateStudentReport ||
		project.kind === "science" ||
		project.kind === "core_function";

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

							{/* Create Progress Report - Only for science/core_function projects */}
							{(project.kind === "science" ||
								project.kind === "core_function") &&
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

					{/* Close Project - Show when no closure document and not in reopenable status */}
					{canClose && onCloseProject && (
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

					{/* Delete/Request Deletion */}
					<DropdownMenuSeparator />
					{currentUser?.is_superuser && onDeleteProject ? (
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
}
