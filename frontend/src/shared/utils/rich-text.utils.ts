/**
 * Rich Text Utilities
 *
 * Utilities for handling rich text content, including conversion
 * between plain text and HTML formats.
 */

/**
 * Checks if a string contains HTML tags
 */
export function isPlainText(text: string): boolean {
	if (!text) return true;

	// Check if string contains common HTML tags used in rich text
	// This includes: p, div, span, strong, em, ul, ol, li, br, a, etc.
	const commonHtmlTags =
		/(<p[\s>]|<\/p>|<div[\s>]|<\/div>|<span[\s>]|<\/span>|<strong[\s>]|<\/strong>|<em[\s>]|<\/em>|<ul[\s>]|<\/ul>|<ol[\s>]|<\/ol>|<li[\s>]|<\/li>|<br[\s/>]|<a[\s>]|<\/a>|<h[1-6][\s>]|<\/h[1-6]>)/i;
	return !commonHtmlTags.test(text);
}

/**
 * Converts plain text to rich text HTML format
 * Wraps plain text in proper HTML structure for Lexical editor
 */
export function convertPlainTextToRichText(text: string): string {
	if (!text) return '<p class="editor-p-light"><span style=""></span></p>';

	// If already has HTML tags, return as-is
	if (!isPlainText(text)) {
		return text;
	}

	// Escape HTML entities in plain text to prevent XSS
	const escapedText = text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");

	// Split by newlines and wrap each paragraph
	const paragraphs = escapedText.split("\n").filter((line) => line.trim());

	if (paragraphs.length === 0) {
		return '<p class="editor-p-light"><span style=""></span></p>';
	}

	// Wrap each paragraph in proper HTML structure
	return paragraphs
		.map(
			(para) => `<p class="editor-p-light"><span style="">${para}</span></p>`
		)
		.join("");
}

/**
 * Ensures text is in rich text format
 * Converts plain text to rich text if needed
 */
export function ensureRichText(text: string): string {
	if (!text) return '<p class="editor-p-light"><span style=""></span></p>';

	return isPlainText(text) ? convertPlainTextToRichText(text) : text;
}
