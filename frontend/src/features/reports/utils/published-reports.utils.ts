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
 * Transform raw published and legacy report data into categorised report items.
 *
 * Published reports come from the backend as AnnualReport objects with a nested
 * `pdf` field. Legacy reports have `file` directly on the object.
 */
export function transformPublishedReports(
	publishedReports: unknown[],
	legacyReports: IAnnualReportPDF[]
): TransformedReports {
	const allWithPDFs = publishedReports
		.filter((r) => {
			const report = r as Record<string, unknown>;
			const pdf = report.pdf as Record<string, unknown> | null | undefined;
			if (!pdf || typeof pdf !== "object") return false;
			return (
				("published_file" in pdf && !!pdf.published_file) ||
				("draft_file" in pdf && !!pdf.draft_file)
			);
		})
		.map((r) => {
			const report = r as Record<string, unknown>;
			const pdf = report.pdf as {
				id: number;
				published_file: string | null;
				draft_file: string | null;
			};
			const division = report.division as {
				id: number;
				name: string;
				slug?: string;
			} | null;
			const fileForCard = pdf.published_file || pdf.draft_file || "";
			const fileUrl = getImageUrl(fileForCard) ?? fileForCard;
			return {
				id: pdf.id,
				year: (report.year as number) ?? 0,
				fileUrl,
				isPublished: report.is_published === true,
				pdfId: pdf.id,
				reportId: (report.id as number) ?? 0,
				isLegacy: false,
				divisionId: division?.id ?? null,
				divisionSlug: division?.slug ?? null,
				hasPublishedFile: !!pdf.published_file,
				hasDraftFile: !!pdf.draft_file,
			};
		});

	const official = allWithPDFs.filter((r) => r.hasPublishedFile);
	const unpublished = allWithPDFs.filter(
		(r) => r.hasDraftFile && !r.hasPublishedFile
	);

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
