import { useState, useRef, useMemo } from "react";
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
import { useAddLegacyPDF } from "@/features/reports/hooks/useReports";

interface AddLegacyPDFModalProps {
	isOpen: boolean;
	onClose: () => void;
	existingYears: number[];
}

/** Years available for legacy PDF uploads (2005–2013) */
const LEGACY_YEAR_RANGE = Array.from({ length: 9 }, (_, i) => 2005 + i);

/** Modal for uploading a legacy annual report PDF */
export function AddLegacyPDFModal({
	isOpen,
	onClose,
	existingYears,
}: AddLegacyPDFModalProps) {
	const [selectedYear, setSelectedYear] = useState<string>("");
	const [file, setFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const addLegacyMutation = useAddLegacyPDF();

	const availableYears = useMemo(
		() => LEGACY_YEAR_RANGE.filter((year) => !existingYears.includes(year)),
		[existingYears]
	);

	const handleSubmit = () => {
		if (!selectedYear || !file) return;
		addLegacyMutation.mutate(
			{ year: Number(selectedYear), file },
			{
				onSuccess: () => {
					resetAndClose();
				},
			}
		);
	};

	const resetAndClose = () => {
		setSelectedYear("");
		setFile(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
		onClose();
	};

	const canSubmit = !!selectedYear && !!file && !addLegacyMutation.isPending;

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Legacy PDF</DialogTitle>
					<DialogDescription>
						Upload a PDF from before the system was in use.
					</DialogDescription>
				</DialogHeader>

				<div className="mt-4 space-y-4">
					{/* Year selector */}
					<div className="space-y-2">
						<Label htmlFor="legacy-year-select">Report Year</Label>
						<Select value={selectedYear} onValueChange={setSelectedYear}>
							<SelectTrigger id="legacy-year-select" className="w-full">
								<SelectValue placeholder="Select a year" />
							</SelectTrigger>
							<SelectContent>
								{availableYears.map((year) => (
									<SelectItem key={year} value={String(year)}>
										{year}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* PDF file input */}
					<div className="space-y-2">
						<Label htmlFor="legacy-pdf-file">PDF File</Label>
						<input
							ref={fileInputRef}
							id="legacy-pdf-file"
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
						isLoading={addLegacyMutation.isPending}
						onClick={handleSubmit}
					>
						Add
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
