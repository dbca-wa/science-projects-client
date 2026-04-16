import { useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
	useReportsWithoutPDF,
	useAddReportPDF,
} from "@/features/reports/hooks/useReports";

interface AddOfficialPDFModalProps {
	isOpen: boolean;
	onClose: () => void;
}

/** Modal for uploading a finalised PDF to an existing annual report */
export function AddOfficialPDFModal({
	isOpen,
	onClose,
}: AddOfficialPDFModalProps) {
	const [selectedReportId, setSelectedReportId] = useState<string>("");
	const [file, setFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const { data: reportsWithoutPDF, isLoading: reportsLoading } =
		useReportsWithoutPDF();
	const addPDFMutation = useAddReportPDF();

	const handleSubmit = () => {
		if (!selectedReportId || !file) return;
		addPDFMutation.mutate(
			{ reportId: Number(selectedReportId), file },
			{
				onSuccess: () => {
					resetAndClose();
				},
			}
		);
	};

	const resetAndClose = () => {
		setSelectedReportId("");
		setFile(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
		onClose();
	};

	const canSubmit = !!selectedReportId && !!file && !addPDFMutation.isPending;

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Official PDF</DialogTitle>
					<DialogDescription>
						Upload a finalised PDF for an annual report. This will mark it as an
						official published report.
					</DialogDescription>
				</DialogHeader>

				<div className="mt-4 space-y-4">
					{/* Report year selector */}
					<div className="space-y-2">
						<Label htmlFor="report-select">Report Year</Label>
						{reportsLoading ? (
							<div className="flex items-center gap-2 text-sm text-gray-500">
								<Loader2 className="size-4 animate-spin" />
								Loading reports…
							</div>
						) : (
							<Select
								value={selectedReportId}
								onValueChange={setSelectedReportId}
							>
								<SelectTrigger id="report-select" className="w-full">
									<SelectValue placeholder="Select a report year" />
								</SelectTrigger>
								<SelectContent>
									{reportsWithoutPDF?.map((report) => (
										<SelectItem key={report.id} value={String(report.id)}>
											{report.year}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>

					{/* PDF file input */}
					<div className="space-y-2">
						<Label htmlFor="official-pdf-file">PDF File</Label>
						<input
							ref={fileInputRef}
							id="official-pdf-file"
							type="file"
							accept=".pdf"
							className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 dark:text-gray-300 dark:file:bg-gray-700 dark:file:text-gray-200"
							onChange={(e) => setFile(e.target.files?.[0] ?? null)}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={resetAndClose}>
						Cancel
					</Button>
					<Button
						disabled={!canSubmit}
						isLoading={addPDFMutation.isPending}
						onClick={handleSubmit}
					>
						Add
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
