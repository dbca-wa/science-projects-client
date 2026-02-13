/**
 * DataTable Component
 *
 * Generic, reusable data table with sorting, pagination, and responsive design.
 */

import { useState, useMemo } from "react";
import type { DataTableProps } from "./types";
import { DataTableHeader } from "./DataTableHeader";
import { DataTableRow } from "./DataTableRow";
import { DataTableEmpty } from "./DataTableEmpty";
import { DataTablePagination } from "./DataTablePagination";
import { sortData, toggleSort, paginateData, getPaginationInfo } from "./utils";
import "./DataTable.css";

export function DataTable<TData>({
	data,
	columns,
	getRowKey,
	onRowClick,
	defaultSort,
	pagination,
	emptyMessage = "No data available",
	loading = false,
	EmptyComponent,
	LoadingComponent,
	className = "",
	ariaLabel,
	theme,
}: DataTableProps<TData>) {
	const [sortConfig, setSortConfig] = useState(defaultSort);
	const [currentPage, setCurrentPage] = useState(1);

	// Sort data
	const sortedData = useMemo(
		() => sortData(data, columns, sortConfig),
		[data, columns, sortConfig]
	);

	// Paginate data
	const paginatedData = useMemo(() => {
		if (!pagination?.enabled) {
			return sortedData;
		}
		return paginateData(sortedData, currentPage, pagination.pageSize);
	}, [sortedData, currentPage, pagination]);

	// Pagination info
	const paginationInfo = useMemo(() => {
		if (!pagination?.enabled) {
			return null;
		}
		return getPaginationInfo(
			sortedData.length,
			currentPage,
			pagination.pageSize
		);
	}, [sortedData.length, currentPage, pagination]);

	// Handle sort
	const handleSort = (columnId: string) => {
		setSortConfig((prev) => toggleSort(prev, columnId));
		// Reset to first page when sorting changes
		setCurrentPage(1);
	};

	// Handle page change
	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	// Calculate grid columns for responsive layout
	const gridCols = columns
		.filter((col) => !col.hideOnMobile)
		.map((col) => col.width || "1fr")
		.join(" ");

	// Loading state
	if (loading) {
		if (LoadingComponent) {
			return <LoadingComponent />;
		}
		return (
			<div className="rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
				<div className="text-gray-500 dark:text-gray-400">Loading...</div>
			</div>
		);
	}

	// Empty state
	if (data.length === 0) {
		if (EmptyComponent) {
			return <EmptyComponent />;
		}
		return <DataTableEmpty message={emptyMessage} />;
	}

	return (
		<div className={`space-y-4 ${className}`}>
			{/* Table */}
			<div
				className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
				role="table"
				aria-label={ariaLabel}
			>
				{/* Header */}
				<DataTableHeader
					columns={columns}
					sortConfig={sortConfig}
					onSort={handleSort}
					theme={theme}
				/>

				{/* Rows */}
				<div role="rowgroup">
					{paginatedData.map((row) => (
						<DataTableRow
							key={getRowKey(row)}
							row={row}
							columns={columns}
							gridCols={gridCols}
							onClick={onRowClick}
							theme={theme}
						/>
					))}
				</div>
			</div>

			{/* Pagination */}
			{pagination?.enabled && paginationInfo && (
				<DataTablePagination
					currentPage={currentPage}
					totalPages={paginationInfo.totalPages}
					startIndex={paginationInfo.startIndex}
					endIndex={paginationInfo.endIndex}
					totalItems={paginationInfo.totalItems}
					itemLabel={pagination.itemLabel || "items"}
					onPageChange={handlePageChange}
				/>
			)}
		</div>
	);
}
