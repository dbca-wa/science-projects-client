import { useState, useMemo } from "react";
import type { IStudentReport } from "@/shared/types/document.types";
import type {
	IProjectData,
	IProjectMember,
	IProjectDocuments,
} from "@/shared/types/project.types";
import type { IUserData } from "@/shared/types/user.types";
import { DocumentTabLayout } from "@/shared/components/documents";
import { InlineSaveEditor } from "@/shared/components/editor";
import { ProjectSection } from "@/shared/components/ProjectSection";
import { YearSelector } from "@/shared/components/YearSelector";
import { Loader2 } from "lucide-react";
import { CommentSection } from "@/features/projects/components/comments";

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

	// TODO: Calculate edit permissions using canEditProject utility
	const canEdit = true; // Temporarily true to see the button

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
				documentType="student_report"
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
					{/* Progress Report */}
					<ProjectSection>
						<InlineSaveEditor
							contentType="student-report-progress-report"
							entityId={selectedReport.id}
							initialContent={selectedReport.progress_report || ""}
							canEdit={canEdit}
							wordLimit={300}
							showWordLimitInLabel={true}
							label="Progress Report"
							toolbar="progressReport"
						/>
					</ProjectSection>
				</div>
			</DocumentTabLayout>
		</>
	);
}
