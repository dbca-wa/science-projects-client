/**
 * Word Source Detector
 *
 * Detects whether clipboard HTML originates from Microsoft Word
 * and identifies the variant (Online vs Desktop).
 *
 * Detection priority:
 * 1. Word Online markers (highest priority — preferred when mixed)
 * 2. Word Desktop markers
 * 3. Generic Word markers (mso- styles → treated as desktop)
 */

export interface WordSource {
	isWord: boolean;
	variant: "online" | "desktop" | null;
}

/**
 * Inspects raw HTML for Word-specific markers and determines the source.
 *
 * When both Online and Desktop markers are present (mixed content from
 * copy-paste chains), Online detection is preferred because Word Online
 * produces more structured, predictable HTML.
 */
export function detectWordSource(html: string): WordSource {
	// Word Online markers
	const isOnline =
		html.includes("data-ccp-parastyle") ||
		html.includes("ListMarkerWrappingSpan") ||
		(html.includes('role="heading"') && html.includes("aria-level"));

	// Word Desktop markers
	const isDesktop =
		html.includes("urn:schemas-microsoft-com:office:word") ||
		html.includes("MsoNormal") ||
		html.includes("MsoListParagraph");

	// Generic Word markers (catch-all for mso- style prefixes)
	const isGenericWord = html.includes("mso-");

	// Priority: Online > Desktop > Generic
	if (isOnline) return { isWord: true, variant: "online" };
	if (isDesktop) return { isWord: true, variant: "desktop" };
	if (isGenericWord) return { isWord: true, variant: "desktop" };

	return { isWord: false, variant: null };
}
