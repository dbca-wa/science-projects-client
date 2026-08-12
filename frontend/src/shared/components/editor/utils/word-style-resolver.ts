/**
 * Word Desktop Style Block Resolver
 *
 * Resolves class-based formatting from Word Desktop's `<style>` blocks into
 * inline styles BEFORE DOMPurify sanitisation runs.
 *
 * Word Desktop (particularly newer Microsoft 365 versions) applies formatting
 * via CSS classes defined in an accompanying `<style>` block rather than inline
 * styles. Since DOMPurify removes `<style>` elements for security, we must
 * resolve these classes to inline styles first so the formatting survives.
 *
 * Only formatting-relevant CSS properties are inlined:
 * - font-weight (bold)
 * - font-style (italic)
 * - text-decoration (underline, line-through)
 * - vertical-align (superscript, subscript)
 *
 * Non-formatting properties (font-family, font-size, color, line-height, etc.)
 * are intentionally discarded as they represent document defaults, not user decisions.
 *
 * Security: This runs on an inert DOM (DOMParser — no script execution).
 * DOMPurify still runs after this step as the definitive security boundary.
 */

/** CSS properties that represent intentional formatting decisions. */
const FORMATTING_PROPERTIES = new Set([
	"font-weight",
	"font-style",
	"text-decoration",
	"text-decoration-line",
	"vertical-align",
]);

/**
 * Represents a single CSS declaration (property: value).
 */
interface CSSDeclaration {
	property: string;
	value: string;
}

/**
 * Parses a CSS declaration block (the part between { and }) into individual declarations.
 * Only returns formatting-relevant declarations.
 */
function parseDeclarations(declarationBlock: string): CSSDeclaration[] {
	const declarations: CSSDeclaration[] = [];

	const parts = declarationBlock
		.split(";")
		.map((d) => d.trim())
		.filter((d) => d.length > 0);

	for (const part of parts) {
		const colonIndex = part.indexOf(":");
		if (colonIndex === -1) continue;

		const property = part.substring(0, colonIndex).trim().toLowerCase();
		const value = part.substring(colonIndex + 1).trim();

		if (FORMATTING_PROPERTIES.has(property) && value.length > 0) {
			declarations.push({ property, value });
		}
	}

	return declarations;
}

/**
 * Parses `<style>` elements and builds a map of class name → formatting declarations.
 *
 * Only processes simple class selectors (e.g. `.Bold0 { ... }`).
 * Complex selectors, element selectors, and pseudo-classes are ignored.
 */
function buildClassStyleMap(
	styleElements: NodeListOf<HTMLStyleElement>
): Map<string, CSSDeclaration[]> {
	const classMap = new Map<string, CSSDeclaration[]>();

	for (const styleEl of styleElements) {
		const cssText = styleEl.textContent || "";

		// Match simple class selectors: .ClassName { declarations }
		// Handles optional whitespace and multi-line content
		const rulePattern = /\.([a-zA-Z_][\w-]*)\s*\{([^}]*)\}/g;
		let match: RegExpExecArray | null;

		while ((match = rulePattern.exec(cssText)) !== null) {
			const className = match[1];
			const declarationBlock = match[2];

			const declarations = parseDeclarations(declarationBlock);

			if (declarations.length > 0) {
				// Merge with existing declarations for this class (if defined in multiple style blocks)
				const existing = classMap.get(className) || [];
				classMap.set(className, [...existing, ...declarations]);
			}
		}
	}

	return classMap;
}

/**
 * Merges resolved formatting declarations into an element's existing inline style.
 * Does not overwrite existing inline style declarations — only adds new ones.
 */
function mergeStylesOntoElement(
	el: Element,
	declarations: CSSDeclaration[]
): void {
	const existingStyle = el.getAttribute("style") || "";

	// Parse existing inline style to know what's already declared
	const existingProperties = new Set<string>();
	if (existingStyle) {
		const parts = existingStyle.split(";").map((d) => d.trim());
		for (const part of parts) {
			const colonIndex = part.indexOf(":");
			if (colonIndex !== -1) {
				existingProperties.add(
					part.substring(0, colonIndex).trim().toLowerCase()
				);
			}
		}
	}

	// Only add declarations for properties not already inline-styled
	const newDeclarations: string[] = [];
	for (const decl of declarations) {
		if (!existingProperties.has(decl.property)) {
			newDeclarations.push(`${decl.property}: ${decl.value}`);
		}
	}

	if (newDeclarations.length === 0) return;

	// Combine existing and new styles
	const combined = existingStyle
		? `${existingStyle.replace(/;?\s*$/, "")}; ${newDeclarations.join("; ")}`
		: newDeclarations.join("; ");

	el.setAttribute("style", combined);
}

/**
 * Resolves Word Desktop `<style>` block formatting classes into inline styles.
 *
 * This function must run BEFORE DOMPurify sanitisation so that formatting
 * information survives the removal of `<style>` elements.
 *
 * On any error, returns the input HTML unchanged (graceful degradation).
 *
 * @param html - Raw clipboard HTML from Word Desktop
 * @returns HTML with class-based formatting resolved to inline styles
 */
export function resolveWordDesktopStyles(html: string): string {
	try {
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, "text/html");

		// Find all <style> elements
		const styleElements = doc.querySelectorAll(
			"style"
		) as NodeListOf<HTMLStyleElement>;

		if (styleElements.length === 0) {
			// No style blocks to resolve — return unchanged
			return html;
		}

		// Build class → formatting declarations map
		const classMap = buildClassStyleMap(styleElements);

		if (classMap.size === 0) {
			// No formatting-relevant rules found — return unchanged
			return html;
		}

		// Walk all elements with class attributes and inline resolved styles
		const elementsWithClasses = doc.querySelectorAll("[class]");

		for (const el of elementsWithClasses) {
			const classList = el.getAttribute("class")?.split(/\s+/) || [];
			const matchingDeclarations: CSSDeclaration[] = [];

			for (const cls of classList) {
				const declarations = classMap.get(cls);
				if (declarations) {
					matchingDeclarations.push(...declarations);
				}
			}

			if (matchingDeclarations.length > 0) {
				mergeStylesOntoElement(el, matchingDeclarations);
			}
		}

		// Remove <style> elements (they'll be removed by DOMPurify anyway,
		// but removing here keeps the output clean for downstream processing)
		styleElements.forEach((el) => el.remove());

		return doc.body.innerHTML;
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Unknown error";
		console.warn(
			`[WordStyleResolver] Style resolution failed, using fallback: ${message}`
		);
		return html;
	}
}
