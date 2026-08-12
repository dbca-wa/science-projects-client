/**
 * Word List Conversion
 *
 * Converts Word list patterns to semantic <ul>/<ol> elements with proper nesting.
 *
 * Word Online clipboard HTML uses:
 *   - <li> elements with data-aria-level for nesting depth
 *   - data-listid attribute to group items into the same list
 *   - data-list-defn-props JSON with font info for type detection
 *     (key "469769226" = font name; "Symbol"/"Wingdings" = bullet)
 *   - data-font attribute as a simpler type indicator
 *   - data-leveltext for number format patterns ("%1." = ordered)
 *   - Items may also have role="listitem" and aria-level (legacy/rendered page)
 *   - ListMarkerWrappingSpan with bullet/number markers (rendered page only)
 *
 * Word Desktop uses:
 *   - <p> elements with MsoListParagraphCxSpFirst/Middle/Last classes
 *   - Bullet characters inline: · (level 1), o (level 2), § (level 3)
 *   - Number patterns inline: 1. (level 1), a. (level 2), i. (level 3)
 *   - Nesting from mso-list style property or margin-left
 *
 * Maximum nesting depth is 3 levels. Higher values are clamped.
 * Skipped levels produce intermediate nested lists.
 */

import type { WordSource } from "./word-detector";

/** Maximum nesting depth for lists. */
const MAX_NESTING_DEPTH = 3;

/** Regex patterns for Word Desktop bullet detection. */
const DESKTOP_BULLET_L1 = /·\s*(<br\s*\/?>)?\s*/i;
const DESKTOP_BULLET_L2 = /o\s*(<br\s*\/?>)?\s*/i;
const DESKTOP_BULLET_L3 = /§\s*(<br\s*\/?>)?\s*/i;

/** Regex patterns for Word Desktop ordered list detection. */
const DESKTOP_ORDERED_L1 = /^[0-9]+\.\s*(<br\s*\/?>)?\s*/i;
const DESKTOP_ORDERED_L2 = /^[a-z]\.\s*(<br\s*\/?>)?\s*/i;
const DESKTOP_ORDERED_L3 = /^[ivxl]+\.\s*(<br\s*\/?>)?\s*/i;

// ─── Word Online List Conversion ────────────────────────────────────────────

/**
 * Determines whether a Word Online list item is ordered or unordered.
 *
 * Detection strategy (in priority order):
 * 1. data-list-defn-props JSON — "469769226" key holds the font name.
 *    "Symbol" or "Wingdings" → bullet (unordered).
 * 2. data-font attribute — same logic as above.
 * 3. data-leveltext attribute — "%1." pattern indicates ordered numbering.
 * 4. ListMarkerWrappingSpan content (legacy/rendered page HTML fallback).
 * 5. Default: unordered.
 */
function detectOnlineListType(li: Element): "ul" | "ol" {
	// Strategy 1: data-list-defn-props JSON (actual clipboard format)
	const defnProps = li.getAttribute("data-list-defn-props");
	if (defnProps) {
		try {
			const props = JSON.parse(defnProps) as Record<string, unknown>;
			// Key "469769226" is the list marker font
			const font = props["469769226"];
			if (typeof font === "string") {
				const lowerFont = font.toLowerCase();
				if (
					lowerFont === "symbol" ||
					lowerFont === "wingdings" ||
					lowerFont === "courier new"
				) {
					return "ul";
				}
				// Non-bullet font means ordered
				return "ol";
			}
		} catch {
			// Fall through to other detection methods
		}
	}

	// Strategy 2: data-font attribute
	const dataFont = li.getAttribute("data-font");
	if (dataFont) {
		const lowerFont = dataFont.toLowerCase();
		if (
			lowerFont === "symbol" ||
			lowerFont === "wingdings" ||
			lowerFont === "courier new"
		) {
			return "ul";
		}
		// Non-bullet font means ordered
		return "ol";
	}

	// Strategy 3: data-leveltext attribute — "%1." pattern = ordered
	const levelText = li.getAttribute("data-leveltext");
	if (levelText) {
		if (/^%\d/.test(levelText)) return "ol";
		// Bullet characters in leveltext
		if (levelText === "" || levelText === "\uf0b7" || levelText === "\u2022")
			return "ul";
	}

	// Strategy 4: ListMarkerWrappingSpan (legacy rendered-page HTML)
	const markerSpan = li.querySelector(".ListMarkerWrappingSpan");
	if (markerSpan) {
		const markerText = (markerSpan.textContent ?? "").trim();
		// Ordered patterns: "1.", "2.", "a.", "b.", "i.", "ii.", "iv." etc.
		if (/^\d+\.$/.test(markerText)) return "ol";
		if (/^[a-z]\.$/.test(markerText)) return "ol";
		if (/^[ivxl]+\.$/.test(markerText)) return "ol";
	}

	return "ul";
}

