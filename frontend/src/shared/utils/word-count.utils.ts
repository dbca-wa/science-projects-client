/**
 * Word counting utilities for rich text content
 */

/**
 * Count words in HTML content
 *
 * Strips HTML tags and counts words in the remaining text.
 * Handles multiple spaces, whitespace, and empty content.
 * Uses DOMParser for safe single-pass entity decoding.
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

	try {
		// Parse HTML and extract text (automatically decodes entities in single pass)
		const parser = new DOMParser();
		const doc = parser.parseFromString(htmlContent, "text/html");

		// Get text content - DOMParser doesn't add spaces between block elements
		// So we need to add spaces manually for block-level elements
		let textOnly = doc.body.textContent || "";

		// DOMParser concatenates text from adjacent block elements without spaces
		// To fix this, we need to add spaces where block elements were
		// We'll use a simple heuristic: if there are multiple capital letters
		// or words run together, we need to handle block elements differently

		// Alternative approach: Replace block-level tags with spaces before parsing
		// This preserves the word boundaries that existed in the HTML
		const blockElements =
			/<\/(p|div|h[1-6]|li|td|th|tr|section|article|header|footer|nav|aside|blockquote|pre|ul|ol|dl)>/gi;
		const htmlWithSpaces = htmlContent.replace(blockElements, " </$1>");

		// Also add space after <br> tags
		const htmlWithBrSpaces = htmlWithSpaces.replace(/<br\s*\/?>/gi, " ");

		// Now parse with DOMParser
		const doc2 = parser.parseFromString(htmlWithBrSpaces, "text/html");
		textOnly = doc2.body.textContent || "";

		// Trim and collapse multiple spaces
		const normalized = textOnly.trim().replace(/\s+/g, " ");

		// If empty after normalization, return 0
		if (normalized === "") {
			return 0;
		}

		// Split by spaces and count
		return normalized.split(" ").length;
	} catch {
		// Fallback to basic tag stripping without entity decoding
		const textOnly = htmlContent.replace(/<[^>]*>/g, " ");
		const normalized = textOnly.trim().replace(/\s+/g, " ");

		if (normalized === "") {
			return 0;
		}

		return normalized.split(" ").length;
	}
}
