/**
 * DataTable Utilities
 * 
 * Utility functions for sorting and data manipulation.
 */

import type { ColumnDef, SortConfig } from "./types";

/**
 * Sort data by column configuration
 */
export function sortData<TData>(
	data: TData[],
	columns: ColumnDef<TData>[],
	sortConfig: SortConfig | undefined
): TData[] {
	if (!sortConfig) {
		return data;
	}

	const column = columns.find((col) => col.id === sortConfig.column);
	if (!column || !column.sortable) {
		return data;
	}

	const sorted = [...data].sort((a, b) => {
		// Use custom sort function if provided
		if (column.sortFn) {
			return column.sortFn(a, b);
		}

		// Default sort by accessor value
		const valueA = column.accessor(a);
		const valueB = column.accessor(b);

		// Handle null/undefined
		if (valueA == null && valueB == null) return 0;
		if (valueA == null) return 1;
		if (valueB == null) return -1;

		// String comparison
		if (typeof valueA === "string" && typeof valueB === "string") {
			return valueA.localeCompare(valueB);
		}

		// Number comparison
		if (typeof valueA === "number" && typeof valueB === "number") {
			return valueA - valueB;
		}

		// Boolean comparison
		if (typeof valueA === "boolean" && typeof valueB === "boolean") {
			return valueA === valueB ? 0 : valueA ? -1 : 1;
		}

		// Date comparison
		if (valueA instanceof Date && valueB instanceof Date) {
			return valueA.getTime() - valueB.getTime();
		}

		// Fallback to string comparison
		return String(valueA).localeCompare(String(valueB));
	});

	// Reverse if descending
	if (sortConfig.direction === "desc") {
		sorted.reverse();
	}

	return sorted;
}

/**
 * Toggle sort direction for a column
 */
export function toggleSort(
	currentSort: SortConfig | undefined,
	columnId: string
): SortConfig {
	if (!currentSort || currentSort.column !== columnId) {
		return { column: columnId, direction: "asc" };
	}

	return {
		column: columnId,
		direction: currentSort.direction === "asc" ? "desc" : "asc",
	};
}

/**
 * Paginate data
 */
export function paginateData<TData>(
	data: TData[],
	page: number,
	pageSize: number
): TData[] {
	const startIndex = (page - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	return data.slice(startIndex, endIndex);
}

/**
 * Calculate total pages
 */
export function calculateTotalPages(totalItems: number, pageSize: number): number {
	return Math.ceil(totalItems / pageSize);
}

/**
 * Get pagination info
 */
export function getPaginationInfo(
	totalItems: number,
	currentPage: number,
	pageSize: number
) {
	const startIndex = (currentPage - 1) * pageSize + 1;
	const endIndex = Math.min(currentPage * pageSize, totalItems);
	const totalPages = calculateTotalPages(totalItems, pageSize);

	return {
		startIndex,
		endIndex,
		totalPages,
		totalItems,
	};
}
