import { useState, useMemo } from "react";
import type { IProgressReport } from "@/shared/types/document.types";
import type {
	IProjectData,
	IProjectMember,
	IProjectDocuments,
} from "@/shared/types/project.types";
import type { IUserData } from "@/shared/types/user.types";
import { useCurrentUser } from "@/features/auth";
import { calculateDocumentEditPermission } from "@/features/projects/utils/permissions";
import {
	isOlderReportLocked,
	isReportCreationLocked,
	getEffectiveCanEdit,
	getLockedMessage,
} from "@/shared/utils/document-locking.utils";
import { DocumentTabLayout } from "@/shared/components/documents";
import { InlineSaveEditor } from "@/shared/components/editor";
import { ProjectSection } from "@/shared/components/ProjectSection";
import { YearSelector } from "@/shared/components/YearSelector";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Loader2, Lock, Plus } from "lucide-react";
import { CommentSection } from "@/features/projects/components/comments";
import { CreateProgressReportModal } from "@/features/projects/components/modals/CreateProgressReportModal";

interface ProgressReportsTabProps {
	progressReports: IProgressReport[];
	project: IProjectData;
	members: IProjectMember[] | null;
	projectId: number;
	// Document actions and approval workflow props
	creator?: IUserData | null;
	modifier?: IUserData | null;
	userIsCaretakerOfAdmin?: boolean;
	userIsCaretakerOfBaLeader?: boolean;
	userIsCaretakerOfProjectLeader?: boolean;
	all_documents?: IProjectDocuments;
	isBaLead?: boolean;
}

