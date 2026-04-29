import { useRef } from "react";
import { Upload, Trash2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { toast } from "sonner";
import {
	useUpdateReportPDF,
	useDeleteReportPDFFile,
	useToggleReportPublished,
} from "@/features/reports/hooks/useReports";
import { getFinancialYearLabel } from "@/shared/utils/date.utils";

interface UpdateReportPDFModalProps {
	isOpen: boolean;
	onClose: () => void;
	pdfId: number;
	reportId: number;
	year: number;
	isPublished: boolean;
	isLegacy: boolean;
}

/** PDF magic bytes: %PDF (hex 25 50 44 46) */
const PDF_MAGIC = new Uint8Array([0x25, 0x50, 0x44, 0x46]);

/** Validate that a file is a genuine PDF by checking magic bytes */
async function validatePDF(file: File): Promise<boolean> {
	if (file.type !== "application/pdf") return false;
	const buffer = await file.slice(0, 4).arrayBuffer();
	const bytes = new Uint8Array(buffer);
	return bytes.every((b, i) => b === PDF_MAGIC[i]);
}

export function UpdateReportPDFModal({
	isOpen,
	onClose,
	pdfId,
	reportId,
	year,
	isPublished,
	isLegacy,
}: UpdateReportPDFModalProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const updateMutation = useUpdateReportPDF();
	const deleteMutation = useDeleteReportPDFFile();
	const toggleMutation = useToggleReportPublished();

	const handleTogglePublished = (checked: boolean) => {
		toggleMutation.mutate(
			{ reportId, isPublished: checked },
			{ onSuccess: () => onClose() }
		);
	};

	const handleReplacePDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		e.target.value = "";

		const isValid = await validatePDF(file);
		if (!isValid) {
			toast.error("Invalid file — only genuine PDF files are accepted");
			return;
		}

		updateMutation.mutate(
			{ pdfId, file, isLegacy },
			{ onSuccess: () => onClose() }
		);
	};

	const handleRemovePDF = () => {
		if (!window.confirm("Remove the current PDF? This cannot be undone."))
			return;
		deleteMutation.mutate({ pdfId, isLegacy }, { onSuccess: () => onClose() });
	};

	const isBusy =
		updateMutation.isPending ||
		deleteMutation.isPending ||
		toggleMutation.isPending;

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Manage PDF — {getFinancialYearLabel(year)}</DialogTitle>
					<DialogDescription>
						Update the PDF file or change the published status.
					</DialogDescription>
				</DialogHeader>

				<div className="mt-2 space-y-5">
					{/* Published toggle — non-legacy only */}
					{!isLegacy && (
						<div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
							<div>
								<Label className="text-sm font-medium">Published Status</Label>
								<p className="text-xs text-muted-foreground mt-0.5">
									{isPublished
										? "This report appears in the Official tab"
										: "This report appears in the Unpublished tab"}
								</p>
							</div>
							<Switch
								checked={isPublished}
								disabled={isBusy}
								onCheckedChange={handleTogglePublished}
							/>
						</div>
					)}

					{/* Action buttons */}
					<div className="flex flex-col gap-2">
						{/* Hidden file input */}
						<input
							ref={fileInputRef}
							type="file"
							accept=".pdf,application/pdf"
							className="hidden"
							onChange={handleReplacePDF}
						/>

						<Button
							variant="outline"
							className="w-full justify-start gap-2"
							disabled={isBusy}
							onClick={() => fileInputRef.current?.click()}
						>
							<Upload className="size-4" />
							{updateMutation.isPending ? "Uploading…" : "Replace PDF File"}
						</Button>

						<Button
							variant="outline"
							className="w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
							disabled={isBusy}
							onClick={handleRemovePDF}
						>
							<Trash2 className="size-4" />
							{deleteMutation.isPending ? "Removing…" : "Remove Current PDF"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
