import type { IAnnualReportPDF } from "../types/report.types";
import { getImageUrl } from "@/shared/utils/image.utils";

export interface ReportItem {
	id: number;
	year: number;
	fileUrl: string;
	pdfId: number;
	reportId: number;
	isPublished: boolean;
	isLegacy: boolean;
	divisionId: number | null;
	divisionSlug: string | null;
}

interface TransformedReports {
	official: ReportItem[];
	unpublished: ReportItem[];
	legacy: ReportItem[];
}

/**
 * Helper to map a raw report (from the backend) into a ReportItem.
 * Uses the specified file field for the card URL.
 */
function mapReport(
	report: Record<string, unknown>,
	fileField: "published_file" | "draft_file"
): ReportItem | null {
	const pdf = report.pdf as {
		id: number;
		published_file: string | null;
		draft_file: string | null;
	} | null;
	if (!pdf) return null;

	const file = pdf[fileField];
	if (!file) return null;

	const division = report.division as {
		id: number;
		name: string;
		slug?: string;
	} | null;

	return {
		id: pdf.id,
		year: (report.year as number) ?? 0,
		fileUrl: getImageUrl(file) ?? file,
		pdfId: pdf.id,
		reportId: (report.id as number) ?? 0,
		isPublished: fileField === "published_file",
		isLegacy: false,
		divisionId: division?.id ?? null,
		divisionSlug: division?.slug ?? null,
	};
}

/**
 * Transform pre-categorised report data into ReportItem arrays for each tab.
 *
 * The backend returns three separate arrays (published, drafts, legacy).
 * - Published tab shows reports using their published_file URL
 * - Drafts tab shows reports using their draft_file URL
 * - Legacy tab shows standalone uploaded PDFs from older years
 */
export function transformPublishedReports(
	publishedReports: unknown[],
	draftReports: unknown[],
	legacyReports: IAnnualReportPDF[]
): TransformedReports {
	const official = publishedReports
		.map((r) => mapReport(r as Record<string, unknown>, "published_file"))
		.filter((r): r is ReportItem => r !== null);

	const unpublished = draftReports
		.map((r) => mapReport(r as Record<string, unknown>, "draft_file"))
		.filter((r): r is ReportItem => r !== null);

	const legacy = legacyReports
		.filter((r) => !!r.file)
		.map((r) => ({
			id: r.id,
			year: r.year,
			fileUrl: getImageUrl(r.file) ?? r.file,
			pdfId: r.id,
			reportId: r.report,
			isPublished: false,
			isLegacy: true,
			divisionId: null,
			divisionSlug: null,
		}));

	return { official, unpublished, legacy };
}

/**
 * Filter report items by division.
 * Returns all items when divisionId is "all".
 */
export function filterReportsByDivision(
	items: ReportItem[],
	divisionId: number | "all"
): ReportItem[] {
	if (divisionId === "all") return items;
	return items.filter((r) => r.divisionId === divisionId);
}
