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
 *
 * Also detects MSO-specific properties used by Word Desktop:
 * - mso-bidi-font-weight: bold
 * - mso-bidi-font-style: italic
 */
export function detectFormatting(span: HTMLElement): FormattingFlags {
	const style = span.getAttribute("style") || "";
	const className = span.getAttribute("class") || "";

	const bold =
		className.includes("MacChromeBold") ||
		style.includes("font-weight: bold") ||
		style.includes("font-weight:bold") ||
		style.includes("font-weight: 700") ||
		style.includes("font-weight:700") ||
		style.includes("mso-bidi-font-weight: bold") ||
		style.includes("mso-bidi-font-weight:bold");

	const italic =
		style.includes("font-style: italic") ||
		style.includes("font-style:italic") ||
		style.includes("mso-bidi-font-style: italic") ||
		style.includes("mso-bidi-font-style:italic");

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
 * Detects formatting on a `<b>` or `<i>` element.
 *
 * These elements carry implicit formatting (bold for `<b>`, italic for `<i>`)
 * unless explicitly overridden by inline styles (e.g. `font-weight: normal`).
 * Additional formatting from inline styles is also detected.
 *
 * IMPORTANT: `mso-bidi-font-weight:normal` and `mso-bidi-font-style:normal`
 * are NOT overrides — they are bidirectional text directives for RTL languages.
 * The check must exclude mso-bidi- prefixed properties from override detection.
 */
export function detectFormattingOnBoldItalicElement(
	el: HTMLElement,
	tagName: "b" | "i"
): FormattingFlags {
	const style = el.getAttribute("style") || "";

	// Start with the implicit formatting from the tag itself
	let bold = tagName === "b";
	let italic = tagName === "i";

	// Check for explicit override: <b style="font-weight: normal"> means NOT bold
	// BUT: must NOT match "mso-bidi-font-weight:normal" which is a bidi directive, not an override
	if (tagName === "b") {
		const hasFontWeightNormal =
			style.includes("font-weight: normal") ||
			style.includes("font-weight:normal");
		const onlyMsoBidi = !style.match(/(?<![a-z-])font-weight:\s*normal/i);

		if (hasFontWeightNormal && !onlyMsoBidi) {
			// There IS a standalone font-weight:normal (not just mso-bidi-font-weight:normal)
			bold = false;
		} else if (hasFontWeightNormal) {
			// Check if there's a standalone font-weight:normal in addition to the mso-bidi one
			// Parse declarations to check for a non-mso-prefixed font-weight:normal
			const hasStandaloneFontWeightNormal = hasStandaloneProperty(
				style,
				"font-weight",
				"normal"
			);
			if (hasStandaloneFontWeightNormal) {
				bold = false;
			}
		}
	}

	// Check for explicit override: <i style="font-style: normal"> means NOT italic
	// BUT: must NOT match "mso-bidi-font-style:normal" which is a bidi directive, not an override
	if (tagName === "i") {
		const hasFontStyleNormal =
			style.includes("font-style: normal") ||
			style.includes("font-style:normal");

		if (hasFontStyleNormal) {
			const hasStandaloneFontStyleNormal = hasStandaloneProperty(
				style,
				"font-style",
				"normal"
			);
			if (hasStandaloneFontStyleNormal) {
				italic = false;
			}
		}
	}

	// Detect additional formatting from inline styles
	// A <b> can also carry italic, underline, etc.
	if (tagName === "b") {
		if (
			style.includes("font-style: italic") ||
			style.includes("font-style:italic")
		) {
			italic = true;
		}
	}

	if (tagName === "i") {
		if (
			style.includes("font-weight: bold") ||
			style.includes("font-weight:bold") ||
			style.includes("font-weight: 700") ||
			style.includes("font-weight:700")
		) {
			bold = true;
		}
	}

	const underline = style.includes("underline");
	const strikethrough = style.includes("line-through");

	const rawSuperscript =
		style.includes("vertical-align: super") ||
		style.includes("vertical-align:super");
	const rawSubscript =
		style.includes("vertical-align: sub") ||
		style.includes("vertical-align:sub");

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
 * Checks whether a standalone (non-mso-prefixed) CSS property with a given value
 * exists in a style string.
 *
 * For example, given style "mso-bidi-font-weight:normal; font-weight:normal",
 * hasStandaloneProperty(style, "font-weight", "normal") returns true.
 * But given "mso-bidi-font-weight:normal",
 * hasStandaloneProperty(style, "font-weight", "normal") returns false.
 */
function hasStandaloneProperty(
	style: string,
	property: string,
	value: string
): boolean {
	// Split by semicolons to get individual declarations
	const declarations = style.split(";").map((d) => d.trim());

	for (const decl of declarations) {
		if (!decl) continue;
		const colonIndex = decl.indexOf(":");
		if (colonIndex === -1) continue;

		const prop = decl.substring(0, colonIndex).trim().toLowerCase();
		const val = decl
			.substring(colonIndex + 1)
			.trim()
			.toLowerCase();

		// Must be exactly the property name (not mso-bidi-font-weight, etc.)
		if (prop === property && val === value) {
			return true;
		}
	}

	return false;
}

/**
 * Walks all span elements in the document and converts CSS/class-based
 * formatting to semantic HTML elements.
 *
 * - Skips spans with class `ListMarkerWrappingSpan` (handled by list conversion)
 * - Removes spans with class `EOP` (Word end-of-paragraph markers)
 * - Detects formatting and wraps content in semantic elements
 * - Unwraps spans with no formatting (promotes children to parent)
 *
 * Also converts `<b>` and `<i>` elements (used by Word Desktop) to semantic
 * elements, handling edge cases like `<b style="font-weight:normal">`.
 */
export function convertInlineFormatting(doc: Document): void {
	// Phase 1: Process span elements (Word Online pattern)
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

	// Phase 2: Process <b> elements (Word Desktop bold pattern)
	const boldElements = Array.from(doc.querySelectorAll("b"));

	for (const el of boldElements) {
		const flags = detectFormattingOnBoldItalicElement(el as HTMLElement, "b");
		const hasFormatting = Object.values(flags).some(Boolean);

		const fragment = doc.createDocumentFragment();
		while (el.firstChild) {
			fragment.appendChild(el.firstChild);
		}

		if (hasFormatting) {
			const wrapped = wrapWithFormatting(doc, fragment, flags);
			el.replaceWith(wrapped);
		} else {
			// <b style="font-weight: normal"> — not actually bold, unwrap
			el.replaceWith(fragment);
		}
	}

	// Phase 3: Process <i> elements (Word Desktop italic pattern)
	const italicElements = Array.from(doc.querySelectorAll("i"));

	for (const el of italicElements) {
		const flags = detectFormattingOnBoldItalicElement(el as HTMLElement, "i");
		const hasFormatting = Object.values(flags).some(Boolean);

		const fragment = doc.createDocumentFragment();
		while (el.firstChild) {
			fragment.appendChild(el.firstChild);
		}

		if (hasFormatting) {
			const wrapped = wrapWithFormatting(doc, fragment, flags);
			el.replaceWith(wrapped);
		} else {
			// <i style="font-style: normal"> — not actually italic, unwrap
			el.replaceWith(fragment);
		}
	}
}