/**
 * Clamps a level value to the allowed range [1, MAX_NESTING_DEPTH].
 */
function clampLevel(level: number): number {
	if (level < 1) return 1;
	if (level > MAX_NESTING_DEPTH) return MAX_NESTING_DEPTH;
	return level;
}

/**
 * Extracts the content of a list item, handling various Word Online structures.
 *
 * Actual clipboard HTML has content in spans directly inside the <li>.
 * Rendered page HTML may have ParaWrappingDiv wrappers.
 * Both may have ListMarkerWrappingSpan that needs removal.
 */
function extractOnlineItemContent(
	li: Element,
	doc: Document
): DocumentFragment {
	// Work on a clone so we don't mutate the original before replacement
	const clone = li.cloneNode(true) as Element;

	// Remove marker span from clone (legacy rendered-page format)
	const markerSpan = clone.querySelector(".ListMarkerWrappingSpan");
	if (markerSpan) {
		markerSpan.remove();
	}

	// Remove EOP spans (Word Online end-of-paragraph markers)
	const eopSpans = clone.querySelectorAll(".EOP");
	eopSpans.forEach((eop) => eop.remove());

	// Check for ParaWrappingDiv — extract its inner content
	const paraDiv = clone.querySelector(".ParaWrappingDiv");
	const source = paraDiv ?? clone;

	const fragment = doc.createDocumentFragment();
	while (source.firstChild) {
		fragment.appendChild(source.firstChild);
	}

	return fragment;
}

/** Represents a group of Word Online list items and their wrapper elements. */
interface OnlineListGroup {
	items: Element[]; // The li[role="listitem"] elements in order
	wrappers: Element[]; // The auto-generated ul/ol wrappers to remove
}

/**
 * Finds the "grouping ancestor" for a list wrapper element.
 *
 * In Word Online HTML, each <ul>/<ol> is often wrapped in a <div> (e.g.
 * OutlineElement, ParaWrappingDiv). When grouping consecutive list items,
 * we need to check adjacency at the wrapper-div level, not the <ul> level.
 *
 * Returns the outermost single-child wrapper div, or the element itself
 * if it's not wrapped in a single-child div.
 */
function findGroupingAncestor(listWrapper: Element): Element {
	let current: Element = listWrapper;

	while (current.parentElement) {
		const parent = current.parentElement;

		// Stop at body or elements with multiple children
		if (parent.tagName === "BODY") break;

		// Only climb through single-child wrapper divs
		if (parent.tagName === "DIV" && parent.children.length === 1) {
			current = parent;
		} else {
			break;
		}
	}

	return current;
}

/**
 * Groups Word Online list items by their logical list membership.
 *
 * Finds all <ul>/<ol> wrapper elements that contain Word Online list items,
 * then groups consecutive wrappers (adjacent siblings in the DOM) into
 * logical lists. Items within each group are collected in document order.
 *
 * This handles two DOM structures:
 * 1. Multiple <li> in a single <ul> (simple case)
 * 2. Each <li> in its own <ul> inside a wrapper <div> (Word Online typical)
 *
 * For case 2, adjacency is checked at the wrapper-div level (e.g.
 * consecutive <div class="OutlineElement"> elements each containing a <ul>).
 */
