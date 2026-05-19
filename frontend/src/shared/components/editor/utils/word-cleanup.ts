/**
 * Word Junk Cleanup
 *
 * Removes all remaining Word-specific artefacts after conversion steps
 * (headings, lists, inline formatting) have consumed the relevant markers.
 *
 * Cleanup operations (in order):
 * 1. Remove style/script/meta/link elements
 * 2. Remove Word-specific classes from all elements
 * 3. Remove non-semantic inline styles (already consumed by formatting conversion)
 * 4. Remove Word-specific attributes (already consumed by heading/list conversion)
 * 5. Unwrap non-semantic wrapper divs (promote children)
 * 6. Remove empty elements bottom-up
 */

/** Word-specific classes to strip from elements. */
const WORD_CLASSES = new Set([
	"MacChromeBold",
	"Underlined",
	"Strikethrough",
	"Superscript",
	"Subscript",
	"ListMarkerWrappingSpan",
	"TextRun",
	"NormalTextRun",
	"EOP",
	"ParaWrappingDiv",
	"OutlineElement",
	"Paragraph",
	"PageContent",
	"Section",
	"SectionContent",
	"Track",
	"Header",
	"HeaderContent",
]);

/** Prefixes that identify a class as Word-specific (Mso*, mso*). */
const WORD_CLASS_PREFIXES = ["Mso", "mso"];

/** Non-semantic CSS properties to remove (already consumed by formatting conversion). */
const NON_SEMANTIC_PROPERTIES = new Set([
	"font-family",
	"font-size",
	"color",
	"background",
	"background-color",
	"font-kerning",
	"line-height",
	"vertical-align",
]);

/** Word-specific attributes to remove after conversion has consumed them. */
const WORD_ATTRIBUTES = [
	"lang",
	"xml:lang",
	"role",
	"aria-level",
	"aria-setsize",
	"aria-posinset",
	"paraid",
	"paraeid",
	"box-id",
];

/** Data attributes with these prefixes are Word-specific. */
const WORD_DATA_ATTR_PREFIXES = ["data-ccp-"];

/** Standalone data attributes to remove. */
const WORD_DATA_ATTRS = ["data-contrast", "data-fontsize"];

/** Wrapper div classes whose elements should be unwrapped (children promoted). */
const WRAPPER_DIV_CLASSES = new Set([
	"ParaWrappingDiv",
	"OutlineElement",
	"PageContent",
	"Section",
	"SectionContent",
	"Track",
]);

/** Elements that are considered meaningful even when empty. */
const SELF_CLOSING_MEANINGFUL = new Set(["BR", "IMG"]);

/**
 * Returns true if a CSS class is Word-specific and should be removed.
 */
function isWordClass(cls: string): boolean {
	if (WORD_CLASSES.has(cls)) return true;
	return WORD_CLASS_PREFIXES.some((prefix) => cls.startsWith(prefix));
}

/**
 * Returns true if a CSS property name is non-semantic and should be removed.
 * Handles mso-* prefixed properties as well.
 */
function isNonSemanticProperty(propertyName: string): boolean {
	if (NON_SEMANTIC_PROPERTIES.has(propertyName)) return true;
	return propertyName.startsWith("mso-");
}

/**
 * Removes style, script, meta, and link elements from the document.
 */
function removeMetaElements(doc: Document): void {
	const selectors = "style, script, meta, link";
	const elements = doc.querySelectorAll(selectors);
	elements.forEach((el) => el.remove());
}

/**
 * Removes Word-specific classes from an element.
 * Removes the class attribute entirely when no classes remain.
 */
function cleanElementClasses(el: Element): void {
	const className = el.getAttribute("class");
	if (!className) return;

	const classes = className.split(/\s+/).filter((cls) => cls.length > 0);
	const remaining = classes.filter((cls) => !isWordClass(cls));

	if (remaining.length === 0) {
		el.removeAttribute("class");
	} else if (remaining.length !== classes.length) {
		el.setAttribute("class", remaining.join(" "));
	}
}

/**
 * Removes non-semantic inline styles from an element.
 * Removes the style attribute entirely when no properties remain.
 */
