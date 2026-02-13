/**
 * DataTableHeader Component
 *
 * Header row with sortable columns for DataTable.
 */

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ColumnDef, SortConfig, DataTableTheme } from "./types";

interface DataTableHeaderProps<TData> {
	columns: ColumnDef<TData>[];
	sortConfig: SortConfig | undefined;
	onSort: (columnId: string) => void;
	theme?: DataTableTheme;
}

export function DataTableHeader<TData>({
	columns,
	sortConfig,
	onSort,
	theme,
}: DataTableHeaderProps<TData>) {
	const getSortIcon = (columnId: string) => {
		if (!sortConfig || sortConfig.column !== columnId) {
			return <ArrowUpDown className="ml-2 h-4 w-4" />;
		}
		return sortConfig.direction === "asc" ? (
			<ArrowDown className="ml-2 h-4 w-4" />
		) : (
			<ArrowUp className="ml-2 h-4 w-4" />
		);
	};

	// Calculate grid columns based on column widths
	const gridCols = columns
		.filter((col) => !col.hideOnMobile)
		.map((col) => col.width || "1fr")
		.join(" ");

	// Default theme
	const headerBg = theme?.headerBg || "bg-blue-50 dark:bg-blue-900/20";
	const accentColor =
		theme?.accentColor || "hover:text-blue-600 dark:hover:text-blue-400";

	return (
		<div
			className={`hidden md:grid gap-4 ${headerBg} border-b border-gray-200 dark:border-gray-700`}
			style={{ gridTemplateColumns: gridCols }}
			role="row"
		>
			{columns
				.filter((col) => !col.hideOnMobile)
				.map((column) => (
					<div key={column.id} className="px-4 py-3" role="columnheader">
						{column.sortable ? (
							<button
								onClick={() => onSort(column.id)}
								className={`flex items-center gap-2 font-semibold text-sm ${accentColor} transition-colors`}
								type="button"
							>
								{column.header}
								{getSortIcon(column.id)}
							</button>
						) : (
							<div className="font-semibold text-sm">{column.header}</div>
						)}
					</div>
				))}
		</div>
	);
}