function groupOnlineItemsByList(
	_doc: Document,
	allItems: Element[]
): OnlineListGroup[] {
	// Find all wrapper elements that contain Word Online list items
	const wrappersWithItems = new Set<Element>();
	for (const item of allItems) {
		const parent = item.parentElement;
		if (parent && (parent.tagName === "UL" || parent.tagName === "OL")) {
			wrappersWithItems.add(parent);
		}
	}

	// Also handle bare items (no wrapper parent — e.g. items directly in body/div)
	const bareItems: Element[] = [];
	for (const item of allItems) {
		const parent = item.parentElement;
		if (!parent || (parent.tagName !== "UL" && parent.tagName !== "OL")) {
			bareItems.push(item);
		}
	}

	// Map each wrapper to its grouping ancestor (the element we check adjacency on)
	const wrapperToAncestor = new Map<Element, Element>();
	const ancestorToWrappers = new Map<Element, Element[]>();

	for (const wrapper of wrappersWithItems) {
		const ancestor = findGroupingAncestor(wrapper);
		wrapperToAncestor.set(wrapper, ancestor);

		if (!ancestorToWrappers.has(ancestor)) {
			ancestorToWrappers.set(ancestor, []);
		}
		ancestorToWrappers.get(ancestor)!.push(wrapper);
	}

	// Group consecutive ancestors (adjacent siblings) into logical lists
	const groups: OnlineListGroup[] = [];
	const processedAncestors = new Set<Element>();

	for (const wrapper of wrappersWithItems) {
		const ancestor = wrapperToAncestor.get(wrapper)!;
		if (processedAncestors.has(ancestor)) continue;

		const group: OnlineListGroup = { items: [], wrappers: [] };

		// Collect this ancestor and any adjacent ancestor siblings that also contain list items
		let current: Element | null = ancestor;
		while (current) {
			// Check if this element is an ancestor that contains list wrappers
			const isListAncestor = processedAncestors.has(current)
				? false
				: ancestorToWrappers.has(current);

			// Also check if current IS a wrapper itself (case where ul is direct sibling)
			const isDirectWrapper =
				wrappersWithItems.has(current) && !processedAncestors.has(current);

			if (!isListAncestor && !isDirectWrapper) break;

			processedAncestors.add(current);

			if (isDirectWrapper) {
				// The element itself is a <ul>/<ol> wrapper
				group.wrappers.push(current);
				const items = Array.from(
					current.querySelectorAll(
						':scope > li[role="listitem"], :scope > li[aria-level], :scope > li[data-aria-level]'
					)
				);
				group.items.push(...items);
			} else if (isListAncestor) {
				// The element is a wrapper div containing <ul>/<ol> elements
				const containedWrappers = ancestorToWrappers.get(current)!;
				for (const w of containedWrappers) {
					group.wrappers.push(w);
					const items = Array.from(
						w.querySelectorAll(
							':scope > li[role="listitem"], :scope > li[aria-level], :scope > li[data-aria-level]'
						)
					);
					group.items.push(...items);
				}
			}

			current = current.nextElementSibling;
		}

		if (group.items.length > 0) {
			groups.push(group);
		}
	}

	// Handle bare items as a single group (if any exist without wrappers)
	if (bareItems.length > 0) {
		groups.push({ items: bareItems, wrappers: [] });
	}

	return groups;
}

/**
 * Builds a nested list structure from a group of Word Online list items.
 *
 * Uses a stack-based approach to track the current nesting depth.
 * When level increases, creates nested sub-lists (including intermediates
 * for skipped levels). When level decreases, pops back up the stack.
 *
 * Each item's list type is detected individually from its marker content.
 * This ensures ordered items (numbers, letters, roman numerals) produce
 * <ol> elements and unordered items (bullets) produce <ul> elements,
 * even when mixed within the same group at different nesting levels.
 */
