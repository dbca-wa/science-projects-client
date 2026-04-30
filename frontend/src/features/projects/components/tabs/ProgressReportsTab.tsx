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
import { DocumentTabLayout } from "@/shared/components/documents";
import { InlineSaveEditor } from "@/shared/components/editor";
import { ProjectSection } from "@/shared/components/ProjectSection";
import { YearSelector } from "@/shared/components/YearSelector";
import { Loader2 } from "lucide-react";
import { CommentSection } from "@/features/projects/components/comments";

interface ProgressReportsTabProps {
	progressReports: IProgressReport[];
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

export function ProgressReportsTab({
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
}: ProgressReportsTabProps) {
	// Get available years from progress reports
	const years = Array.from(
		new Set(progressReports.map((report) => report.year))
	).sort((a, b) => b - a); // Sort descending (newest first)

	// Default to highest year
	const [selectedYear, setSelectedYear] = useState<number>(() => {
		return years.length > 0 ? Math.max(...years) : new Date().getFullYear();
	});

	// Find the selected progress report using useMemo to avoid effect
	const selectedReport = useMemo(() => {
		return (
			progressReports.find((report) => report.year === selectedYear) || null
		);
	}, [selectedYear, progressReports]);

	const { data: currentUser } = useCurrentUser();

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

	const canEdit = selectedReport
		? calculateDocumentEditPermission({
				currentUser,
				members,
				document: selectedReport.document,
				isBaLead,
				userIsCaretakerOfBaLeader,
				userIsCaretakerOfAdmin,
			})
		: false;

	return (
		<>
			{/* Year Selector */}
			<YearSelector
				years={years}
				selectedYear={selectedYear}
				onYearChange={setSelectedYear}
			/>

			<DocumentTabLayout
				document={selectedReport.document}
				project={project}
				members={members}
				documentType="progress_report"
				typeSpecificId={selectedReport.id}
				canDelete={true}
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
					{/* Context */}
					<ProjectSection>
						<InlineSaveEditor
							contentType="progress-report-context"
							entityId={selectedReport.id}
							initialContent={selectedReport.context || ""}
							canEdit={canEdit}
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
							wordLimit={150}
							limitCanBePassed={true}
							showWordLimitInLabel={true}
							label="Progress"
							toolbar="progressReport"
						/>
					</ProjectSection>

					{/* Management Implications */}
					<ProjectSection>
						<InlineSaveEditor
							contentType="progress-report-implications"
							entityId={selectedReport.id}
							initialContent={selectedReport.implications || ""}
							canEdit={canEdit}
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
							wordLimit={150}
							limitCanBePassed={true}
							showWordLimitInLabel={true}
							label="Future Directions"
						/>
					</ProjectSection>
				</div>
			</DocumentTabLayout>
		</>
	);
}
