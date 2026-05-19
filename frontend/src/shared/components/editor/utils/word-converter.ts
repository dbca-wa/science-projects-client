/**
 * Word Converter Orchestrator
 *
 * Main entry point for converting Word HTML clipboard content into clean
 * semantic HTML that Lexical's $generateNodesFromDOM can process natively.
 *
 * Pipeline order:
 * 1. Parse HTML into a DOM document
 * 2. Convert headings (before formatting, as headings contain formatted spans)
 * 3. Convert lists (before formatting, as list items contain formatted spans)
 * 4. Convert inline formatting (spans → semantic elements)
 * 5. Clean up Word junk (classes, styles, attributes, empty elements)
 * 6. Serialise back to HTML string
 *
 * On any error, logs a warning and returns the input HTML unchanged
 * (already DOMPurify-sanitised by the caller).
 */

import { convertHeadings } from "./word-headings";
import { convertLists } from "./word-lists";
import { convertInlineFormatting } from "./word-formatting";
import { cleanupWordJunk } from "./word-cleanup";
import type { WordSource } from "./word-detector";

/**
 * Converts Word HTML into clean semantic HTML.
 *
 * Accepts sanitised HTML (post-DOMPurify) and the detected Word variant.
 * Returns a semantic HTML string suitable for Lexical node generation.
 *
 * If conversion fails for any reason, returns the input HTML unchanged
 * so the paste pipeline can continue with degraded but safe content.
 */
export function convertWordHTML(
	html: string,
	variant: WordSource["variant"] & ("online" | "desktop")
): string {
	try {
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, "text/html");

		// Step 1: Convert headings (before formatting, as headings contain formatted spans)
		convertHeadings(doc, variant);

		// Step 2: Convert lists (before formatting, as list items contain formatted spans)
		convertLists(doc, variant);

		// Step 3: Convert inline formatting (spans → semantic elements)
		convertInlineFormatting(doc);

		// Step 4: Clean up Word junk (classes, styles, attributes, empty elements)
		cleanupWordJunk(doc);

		return doc.body.innerHTML;
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Unknown error";
		console.warn(
			`[WordConverter] Conversion failed, using fallback: ${message}`
		);
		return html;
	}
}
