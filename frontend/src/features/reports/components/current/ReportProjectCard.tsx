import { useState } from "react";
import { CheckCircle } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from "@/shared/components/ui/dialog";
import { getImageUrl } from "@/shared/utils/image.utils";
import { sanitizeInput } from "@/shared/utils/sanitise.utils";
import { getDocumentTypeName } from "@/shared/utils/document.utils";
import { InlineSaveEditor } from "@/shared/components/editor/InlineSaveEditor";
import { useApproveReport } from "@/features/reports/hooks/useReports";
import type {
	IARProgressReport,
	IARStudentReport,
	IReportTeamMember,
} from "@/features/reports/types/report.types";

interface ReportProjectCardProps {
	report: IARProgressReport | IARStudentReport;
	reportType: "progress" | "student";
	index: number;
	canEdit: boolean;
	showApproveButton?: boolean;
}

/** Derive a project tag from kind, year, and number (e.g. SP-2024-001). */
function buildProjectTag(kind: string, year: number, num: number): string {
	const prefix =
		kind === "science"
			? "SP"
			: kind === "external"
				? "EXT"
				: kind === "student"
					? "STP"
					: "CF";
	return `${prefix}-${year}-${String(num).padStart(3, "0")}`;
}

/** Colour class for project status text. */
function statusColour(status: string): string {
	if (status === "completed" || status === "terminated")
		return "text-green-600 dark:text-green-400";
	if (status === "updating") return "text-red-600 dark:text-red-400";
	if (status === "suspended") return "text-orange-500 dark:text-orange-400";
	return "";
}

/** Sort team members (leaders first, then by position) and return display names. */
function getOrderedTeamNames(members?: IReportTeamMember[] | null): string {
	if (!members?.length) return "";
	return [...members]
		.sort((a, b) => {
			if (a.is_leader && !b.is_leader) return -1;
			if (!a.is_leader && b.is_leader) return 1;
			return a.position - b.position;
		})
		.map((m) =>
			`${m.user.display_first_name ?? ""} ${m.user.display_last_name ?? ""}`.trim()
		)
		.filter(Boolean)
		.join(", ");
}

/** Filter team members by role and return comma-separated display names. */
function getMembersByRole(members: IReportTeamMember[], role: string): string {
	return members
		.filter((m) => m.role === role)
		.map((m) =>
			`${m.user.display_first_name ?? ""} ${m.user.display_last_name ?? ""}`.trim()
		)
		.filter(Boolean)
		.join(", ");
}

/**
 * Shared card for displaying a progress or student report
 * within the annual report Pending / Approved tabs.
 *
 * Layout: rounded container with image + project info side-by-side
 * (stacked on mobile), an optional approve button on hover,
 * and labelled rich text sections below.
 */
