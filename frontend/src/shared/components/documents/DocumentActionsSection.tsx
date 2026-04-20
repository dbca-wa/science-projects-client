import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Download, FileText, Trash2 } from "lucide-react";
import type { IMainDoc } from "@/shared/types/document.types";
import type {
	IProjectData,
	IProjectMember,
	IProjectDocuments,
	IProjectAreas,
} from "@/shared/types/project.types";
import type { DocumentType } from "@/shared/utils/document.utils";
import {
	getApprovalState,
	getCurrentApprovalStage,
} from "@/features/projects/utils/authors/approval.utils";
import { useCurrentUser } from "@/features/auth";
import { isUserAtApprovalStage } from "@/features/projects/utils/permissions/project-permissions.utils";
import { findProjectLeader } from "@/features/projects/utils/team/team.utils";

interface DocumentActionsSectionProps {
	document: IMainDoc;
	project: IProjectData;
	members: IProjectMember[] | null;
	documentType: DocumentType;
	canDelete: boolean;
	// Caretaker permissions
	userIsCaretakerOfAdmin?: boolean;
	userIsCaretakerOfBaLeader?: boolean;
	userIsCaretakerOfProjectLeader?: boolean;
	// Additional props for special actions
	all_documents?: IProjectDocuments;
	projectAreas?: IProjectAreas;
	documents?: IMainDoc[];
	setToLastTab?: (tabToGoTo?: number) => void;
	isBaLead?: boolean;
	// Action callbacks
	onSubmit?: () => void;
	onApprove?: () => void;
	onRecall?: () => void;
	onSendBack?: () => void;
	onDownloadPdf?: () => void;
	onGeneratePdf?: () => void;
	onDelete?: () => void;
	// Special action callbacks
	onCreateProgressReport?: () => void;
	onSetAreas?: () => void;
	onReopenProject?: () => void;
}

interface ApprovalStatusRowProps {
	label: string;
	status: "granted" | "required" | "not_applicable";
	children?: React.ReactNode;
}

function ApprovalStatusRow({
	label,
	status,
	children,
}: ApprovalStatusRowProps) {
	const statusConfig = {
		granted: {
			text: "Granted",
			variant: "approved" as const,
		},
		required: {
			text: "Required",
			variant: "pending" as const,
		},
		not_applicable: {
			text: "Not Applicable",
			variant: "secondary" as const,
		},
	};

	const config = statusConfig[status];

	return (
		<div className="space-y-3">
			<div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center">
				<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
					{label}
				</span>
				<Badge variant={config.variant}>{config.text}</Badge>
			</div>
			{children && <div className="flex flex-col gap-2">{children}</div>}
		</div>
	);
}

