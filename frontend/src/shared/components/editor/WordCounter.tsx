import { useMemo } from "react";
import { countWords } from "@/shared/utils/word-count.utils";

export interface WordCounterProps {
	content: string;
	limit?: number;
	showLimit?: boolean;
}

/**
 * WordCounter component
 *
 * Displays current word count with:
 * - Warning when limit exceeded
 * - Accessible colour contrast
 * - ARIA live region for count updates
 */
export function WordCounter({
	content,
	limit,
	showLimit = true,
}: WordCounterProps) {
	const wordCount = useMemo(() => countWords(content), [content]);
	const isOverLimit = limit !== undefined && wordCount > limit;
	const isApproachingLimit = limit !== undefined && wordCount >= limit * 0.9;

	return (
		<div
			className="text-sm"
			role="status"
			aria-live={isApproachingLimit ? "assertive" : "polite"}
			aria-atomic="true"
		>
			<span
				className={isOverLimit ? "text-red-600 font-medium" : "text-gray-600"}
			>
				{wordCount}
				{limit !== undefined && showLimit && ` / ${limit}`}
				{wordCount === 1 ? " word" : " words"}
			</span>

			{isOverLimit && (
				<span className="ml-2 text-red-600 font-medium" role="alert">
					(exceeds limit by {wordCount - limit})
				</span>
			)}
		</div>
	);
}