export default function ReportProjectCard({
	report,
	reportType,
	index,
	canEdit,
	showApproveButton = false,
}: ReportProjectCardProps) {
	const [approveDialogOpen, setApproveDialogOpen] = useState(false);

	const project = report.document?.project;
	const shouldAlternatePicture = index % 2 !== 0;

	const imageUrl = getImageUrl(project?.image);
	const projectTitle = sanitizeInput(project?.title ?? "Untitled Project");
	const projectUrl = `/projects/${project?.id}/progress`;
	const tag = buildProjectTag(
		project?.kind ?? "science",
		project?.year ?? new Date().getFullYear(),
		project?.number ?? 0
	);
	const statusClass = statusColour(project?.status ?? "");
	const capitalisedStatus = project?.status
		? project.status.charAt(0).toUpperCase() + project.status.slice(1)
		: "Unknown";

	const teamMembers = report.team_members ?? [];

	const imageBlock = (
		<div className="w-full sm:w-[276px] sm:min-w-[276px] h-[200px] rounded-md overflow-hidden">
			{imageUrl ? (
				<img
					src={imageUrl}
					alt={projectTitle}
					className="w-full h-full object-cover"
				/>
			) : (
				<div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-muted-foreground text-sm">
					No image
				</div>
			)}
		</div>
	);

	/* Info block differs between progress and student reports */
	const infoBlock =
		reportType === "progress" ? (
			<ProgressInfoBlock
				projectTitle={projectTitle}
				projectUrl={projectUrl}
				statusClass={statusClass}
				capitalisedStatus={capitalisedStatus}
				tag={tag}
				scientists={getOrderedTeamNames(teamMembers)}
			/>
		) : (
			<StudentInfoBlock
				projectTitle={projectTitle}
				projectUrl={projectUrl}
				statusClass={statusClass}
				capitalisedStatus={capitalisedStatus}
				tag={tag}
				teamMembers={teamMembers}
			/>
		);

	return (
		<>
			<div
				className="group relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/60 overflow-hidden"
				style={{
					boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.06)",
				}}
			>
				{/* Approve button — top-right, visible on hover */}
				{showApproveButton && (
					<div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									type="button"
									className="size-10 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-lg cursor-pointer transition-colors"
									onClick={() => setApproveDialogOpen(true)}
									aria-label="Approve this report"
								>
									<CheckCircle className="size-5" />
								</button>
							</TooltipTrigger>
							<TooltipContent side="bottom">Approve this report</TooltipContent>
						</Tooltip>
					</div>
				)}

				{/* Top section: image + project info (stacked on mobile) */}
				<div className="flex flex-col sm:flex-row gap-4 pt-6 px-4 sm:px-8">
					{shouldAlternatePicture ? (
						<>
							{infoBlock}
							{imageBlock}
						</>
					) : (
						<>
							{imageBlock}
							{infoBlock}
						</>
					)}
				</div>

				{/* Rich text content sections */}
				<div className="px-4 pb-6 pt-2 space-y-4">
					{reportType === "progress" ? (
						<ProgressReportSections
							report={report as IARProgressReport}
							canEdit={canEdit}
						/>
					) : (
						<StudentReportSections
							report={report as IARStudentReport}
							canEdit={canEdit}
						/>
					)}
				</div>
			</div>

			{/* Approve confirmation dialogue */}
			<ApproveDialog
				open={approveDialogOpen}
				onOpenChange={setApproveDialogOpen}
				report={report}
				reportType={reportType}
			/>
		</>
	);
}

/* ------------------------------------------------------------------ */
/*  Info blocks                                                        */
/* ------------------------------------------------------------------ */

