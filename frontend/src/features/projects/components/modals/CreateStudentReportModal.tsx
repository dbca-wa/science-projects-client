import { useState, useMemo, useEffect } from "react";
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
import { Loader2 } from "lucide-react";
import { useCreateStudentReport } from "../../hooks/useCreateStudentReport";
import { useGetStudentReportAvailableYears } from "../../hooks/useGetStudentReportAvailableYears";

interface CreateStudentReportModalProps {
	isOpen: boolean;
	onClose: () => void;
	projectId: number;
}

export function CreateStudentReportModal({
	isOpen,
	onClose,
	projectId,
}: CreateStudentReportModalProps) {
	const [selectedYear, setSelectedYear] = useState<string>("");
	const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

	// Fetch available years (only when modal is open)
	const { data: availableYears, isLoading: isLoadingYears } =
		useGetStudentReportAvailableYears(projectId, isOpen);

	const createReportMutation = useCreateStudentReport();

	// Update selected report ID when selected year changes
	useEffect(() => {
		if (selectedYear && availableYears) {
			const yearData = availableYears.find(
				(item) => Number(item.year) === Number(selectedYear)
			);
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setSelectedReportId(yearData?.pk || null);
		} else {
			setSelectedReportId(null);
		}
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
					setSelectedReportId(null);
				},
			}
		);
	};

	const hasNoAvailableYears =
		!isLoadingYears && (!availableYears || availableYears.length === 0);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create Student Report</DialogTitle>
					<DialogDescription>
						Create a student report for the selected year.
					</DialogDescription>
				</DialogHeader>

				{isLoadingYears ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				) : hasNoAvailableYears ? (
					<div className="py-4">
						<p className="text-sm text-muted-foreground">
							A student report cannot be created for this project as it already
							has reports for each available year.
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{/* Info Box */}
						<div className="rounded-lg bg-muted p-4">
							<ul className="ml-6 list-disc space-y-2 text-sm">
								<li>
									This will create a student report for the selected year.
								</li>
								<li>
									Years will only appear based on whether an annual report
									exists for that year.
								</li>
								<li>
									Years which already have student reports for this project will
									not be selectable.
								</li>
							</ul>
						</div>

						{/* Year Selection */}
						<div className="space-y-2">
							<Label htmlFor="year-select">Report Year</Label>
							<Select value={selectedYear} onValueChange={setSelectedYear}>
								<SelectTrigger id="year-select">
									<SelectValue placeholder="Select a report year..." />
								</SelectTrigger>
								<SelectContent>
									{sortedYears.map((yearData) => (
										<SelectItem
											key={yearData.pk}
											value={yearData.year.toString()}
										>
											{formatYearDisplay(yearData.year)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<p className="text-sm text-muted-foreground">
								Select an annual report for this student report
							</p>
						</div>
					</div>
				)}

				<DialogFooter>
					{!hasNoAvailableYears && (
						<>
							<Button type="button" variant="outline" onClick={onClose}>
								Cancel
							</Button>
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
								{createReportMutation.isPending ? "Creating..." : "Create"}
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
