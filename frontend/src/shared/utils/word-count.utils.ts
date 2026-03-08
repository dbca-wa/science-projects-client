/**
 * Word counting utilities for rich text content
 */

/**
 * Count words in HTML content
 *
 * Strips HTML tags and counts words in the remaining text.
 * Handles multiple spaces, whitespace, and empty content.
 *
 * @param htmlContent - HTML string to count words in
 * @returns Number of words in the content
 *
 * @example
 * countWords("<p>Hello world</p>") // 2
 * countWords("<p>Hello   world</p>") // 2 (multiple spaces)
 * countWords("") // 0
 * countWords("<p></p>") // 0
 */
export function countWords(htmlContent: string): number {
	if (!htmlContent || htmlContent.trim() === "") {
		return 0;
	}

	// Replace HTML tags with spaces to prevent word concatenation
	const textOnly = htmlContent.replace(/<[^>]*>/g, " ");

	// Decode HTML entities (e.g., &nbsp; &amp;)
	const decoded = textOnly
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'");

	// Trim and collapse multiple spaces
	const normalized = decoded.trim().replace(/\s+/g, " ");

	// If empty after normalization, return 0
	if (normalized === "") {
		return 0;
	}

	// Split by spaces and count
	return normalized.split(" ").length;
}