/** Project info for progress reports: status, tag, scientists. */
function ProgressInfoBlock({
	projectTitle,
	projectUrl,
	statusClass,
	capitalisedStatus,
	tag,
	scientists,
}: {
	projectTitle: string;
	projectUrl: string;
	statusClass: string;
	capitalisedStatus: string;
	tag: string;
	scientists: string;
}) {
	return (
		<div className="flex-1 min-w-0">
			<a
				href={projectUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="text-blue-600 dark:text-blue-400 font-bold text-[17px] hover:underline line-clamp-4"
			>
				{projectTitle}
			</a>

			<div className="mt-2 space-y-0.5 text-sm">
				<p>
					<span className={`font-semibold ${statusClass}`}>Status: </span>
					<span className={statusClass}>{capitalisedStatus}</span>
				</p>
				<p>
					<span className="font-semibold">Tag: </span>
					{tag}
				</p>
				{scientists && (
					<p>
						<span className="font-semibold">Scientists: </span>
						{scientists}
					</p>
				)}
			</div>
		</div>
	);
}

/** Project info for student reports: status, tag, student, academics, scientists. */
function StudentInfoBlock({
	projectTitle,
	projectUrl,
	statusClass,
	capitalisedStatus,
	tag,
	teamMembers,
}: {
	projectTitle: string;
	projectUrl: string;
	statusClass: string;
	capitalisedStatus: string;
	tag: string;
	teamMembers: IReportTeamMember[];
}) {
	const student = getMembersByRole(teamMembers, "student");
	const academics = getMembersByRole(teamMembers, "academicsuper");
	const scientists = getMembersByRole(teamMembers, "supervising");

	return (
		<div className="flex-1 min-w-0">
			<a
				href={projectUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="text-blue-600 dark:text-blue-400 font-bold text-[17px] hover:underline line-clamp-4"
			>
				{projectTitle}
			</a>

			<div className="mt-2 space-y-0.5 text-sm">
				<p>
					<span className={`font-semibold ${statusClass}`}>Status: </span>
					<span className={statusClass}>{capitalisedStatus}</span>
				</p>
				<p>
					<span className="font-semibold">Tag: </span>
					{tag}
				</p>
				{student && (
					<p>
						<span className="font-semibold">Student: </span>
						{student}
					</p>
				)}
				{academics && (
					<p>
						<span className="font-semibold">Academics: </span>
						{academics}
					</p>
				)}
				{scientists && (
					<p>
						<span className="font-semibold">Scientists: </span>
						{scientists}
					</p>
				)}
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Approve dialogue                                                   */
/* ------------------------------------------------------------------ */

function ApproveDialog({
	open,
	onOpenChange,
	report,
	reportType,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	report: IARProgressReport | IARStudentReport;
	reportType: "progress" | "student";
}) {
	const approveMutation = useApproveReport();
	const isActive = report.document?.project?.status === "active";
	const kind =
		reportType === "student"
			? ("studentreport" as const)
			: ("progressreport" as const);

	const handleApprove = () => {
		approveMutation.mutate(
			{
				kind,
				reportPk: report.id,
				documentPk: report.document.id,
				isActive,
			},
			{ onSuccess: () => onOpenChange(false) }
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{isActive ? "Return" : "Approve"} Report</DialogTitle>
					<DialogDescription>
						{isActive
							? "Set this report back to pending? This will set the project back to update requested."
							: "Provide final sign off for this report? If not already approved by project lead and business area lead, the report will be fast-tracked."}
					</DialogDescription>
				</DialogHeader>

				<div className="text-sm space-y-1 py-2">
					<p>
						<span className="font-semibold">Project: </span>
						{sanitizeInput(report.document?.project?.title ?? "")}
					</p>
					<p>
						<span className="font-semibold">Kind: </span>
						{getDocumentTypeName(kind)}
					</p>
					<p>
						<span className="font-semibold">Year: </span>
						{report.year}
					</p>
				</div>

				<DialogFooter>
					<DialogClose className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground cursor-pointer">
						Cancel
					</DialogClose>
					<button
						type="button"
						className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 cursor-pointer disabled:opacity-50"
						onClick={handleApprove}
						disabled={approveMutation.isPending}
					>
						{approveMutation.isPending
							? "Processing…"
							: isActive
								? "Set to Pending"
								: "Approve"}
					</button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

/* ------------------------------------------------------------------ */
/*  Rich text sections                                                 */
/* ------------------------------------------------------------------ */

/** Five rich text sections for a progress report. */
function ProgressReportSections({
	report,
	canEdit,
}: {
	report: IARProgressReport;
	canEdit: boolean;
}) {
	return (
		<>
			<InlineSaveEditor
				contentType="progress-report-context"
				entityId={report.id}
				initialContent={report.context ?? ""}
				canEdit={canEdit}
				label="Context"
				toolbar="simple"
				compact
			/>
			<InlineSaveEditor
				contentType="progress-report-aims"
				entityId={report.id}
				initialContent={report.aims ?? ""}
				canEdit={canEdit}
				label="Aims"
				toolbar="simple"
				compact
			/>
			<InlineSaveEditor
				contentType="progress-report-progress"
				entityId={report.id}
				initialContent={report.progress ?? ""}
				canEdit={canEdit}
				label="Progress"
				toolbar="simple"
				compact
			/>
			<InlineSaveEditor
				contentType="progress-report-implications"
				entityId={report.id}
				initialContent={report.implications ?? ""}
				canEdit={canEdit}
				label="Management Implications"
				toolbar="simple"
				compact
			/>
			<InlineSaveEditor
				contentType="progress-report-future"
				entityId={report.id}
				initialContent={report.future ?? ""}
				canEdit={canEdit}
				label="Future Directions"
				toolbar="simple"
				compact
			/>
		</>
	);
}

/** Single rich text section for a student report. */
function StudentReportSections({
	report,
	canEdit,
}: {
	report: IARStudentReport;
	canEdit: boolean;
}) {
	return (
		<InlineSaveEditor
			contentType="student-report-progress-report"
			entityId={report.id}
			initialContent={report.progress_report ?? ""}
			canEdit={canEdit}
			label="Progress Report"
			toolbar="simple"
			compact
		/>
	);
}