function buildOnlineNestedList(
	doc: Document,
	items: Element[],
	rootListType: "ul" | "ol"
): HTMLElement {
	const rootList = doc.createElement(rootListType);

	// Stack tracks the list element at each depth level.
	// Index 0 = depth 1 (root), index 1 = depth 2, etc.
	const listStack: HTMLElement[] = [rootList];
	let currentLevel = 1;
	let lastLi: HTMLElement | null = null;

	for (const item of items) {
		const rawLevel = parseInt(
			item.getAttribute("data-aria-level") ??
				item.getAttribute("aria-level") ??
				"1",
			10
		);
		const level = clampLevel(Number.isNaN(rawLevel) ? 1 : rawLevel);

		// Detect the list type for THIS specific item
		const itemListType = detectOnlineListType(item);

		// Extract cleaned content
		const content = extractOnlineItemContent(item, doc);

		if (level > currentLevel) {
			// Need to nest deeper — create intermediate lists for skipped levels
			for (let i = currentLevel; i < level; i++) {
				const subList = doc.createElement(itemListType);

				// Attach sub-list to the last <li>, or to the current list if no <li> exists
				if (lastLi) {
					lastLi.appendChild(subList);
				} else {
					// Edge case: first item starts at level > 1
					const wrapperLi = doc.createElement("li");
					listStack[listStack.length - 1].appendChild(wrapperLi);
					wrapperLi.appendChild(subList);
					lastLi = wrapperLi;
				}

				listStack.push(subList);
			}
		} else if (level < currentLevel) {
			// Pop back up to the correct depth
			const popCount = currentLevel - level;
			for (let i = 0; i < popCount && listStack.length > 1; i++) {
				listStack.pop();
			}
		}

		// Create the <li> and append content
		const li = doc.createElement("li");
		li.appendChild(content);

		listStack[listStack.length - 1].appendChild(li);
		lastLi = li;
		currentLevel = level;
	}

	return rootList;
}

/**
 * Converts Word Online list items to proper semantic list elements.
 *
 * Instead of trying to unwrap <li> elements from auto-generated wrappers
 * (which is impossible — the DOM re-wraps orphan <li> elements immediately),
 * this function:
 * 1. Finds all <li role="listitem"> or <li data-aria-level> elements
 * 2. Groups them by logical list (consecutive wrapper elements or data-listid)
 * 3. Builds the correct nested list structure from level attributes
 * 4. Replaces the wrapper element(s) with the properly-built list
 */
function convertWordOnlineLists(doc: Document): void {
	// Try multiple selectors to find Word Online list items.
	// Priority: data-aria-level (actual clipboard), then role="listitem", then aria-level
	let listItems = Array.from(doc.querySelectorAll("li[data-aria-level]"));

	if (listItems.length === 0) {
		listItems = Array.from(doc.querySelectorAll('li[role="listitem"]'));
	}

	if (listItems.length === 0) {
		// Fallback: find li elements with aria-level (some browsers preserve this)
		listItems = Array.from(doc.querySelectorAll("li[aria-level]"));
	}

	if (listItems.length === 0) return;

	const groups = groupOnlineItemsByList(doc, listItems);

	for (const group of groups) {
		if (group.items.length === 0) continue;

		// Determine root list type from the first item's marker
		const rootListType = detectOnlineListType(group.items[0]);

		// Build the nested list structure
		const builtList = buildOnlineNestedList(doc, group.items, rootListType);

		// Replace the wrapper element(s) with the built list.
		// We need to replace at the grouping ancestor level to handle
		// the case where each <ul> is inside its own wrapper <div>.
		if (group.wrappers.length > 0) {
			// Find the grouping ancestor of the first wrapper — that's where we insert
			const firstAncestor = findGroupingAncestor(group.wrappers[0]);
			firstAncestor.replaceWith(builtList);

			// Remove remaining wrapper ancestors
			for (let i = 1; i < group.wrappers.length; i++) {
				const ancestor = findGroupingAncestor(group.wrappers[i]);
				// Only remove if it's still in the document (not already removed as a child)
				if (ancestor.parentNode) {
					ancestor.remove();
				}
			}
		} else {
			// Bare items (no wrapper) — replace the first item, remove the rest
			group.items[0].replaceWith(builtList);
			for (let i = 1; i < group.items.length; i++) {
				group.items[i].remove();
			}
		}
	}
}

