/**
 * YearSelector Component
 *
 * Reusable year selector for document tabs (Progress Reports, Student Reports).
 * Displays available years in FY format with light blue background.
 * Shows status icons: emerald tick for approved, orange warning for needs attention.
 */

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Card, CardContent } from "@/shared/components/ui/card";
import { AlertCircle, Check } from "lucide-react";

interface YearSelectorProps {
	years: number[];
	selectedYear: number;
	onYearChange: (year: number) => void;
	/** Optional action element rendered next to the dropdown (e.g. create button) */
	action?: React.ReactNode;
	/** Map of year → document status. Used to show status icons in the dropdown. */
	yearStatuses?: Record<number, string>;
}

export const YearSelector = ({
	years,
	selectedYear,
	onYearChange,
	action,
	yearStatuses,
}: YearSelectorProps) => {
	/** Get the status icon for a year */
	const getStatusIcon = (year: number, size: "sm" | "md" = "md") => {
		if (!yearStatuses) return null;
		const status = yearStatuses[year];
		if (!status) return null;

		const iconSize = size === "sm" ? "size-3.5" : "size-4";
		const checkSize = size === "sm" ? "size-2" : "size-2.5";

		if (status === "approved") {
			return (
				<span
					className={`inline-flex ${iconSize} items-center justify-center rounded-full bg-emerald-500 shrink-0`}
				>
					<Check className={`${checkSize} text-white`} strokeWidth={3} />
				</span>
			);
		}
		return (
			<AlertCircle
				className={`${iconSize} shrink-0 text-orange-600 dark:text-orange-400`}
			/>
		);
	};

	return (
		<Card className="mb-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
			<CardContent className="px-4">
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium text-blue-900 dark:text-blue-100">
						Selected Year
					</span>
					<div className="flex items-center gap-2">
						<Select
							value={selectedYear.toString()}
							onValueChange={(value) => onYearChange(Number(value))}
						>
							<SelectTrigger className="w-[210px] bg-white dark:bg-gray-950">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{years.map((year) => (
									<SelectItem key={year} value={year.toString()}>
										<span className="inline-flex items-center gap-2">
											{getStatusIcon(year, "sm")}
											<span>
												FY {year - 1} - {String(year).slice(2)}
											</span>
										</span>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{action}
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
