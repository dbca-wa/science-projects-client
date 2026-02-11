/**
 * Style HTML string by removing inline styles but preserving link colours
 * Used for displaying rich text editor content with consistent styling
 *
 * NOTE: This is NOT a security function. For security sanitisation,
 * use sanitizeRichText() from sanitise.utils.ts
 *
 * @param htmlString - Raw HTML string from rich text editor
 * @returns Styled HTML string
 */
export const styleHtmlForDisplay = (htmlString: string): string => {
	if (!htmlString) return "";

	const parser = new DOMParser();
	const doc = parser.parseFromString(htmlString, "text/html");
	const elements = doc.body.querySelectorAll("*");

	elements.forEach((element) => {
		// Unwrap bold and strong tags (remove tag but keep content)
		if (
			element.tagName.toLowerCase() === "b" ||
			element.tagName.toLowerCase() === "strong"
		) {
			const parent = element.parentNode;
			while (element.firstChild) {
				parent?.insertBefore(element.firstChild, element);
			}
			parent?.removeChild(element);
		} else if (element.tagName.toLowerCase() === "a") {
			// Preserve links but add styling classes
			element.removeAttribute("style");
			element.setAttribute(
				"class",
				"text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300"
			);
			element.setAttribute("target", "_blank");
			element.setAttribute("rel", "noopener noreferrer");
		} else {
			// Remove inline styles from other elements
			element.removeAttribute("style");
		}
	});

	return doc.body.innerHTML;
};

/**
 * Check if rich text editor content is empty
 * Handles various empty states from rich text editors
 *
 * @param content - HTML content string
 * @returns True if content is empty or contains only empty paragraphs
 */
export const isEmptyRichTextContent = (
	content: string | undefined
): boolean => {
	if (!content) return true;

	const emptyPatterns = [
		"",
		"<p></p>",
		'<p class="editor-p-light"><br></p>',
		'<p class="editor-p-dark"><br></p>',
	];

	return emptyPatterns.includes(content);
};

/**
 * Get styled HTML with fallback for empty content
 *
 * @param content - HTML content string
 * @param fallback - Fallback text to display when content is empty
 * @returns Styled HTML or fallback message
 */
export const getStyledHtmlOrFallback = (
	content: string | undefined,
	fallback: string = "(Not Provided)"
): string => {
	if (isEmptyRichTextContent(content)) {
		return `<p>${fallback}</p>`;
	}
	return styleHtmlForDisplay(content || `<p>${fallback}</p>`);
};

/**
 * Extract plain text from HTML content
 * Used to display titles and content without HTML tags
 *
 * @param html - HTML string to extract text from
 * @returns Plain text content
 */
export const extractTextFromHTML = (html: string): string => {
	const div = document.createElement("div");
	div.innerHTML = html;
	return div.textContent || div.innerText || "";
};