// ─── Word Desktop List Conversion ───────────────────────────────────────────

/**
 * Determines whether a Word Desktop list paragraph is ordered or unordered
 * by inspecting its text content for bullet characters vs number patterns.
 *
 * Also checks for specific font families that indicate bullet markers
 * (Symbol, Wingdings, Courier New) in child spans, and the content of
 * mso-list:Ignore marker spans.
 */
function detectDesktopListType(p: Element): "ul" | "ol" {
	// Strategy 1: Check for bullet font families in child spans
	// Word Desktop uses Symbol font for level 1 bullets (·),
	// Courier New for level 2 (o), Wingdings for level 3 (§)
	const spans = p.querySelectorAll("span");
	for (const span of spans) {
		const style = span.getAttribute("style") || "";
		const fontFamily = style.toLowerCase();
		if (
			fontFamily.includes("font-family:symbol") ||
			fontFamily.includes("font-family: symbol") ||
			fontFamily.includes("font-family:wingdings") ||
			fontFamily.includes("font-family: wingdings")
		) {
			return "ul";
		}
	}

	// Strategy 2: Check mso-list:Ignore span content for the actual marker text
	// This is the most reliable method for Word for Mac clipboard HTML
	for (const span of spans) {
		const style = span.getAttribute("style") || "";
		if (
			style.includes("mso-list:Ignore") ||
			style.includes("mso-list: Ignore")
		) {
			const markerText = (span.textContent ?? "").trim();
			// Check ordered patterns on the isolated marker text
			if (/^[0-9]+\.$/.test(markerText)) return "ol";
			if (/^[a-z]\.$/.test(markerText)) return "ol";
			if (/^[ivxl]+\.$/.test(markerText)) return "ol";
			// If found a marker span but it's not ordered, it's a bullet
			return "ul";
		}
	}

	// Strategy 3: Check text content for patterns (fallback for older formats)
	const text = p.textContent ?? "";

	// Check for bullet characters first — but only at the START of text
	const trimmed = text.trim();
	if (/^·/.test(trimmed)) return "ul";
	if (/^§/.test(trimmed)) return "ul";

	// Check for ordered patterns at the start
	if (DESKTOP_ORDERED_L1.test(trimmed)) return "ol";
	if (DESKTOP_ORDERED_L2.test(trimmed)) return "ol";
	if (DESKTOP_ORDERED_L3.test(trimmed)) return "ol";

	// Standalone "o" at start (Courier New bullet for level 2)
	if (/^o\s/.test(trimmed)) return "ul";

	return "ul";
}

/**
 * Determines the nesting level of a Word Desktop list paragraph.
 *
 * Checks (in order of priority):
 * 1. mso-list style property (e.g., "mso-list:l0 level2 lfo1")
 * 2. margin-left value (36pt increments = 1 level)
 * 3. Bullet/number pattern matching
 *
 * Returns a clamped level between 1 and MAX_NESTING_DEPTH.
 */
