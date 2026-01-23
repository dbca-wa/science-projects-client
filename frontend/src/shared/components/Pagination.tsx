import { Button } from "@/shared/components/ui/button";
import { useWindowSize } from "@/shared/hooks/useWindowSize";
import { BREAKPOINTS } from "@/shared/constants/breakpoints";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

/**
 * Pagination component
 * Provides navigation controls for paginated data with responsive page number display
 */
export const Pagination = ({
	currentPage,
	totalPages,
	onPageChange,
}: PaginationProps) => {
	const { width } = useWindowSize();

	if (totalPages <= 1) {
		return null;
	}

	const handleClick = (pageNumber: number) => {
		onPageChange(pageNumber);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	// Responsive max displayed pages using breakpoint constants
	// Mobile: 3 pages, Tablet: 5 pages, Desktop: 8 pages
	const maxDisplayedPages = width < BREAKPOINTS.sm ? 3 : width < BREAKPOINTS.lg ? 5 : 8;

	// Calculate the start and end page numbers for rendering
	let startPage = Math.max(1, currentPage - Math.floor(maxDisplayedPages / 2));
	const endPage = Math.min(totalPages, startPage + maxDisplayedPages - 1);
	if (endPage - startPage < maxDisplayedPages - 1) {
		startPage = Math.max(1, endPage - maxDisplayedPages + 1);
	}

	return (
		<div className="h-full mt-8 flex justify-center flex-wrap gap-1">
			{/* Prev button */}
			<Button
				variant="outline"
				size="sm"
				disabled={currentPage === 1}
				onClick={() => handleClick(currentPage - 1)}
				className="mx-0.5"
			>
				Prev
			</Button>

			{/* Page number buttons */}
			{Array.from({ length: endPage - startPage + 1 }, (_, i) => {
				const pageNum = startPage + i;
				return (
					<Button
						key={pageNum}
						size="sm"
						variant={pageNum === currentPage ? "default" : "outline"}
						onClick={() => handleClick(pageNum)}
						className="mx-0.5 min-w-[2.5rem]"
					>
						{pageNum}
					</Button>
				);
			})}

			{/* Next button */}
			<Button
				variant="outline"
				size="sm"
				disabled={currentPage === totalPages}
				onClick={() => handleClick(currentPage + 1)}
				className="mx-0.5"
			>
				Next
			</Button>
		</div>
	);
};
