import type {
	IProblematicProjectsResponse,
	IProblematicProjectRow,
	IUnapprovedDoc,
	ProblemKind,
} from "../types/business-area.types";
import { getDocumentStatusLabel } from "@/shared/utils/document.utils";
import { extractTextFromHTML } from "@/shared/utils/html-display.utils";

/** Approval stage derived from the three boolean flags */
export type ApprovalStage = 1 | 2 | 3;

/** Per-table sort configuration */
export interface SortConfig {
	column: "title" | "kind" | "status" | "fy" | "waitingOn" | null;
	direction: "asc" | "desc" | null;
}

/** Canonical sort order for document kinds */
export const DOC_KIND_ORDER: Record<string, number> = {
	concept: 0,
	projectplan: 1,
	progressreport: 2,
	studentreport: 3,
	projectclosure: 4,
};

/** Canonical sort order for document statuses */
export const STATUS_ORDER: Record<string, number> = {
	final_update: 0,
	updating: 1,
	active: 2,
	pending: 3,
	new: 4,
	closure_requested: 5,
	suspended: 6,
	completed: 7,
	terminated: 8,
};

/**
 * Flatten the categorised problematic projects response into a single array,
 * tagging each project with its problem kind.
 */
export function flattenProblematicProjects(
	response: IProblematicProjectsResponse
): IProblematicProjectRow[] {
	const tagged = (
		projects: IProblematicProjectsResponse[keyof IProblematicProjectsResponse],
		kind: ProblemKind
	): IProblematicProjectRow[] =>
		projects.map((p) => ({ ...p, problemKind: kind }));

	return [
		...tagged(response.no_members, "memberless"),
		...tagged(response.no_leader, "leaderless"),
		...tagged(response.external_leader, "externally_led"),
		...tagged(response.multiple_leads, "multiple_leaders"),
	];
}

/** Human-readable label for each problem kind */
export function getProblemLabel(kind: ProblemKind): string {
	const labels: Record<ProblemKind, string> = {
		memberless: "No Members",
		leaderless: "No Leader Tag",
		externally_led: "Externally Led",
		multiple_leaders: "Multiple Leader Tags",
	};
	return labels[kind];
}

/** Severity colour for each problem kind */
export function getProblemColour(kind: ProblemKind): string {
	const colours: Record<ProblemKind, string> = {
		memberless: "red",
		leaderless: "orange",
		externally_led: "red",
		multiple_leaders: "yellow",
	};
	return colours[kind];
}

/** Display label for document or project statuses */
export function getDocStatusLabel(status: string): string {
	// Try document status labels first (covers revising, inreview, inapproval, etc.)
	const docLabel = getDocumentStatusLabel(status);
	if (docLabel !== status) return docLabel;

	// Fall back to project-specific statuses
	const projectLabels: Record<string, string> = {
		pending: "Pending Project Plan",
		closure_requested: "Closure Requested",
		updating: "Update Requested",
		completed: "Completed",
		new: "New",
		active: "Active (Approved)",
		final_update: "Final Update Requested",
		terminated: "Terminated and Closed",
		suspended: "Suspended",
	};
	return projectLabels[status] ?? status;
}

/** Classify a document into its approval stage */
export function getApprovalStage(doc: IUnapprovedDoc): ApprovalStage {
	if (!doc.project_lead_approval_granted) return 1;
	if (!doc.business_area_lead_approval_granted) return 2;
	return 3;
}

/** Whether a document kind has a financial year */
export function isReportKind(kind: string): boolean {
	return kind === "progressreport" || kind === "studentreport";
}

/** Sort unapproved documents by a given column and direction */
export function sortUnapprovedDocs(
	docs: IUnapprovedDoc[],
	config: SortConfig
): IUnapprovedDoc[] {
	if (!config.column || !config.direction) return docs;

	const sorted = [...docs].sort((a, b) => {
		let cmp = 0;
		switch (config.column) {
			case "title":
				cmp = extractTextFromHTML(a.project.title).localeCompare(
					extractTextFromHTML(b.project.title)
				);
				break;
			case "kind":
				cmp = (DOC_KIND_ORDER[a.kind] ?? 99) - (DOC_KIND_ORDER[b.kind] ?? 99);
				break;
			case "status":
				cmp = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
				break;
			case "fy": {
				const aYear = isReportKind(a.kind)
					? (a.report_year ?? Infinity)
					: Infinity;
				const bYear = isReportKind(b.kind)
					? (b.report_year ?? Infinity)
					: Infinity;
				if (aYear === Infinity && bYear === Infinity) return 0;
				if (aYear === Infinity) return 1;
				if (bYear === Infinity) return -1;
				cmp = aYear - bYear;
				break;
			}
			case "waitingOn": {
				const aName = a.waiting_on
					? `${a.waiting_on.display_first_name} ${a.waiting_on.display_last_name}`
					: "zzz";
				const bName = b.waiting_on
					? `${b.waiting_on.display_first_name} ${b.waiting_on.display_last_name}`
					: "zzz";
				cmp = aName.localeCompare(bName);
				break;
			}
		}
		return config.direction === "desc" ? -cmp : cmp;
	});

	return sorted;
}