function detectDesktopLevel(p: Element): number {
	const style = p.getAttribute("style") ?? "";

	// Check mso-list for explicit level (e.g., "mso-list:l0 level2 lfo1")
	const msoListMatch = style.match(/mso-list:\s*\w+\s+level(\d+)/i);
	if (msoListMatch) {
		const level = parseInt(msoListMatch[1], 10);
		return clampLevel(Number.isNaN(level) ? 1 : level);
	}

	// Check margin-left (36pt per level is the Word default)
	const marginMatch = style.match(/margin-left:\s*([\d.]+)pt/i);
	if (marginMatch) {
		const marginPt = parseFloat(marginMatch[1]);
		// 36pt = level 1, 72pt = level 2, 108pt = level 3
		const level = Math.max(1, Math.round(marginPt / 36));
		return clampLevel(level);
	}

	// Fallback: detect from bullet/number pattern
	const text = (p.textContent ?? "").trim();
	if (DESKTOP_BULLET_L3.test(text) || DESKTOP_ORDERED_L3.test(text)) return 3;
	if (DESKTOP_BULLET_L2.test(text) || DESKTOP_ORDERED_L2.test(text)) return 2;

	return 1;
}

/**
 * Strips the bullet/number marker from a Word Desktop list item's HTML content.
 * Preserves inline formatting that follows the marker.
 *
 * Word Desktop wraps list markers in spans with `mso-list:Ignore` style,
 * which may also contain spacer spans. After DOMPurify strips the conditional
 * comments that originally wrapped these, they become regular content.
 * This function removes those marker spans first, then falls back to
 * text-pattern matching for any remaining markers.
 */
function stripDesktopMarker(element: Element, listType: "ul" | "ol"): void {
	// Strategy 1: Remove spans with mso-list:Ignore (contains the marker + spacer)
	let removedMarkerSpans = false;
	const allSpans = Array.from(element.querySelectorAll("span"));
	for (const span of allSpans) {
		const style = span.getAttribute("style") || "";
		if (
			style.includes("mso-list:Ignore") ||
			style.includes("mso-list: Ignore")
		) {
			span.remove();
			removedMarkerSpans = true;
			continue;
		}
		// Also remove spacer spans that use tiny font sizes (7.0pt Times New Roman)
		// These are the &nbsp; spacers between the marker and content
		if (style.includes("font:7.0pt") || style.includes("font: 7.0pt")) {
			// Only remove if it only contains whitespace/nbsp
			const text = span.textContent || "";
			if (/^[\s\u00a0]*$/.test(text)) {
				span.remove();
				removedMarkerSpans = true;
			}
		}
	}

	// If we successfully removed mso-list:Ignore marker spans, the marker is gone.
	// Do NOT run the fallback text-based stripping — it will incorrectly match
	// content characters (e.g. "o" in "Number one" matching the bullet L2 regex).
	if (removedMarkerSpans) return;

	// Strategy 2: Text-based marker stripping for remaining markers
	// (fallback for HTML that doesn't use mso-list:Ignore pattern)
	const walker = element.ownerDocument.createTreeWalker(
		element,
		NodeFilter.SHOW_TEXT
	);

	let textNode = walker.nextNode() as Text | null;

	while (textNode) {
		const text = textNode.textContent ?? "";

		let regex: RegExp | null = null;

		if (listType === "ul") {
			// Try each bullet pattern
			if (DESKTOP_BULLET_L1.test(text)) regex = DESKTOP_BULLET_L1;
			else if (DESKTOP_BULLET_L2.test(text)) regex = DESKTOP_BULLET_L2;
			else if (DESKTOP_BULLET_L3.test(text)) regex = DESKTOP_BULLET_L3;
		} else {
			// Try each ordered pattern
			if (DESKTOP_ORDERED_L1.test(text)) regex = DESKTOP_ORDERED_L1;
			else if (DESKTOP_ORDERED_L2.test(text)) regex = DESKTOP_ORDERED_L2;
			else if (DESKTOP_ORDERED_L3.test(text)) regex = DESKTOP_ORDERED_L3;
		}

		if (regex) {
			textNode.textContent = text.replace(regex, "");
			return; // Only strip the first marker found
		}

		textNode = walker.nextNode() as Text | null;
	}
}

