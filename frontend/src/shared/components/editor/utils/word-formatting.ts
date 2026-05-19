/**
 * Inline Formatting Conversion
 *
 * Converts Word's CSS/class-based inline formatting to semantic HTML elements.
 * Handles both Word Online (class-based) and Word Desktop (style-based) patterns.
 *
 * Detection covers: bold, italic, underline, strikethrough, superscript, subscript.
 * Wrapping uses a fixed nesting order: strong > em > u > s > sup/sub (outermost to innermost).
 */

export interface FormattingFlags {
	bold: boolean;
	italic: boolean;
	underline: boolean;
	strikethrough: boolean;
	superscript: boolean;
	subscript: boolean;
}

/**
 * Detects formatting applied to a span element via inline styles and CSS classes.
 *
 * Handles the `text-decoration` property containing both "underline" and "line-through"
 * simultaneously. Superscript and subscript are mutually exclusive — if both are detected,
 * subscript wins (checked last).
 */
export function detectFormatting(span: HTMLElement): FormattingFlags {
	const style = span.getAttribute("style") || "";
	const className = span.getAttribute("class") || "";

	const bold =
		className.includes("MacChromeBold") ||
		style.includes("font-weight: bold") ||
		style.includes("font-weight:bold") ||
		style.includes("font-weight: 700") ||
		style.includes("font-weight:700");

	const italic =
		style.includes("font-style: italic") || style.includes("font-style:italic");

	// text-decoration can contain both "underline" and "line-through" simultaneously
	const underline =
		className.includes("Underlined") || style.includes("underline");

	const strikethrough =
		className.includes("Strikethrough") || style.includes("line-through");

	const rawSuperscript =
		className.includes("Superscript") ||
		style.includes("vertical-align: super") ||
		style.includes("vertical-align:super");

	const rawSubscript =
		className.includes("Subscript") ||
		style.includes("vertical-align: sub") ||
		style.includes("vertical-align:sub");

	// Mutual exclusivity: if both detected, subscript wins (last declared)
	let superscript = rawSuperscript;
	let subscript = rawSubscript;
	if (rawSuperscript && rawSubscript) {
		superscript = false;
		subscript = true;
	}

	return {
		bold,
		italic,
		underline,
		strikethrough,
		superscript,
		subscript,
	};
}

/**
 * Wraps content in nested semantic elements based on detected formatting flags.
 *
 * Fixed nesting order (outermost to innermost): strong > em > u > s > sup/sub.
 * This means we apply innermost first, then wrap outward.
 */
export function wrapWithFormatting(
	doc: Document,
	content: DocumentFragment | Node,
	flags: FormattingFlags
): Node {
	let result: Node = content;

	// Apply innermost first, then wrap outward
	// Order (innermost → outermost): sup/sub → s → u → em → strong
	if (flags.subscript) {
		const sub = doc.createElement("sub");
		sub.appendChild(result);
		result = sub;
	} else if (flags.superscript) {
		const sup = doc.createElement("sup");
		sup.appendChild(result);
		result = sup;
	}

	if (flags.strikethrough) {
		const s = doc.createElement("s");
		s.appendChild(result);
		result = s;
	}

	if (flags.underline) {
		const u = doc.createElement("u");
		u.appendChild(result);
		result = u;
	}

	if (flags.italic) {
		const em = doc.createElement("em");
		em.appendChild(result);
		result = em;
	}

	if (flags.bold) {
		const strong = doc.createElement("strong");
		strong.appendChild(result);
		result = strong;
	}

	return result;
}

/**
 * Walks all span elements in the document and converts CSS/class-based
 * formatting to semantic HTML elements.
 *
 * - Skips spans with class `ListMarkerWrappingSpan` (handled by list conversion)
 * - Removes spans with class `EOP` (Word end-of-paragraph markers)
 * - Detects formatting and wraps content in semantic elements
 * - Unwraps spans with no formatting (promotes children to parent)
 */
export function convertInlineFormatting(doc: Document): void {
	const spans = Array.from(doc.querySelectorAll("span"));

	for (const span of spans) {
		// Skip ListMarkerWrappingSpan (handled by list conversion)
		if (span.classList.contains("ListMarkerWrappingSpan")) continue;

		// Remove EOP spans (Word end-of-paragraph markers)
		if (span.classList.contains("EOP")) {
			span.remove();
			continue;
		}

		const flags = detectFormatting(span);
		const hasFormatting = Object.values(flags).some(Boolean);

		if (hasFormatting) {
			// Move children to a fragment, preserving child structure
			const fragment = doc.createDocumentFragment();
			while (span.firstChild) {
				fragment.appendChild(span.firstChild);
			}

			// Wrap in semantic elements
			const wrapped = wrapWithFormatting(doc, fragment, flags);
			span.replaceWith(wrapped);
		} else {
			// No formatting detected — unwrap the span (promote children to parent)
			const fragment = doc.createDocumentFragment();
			while (span.firstChild) {
				fragment.appendChild(span.firstChild);
			}
			span.replaceWith(fragment);
		}
	}
}
