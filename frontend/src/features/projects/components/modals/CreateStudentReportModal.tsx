import { useState, useMemo } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { GraduationCap, Info, Loader2 } from "lucide-react";
import { useCreateStudentReport } from "../../hooks/useCreateStudentReport";
import { useGetStudentReportAvailableYears } from "../../hooks/useGetStudentReportAvailableYears";

interface CreateStudentReportModalProps {
	isOpen: boolean;
	onClose: () => void;
	projectId: number;
}

export const CreateStudentReportModal = ({
	isOpen,
	onClose,
	projectId,
}: CreateStudentReportModalProps) => {
	const [selectedYear, setSelectedYear] = useState<string>("");

	// Fetch available years (only when modal is open)
	const { data: availableYears, isLoading: isLoadingYears } =
		useGetStudentReportAvailableYears(projectId, isOpen);

	const createReportMutation = useCreateStudentReport();

	// Derive selected report ID from selected year
	const selectedReportId = useMemo(() => {
		if (selectedYear && availableYears) {
			const yearData = availableYears.find(
				(item) => Number(item.year) === Number(selectedYear)
			);
			return yearData?.id || null;
		}
		return null;
	}, [selectedYear, availableYears]);

	// Format year display (FY 2023-24 format)
	const formatYearDisplay = (year: number) => {
		return `FY ${year - 1} - ${String(year).slice(2)}`;
	};

	// Sort years in descending order
	const sortedYears = useMemo(() => {
		if (!availableYears) return [];
		return [...availableYears].sort((a, b) => b.year - a.year);
	}, [availableYears]);

	const handleCreate = () => {
		if (!selectedYear || !selectedReportId) return;

		createReportMutation.mutate(
			{
				projectId,
				reportId: selectedReportId,
				year: Number.parseInt(selectedYear, 10),
			},
			{
				onSuccess: () => {
					onClose();
					setSelectedYear("");
				},
			}
		);
	};

	const hasNoAvailableYears =
		!isLoadingYears && (!availableYears || availableYears.length === 0);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/40">
							<GraduationCap className="size-5 text-purple-600 dark:text-purple-400" />
						</div>
						<div>
							<DialogTitle className="text-lg">
								Create Student Report
							</DialogTitle>
							<DialogDescription className="mt-0.5">
								Add a new student report for this project
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				{isLoadingYears ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="size-8 animate-spin text-muted-foreground" />
					</div>
				) : hasNoAvailableYears ? (
					<div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-5">
						<p className="text-sm text-amber-800 dark:text-amber-200">
							No report years are available. This project already has student
							reports for every annual report year, or no annual reports exist
							yet.
						</p>
					</div>
				) : (
					<div className="space-y-5 pt-2">
						{/* Explanation */}
						<div className="flex gap-3 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20 p-4">
							<Info className="size-4 mt-0.5 shrink-0 text-purple-600 dark:text-purple-400" />
							<div className="space-y-1.5 text-sm text-purple-800 dark:text-purple-200">
								<p>
									Select a financial year to create a student report. Only years
									with an existing annual report are shown.
								</p>
								<p className="text-purple-600 dark:text-purple-400">
									Years that already have a student report for this project are
									excluded.
								</p>
							</div>
						</div>

						{/* Year Selection */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label
									htmlFor="student-year-select"
									className="text-sm font-semibold"
								>
									Financial Year
								</Label>
								<span className="text-xs text-muted-foreground">
									{sortedYears.length} year{sortedYears.length !== 1 ? "s" : ""}{" "}
									available
								</span>
							</div>
							<Select value={selectedYear} onValueChange={setSelectedYear}>
								<SelectTrigger id="student-year-select" className="w-full h-11">
									<SelectValue placeholder="Select a financial year..." />
								</SelectTrigger>
								<SelectContent>
									{sortedYears.map((yearData) => (
										<SelectItem
											key={yearData.id}
											value={yearData.year.toString()}
										>
											{formatYearDisplay(yearData.year)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				)}

				<DialogFooter className="gap-3 sm:gap-3">
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					{!hasNoAvailableYears && (
						<Button
							onClick={handleCreate}
							disabled={
								createReportMutation.isPending ||
								!selectedYear ||
								!selectedReportId ||
								isLoadingYears
							}
							className="bg-green-600 hover:bg-green-700"
						>
							{createReportMutation.isPending ? (
								<>
									<Loader2 className="mr-2 size-4 animate-spin" />
									Creating...
								</>
							) : (
								"Create Student Report"
							)}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
