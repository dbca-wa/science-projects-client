/**
 * DataTable Types
 *
 * Type definitions for the generic DataTable component.
 */

import type { ReactNode } from "react";

/**
 * Column definition for DataTable
 */
export interface ColumnDef<TData> {
	/** Unique column identifier */
	id: string;

	/** Column header text */
	header: string;

	/** Accessor function to get cell value */
	accessor: (row: TData) => unknown;

	/** Custom cell renderer */
	cell?: (row: TData, value: unknown) => ReactNode;

	/** Enable sorting for this column */
	sortable?: boolean;

	/** Custom sort function */
	sortFn?: (a: TData, b: TData) => number;

	/** Column width (CSS value) */
	width?: string;

	/** Hide column on mobile */
	hideOnMobile?: boolean;

	/** Mobile label (shown above value on mobile) */
	mobileLabel?: string;
}

/**
 * Sorting configuration
 */
export interface SortConfig {
	/** Column ID to sort by */
	column: string;

	/** Sort direction */
	direction: "asc" | "desc";
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
	/** Enable pagination */
	enabled: boolean;

	/** Items per page */
	pageSize: number;

	/** Show page size selector */
	showPageSize?: boolean;

	/** Available page sizes */
	pageSizes?: number[];

	/** Label for items (e.g., "documents", "projects") */
	itemLabel?: string;
}

/**
 * Theme configuration for DataTable styling
 */
export interface DataTableTheme {
	/** Header background color class */
	headerBg?: string;

	/** Row hover color class */
	rowHover?: string;

	/** Accent color for links/highlights */
	accentColor?: string;
}

/**
 * DataTable props
 */
export interface DataTableProps<TData> {
	/** Data to display */
	data: TData[];

	/** Column definitions */
	columns: ColumnDef<TData>[];

	/** Unique key extractor */
	getRowKey: (row: TData) => string | number;

	/** Row click handler */
	onRowClick?: (row: TData, event: React.MouseEvent) => void;

	/** Initial sort configuration */
	defaultSort?: SortConfig;

	/** Pagination configuration */
	pagination?: PaginationConfig;

	/** Empty state message */
	emptyMessage?: string;

	/** Loading state */
	loading?: boolean;

	/** Custom empty state component */
	EmptyComponent?: React.ComponentType;

	/** Custom loading component */
	LoadingComponent?: React.ComponentType;

	/** Additional CSS classes */
	className?: string;

	/** ARIA label for table */
	ariaLabel?: string;

	/** Theme configuration */
	theme?: DataTableTheme;
}
