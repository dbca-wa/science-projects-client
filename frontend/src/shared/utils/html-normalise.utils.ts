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
 * Removes insignificant differences that don't affect semantic meaning.
 * Specifically handles Lexical editor serialisation quirks where the HTML
 * output on load can differ from what was stored (e.g. `<p><br></p>` vs
 * `<p></p>`, class attribute ordering, trailing whitespace).
 *
 * @param html - HTML content to normalise
 * @returns Normalised HTML content
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

	// 4. Remove empty paragraphs — all variations Lexical can produce
	normalised = normalised.replace(/<p[^>]*>\s*<br\s*\/?>\s*<\/p>/gi, "");
	normalised = normalised.replace(/<p[^>]*>\s*<\/p>/gi, "");

	// 5. Normalise self-closing tags (convert <br/> to <br>, <img/> to <img>, etc.)
	normalised = normalised.replace(/<(\w+)([^>]*?)\/>/g, "<$1$2>");

	// 6. Normalise class attribute ordering (sort class names alphabetically)
	normalised = normalised.replace(
		/class="([^"]*)"/g,
		(_match, classes: string) => {
			const sorted = classes.split(/\s+/).filter(Boolean).sort().join(" ");
			return `class="${sorted}"`;
		}
	);

	// 7. Remove data- attributes that Lexical adds during serialisation
	normalised = normalised.replace(/\s*data-lexical-[a-z-]+="[^"]*"/gi, "");

	// 8. Normalise <br> variations
	normalised = normalised.replace(/<br\s*\/?>/gi, "<br>");

	// 9. Remove trailing <br> inside paragraphs (Lexical adds these for empty lines)
	normalised = normalised.replace(/<br><\/p>/gi, "</p>");

	// 10. Final trim
	normalised = normalised.trim();

	return normalised;
}
