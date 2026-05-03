import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useWindowSize } from "@/shared/hooks/useWindowSize";
import { BREAKPOINTS } from "@/shared/constants/breakpoints";

interface ProjectKeywordsProps {
	keywords: string | null | undefined;
	className?: string;
}

/**
 * ProjectKeywords component displays project keywords as tags
 * - Parses keyword string to array
 * - Displays as tags with responsive grid
 * - Implements show more/less functionality with responsive limits
 * - Handles empty/null keywords gracefully
 *
 * Responsive limits:
 * - 1 column (mobile): max 8 items
 * - 2 columns (sm): max 8 items
 * - 3 columns (xl): max 9 items
 * - 4 columns (2xl): max 12 items
 */
export const ProjectKeywords = ({
	keywords,
	className,
}: ProjectKeywordsProps) => {
	const [showAll, setShowAll] = useState(false);
	const { width } = useWindowSize();

	// Determine max visible based on breakpoint
	const getMaxVisible = (): number => {
		if (width >= BREAKPOINTS["2xl"]) return 12; // 4 columns
		if (width >= BREAKPOINTS.xl) return 9; // 3 columns
		if (width >= BREAKPOINTS.sm) return 8; // 2 columns
		return 8; // 1 column
	};

	const maxVisible = getMaxVisible();

	// Parse keywords string to array
	const parseKeywords = (): string[] => {
		if (!keywords || keywords === "") {
			return [];
		}
		return keywords
			.split(", ")
			.map((keyword) => keyword.charAt(0).toUpperCase() + keyword.slice(1));
	};

	const keywordArray = parseKeywords();
	const hasMore = keywordArray.length > maxVisible;
	// Automatically reset showAll when there's no more items to show
	const effectiveShowAll = showAll && hasMore;
	const displayedKeywords = effectiveShowAll
		? keywordArray
		: keywordArray.slice(0, maxVisible);

	// Show placeholder if no keywords
	if (keywordArray.length === 0) {
		return (
			<div className={cn("text-gray-500 dark:text-gray-400 italic", className)}>
				This project has no keywords
			</div>
		);
	}

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
				{displayedKeywords.map((tag, index) => (
					<div
						key={index}
						className="flex items-center justify-center text-center min-h-[50px] px-3 py-2 text-sm rounded bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 border border-purple-200 dark:border-purple-800 overflow-hidden"
					>
						<span className="truncate">{tag}</span>
					</div>
				))}
			</div>
			{hasMore && (
				<Button
					variant="outline"
					size="sm"
					onClick={(e) => {
						e.stopPropagation();
						setShowAll(!effectiveShowAll);
					}}
					className="self-start text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/30"
				>
					{effectiveShowAll
						? "Show Less"
						: `Show More (${keywordArray.length - maxVisible} more)`}
				</Button>
			)}
		</div>
	);
};