function cleanElementStyles(el: Element): void {
	const style = el.getAttribute("style");
	if (!style) return;

	const declarations = style
		.split(";")
		.map((decl) => decl.trim())
		.filter((decl) => decl.length > 0);

	const remaining = declarations.filter((decl) => {
		const colonIndex = decl.indexOf(":");
		if (colonIndex === -1) return false;
		const property = decl.substring(0, colonIndex).trim();
		return !isNonSemanticProperty(property);
	});

	if (remaining.length === 0) {
		el.removeAttribute("style");
	} else if (remaining.length !== declarations.length) {
		el.setAttribute("style", remaining.join("; "));
	}
}

/**
 * Removes Word-specific attributes from an element.
 * Handles both fixed attribute names and data-* prefix patterns.
 */
function cleanElementAttributes(el: Element): void {
	// Remove fixed Word attributes
	for (const attr of WORD_ATTRIBUTES) {
		el.removeAttribute(attr);
	}

	// Remove data-ccp-* and other Word data attributes
	const attrsToRemove: string[] = [];

	for (const attr of Array.from(el.attributes)) {
		const name = attr.name;

		if (WORD_DATA_ATTRS.includes(name)) {
			attrsToRemove.push(name);
			continue;
		}

		if (WORD_DATA_ATTR_PREFIXES.some((prefix) => name.startsWith(prefix))) {
			attrsToRemove.push(name);
		}
	}

	for (const name of attrsToRemove) {
		el.removeAttribute(name);
	}
}

/**
 * Unwraps non-semantic wrapper divs by promoting their children
 * into the parent at the same position.
 */
function unwrapWrapperDivs(doc: Document): void {
	// Build a selector for all wrapper classes
	const selectors = Array.from(WRAPPER_DIV_CLASSES)
		.map((cls) => `div.${cls}`)
		.join(", ");

	// Process bottom-up to handle nested wrappers correctly
	let wrappers = Array.from(doc.querySelectorAll(selectors));

	while (wrappers.length > 0) {
		for (const wrapper of wrappers) {
			const parent = wrapper.parentNode;
			if (!parent) continue;

			// Move all children before the wrapper
			while (wrapper.firstChild) {
				parent.insertBefore(wrapper.firstChild, wrapper);
			}

			// Remove the now-empty wrapper
			parent.removeChild(wrapper);
		}

		// Re-query in case unwrapping revealed more nested wrappers
		wrappers = Array.from(doc.querySelectorAll(selectors));
	}
}

/**
 * Removes empty elements bottom-up.
 *
 * An element is considered empty if it:
 * - Has no text content (after trimming)
 * - Has no meaningful children (only other empty elements)
 * - Is not a self-closing meaningful element (br, img)
 *
 * Iterates until no more empty elements are found (handles nested empties).
 */
function removeEmptyElements(doc: Document): void {
	let changed = true;

	while (changed) {
		changed = false;
		const elements = Array.from(doc.body.querySelectorAll("*"));

		for (const el of elements) {
			// Skip meaningful self-closing elements
			if (SELF_CLOSING_MEANINGFUL.has(el.tagName)) continue;

			// Skip elements that contain meaningful children
			const hasMeaningfulChild = Array.from(el.children).some((child) =>
				SELF_CLOSING_MEANINGFUL.has(child.tagName)
			);
			if (hasMeaningfulChild) continue;

			// Remove if no text content and no children (or only empty children)
			const textContent = el.textContent?.trim() ?? "";
			if (textContent === "" && el.children.length === 0) {
				el.remove();
				changed = true;
			}
		}
	}
}

/**
 * Removes all remaining Word-specific artefacts from a document.
 *
 * This function runs AFTER heading, list, and inline formatting conversion
 * have consumed the relevant Word markers. It strips leftover classes,
 * styles, attributes, wrapper elements, and empty elements.
 */
export function cleanupWordJunk(doc: Document): void {
	// Step 1: Remove style/script/meta/link elements
	removeMetaElements(doc);

	// Step 2–4: Clean classes, styles, and attributes on all elements
	const allElements = Array.from(doc.querySelectorAll("*"));
	for (const el of allElements) {
		cleanElementClasses(el);
		cleanElementStyles(el);
		cleanElementAttributes(el);
	}

	// Step 5: Unwrap non-semantic wrapper divs (promote children)
	unwrapWrapperDivs(doc);

	// Step 6: Remove empty elements bottom-up
	removeEmptyElements(doc);
}
