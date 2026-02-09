import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface ProjectKeywordsProps {
	keywords: string | null | undefined;
	className?: string;
	maxVisible?: number;
}

/**
 * ProjectKeywords component displays project keywords as tags
 * - Parses keyword string to array
 * - Displays as tags with responsive grid
 * - Implements show more/less functionality
 * - Handles empty/null keywords gracefully
 */
export function ProjectKeywords({
	keywords,
	className,
	maxVisible = 5,
}: ProjectKeywordsProps) {
	const [showAll, setShowAll] = useState(false);

	// Parse keywords string to array
	const parseKeywords = (): string[] => {
		if (!keywords || keywords === "") {
			return ["None"];
		}
		return keywords
			.split(", ")
			.map((keyword) => keyword.charAt(0).toUpperCase() + keyword.slice(1));
	};

	const keywordArray = parseKeywords();
	const hasMore = keywordArray.length > maxVisible;
	const displayedKeywords = showAll
		? keywordArray
		: keywordArray.slice(0, maxVisible);

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4">
				{displayedKeywords.map((tag, index) => (
					<div
						key={index}
						className="flex items-center justify-center text-center min-h-[50px] px-3 py-2 text-sm rounded-md bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
					>
						{tag}
					</div>
				))}
			</div>
			{hasMore && (
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setShowAll(!showAll)}
					className="self-start"
				>
					{showAll ? "Show Less" : `Show More (${keywordArray.length - maxVisible} more)`}
				</Button>
			)}
		</div>
	);
}
