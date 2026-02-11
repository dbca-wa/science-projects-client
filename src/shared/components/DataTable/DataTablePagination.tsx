/**
 * DataTablePagination Component
 *
 * Pagination controls for DataTable.
 */

import { Pagination } from "@/shared/components/Pagination";

interface DataTablePaginationProps {
	currentPage: number;
	totalPages: number;
	startIndex: number;
	endIndex: number;
	totalItems: number;
	itemLabel: string;
	onPageChange: (page: number) => void;
}

export function DataTablePagination({
	currentPage,
	totalPages,
	startIndex,
	endIndex,
	totalItems,
	itemLabel,
	onPageChange,
}: DataTablePaginationProps) {
	// Don't show pagination if only one page
	if (totalPages <= 1) {
		return null;
	}

	return (
		<Pagination
			currentPage={currentPage}
			totalPages={totalPages}
			onPageChange={onPageChange}
			startIndex={startIndex}
			endIndex={endIndex}
			totalItems={totalItems}
			itemLabel={itemLabel}
		/>
	);
}
