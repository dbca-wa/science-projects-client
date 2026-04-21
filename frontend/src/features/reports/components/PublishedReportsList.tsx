/* eslint-disable react-refresh/only-export-components */
import { useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";
import {
	usePublishedReports,
	useLegacyReports,
} from "@/features/reports/hooks/useReports";
import { Loader2, AlertCircle, Pencil, Scroll, BadgeCheck } from "lucide-react";
import { AddOfficialPDFModal } from "./modals/AddOfficialPDFModal";
import { AddLegacyPDFModal } from "./modals/AddLegacyPDFModal";
import { UpdateReportPDFModal } from "./modals/UpdateReportPDFModal";
import { FaFilePdf } from "react-icons/fa";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from "@/shared/components/ui/tabs";
import type { IAnnualReportPDF } from "@/features/reports/types/report.types";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { getImageUrl } from "@/shared/utils/image.utils";
import { useAuthStore } from "@/app/stores/store-context";
import { useDivisions } from "@/features/admin/hooks/useDivisions";

/** Format a year into "FY {prevYear}-{reportYear}" (e.g. 2025 → "FY 24-25") */
function formatFY(year: number): string {
	const prev = String(year - 1)
		.slice(-2)
		.padStart(2, "0");
	const current = String(year).slice(-2).padStart(2, "0");
	return `FY ${prev}-${current}`;
}

interface ReportCardProps {
	fileUrl: string;
	year: number;
	isSuperuser: boolean;
	pdfId: number;
	reportId: number;
	isPublished: boolean;
	isLegacy: boolean;
	divisionSlug: string | null;
	onUpdate: (data: UpdateModalData) => void;
}

/** Single report card — the entire card is a clickable link that opens the PDF */
function ReportCard({
	fileUrl,
	year,
	isSuperuser,
	pdfId,
	reportId,
	isPublished,
	isLegacy,
	divisionSlug,
	onUpdate,
}: ReportCardProps) {
	return (
		<div className="group flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
			{/* Clickable area — opens PDF in new tab */}
			<a
				href={fileUrl}
				target="_blank"
				rel="noopener noreferrer"
				draggable={false}
				className="flex flex-1 cursor-pointer flex-col items-center px-3 pt-6 pb-4"
			>
				<FaFilePdf
					size={56}
					className="text-red-600 select-none dark:text-red-500"
					aria-hidden="true"
				/>
				<span className="mt-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
					{divisionSlug ? `${divisionSlug} ` : ""}
					{formatFY(year)}
				</span>
				<span className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
					Annual Report
				</span>
			</a>

			{/* Superuser update — entire bottom section is clickable */}
			{isSuperuser && (
				<button
					type="button"
					className="cursor-pointer border-t border-gray-200 px-3 py-2.5 text-center text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
					onClick={() =>
						onUpdate({ pdfId, reportId, year, isPublished, isLegacy })
					}
				>
					<Pencil className="mr-1 inline-block size-3" />
					Update
				</button>
			)}

			{/* Bottom padding when no button */}
			{!isSuperuser && <div className="pb-2" />}
		</div>
	);
}

interface UpdateModalData {
	pdfId: number;
	reportId: number;
	year: number;
	isPublished: boolean;
	isLegacy: boolean;
}

interface ReportItem {
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

/** Grid of report cards */
function ReportGrid({
	reports,
	isSuperuser,
	onUpdate,
}: {
	reports: ReportItem[];
	isSuperuser: boolean;
	onUpdate: (data: UpdateModalData) => void;
}) {
	const sorted = [...reports].sort((a, b) => b.year - a.year);

	if (sorted.length === 0) {
		return (
			<p className="py-12 text-center text-gray-500 dark:text-gray-400">
				No reports in this category.
			</p>
		);
	}

	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
			{sorted.map((report) => (
				<ReportCard
					key={report.id}
					fileUrl={report.fileUrl}
					year={report.year}
					isSuperuser={isSuperuser}
					pdfId={report.pdfId}
					reportId={report.reportId}
					isPublished={report.isPublished}
					isLegacy={report.isLegacy}
					divisionSlug={report.divisionSlug}
					onUpdate={onUpdate}
				/>
			))}
		</div>
	);
}

/**
 * Fetches and displays annual report PDFs in a tabbed layout
 * with Annual Reports, Legacy PDFs, and Unpublished tabs.
 */
export const PublishedReportsList = observer(function PublishedReportsList({
	selectedTab = "official",
}: {
	selectedTab?: "official" | "drafts" | "legacy";
}) {
	const navigate = useNavigate();
	const authStore = useAuthStore();
	const isSuperuser = authStore.isSuperuser;

	const [addOfficialOpen, setAddOfficialOpen] = useState(false);
	const [addLegacyOpen, setAddLegacyOpen] = useState(false);
	const [selectedDivision, setSelectedDivision] = useState<number | "all">(
		"all"
	);
	const [updateModalData, setUpdateModalData] =
		useState<UpdateModalData | null>(null);

	const { data: divisions } = useDivisions();

	const {
		data: publishedReports,
		isLoading: publishedLoading,
		error: publishedError,
	} = usePublishedReports();
	const {
		data: legacyReports,
		isLoading: legacyLoading,
		error: legacyError,
	} = useLegacyReports();

	const isLoading = publishedLoading || legacyLoading;
	const error = publishedError || legacyError;

	if (isLoading) {
		return (
			<div className="flex min-h-[300px] items-center justify-center">
				<Loader2 className="size-10 animate-spin text-blue-600" />
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="size-4" />
				<AlertDescription>
					Failed to load reports: {error.message || "Unknown error"}
				</AlertDescription>
			</Alert>
		);
	}

	const published = publishedReports ?? [];
	const legacy = legacyReports ?? [];

	/*
	 * Transform published reports: the backend returns AnnualReport objects
	 * with a nested `pdf` field. Extract all reports that have a PDF file.
	 */
	const allWithPDFs = published
		.filter((r) => {
			const report = r as unknown as Record<string, unknown>;
			const pdf = report.pdf as Record<string, unknown> | null | undefined;
			if (!pdf || typeof pdf !== "object") return false;
			return (
				("published_file" in pdf && !!pdf.published_file) ||
				("draft_file" in pdf && !!pdf.draft_file)
			);
		})
		.map((r) => {
			const report = r as unknown as Record<string, unknown>;
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

	/* Legacy reports have `file` directly on the object */
	const legacyWithFiles = legacy
		.filter((r: IAnnualReportPDF) => !!r.file)
		.map((r: IAnnualReportPDF) => ({
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

	/* Apply division filter across all tabs */
	const filterByDivision = (items: ReportItem[]) =>
		selectedDivision === "all"
			? items
			: items.filter((r) => r.divisionId === selectedDivision);

	const filteredOfficial = filterByDivision(official);
	const filteredUnpublished = filterByDivision(unpublished);
	const filteredLegacy = filterByDivision(legacyWithFiles);

	const handleUpdate = (data: UpdateModalData) => setUpdateModalData(data);

	return (
		<>
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
					Published Reports
				</h1>
				<div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
					<Select
						value={
							selectedDivision === "all" ? "all" : selectedDivision.toString()
						}
						onValueChange={(v) =>
							setSelectedDivision(v === "all" ? "all" : Number(v))
						}
					>
						<SelectTrigger
							className="w-full sm:w-48"
							aria-label="Filter by division"
						>
							<SelectValue placeholder="All Divisions" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Divisions</SelectItem>
							{divisions?.map((d) => (
								<SelectItem key={d.id} value={d.id.toString()}>
									{d.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{isSuperuser && selectedTab === "official" && (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="default"
									className="bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-700 dark:hover:bg-emerald-600"
									onClick={() => setAddOfficialOpen(true)}
								>
									<BadgeCheck className="mr-1.5 size-4" />
									Add Official
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								Upload a finalised annual report PDF and mark it as published
							</TooltipContent>
						</Tooltip>
					)}
					{isSuperuser && selectedTab === "legacy" && (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="default"
									className="bg-amber-500 text-white hover:bg-amber-400 dark:bg-amber-600 dark:hover:bg-amber-500"
									onClick={() => setAddLegacyOpen(true)}
								>
									<Scroll className="mr-1.5 size-4" />
									Add Legacy
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								Upload a legacy annual report PDF from before the system was in
								use
							</TooltipContent>
						</Tooltip>
					)}
				</div>
			</div>

			<Tabs
				value={selectedTab}
				onValueChange={(value) => {
					const routes: Record<string, string> = {
						official: "/reports",
						drafts: "/reports/drafts",
						legacy: "/reports/legacy",
					};
					void navigate(routes[value] ?? "/reports");
				}}
			>
				<TabsList className="w-full justify-start">
					<TabsTrigger value="official">Official</TabsTrigger>
					<TabsTrigger value="drafts">Drafts</TabsTrigger>
					<TabsTrigger value="legacy">Legacy</TabsTrigger>
				</TabsList>

				<TabsContent value="official">
					<ReportGrid
						reports={filteredOfficial}
						isSuperuser={isSuperuser}
						onUpdate={handleUpdate}
					/>
				</TabsContent>

				<TabsContent value="drafts">
					<ReportGrid
						reports={filteredUnpublished}
						isSuperuser={isSuperuser}
						onUpdate={handleUpdate}
					/>
				</TabsContent>

				<TabsContent value="legacy">
					<ReportGrid
						reports={filteredLegacy}
						isSuperuser={isSuperuser}
						onUpdate={handleUpdate}
					/>
				</TabsContent>

				{/* Upload modals */}
				<AddOfficialPDFModal
					isOpen={addOfficialOpen}
					onClose={() => setAddOfficialOpen(false)}
					defaultDivisionId={selectedDivision}
				/>
				<AddLegacyPDFModal
					isOpen={addLegacyOpen}
					onClose={() => setAddLegacyOpen(false)}
					existingYears={legacyWithFiles.map((r) => r.year)}
				/>

				{/* Update modal */}
				{updateModalData && (
					<UpdateReportPDFModal
						isOpen
						onClose={() => setUpdateModalData(null)}
						pdfId={updateModalData.pdfId}
						reportId={updateModalData.reportId}
						year={updateModalData.year}
						isPublished={updateModalData.isPublished}
						isLegacy={updateModalData.isLegacy}
					/>
				)}
			</Tabs>
		</>
	);
});
