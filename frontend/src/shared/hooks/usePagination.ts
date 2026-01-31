import { useState, useMemo, useCallback, useEffect } from "react";

interface UsePaginationProps<T> {
	data: T[];
	pageSize?: number;
	resetDeps?: unknown[];
}

interface UsePaginationReturn<T> {
	currentPage: number;
	totalPages: number;
	paginatedData: T[];
	goToPage: (page: number) => void;
	goToNextPage: () => void;
	goToPreviousPage: () => void;
	canGoNext: boolean;
	canGoPrevious: boolean;
	startIndex: number;
	endIndex: number;
	totalItems: number;
}

/**
 * Reusable pagination hook for client-side pagination
 * 
 * Slices data array to show only current page's items, reducing DOM rendering
 * while keeping all data available for counts and filtering.
 */
export function usePagination<T>({
	data,
	pageSize = 50,
	resetDeps = [],
}: UsePaginationProps<T>): UsePaginationReturn<T> {
	const [currentPage, setCurrentPage] = useState(1);

	// Reset to page 1 when dependencies change (e.g., filters)
	useEffect(() => {
		setCurrentPage(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, resetDeps);

	// Memoize total pages calculation
	const totalPages = useMemo(
		() => Math.max(1, Math.ceil(data.length / pageSize)),
		[data.length, pageSize]
	);

	// Memoize start index calculation
	const startIndex = useMemo(
		() => (currentPage - 1) * pageSize,
		[currentPage, pageSize]
	);

	// Memoize end index calculation
	const endIndex = useMemo(
		() => Math.min(startIndex + pageSize, data.length),
		[startIndex, pageSize, data.length]
	);

	// Memoize paginated data slice
	const paginatedData = useMemo(
		() => data.slice(startIndex, endIndex),
		[data, startIndex, endIndex]
	);

	// Memoize navigation functions to prevent recreation
	const goToPage = useCallback(
		(page: number) => {
			const validPage = Math.max(1, Math.min(page, totalPages));
			setCurrentPage(validPage);
		},
		[totalPages]
	);

	const goToNextPage = useCallback(() => {
		if (currentPage < totalPages) {
			setCurrentPage((prev) => prev + 1);
		}
	}, [currentPage, totalPages]);

	const goToPreviousPage = useCallback(() => {
		if (currentPage > 1) {
			setCurrentPage((prev) => prev - 1);
		}
	}, [currentPage]);

	// Auto-adjust if current page exceeds total pages after data changes
	useEffect(() => {
		if (currentPage > totalPages && totalPages > 0) {
			setCurrentPage(totalPages);
		}
	}, [currentPage, totalPages]);

	return {
		currentPage,
		totalPages,
		paginatedData,
		goToPage,
		goToNextPage,
		goToPreviousPage,
		canGoNext: currentPage < totalPages,
		canGoPrevious: currentPage > 1,
		startIndex,
		endIndex,
		totalItems: data.length,
	};
}
