/**
 * HTML Normalisation Utilities
 *
 * Utilities for normalising HTML content to enable accurate content comparison.
 * Removes insignificant whitespace and formatting differences that don't affect
 * the semantic meaning of the content.
 */

/**
 * Normalise HTML content for comparison
 *
 * Removes insignificant differences that don't affect semantic meaning:
 * - Trims leading/trailing whitespace
 * - Normalises whitespace between tags
 * - Removes empty paragraphs
 * - Normalises self-closing tags
 *
 * @param html - HTML content to normalise
 * @returns Normalised HTML content
 *
 * @example
 * ```typescript
 * const html1 = '<p>Hello</p>  <p>World</p>';
 * const html2 = '<p>Hello</p><p>World</p>';
 * normaliseHtmlContent(html1) === normaliseHtmlContent(html2); // true
 * ```
 */
export function normaliseHtmlContent(html: string): string {
	if (!html) return "";

	let normalised = html;

	// 1. Trim leading/trailing whitespace
	normalised = normalised.trim();

	// 2. Normalise whitespace between tags (remove spaces between closing and opening tags)
	normalised = normalised.replace(/>\s+</g, "><");

	// 3. Normalise multiple spaces within text content to single space
	normalised = normalised.replace(/\s{2,}/g, " ");

	// 4. Remove empty paragraphs (with or without whitespace)
	normalised = normalised.replace(/<p>\s*<\/p>/gi, "");
	normalised = normalised.replace(/<p[^>]*>\s*<\/p>/gi, "");

	// 5. Normalise self-closing tags (convert <br/> to <br>, <img/> to <img>, etc.)
	normalised = normalised.replace(/<(\w+)([^>]*?)\/>/g, "<$1$2>");

	// 6. Final trim
	normalised = normalised.trim();

	return normalised;
}
