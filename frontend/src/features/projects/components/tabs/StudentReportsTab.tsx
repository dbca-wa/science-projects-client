import { useState, useMemo } from "react";
import type { IStudentReport } from "@/shared/types/document.types";
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
import { CreateStudentReportModal } from "@/features/projects/components/modals/CreateStudentReportModal";

interface StudentReportsTabProps {
	studentReports: IStudentReport[];
	project: IProjectData;
	members: IProjectMember[] | null;
	projectId: number;
	// New props for DocumentActionsSection
	creator?: IUserData | null;
	modifier?: IUserData | null;
	userIsCaretakerOfAdmin?: boolean;
	userIsCaretakerOfBaLeader?: boolean;
	userIsCaretakerOfProjectLeader?: boolean;
	all_documents?: IProjectDocuments;
	isBaLead?: boolean;
}

export function StudentReportsTab({
	studentReports,
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
}: StudentReportsTabProps) {
	// Get available years from student reports
	const years = Array.from(
		new Set(studentReports.map((report) => report.year))
	).sort((a, b) => b - a); // Sort descending (newest first)

	// Default to highest year
	const [selectedYear, setSelectedYear] = useState<number>(() => {
		return years.length > 0 ? Math.max(...years) : new Date().getFullYear();
	});

	// Find the selected student report using useMemo to avoid effect
	const selectedReport = useMemo(() => {
		return (
			studentReports.find((report) => report.year === selectedYear) || null
		);
	}, [selectedYear, studentReports]);

	const { data: currentUser } = useCurrentUser();

	// Modal state for creating new student reports
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	// Check if there are available years for new reports
	const isCreationLocked = isReportCreationLocked(project, all_documents);

	// Build year → status map for the YearSelector warning icons
	// NOTE: Must be called before early returns (React hooks rule)
	const yearStatuses = useMemo(() => {
		const map: Record<number, string> = {};
		for (const report of studentReports) {
			map[report.year] = report.document.status;
		}
		return map;
	}, [studentReports]);

	if (studentReports.length === 0) {
		return (
			<div className="rounded-lg border bg-card p-6">
				<p className="text-muted-foreground">No student reports available.</p>
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
		selectedYear,
		years,
		selectedReport.document.status
	);
	const canEdit = getEffectiveCanEdit(
		canEditBase,
		selectedReport.document,
		isLocked
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
				selectedYear={selectedYear}
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
								aria-label="New Student Report"
							>
								<Plus className="size-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							{isCreationLocked
								? "Report creation is locked"
								: "New Student Report"}
						</TooltipContent>
					</Tooltip>
				}
			/>

			<DocumentTabLayout
				document={selectedReport.document}
				project={project}
				members={members}
				documentType="student_report"
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
					{/* Progress Report */}
					<ProjectSection>
						<InlineSaveEditor
							contentType="student-report-progress-report"
							entityId={selectedReport.id}
							initialContent={selectedReport.progress_report || ""}
							canEdit={canEdit}
							lockedMessage={lockedMessage}
							wordLimit={300}
							showWordLimitInLabel={true}
							label="Progress Report"
							toolbar="report"
						/>
					</ProjectSection>
				</div>
			</DocumentTabLayout>

			{/* Create Student Report Modal */}
			<CreateStudentReportModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				projectId={project.id}
			/>
		</>
	);
}