export function DocumentActionsSection({
	document,
	project,
	members,
	documentType,
	canDelete: _canDelete,
	userIsCaretakerOfAdmin,
	userIsCaretakerOfBaLeader,
	userIsCaretakerOfProjectLeader,
	all_documents,
	projectAreas,
	documents: _documents,
	setToLastTab: _setToLastTab,
	isBaLead,
	onSubmit,
	onApprove,
	onRecall,
	onSendBack,
	onDownloadPdf,
	onGeneratePdf,
	onDelete,
	onCreateProgressReport,
	onSetAreas,
	onReopenProject,
}: DocumentActionsSectionProps) {
	const { data: currentUser } = useCurrentUser();

	const approvalState = useMemo(() => getApprovalState(document), [document]);

	const currentStage = useMemo(
		() => getCurrentApprovalStage(document),
		[document]
	);

	const projectLead = useMemo(() => {
		return members ? findProjectLeader(members) : null;
	}, [members]);

	const isProjectLead = useMemo(() => {
		if (!currentUser || !projectLead) return false;
		return currentUser.id === projectLead.user.id;
	}, [currentUser, projectLead]);

	const isBusinessAreaLead = useMemo(() => {
		if (!currentUser || !project.business_area?.leader) return false;
		return currentUser.id === project.business_area.leader;
	}, [currentUser, project]);

	const isDirectorateApprover = useMemo(() => {
		if (!currentUser) return false;
		// Check if user can approve at directorate level
		return isUserAtApprovalStage(currentUser, project, "directorate");
	}, [currentUser, project]);

	// Delete button: Show when project lead approval NOT granted AND document NOT directorate approved
	// Special case: project plans with no progress reports can be deleted even if partially approved
	const canDelete = useMemo(() => {
		// Never show if fully approved
		if (document.directorate_approval_granted) {
			return false;
		}

		// Check if user has permission (project lead, superuser, or caretaker)
		const hasPermission =
			currentUser?.is_superuser ||
			userIsCaretakerOfAdmin ||
			isProjectLead ||
			userIsCaretakerOfProjectLeader ||
			isBaLead ||
			userIsCaretakerOfBaLeader;

		if (!hasPermission) return false;

		// Show for new documents (project lead approval not granted)
		if (!document.project_lead_approval_granted) {
			return true;
		}

		// Special case: project plans without progress reports can be deleted even if partially approved
		if (
			documentType === "projectplan" &&
			(!all_documents?.progress_reports ||
				all_documents.progress_reports.length < 1)
		) {
			return true;
		}

		return false;
	}, [
		currentUser,
		document,
		documentType,
		all_documents,
		isProjectLead,
		isBaLead,
		userIsCaretakerOfAdmin,
		userIsCaretakerOfBaLeader,
		userIsCaretakerOfProjectLeader,
	]);

	// Submit: Project lead can submit when approval required
	const canSubmit = useMemo(() => {
		const hasPermission =
			currentUser?.is_superuser ||
			userIsCaretakerOfAdmin ||
			isProjectLead ||
			userIsCaretakerOfProjectLeader ||
			isBaLead ||
			userIsCaretakerOfBaLeader;

		return hasPermission && approvalState.projectLead === "required";
	}, [
		currentUser,
		isProjectLead,
		isBaLead,
		approvalState,
		userIsCaretakerOfAdmin,
		userIsCaretakerOfBaLeader,
		userIsCaretakerOfProjectLeader,
	]);

	// Approve: Current stage approver can approve
	const canApprove = useMemo(() => {
		if (!currentUser || currentStage === "complete") return false;
		return isUserAtApprovalStage(currentUser, project, currentStage);
	}, [currentUser, project, currentStage]);

	// Recall Project Lead: Project lead can recall when BA lead approval is pending
	const canRecallProjectLeadApproval = useMemo(() => {
		const hasPermission =
			currentUser?.is_superuser ||
			userIsCaretakerOfAdmin ||
			isProjectLead ||
			userIsCaretakerOfProjectLeader ||
			isBaLead ||
			userIsCaretakerOfBaLeader;

		return (
			hasPermission &&
			approvalState.projectLead === "granted" &&
			approvalState.businessAreaLead === "required"
		);
	}, [
		currentUser,
		isProjectLead,
		isBaLead,
		approvalState,
		userIsCaretakerOfAdmin,
		userIsCaretakerOfBaLeader,
		userIsCaretakerOfProjectLeader,
	]);

	// Recall Business Area: BA lead can recall when directorate approval is pending
	const canRecallBusinessAreaApproval = useMemo(() => {
		const hasPermission =
			currentUser?.is_superuser ||
			userIsCaretakerOfAdmin ||
			isBusinessAreaLead ||
			userIsCaretakerOfBaLeader;

		return (
			hasPermission &&
			approvalState.businessAreaLead === "granted" &&
			approvalState.directorate === "required"
		);
	}, [
		currentUser,
		isBusinessAreaLead,
		approvalState,
		userIsCaretakerOfAdmin,
		userIsCaretakerOfBaLeader,
	]);

	// Recall Directorate: Directorate approver can recall after approval
	const canRecallDirectorateApproval = useMemo(() => {
		const hasPermission =
			currentUser?.is_superuser ||
			userIsCaretakerOfAdmin ||
			isDirectorateApprover;

		return hasPermission && approvalState.directorate === "granted";
	}, [
		currentUser,
		isDirectorateApprover,
		approvalState,
		userIsCaretakerOfAdmin,
	]);

	// Send Back: Approvers at BA lead or directorate stage can send back
	const canSendBackForRevision = useMemo(() => {
		if (
			!currentUser ||
			currentStage === "complete" ||
			currentStage === "project_lead"
		)
			return false;
		return isUserAtApprovalStage(currentUser, project, currentStage);
	}, [currentUser, project, currentStage]);

	const canGeneratePdf = useMemo(() => {
		if (!currentUser) return false;
		return currentUser.is_superuser || isProjectLead;
	}, [currentUser, isProjectLead]);

	// Special action button visibility
	// Create Progress Report: Show for fully approved project plans with no progress reports
	const canCreateProgressReport = useMemo(() => {
		if (documentType !== "projectplan") return false;
		if (
			all_documents?.progress_reports &&
			all_documents.progress_reports.length >= 1
		)
			return false;

		const isFullyApproved =
			document.project_lead_approval_granted &&
			document.business_area_lead_approval_granted &&
			document.directorate_approval_granted;

		if (!isFullyApproved) return false;

		const hasPermission =
			currentUser?.is_superuser ||
			userIsCaretakerOfAdmin ||
			isProjectLead ||
			userIsCaretakerOfProjectLeader ||
			isBaLead ||
			userIsCaretakerOfBaLeader;

		return hasPermission;
	}, [
		documentType,
		all_documents,
		document,
		currentUser,
		isProjectLead,
		isBaLead,
		userIsCaretakerOfAdmin,
		userIsCaretakerOfProjectLeader,
		userIsCaretakerOfBaLeader,
	]);

	// Set Areas: Show for new project plans with no areas
	const canSetAreas = useMemo(() => {
		if (documentType !== "projectplan") return false;
		if (projectAreas?.areas && projectAreas.areas.length >= 1) return false;
		if (document.project_lead_approval_granted) return false;

		return true; // No permission check needed - anyone can see this
	}, [documentType, projectAreas, document]);

	// Reopen Project: Show for closed project closures
	const canReopenProject = useMemo(() => {
		if (documentType !== "projectclosure") return false;

		const isProjectClosed =
			project.status === "completed" ||
			project.status === "terminated" ||
			project.status === "suspended";

		if (!isProjectClosed) return false;

		const hasPermission =
			currentUser?.is_superuser ||
			userIsCaretakerOfAdmin ||
			isProjectLead ||
			userIsCaretakerOfProjectLeader ||
			isBaLead ||
			userIsCaretakerOfBaLeader ||
			isDirectorateApprover;

		return hasPermission;
	}, [
		documentType,
		project,
		currentUser,
		isProjectLead,
		isBaLead,
		isDirectorateApprover,
		userIsCaretakerOfAdmin,
		userIsCaretakerOfProjectLeader,
		userIsCaretakerOfBaLeader,
	]);

	return (
		<>
			{/* Actions Panel */}
			<Card className="gap-0 bg-[#EBF0F6] dark:bg-gray-700">
				<CardHeader className="pb-4">
					<CardTitle>Actions</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4 pt-0">
					{/* Approval Status Section with actions under each stage */}
					<div className="rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-muted/30 dark:bg-gray-900 p-3 space-y-3">
						<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
							Approval Status
						</h3>
						<div className="space-y-4">
							{/* Project Lead Section */}
							<div className="space-y-3">
								<ApprovalStatusRow
									label="Project Lead"
									status={approvalState.projectLead}
								>
									{/* Submit button - Green */}
									{canSubmit && onSubmit && (
										<Button
											onClick={onSubmit}
											variant="action-green"
											size="sm"
											className="w-full"
										>
											Submit for Approval
										</Button>
									)}
									{/* Delete button - Red (only when project lead approval NOT granted) */}
									{canDelete && onDelete && (
										<Button
											onClick={onDelete}
											variant="action-red"
											size="sm"
											className="w-full"
										>
											<Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
											Delete Document
										</Button>
									)}
									{/* Recall button - Blue (when BA lead approval is pending) */}
									{canRecallProjectLeadApproval && onRecall && (
										<Button
											onClick={onRecall}
											variant="action-blue"
											size="sm"
											className="w-full"
										>
											Recall Approval
										</Button>
									)}
								</ApprovalStatusRow>
							</div>

							{/* Business Area Lead Section */}
							<div className="space-y-3">
								<ApprovalStatusRow
									label="Business Area Lead"
									status={approvalState.businessAreaLead}
								>
									{/* Approve button - Green */}
									{approvalState.projectLead === "granted" &&
										approvalState.businessAreaLead === "required" &&
										canApprove &&
										onApprove && (
											<Button
												onClick={onApprove}
												variant="action-green"
												size="sm"
												className="w-full"
											>
												Approve
											</Button>
										)}
									{/* Send Back button - Orange */}
									{approvalState.projectLead === "granted" &&
										approvalState.businessAreaLead === "required" &&
										canSendBackForRevision &&
										onSendBack && (
											<Button
												onClick={onSendBack}
												variant="action-orange"
												size="sm"
												className="w-full"
											>
												Send Back for Revisions
											</Button>
										)}
									{/* Recall button - Blue (when directorate approval is pending) */}
									{canRecallBusinessAreaApproval && onRecall && (
										<Button
											onClick={onRecall}
											variant="action-blue"
											size="sm"
											className="w-full"
										>
											Recall Approval
										</Button>
									)}
								</ApprovalStatusRow>
							</div>

							{/* Directorate Section */}
							<div className="space-y-3">
								<ApprovalStatusRow
									label="Directorate"
									status={approvalState.directorate}
								>
									{/* Approve button - Green */}
									{approvalState.businessAreaLead === "granted" &&
										approvalState.directorate === "required" &&
										canApprove &&
										onApprove && (
											<Button
												onClick={onApprove}
												variant="action-green"
												size="sm"
												className="w-full"
											>
												Approve
											</Button>
										)}
									{/* Send Back button - Orange */}
									{approvalState.businessAreaLead === "granted" &&
										approvalState.directorate === "required" &&
										canSendBackForRevision &&
										onSendBack && (
											<Button
												onClick={onSendBack}
												variant="action-orange"
												size="sm"
												className="w-full"
											>
												Send Back for Revisions
											</Button>
										)}
									{/* Recall button - Blue (after directorate approval) */}
									{canRecallDirectorateApproval && onRecall && (
										<Button
											onClick={onRecall}
											variant="action-blue"
											size="sm"
											className="w-full"
										>
											Recall Approval
										</Button>
									)}
								</ApprovalStatusRow>
							</div>
						</div>
					</div>

					{/* Special Action Buttons Section */}
					{(canCreateProgressReport || canSetAreas || canReopenProject) && (
						<div className="rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-muted/30 dark:bg-gray-900 p-3 space-y-3">
							<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
								Special Actions
							</h3>
							<div className="space-y-2">
								{/* Create Progress Report - Orange */}
								{canCreateProgressReport && onCreateProgressReport && (
									<Button
										onClick={onCreateProgressReport}
										variant="action-orange"
										size="sm"
										className="w-full"
									>
										Create Progress Report
									</Button>
								)}

								{/* Set Areas - Green */}
								{canSetAreas && onSetAreas && (
									<Button
										onClick={onSetAreas}
										variant="action-green"
										size="sm"
										className="w-full"
									>
										Set Areas
									</Button>
								)}

								{/* Reopen Project - Orange */}
								{canReopenProject && onReopenProject && (
									<Button
										onClick={onReopenProject}
										variant="action-orange"
										size="sm"
										className="w-full"
									>
										{currentUser?.is_superuser || userIsCaretakerOfAdmin
											? "Delete Closure"
											: "Reopen Project"}
									</Button>
								)}
							</div>
						</div>
					)}

					{/* PDF Section */}
					{(document.pdf || canGeneratePdf) && (
						<div className="rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-muted/30 dark:bg-gray-900 p-3 space-y-3">
							<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
								PDF
							</h3>
							<div className="flex items-center gap-2">
								{canGeneratePdf && onGeneratePdf && (
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												onClick={onGeneratePdf}
												variant="outline"
												className="flex-1"
												size="sm"
											>
												<FileText className="mr-2 h-4 w-4" aria-hidden="true" />
												Generate New
											</Button>
										</TooltipTrigger>
										<TooltipContent>Generate a new PDF version</TooltipContent>
									</Tooltip>
								)}
								{onDownloadPdf && (
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												onClick={document.pdf ? onDownloadPdf : undefined}
												variant="outline"
												size="icon"
												aria-disabled={!document.pdf}
												className={`size-9 shrink-0 ${
													document.pdf
														? "cursor-pointer bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/40"
														: "cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200 opacity-50 dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700"
												}`}
												aria-label={
													document.pdf
														? "Download last generated PDF"
														: "No PDF available"
												}
											>
												<Download className="h-4 w-4" aria-hidden="true" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											{document.pdf ? "Download latest" : "No PDF available"}
										</TooltipContent>
									</Tooltip>
								)}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</>
	);
}
