/**
 * Word Heading Conversion
 *
 * Converts Word heading patterns to proper semantic <h1>–<h6> elements.
 *
 * Word Online uses:
 *   - <p role="heading" aria-level="N"> with valid N in 1–6
 *   - Inner spans with data-ccp-parastyle="heading N" (case-insensitive)
 *
 * Word Desktop uses:
 *   - <p class="MsoHeading1"> through <p class="MsoHeading6">
 *
 * Invalid aria-level values (outside 1–6, non-numeric, NaN) cause the
 * paragraph to be treated as a regular paragraph regardless of any other
 * heading indicators present on the element.
 */

import type { WordSource } from "./word-detector";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/**
 * Returns true if the parsed level is a valid heading level (1–6).
 */
function isValidHeadingLevel(level: number): level is HeadingLevel {
	return Number.isInteger(level) && level >= 1 && level <= 6;
}

/**
 * Detects heading level from a Word Online paragraph element.
 *
 * Checks role="heading" + aria-level first. If aria-level is present but
 * invalid, returns null immediately — the paragraph is treated as regular
 * text regardless of other indicators (data-ccp-parastyle, classes, etc.).
 *
 * Falls back to checking data-ccp-parastyle on inner spans.
 */
function detectOnlineHeadingLevel(
	p: HTMLParagraphElement
): HeadingLevel | null {
	const role = p.getAttribute("role");
	const ariaLevel = p.getAttribute("aria-level");

	// If role="heading" is present with an aria-level attribute, validate it
	if (role === "heading" && ariaLevel !== null) {
		const parsed = parseInt(ariaLevel, 10);

		if (isValidHeadingLevel(parsed)) {
			return parsed;
		}

		// Invalid aria-level — treat as regular paragraph, skip all other checks
		return null;
	}

	// Check data-ccp-parastyle on inner spans (case-insensitive)
	const spans = p.querySelectorAll("[data-ccp-parastyle]");

	for (const span of spans) {
		const parastyle = (
			span.getAttribute("data-ccp-parastyle") ?? ""
		).toLowerCase();
		const match = parastyle.match(/^heading\s+(\d)$/);

		if (match) {
			const parsed = parseInt(match[1], 10);

			if (isValidHeadingLevel(parsed)) {
				return parsed;
			}
		}
	}

	return null;
}

/**
 * Detects heading level from a Word Desktop paragraph element.
 *
 * Looks for MsoHeading[1-6] in the class attribute (case-insensitive).
 */
function detectDesktopHeadingLevel(
	p: HTMLParagraphElement
): HeadingLevel | null {
	const className = p.getAttribute("class") ?? "";
	const match = className.match(/MsoHeading(\d)/i);

	if (match) {
		const parsed = parseInt(match[1], 10);

		if (isValidHeadingLevel(parsed)) {
			return parsed;
		}
	}

	return null;
}

/**
 * Converts Word heading patterns to semantic <h1>–<h6> elements.
 *
 * Iterates all <p> elements in the document and replaces those identified
 * as headings with the appropriate heading element, preserving innerHTML.
 */
export function convertHeadings(
	doc: Document,
	variant: WordSource["variant"] & ("online" | "desktop")
): void {
	const paragraphs = Array.from(doc.querySelectorAll("p"));

	for (const p of paragraphs) {
		const level =
			variant === "online"
				? detectOnlineHeadingLevel(p)
				: detectDesktopHeadingLevel(p);

		if (level !== null) {
			const tag: HeadingTag = `h${level}`;
			const heading = doc.createElement(tag);
			heading.innerHTML = p.innerHTML;
			p.replaceWith(heading);
		}
	}
}
