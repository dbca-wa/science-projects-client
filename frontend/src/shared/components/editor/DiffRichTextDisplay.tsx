/**
 * DiffRichTextDisplay Component
 *
 * Specialised read-only component for displaying diff-highlighted rich text content.
 * Renders HTML directly without Lexical to preserve diff highlighting spans.
 *
 * SECURITY: This component is SAFE for system-generated diff content from htmldiff-js.
 * The sanitiseDiffHtml utility uses DOMPurify with a whitelist approach to remove all
 * potentially dangerous HTML (scripts, event handlers, dangerous protocols) while
 * preserving diff highlighting spans with class attributes.
 *
 * USAGE GUIDELINES:
 * - ✅ SAFE: System-generated diff content from htmldiff-js library
 * - ✅ SAFE: Content processed through sanitiseDiffHtml utility
 * - ❌ UNSAFE: Raw user-generated content (use RichTextDisplay instead)
 * - ❌ UNSAFE: Content from untrusted external sources
 *
 * @example
 * // ✅ CORRECT - System-generated diff from htmldiff-js
 * const diffHtml = HtmlDiff.execute(oldContent, newContent);
 * const customDiff = diffHtml
 *   .replace(/<ins[^>]*>/g, '<span class="diff-addition">')
 *   .replace(/<\/ins>/g, '</span>')
 *   .replace(/<del[^>]*>/g, '<span class="diff-deletion">')
 *   .replace(/<\/del>/g, '</span>');
 * <DiffRichTextDisplay content={customDiff} />
 *
 * @example
 * // ❌ WRONG - Raw user-generated content
 * <DiffRichTextDisplay content={userInput} />
 *
 * @see sanitiseDiffHtml - Sanitisation utility that makes this component safe
 * @see ContentDiff - The only component that should use DiffRichTextDisplay
 */

import React from "react";
import { sanitiseDiffHtml } from "@/shared/utils/html-sanitise.utils";
import "@/shared/styles/editor.css";

export interface DiffRichTextDisplayProps {
	/** HTML content with diff highlighting */
	content: string;

	/** Optional className for styling */
	className?: string;

	/** Message to show when content is empty */
	emptyMessage?: string;
}

export const DiffRichTextDisplay: React.FC<DiffRichTextDisplayProps> = ({
	content,
	className = "",
	emptyMessage = "No content",
}) => {
	// Development-mode warning for potential misuse
	if (process.env.NODE_ENV === "development") {
		if (
			content &&
			(content.includes("<script") ||
				content.includes("javascript:") ||
				content.includes("onerror="))
		) {
			console.warn(
				"DiffRichTextDisplay: Content contains suspicious patterns. " +
					"This component should ONLY be used for system-generated diff content from htmldiff-js. " +
					"For user-generated content, use RichTextDisplay instead."
			);
		}
	}

	// Sanitise HTML content using diff-specific sanitiser
	// This preserves span tags with class attributes for diff highlighting
	const sanitisedContent = content ? sanitiseDiffHtml(content) : "";

	// If no content, show empty message
	if (!sanitisedContent) {
		return (
			<div className={`${className} italic text-gray-500 dark:text-gray-400`}>
				{emptyMessage}
			</div>
		);
	}

	// Render HTML directly to preserve diff spans
	return (
		<div
			className={`diff-prose ${className}`}
			dangerouslySetInnerHTML={{ __html: sanitisedContent }}
		/>
	);
};