export const ProgressReportsTab = ({
	progressReports,
	project,
	members,
	projectId,
	creator,
	modifier,
	userIsCaretakerOfAdmin,
	userIsCaretakerOfBaLeader,
	userIsCaretakerOfProjectLeader,
	all_documents,
	isBaLead,
}: ProgressReportsTabProps) => {
	// Get available years from progress reports
	const years = Array.from(
		new Set(progressReports.map((report) => report.year))
	).sort((a, b) => b - a); // Sort descending (newest first)

	// Default to highest year, auto-corrects if selected year no longer exists
	const [selectedYear, setSelectedYear] = useState<number>(() => {
		return years.length > 0 ? Math.max(...years) : new Date().getFullYear();
	});

	// Derive the effective year — if selectedYear was deleted, fall back to highest
	const effectiveYear = years.includes(selectedYear)
		? selectedYear
		: years.length > 0
			? Math.max(...years)
			: selectedYear;

	// Find the selected progress report using useMemo to avoid effect
	const selectedReport = useMemo(() => {
		return (
			progressReports.find((report) => report.year === effectiveYear) || null
		);
	}, [effectiveYear, progressReports]);

	const { data: currentUser } = useCurrentUser();

	// Modal state for creating new progress reports
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	// Build year → status map for the YearSelector warning icons
	// NOTE: Must be called before early returns (React hooks rule)
	const yearStatuses = useMemo(() => {
		const map: Record<number, string> = {};
		for (const report of progressReports) {
			map[report.year] = report.document.status;
		}
		return map;
	}, [progressReports]);

	if (progressReports.length === 0) {
		return (
			<div className="rounded-lg border bg-card p-6">
				<p className="text-muted-foreground">
					No progress reports available. Create one from the Project Plan tab.
				</p>
			</div>
		);
	}

	if (!selectedReport) {
		return (
			<div className="rounded-lg border bg-card p-6 flex items-center justify-center">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	const canEditBase = selectedReport
		? calculateDocumentEditPermission({
				currentUser,
				members,
				document: selectedReport.document,
				isBaLead,
				userIsCaretakerOfBaLeader,
				userIsCaretakerOfAdmin,
			})
		: false;

	// Lock older reports — only approved older reports are locked
	const isLocked = isOlderReportLocked(
		effectiveYear,
		years,
		selectedReport.document.status
	);

	// Lock report creation if project is terminated/completed or has approved closure
	const isCreationLocked = isReportCreationLocked(project, all_documents);

	const canEdit = getEffectiveCanEdit(
		canEditBase,
		selectedReport.document,
		isLocked,
		currentUser?.is_superuser
	);
	const lockedMessage = getLockedMessage(
		selectedReport.document,
		isLocked,
		"This report is locked because a newer report exists."
	);

	return (
		<>
			{/* Year Selector with Create Button */}
			<YearSelector
				years={years}
				selectedYear={effectiveYear}
				onYearChange={setSelectedYear}
				yearStatuses={yearStatuses}
				action={
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="icon"
								className="size-9 shrink-0 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
								onClick={() => setIsCreateModalOpen(true)}
								disabled={isCreationLocked}
								aria-label="New Progress Report"
							>
								<Plus className="size-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							{isCreationLocked
								? "Report creation is locked"
								: "New Progress Report"}
						</TooltipContent>
					</Tooltip>
				}
			/>

			<DocumentTabLayout
				document={selectedReport.document}
				project={project}
				members={members}
				documentType="progress_report"
				typeSpecificId={selectedReport.id}
				canDelete={!isLocked}
				locked={isLocked}
				creator={creator}
				modifier={modifier}
				userIsCaretakerOfAdmin={userIsCaretakerOfAdmin}
				userIsCaretakerOfBaLeader={userIsCaretakerOfBaLeader}
				userIsCaretakerOfProjectLeader={userIsCaretakerOfProjectLeader}
				all_documents={all_documents}
				isBaLead={isBaLead}
				commentsSection={
					<CommentSection
						documentId={selectedReport.document.id}
						projectId={projectId}
					/>
				}
			>
				<div className="space-y-6">
					{/* Locked banner for older reports */}
					{isLocked && (
						<Alert className="border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
							<Lock className="size-4 text-gray-500 dark:text-gray-400" />
							<AlertDescription className="text-gray-600 dark:text-gray-400">
								This report is locked because a newer report exists. Content can
								still be copied.
							</AlertDescription>
						</Alert>
					)}
					{/* Context */}
					<ProjectSection>
						<InlineSaveEditor
							contentType="progress-report-context"
							entityId={selectedReport.id}
							initialContent={selectedReport.context || ""}
							canEdit={canEdit}
							lockedMessage={lockedMessage}
							wordLimit={150}
							limitCanBePassed={true}
							showWordLimitInLabel={true}
							label="Context"
						/>
					</ProjectSection>

					{/* Aims */}
					<ProjectSection>
						<InlineSaveEditor
							contentType="progress-report-aims"
							entityId={selectedReport.id}
							initialContent={selectedReport.aims || ""}
							canEdit={canEdit}
							lockedMessage={lockedMessage}
							wordLimit={150}
							limitCanBePassed={true}
							showWordLimitInLabel={true}
							label="Aims"
						/>
					</ProjectSection>

					{/* Progress */}
					<ProjectSection>
						<InlineSaveEditor
							contentType="progress-report-progress"
							entityId={selectedReport.id}
							initialContent={selectedReport.progress || ""}
							canEdit={canEdit}
							lockedMessage={lockedMessage}
							wordLimit={150}
							limitCanBePassed={true}
							showWordLimitInLabel={true}
							label="Progress"
							toolbar="report"
						/>
					</ProjectSection>

					{/* Management Implications */}
					<ProjectSection>
						<InlineSaveEditor
							contentType="progress-report-implications"
							entityId={selectedReport.id}
							initialContent={selectedReport.implications || ""}
							canEdit={canEdit}
							lockedMessage={lockedMessage}
							wordLimit={150}
							limitCanBePassed={true}
							showWordLimitInLabel={true}
							label="Management Implications"
						/>
					</ProjectSection>

					{/* Future Directions */}
					<ProjectSection>
						<InlineSaveEditor
							contentType="progress-report-future"
							entityId={selectedReport.id}
							initialContent={selectedReport.future || ""}
							canEdit={canEdit}
							lockedMessage={lockedMessage}
							wordLimit={150}
							limitCanBePassed={true}
							showWordLimitInLabel={true}
							label="Future Directions"
						/>
					</ProjectSection>
				</div>
			</DocumentTabLayout>

			{/* Create Progress Report Modal */}
			<CreateProgressReportModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				project={project}
			/>
		</>
	);
};
