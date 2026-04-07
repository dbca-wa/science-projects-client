import DOMPurify from "dompurify";

/**
 * HTML sanitisation utilities for rich text content
 *
 * Uses DOMPurify to sanitise HTML content and prevent XSS attacks.
 * Configured to allow standard formatting tags while stripping dangerous content.
 */

/**
 * Allowed HTML tags for rich text content
 */
const ALLOWED_TAGS = [
	// Paragraphs and headings
	"p",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	// Lists
	"ul",
	"ol",
	"li",
	// Links
	"a",
	// Formatting
	"strong",
	"em",
	"u",
	"s",
	"sub",
	"sup",
	"span",
	"br",
	// Additional semantic tags
	"blockquote",
	"code",
	"pre",
	// Tables
	"table",
	"thead",
	"tbody",
	"tfoot",
	"tr",
	"th",
	"td",
	"colgroup",
	"col",
];

/**
 * Allowed HTML attributes
 */
const ALLOWED_ATTR = [
	"href", // For links
	"target", // For links
	"rel", // For links
	"class", // For editor styling classes (editor-ul1, editor-li-light, etc.)
	"dir", // For text direction (ltr/rtl)
	"style", // For inline styles (white-space: pre-wrap, etc.)
	"value", // For list item numbering
];

/**
 * DOMPurify configuration for rich text content
 */
const SANITISE_CONFIG: Parameters<typeof DOMPurify.sanitize>[1] = {
	ALLOWED_TAGS,
	ALLOWED_ATTR,
	ALLOW_DATA_ATTR: false,
	ALLOW_UNKNOWN_PROTOCOLS: false,
	SAFE_FOR_TEMPLATES: true,
};

/**
 * Sanitise HTML content to prevent XSS attacks
 *
 * Removes dangerous scripts, attributes, and protocols while preserving
 * safe formatting tags and attributes.
 *
 * @param htmlContent - HTML string to sanitise
 * @returns Sanitised HTML string
 *
 * @example
 * sanitiseHtml("<p>Safe content</p>") // "<p>Safe content</p>"
 * sanitiseHtml("<script>alert('xss')</script>") // ""
 * sanitiseHtml("<p onclick='alert()'>Text</p>") // "<p>Text</p>"
 */
export function sanitiseHtml(htmlContent: string): string {
	if (!htmlContent || htmlContent.trim() === "") {
		return "";
	}

	return DOMPurify.sanitize(htmlContent, SANITISE_CONFIG) as string;
}

/**
 * Check if HTML content is safe (no dangerous content)
 *
 * @param htmlContent - HTML string to check
 * @returns True if content is safe, false otherwise
 */
export function isHtmlSafe(htmlContent: string): boolean {
	// Normalize whitespace for comparison
	const normalized = htmlContent.trim();
	const sanitised = sanitiseHtml(htmlContent).trim();

	// Empty strings are considered safe
	if (normalized === "" && sanitised === "") {
		return true;
	}

	return sanitised === normalized;
}

/**
 * Allowed HTML tags for diff content (includes span for highlighting)
 */
const DIFF_ALLOWED_TAGS = [
	...ALLOWED_TAGS,
	"span", // For diff highlighting
];

/**
 * Allowed HTML attributes for diff content (includes class and aria-label)
 */
const DIFF_ALLOWED_ATTR = [
	...ALLOWED_ATTR,
	"class", // For diff highlighting classes
	"aria-label", // For accessibility
];

/**
 * DOMPurify configuration for diff content
 */
const DIFF_SANITISE_CONFIG: Parameters<typeof DOMPurify.sanitize>[1] = {
	ALLOWED_TAGS: DIFF_ALLOWED_TAGS,
	ALLOWED_ATTR: DIFF_ALLOWED_ATTR,
	ALLOW_DATA_ATTR: false,
	ALLOW_UNKNOWN_PROTOCOLS: false,
	SAFE_FOR_TEMPLATES: true,
};

/**
 * Sanitise HTML content for diff display
 *
 * This is a specialized sanitizer for diff content that allows span tags
 * with class attributes for highlighting additions and deletions.
 *
 * SECURITY NOTE: This should ONLY be used for system-generated diff content,
 * NEVER for user-generated content. User content should use sanitiseHtml().
 *
 * @param htmlContent - HTML string to sanitise (system-generated diff content)
 * @returns Sanitised HTML string with diff highlighting preserved
 *
 * @example
 * // System-generated diff content
 * const diffHtml = '<p>Text with <span class="diff-addition">added</span> content</p>';
 * sanitiseDiffHtml(diffHtml); // Preserves span and class
 *
 * // DO NOT use for user content
 * const userHtml = '<p>User content</p>';
 * sanitiseHtml(userHtml); // Use regular sanitizer instead
 */
export function sanitiseDiffHtml(htmlContent: string): string {
	if (!htmlContent || htmlContent.trim() === "") {
		return "";
	}

	return DOMPurify.sanitize(htmlContent, DIFF_SANITISE_CONFIG) as string;
}
