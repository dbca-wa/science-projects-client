import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
	XCircle,
	Loader2,
	ExternalLink,
	FileCheck,
	FileStack,
	Upload,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { getImageUrl } from "@/shared/utils/image.utils";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	useReportPDF,
	useGenerateReportPDF,
	useCancelReportPDFGen,
	usePublishReportPDF,
} from "@/features/reports/hooks/useReports";
import { useSSE } from "@/features/reports/hooks/useSSE";
import { getSSEUrl } from "@/features/reports/services/report.service";
import type {
	IAnnualReport,
	IProgressEvent,
} from "@/features/reports/types/report.types";
import { PublishConfirmModal } from "../modals/PublishConfirmModal";
import { useAuthStore } from "@/app/stores/store-context";

/**
 * Print Preview tab — PDF generation with SSE progress,
 * preview via iframe, and download for the current annual report.
 */
const PrintPreviewTab = ({ report }: { report: IAnnualReport }) => {
	const queryClient = useQueryClient();
	const authStore = useAuthStore();
	const { data: pdfData, isLoading, refetch } = useReportPDF(report.id);
	const generatePDF = useGenerateReportPDF();
	const cancelGen = useCancelReportPDFGen();
	const publishPDF = usePublishReportPDF();

	const [publishModalOpen, setPublishModalOpen] = useState(false);

	const isGenerating = pdfData?.report?.pdf_generation_in_progress ?? false;
	const canPublish =
		!!pdfData?.has_draft &&
		(authStore.isSuperuser || !!authStore.user?.is_key_stakeholder);

	// SSE progress state
	const [progressData, setProgressData] = useState<IProgressEvent | null>(null);
	const [generationKind, setGenerationKind] = useState<"all" | "approved">(
		"approved"
	);
	const [iframeError, setIframeError] = useState(false);

	// SSE callbacks
	const handleSSEMessage = useCallback((event: IProgressEvent) => {
		setProgressData(event);
	}, []);

	const handleSSEComplete = useCallback(() => {
		setProgressData(null);
		void queryClient.invalidateQueries({
			queryKey: ["reports", "pdf", report.id],
		});
	}, [queryClient, report.id]);

	const handleSSEError = useCallback(() => {
		toast.error("Lost connection to generation progress stream");
	}, []);

	// Connect SSE when generating
	const { isConnected: isSSEConnected } = useSSE({
		url: getSSEUrl(report.id),
		enabled: isGenerating,
		onMessage: handleSSEMessage,
		onComplete: handleSSEComplete,
		onError: handleSSEError,
	});

	// Fallback: poll PDF status every 5s if SSE is not connected during generation
	useEffect(() => {
		if (!isGenerating || isSSEConnected) return;
		const interval = setInterval(() => void refetch(), 5_000);
		return () => clearInterval(interval);
	}, [isGenerating, isSSEConnected, refetch]);

	// Clear progress when generation stops (derived, no effect needed)
	const activeProgress = isGenerating ? progressData : null;

	// Generation elapsed timer — uses started_at from SSE for accuracy across refreshes
	const [elapsed, setElapsed] = useState(0);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const startedAtRef = useRef<number | null>(null);

	// Track started_at in a ref to avoid effect re-triggers
	useEffect(() => {
		if (activeProgress?.started_at) {
			startedAtRef.current = activeProgress.started_at;
		}
		if (!isGenerating) {
			startedAtRef.current = null;
		}
	}, [activeProgress?.started_at, isGenerating]);

	useEffect(() => {
		if (!isGenerating) {
			if (timerRef.current) clearInterval(timerRef.current);
			timerRef.current = null;
			return;
		}

		timerRef.current = setInterval(() => {
			const sa = startedAtRef.current;
			if (sa) {
				setElapsed(Math.floor(Date.now() / 1000 - sa));
			} else {
				setElapsed((s) => s + 1);
			}
		}, 1_000);

		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [isGenerating]);

	// Reset elapsed when not generating (derived)
	const displayElapsed = isGenerating ? elapsed : 0;

	const handleGenerate = useCallback(
		(genkind: "all" | "approved") => {
			setGenerationKind(genkind);
			setIframeError(false);
			setProgressData(null);
			setElapsed(0);
			startedAtRef.current = null;
			generatePDF.mutate({ pk: report.id, genkind });
		},
		[generatePDF, report.id]
	);

	const handleCancel = useCallback(() => {
		cancelGen.mutate(report.id);
		setProgressData(null);
		setElapsed(0);
		startedAtRef.current = null;
	}, [cancelGen, report.id]);

	const handleIframeError = useCallback(() => {
		setIframeError(true);
	}, []);

	const handlePublish = useCallback(() => {
		publishPDF.mutate(report.id, {
			onSuccess: () => setPublishModalOpen(false),
		});
	}, [publishPDF, report.id]);

	// Use the direct server file URL for iframe (show draft for preview)
	const fileUrl = pdfData?.draft_file ? getImageUrl(pdfData.draft_file) : null;
	const hasPDF = !!fileUrl && !!pdfData?.has_draft;

	// Derive display values from SSE progress or defaults
	const percentage = activeProgress?.percentage ?? 0;
	const phaseLabel = activeProgress?.phase_label ?? "Starting generation…";
	const displayKind = useMemo(() => {
		const kind = activeProgress?.generation_kind ?? generationKind;
		return kind === "approved"
			? "Approved Only"
			: "Approved & Unapproved Reports";
	}, [activeProgress?.generation_kind, generationKind]);

	const isPending = generatePDF.isPending || cancelGen.isPending;

	return (
		<div className="space-y-4 py-4">
			{/* Action bar */}
			<div className="flex flex-wrap items-center gap-2 sm:justify-end">
				{isGenerating ? (
					<Button
						size="sm"
						variant="outline"
						className="cursor-pointer border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
						disabled={cancelGen.isPending}
						onClick={handleCancel}
					>
						<XCircle className="mr-1.5 h-4 w-4" />
						Cancel Generation
					</Button>
				) : (
					<>
						<Button
							size="sm"
							className="gen-btn cursor-pointer gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md hover:text-[#62a0f2] dark:hover:text-[#62a0f2]"
							disabled={isPending}
							onClick={() => handleGenerate("approved")}
						>
							<FileCheck className="h-4 w-4" />
							Generate Approved
						</Button>
						<Button
							size="sm"
							className="gen-btn cursor-pointer gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md hover:text-[#62a0f2] dark:hover:text-[#62a0f2]"
							disabled={isPending}
							onClick={() => handleGenerate("all")}
						>
							<FileStack className="h-4 w-4" />
							Generate All
						</Button>
						{canPublish && (
							<Button
								size="sm"
								variant="outline"
								className="cursor-pointer gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950"
								disabled={isPending || publishPDF.isPending}
								onClick={() => setPublishModalOpen(true)}
							>
								<Upload className="h-4 w-4" />
								Publish
							</Button>
						)}
						{hasPDF && fileUrl && (
							<Button
								size="icon"
								variant="outline"
								className="h-9 w-9 cursor-pointer shrink-0 rounded-lg transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-md"
								title="Open PDF in new tab"
								onClick={() => window.open(fileUrl, "_blank")}
							>
								<ExternalLink className="h-4 w-4" />
							</Button>
						)}
					</>
				)}
			</div>

			{/* Content area */}
			<div className="overflow-hidden rounded-lg border bg-card">
				{isLoading ? (
					<div className="flex items-center justify-center py-24">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				) : isGenerating ? (
					<div className="flex flex-col items-center justify-center gap-4 px-6 py-24 sm:px-8">
						{/* Generation kind badge */}
						<span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-500/30">
							{displayKind}
						</span>

						{/* Phase label */}
						<p className="text-sm font-medium text-foreground">{phaseLabel}</p>

						{/* Progress bar */}
						<div className="w-full max-w-md">
							<div className="relative h-3.5 w-full overflow-hidden rounded-full bg-gray-100 shadow-inner dark:bg-gray-800">
								<div
									className="progress-bar-fill h-full"
									style={{ width: `${Math.max(percentage, 2)}%` }}
								/>
							</div>
							<p className="mt-1.5 text-center text-xs font-medium text-muted-foreground">
								{percentage}%
							</p>
						</div>

						{/* Elapsed time */}
						<p className="text-sm tabular-nums text-muted-foreground">
							{displayElapsed}s elapsed
							{displayElapsed > 30 && (
								<span className="ml-2 text-amber-600">
									— taking longer than usual
								</span>
							)}
						</p>
					</div>
				) : hasPDF && !iframeError ? (
					<iframe
						src={fileUrl!}
						title={`${report.year} Annual Report PDF`}
						className="h-[70vh] w-full sm:h-[80vh] lg:h-[85vh]"
						onError={handleIframeError}
					/>
				) : hasPDF && iframeError ? (
					<div className="flex flex-col items-center justify-center gap-3 py-24">
						<p className="text-sm text-muted-foreground">
							Unable to display the PDF in the browser.
						</p>
						<a
							href={fileUrl!}
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm font-medium text-blue-600 underline hover:text-blue-700"
						>
							Open PDF in new tab
						</a>
					</div>
				) : (
					<div className="py-24 text-center">
						<p className="text-muted-foreground">
							No PDF available. Click one of the generate buttons above to
							create one.
						</p>
					</div>
				)}
			</div>

			<PublishConfirmModal
				isOpen={publishModalOpen}
				onClose={() => setPublishModalOpen(false)}
				onConfirm={handlePublish}
				isPending={publishPDF.isPending}
			/>
		</div>
	);
};

export default PrintPreviewTab;