/**
 * Collects a group of consecutive Word Desktop list paragraphs starting
 * from a MsoListParagraphCxSpFirst element, through Middle elements,
 * ending at a MsoListParagraphCxSpLast element.
 */
function collectDesktopListGroup(startP: Element): Element[] {
	const middleClass = "MsoListParagraphCxSpMiddle";
	const lastClass = "MsoListParagraphCxSpLast";

	const group: Element[] = [startP];
	let next = startP.nextElementSibling;

	while (next) {
		if (
			next.classList.contains(middleClass) ||
			next.classList.contains(lastClass)
		) {
			group.push(next);
			if (next.classList.contains(lastClass)) break;
			next = next.nextElementSibling;
		} else {
			break;
		}
	}

	return group;
}

/**
 * Builds a nested list structure from a group of Word Desktop list paragraphs.
 *
 * Uses the same stack-based approach as the Online converter.
 * Strips marker content and preserves inline formatting.
 */
function buildDesktopNestedList(
	doc: Document,
	items: Element[],
	listType: "ul" | "ol"
): HTMLElement {
	const rootList = doc.createElement(listType);
	const listStack: HTMLElement[] = [rootList];
	let currentLevel = 1;
	let lastLi: HTMLElement | null = null;

	for (const item of items) {
		const level = detectDesktopLevel(item);

		// Create <li> with the paragraph's inner content
		const li = doc.createElement("li");
		li.innerHTML = item.innerHTML;

		// Strip the bullet/number marker from the content
		stripDesktopMarker(li, listType);

		// Trim leading/trailing whitespace in the li
		li.innerHTML = li.innerHTML.trim();

		if (level > currentLevel) {
			// Nest deeper — create intermediate lists for skipped levels
			for (let i = currentLevel; i < level; i++) {
				const subList = doc.createElement(listType);

				if (lastLi) {
					lastLi.appendChild(subList);
				} else {
					const wrapperLi = doc.createElement("li");
					listStack[listStack.length - 1].appendChild(wrapperLi);
					wrapperLi.appendChild(subList);
					lastLi = wrapperLi;
				}

				listStack.push(subList);
			}
		} else if (level < currentLevel) {
			// Pop back up to the correct depth
			const popCount = currentLevel - level;
			for (let i = 0; i < popCount && listStack.length > 1; i++) {
				listStack.pop();
			}
		}

		listStack[listStack.length - 1].appendChild(li);
		lastLi = li;
		currentLevel = level;
	}

	return rootList;
}

/**
 * Converts Word Desktop list paragraphs to proper semantic list elements.
 *
 * Finds all <p class="MsoListParagraphCxSpFirst"> elements, collects their
 * groups (First/Middle/Last), determines list type, builds nested structure,
 * and replaces the original paragraphs.
 */
function convertWordDesktopLists(doc: Document): void {
	const firstClass = "MsoListParagraphCxSpFirst";

	// Find all list start paragraphs
	const listStarts = Array.from(doc.querySelectorAll(`p.${firstClass}`));

	for (const startP of listStarts) {
		// Collect the full group (First + Middle* + Last)
		const group = collectDesktopListGroup(startP);

		// Determine list type from the first item
		const listType = detectDesktopListType(startP);

		// Build the nested list structure
		const builtList = buildDesktopNestedList(doc, group, listType);

		// Replace first element with the built list, remove the rest
		startP.replaceWith(builtList);
		for (let i = 1; i < group.length; i++) {
			group[i].remove();
		}
	}
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Converts Word list patterns to semantic <ul>/<ol> elements.
 *
 * Dispatches to the appropriate strategy based on the detected Word variant.
 * Word Online uses <li role="listitem"> with aria-level attributes.
 * Word Desktop uses <p> elements with MsoListParagraphCxSp* classes.
 */
export function convertLists(
	doc: Document,
	variant: WordSource["variant"] & ("online" | "desktop")
): void {
	if (variant === "online") {
		convertWordOnlineLists(doc);
	} else {
		convertWordDesktopLists(doc);
	}
}
