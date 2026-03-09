/**
 * YearSelector Component
 *
 * Reusable year selector for document tabs (Progress Reports, Student Reports).
 * Displays available years in FY format with light blue background.
 */

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Card, CardContent } from "@/shared/components/ui/card";

interface YearSelectorProps {
	years: number[];
	selectedYear: number;
	onYearChange: (year: number) => void;
}

export function YearSelector({
	years,
	selectedYear,
	onYearChange,
}: YearSelectorProps) {
	return (
		<Card className="mb-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
			<CardContent className="px-4">
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium text-blue-900 dark:text-blue-100">
						Selected Year
					</span>
					<Select
						value={selectedYear.toString()}
						onValueChange={(value) => onYearChange(Number(value))}
					>
						<SelectTrigger className="w-[180px] bg-white dark:bg-gray-950">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{years.map((year) => (
								<SelectItem key={year} value={year.toString()}>
									FY {year - 1} - {String(year).slice(2)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</CardContent>
		</Card>
	);
}
