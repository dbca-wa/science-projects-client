/**
 * DataTableRow Component
 *
 * Individual row component for DataTable with responsive layout.
 * Uses CSS classes for responsive behavior instead of JS-based detection.
 */

import type { ColumnDef, DataTableTheme } from "./types";

interface DataTableRowProps<TData> {
	row: TData;
	columns: ColumnDef<TData>[];
	gridCols: string;
	onClick?: (row: TData, event: React.MouseEvent) => void;
	theme?: DataTableTheme;
}

export function DataTableRow<TData>({
	row,
	columns,
	gridCols,
	onClick,
	theme,
}: DataTableRowProps<TData>) {
	const handleClick = (event: React.MouseEvent) => {
		if (onClick) {
			onClick(row, event);
		}
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			if (onClick) {
				onClick(row, event as unknown as React.MouseEvent);
			}
		}
	};

	// Filter visible columns (non-hidden on mobile)
	const visibleColumns = columns.filter((col) => !col.hideOnMobile);

	// Default theme
	const rowHover =
		theme?.rowHover || "hover:bg-blue-50 dark:hover:bg-blue-900/10";

	// On mobile: single column card layout (via CSS)
	// On desktop (md+): CSS media query applies custom grid columns via --grid-cols
	return (
		<div
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			className={`datatable-row grid gap-0 md:gap-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 cursor-pointer ${rowHover} transition-colors`}
			style={
				{
					"--grid-cols": gridCols,
				} as React.CSSProperties
			}
			role="row"
			tabIndex={onClick ? 0 : undefined}
		>
			{visibleColumns.map((column) => {
				const value = column.accessor(row);
				const cellContent = column.cell
					? column.cell(row, value)
					: String(value ?? "");

				return (
					<div key={column.id} className="px-4 py-4" role="cell">
						{/* Mobile label - hidden on desktop */}
						<div className="md:hidden text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
							{column.mobileLabel || column.header}
						</div>
						{/* Cell content */}
						<div>{cellContent}</div>
					</div>
				);
			})}
		</div>
	);
}
