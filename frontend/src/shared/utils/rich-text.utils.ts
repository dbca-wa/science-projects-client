/**
 * Rich text content utilities
 *
 * Helpers for detecting plain text vs HTML, converting between formats,
 * and checking whether rich text editor content is meaningfully populated.
 */

/**
 * Check if a string is plain text (no HTML tags).
 * Only considers valid HTML tag names (letters, not arbitrary text in angle brackets).
 */
export const isPlainText = (text: string): boolean => {
	if (!text) return true;
	// Match opening/closing tags with valid HTML element names (e.g. <p>, <div>, </span>)
	// but not arbitrary text like <tags> or <123>
	return !/(<\/?\s*(?:p|div|span|br|h[1-6]|ul|ol|li|a|strong|em|b|i|u|table|tr|td|th|img|blockquote|pre|code|sub|sup|s|del|ins|mark|small|big|hr|section|article|header|footer|nav|aside|figure|figcaption|main|details|summary|dialog|template|slot|canvas|svg|video|audio|source|iframe|object|embed|form|input|textarea|select|button|label|fieldset|legend|datalist|output|option|optgroup|progress|meter|ruby|rt|rp|bdi|bdo|wbr|area|map|col|colgroup|caption|thead|tbody|tfoot|picture|time|data|address|abbr|cite|dfn|kbd|samp|var|q|dl|dt|dd|noscript|script|style|link|meta|base|head|body|html)\b[^>]*>)/i.test(
		text
	);
};

/**
 * Escape HTML entities in a string for safe insertion into HTML.
 */
const escapeHtml = (text: string): string => {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
};

/**
 * Convert plain text to Lexical-compatible rich text HTML.
 * If the input already contains HTML tags, returns it unchanged.
 * Handles multi-line text by wrapping each line in a paragraph.
 */
export const convertPlainTextToRichText = (text: string): string => {
	// If already HTML, return as-is
	if (!isPlainText(text)) return text;

	// Handle empty string
	if (!text) {
		return '<p class="editor-p-light"><span style=""></span></p>';
	}

	// Split by newlines and wrap each line
	const lines = text.split("\n");
	return lines
		.map(
			(line) =>
				`<p class="editor-p-light"><span style="">${escapeHtml(line)}</span></p>`
		)
		.join("");
};

/**
 * Ensure a string is valid rich text HTML.
 * Converts plain text to rich text if needed, leaves HTML unchanged.
 */
export const ensureRichText = (text: string): string => {
	return convertPlainTextToRichText(text);
};

/**
 * Common empty HTML patterns produced by Lexical when the editor has no content.
 * These are treated as "empty" for validation purposes.
 */
const EMPTY_HTML_PATTERNS = [
	"",
	"<p></p>",
	"<p><br></p>",
	'<p class="editor-paragraph"><br></p>',
	'<p class="editor-paragraph mb-2"><br></p>',
	'<p class="editor-paragraph"></p>',
	'<p class="editor-paragraph mb-2"></p>',
	'<p class="editor-p-light"><span style=""></span></p>',
];

/**
 * Check whether a rich text HTML string is effectively empty.
 *
 * Returns true if the content is null, undefined, whitespace-only,
 * or matches any of the common empty HTML patterns produced by Lexical.
 */
export const isRichTextEmpty = (html: string | null | undefined): boolean => {
	if (!html) return true;

	const trimmed = html.trim();
	if (trimmed.length === 0) return true;

	// Check against known empty patterns
	if (EMPTY_HTML_PATTERNS.includes(trimmed)) return true;

	// Strip all HTML tags and check if any text content remains
	const textContent = trimmed.replace(/<[^>]*>/g, "").trim();
	return textContent.length === 0;
};
