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
import { AlertCircle as _AlertCircle, Loader2 } from "lucide-react";
import { useCreateProgressReport } from "../hooks/useCreateProgressReport";
import { useGetProgressReportAvailableYears } from "../hooks/useGetProgressReportAvailableYears";
import type { IProjectData } from "@/shared/types/project.types";

interface CreateProgressReportModalProps {
	isOpen: boolean;
	onClose: () => void;
	project: IProjectData;
}

export function CreateProgressReportModal({
	isOpen,
	onClose,
	project,
}: CreateProgressReportModalProps) {
	const [selectedYear, setSelectedYear] = useState<string>("");

	// Fetch available years (only when modal is open)
	const { data: availableYears, isLoading: isLoadingYears } =
		useGetProgressReportAvailableYears(project.id, isOpen);

	const createReportMutation = useCreateProgressReport();

	// Derive selected report ID from selected year
	const selectedReportId = useMemo(() => {
		if (selectedYear && availableYears) {
			const yearData = availableYears.find(
				(item) => Number(item.year) === Number(selectedYear)
			);
			return yearData?.pk || null;
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
				projectId: project.id,
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
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create Progress Report</DialogTitle>
					<DialogDescription>
						Create a progress report for the selected year.
					</DialogDescription>
				</DialogHeader>

				{isLoadingYears ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				) : hasNoAvailableYears ? (
					<div className="py-4">
						<p className="text-sm text-muted-foreground">
							A progress report cannot be created for this project as it already
							has reports for each available year.
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{/* Info Box */}
						<div className="rounded-lg bg-muted p-4">
							<ul className="ml-6 list-disc space-y-2 text-sm">
								<li>
									This will create a progress report for the selected year.
								</li>
								<li>
									Years will only appear based on whether an annual report
									exists for that year.
								</li>
								<li>
									Years which already have progress reports for this project
									will not be selectable.
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
								Select an annual report for this progress report
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
