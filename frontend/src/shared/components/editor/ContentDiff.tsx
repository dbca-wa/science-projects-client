import { useMemo, useState } from "react";
import HtmlDiff from "htmldiff-js";
import { DiffRichTextDisplay } from "./DiffRichTextDisplay";
import { RichTextDisplay } from "./RichTextDisplay";
import { Button } from "@/shared/components/ui/button";

/**
 * Truncate content if it exceeds the maximum length
 */
const truncateContent = (
	content: string,
	maxLength: number = 10000
): { text: string; truncated: boolean } => {
	if (content.length <= maxLength) {
		return { text: content, truncated: false };
	}

	return {
		text: content.substring(0, maxLength),
		truncated: true,
	};
};

/**
 * Props for ContentDiff component
 */
export interface ContentDiffProps {
	/** Original content (HTML) */
	originalContent: string;

	/** Current content (HTML) */
	currentContent: string;

	/** Optional className for styling */
	className?: string;
}

/**
 * ContentDiff component
 *
 * Displays a comparison of original and current content.
 * Shows deletions in original content and additions in current content.
 *
 * WCAG 2.2 Level AA compliant:
 * - Semantic HTML structure
 * - Sufficient colour contrast for diff highlights
 * - Clear visual distinction between additions and deletions
 */
export const ContentDiff = ({
	originalContent,
	currentContent,
	className = "",
}: ContentDiffProps) => {
	// Toggle between diff view and preview view (default to preview)
	const [showDiff, setShowDiff] = useState(false);

	// Compute HTML diff with highlighting (memoized)
	const { diffHtml, currentTruncated } = useMemo(() => {
		// Truncate if needed
		const { text: truncatedOriginal } = truncateContent(originalContent);
		const { text: truncatedCurrent, truncated: isTruncated } =
			truncateContent(currentContent);

		// Use htmldiff-js to compute diff with proper HTML handling
		// It will add <ins> tags for additions and <del> tags for deletions
		const diff = HtmlDiff.execute(truncatedOriginal, truncatedCurrent);

		// Replace htmldiff-js tags with our custom classes
		const customDiff = diff
			.replace(/<ins[^>]*>/g, '<span class="diff-addition">')
			.replace(/<\/ins>/g, "</span>")
			.replace(/<del[^>]*>/g, '<span class="diff-deletion">')
			.replace(/<\/del>/g, "</span>");

		return {
			diffHtml: customDiff,
			currentTruncated: isTruncated,
		};
	}, [originalContent, currentContent]);

	// Get truncated current content for preview
	const truncatedCurrent = useMemo(() => {
		const { text } = truncateContent(currentContent);
		return text;
	}, [currentContent]);

	return (
		<div className={`space-y-4 ${className}`}>
			{showDiff ? (
				/* Diff view with additions (green) and deletions (red strikethrough) */
				<>
					<div className="space-y-2">
						{/* Header with label and toggle buttons on same line */}
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
								<span
									className="inline-block w-1 h-4 bg-blue-500 rounded-full"
									aria-hidden="true"
								/>
								Changes
							</h3>
							<div className="flex items-center gap-2">
								<Button
									type="button"
									variant={!showDiff ? "default" : "outline"}
									size="sm"
									onClick={() => setShowDiff(false)}
									className="text-xs"
								>
									Preview
								</Button>
								<Button
									type="button"
									variant={showDiff ? "default" : "outline"}
									size="sm"
									onClick={() => setShowDiff(true)}
									className="text-xs"
								>
									Changes
								</Button>
							</div>
						</div>
						<div className="p-4 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-600 rounded-lg shadow-sm">
							<DiffRichTextDisplay
								content={diffHtml}
								emptyMessage="No content"
								className="text-sm"
							/>
						</div>
						<div className="flex items-center gap-4 px-4 text-xs text-muted-foreground">
							<div className="flex items-center gap-2">
								<span
									className="inline-block w-3 h-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded"
									aria-hidden="true"
								/>
								<span>Added</span>
							</div>
							<div className="flex items-center gap-2">
								<span
									className="inline-block w-3 h-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded"
									aria-hidden="true"
								/>
								<span>Deleted</span>
							</div>
						</div>
					</div>
				</>
			) : (
				/* Preview view - clean current content without diff highlighting */
				<>
					<div className="space-y-2">
						{/* Header with label and toggle buttons on same line */}
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
								<span
									className="inline-block w-1 h-4 bg-blue-500 rounded-full"
									aria-hidden="true"
								/>
								Preview (Current Content)
							</h3>
							<div className="flex items-center gap-2">
								<Button
									type="button"
									variant={!showDiff ? "default" : "outline"}
									size="sm"
									onClick={() => setShowDiff(false)}
									className="text-xs"
								>
									Preview
								</Button>
								<Button
									type="button"
									variant={showDiff ? "default" : "outline"}
									size="sm"
									onClick={() => setShowDiff(true)}
									className="text-xs"
								>
									Changes
								</Button>
							</div>
						</div>
						<div className="p-4 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-600 rounded-lg shadow-sm">
							<RichTextDisplay
								content={truncatedCurrent}
								emptyMessage="No content"
								className="text-sm"
							/>
						</div>
					</div>
				</>
			)}

			{currentTruncated && (
				<p className="text-xs text-muted-foreground italic px-4">
					Content truncated for display (showing first 10,000 characters)
				</p>
			)}
		</div>
	);
};
