/**
 * Comprehensive integration tests for the Word HTML conversion pipeline.
 *
 * Tests the full pipeline: convertWordHTML (orchestrator) and detectWordSource.
 * Verifies formatting, headings, lists, junk removal, mode stripping,
 * non-Word passthrough, and error fallback behaviour.
 */

import { describe, it, expect } from "vitest";
import { convertWordHTML } from "./word-converter";
import { detectWordSource } from "./word-detector";
import {
	ONLINE_BOLD,
	ONLINE_ITALIC,
	ONLINE_UNDERLINE,
	ONLINE_STRIKETHROUGH,
	ONLINE_SUPERSCRIPT,
	ONLINE_SUBSCRIPT,
	ONLINE_BOLD_ITALIC,
	ONLINE_BOLD_ITALIC_UNDERLINE,
	ONLINE_BOLD_STRIKETHROUGH,
	ONLINE_HEADING_1,
	ONLINE_HEADING_2,
	ONLINE_HEADING_3,
	ONLINE_UNORDERED_LIST_NESTED,
	ONLINE_ORDERED_LIST_NESTED,
	ONLINE_JUNK_HEAVY,
	ONLINE_UNORDERED_LIST_NESTED_WRAPPED,
	ONLINE_ORDERED_LIST_NESTED_WRAPPED,
	ONLINE_ORDERED_LIST_MULTIPLE_WRAPPERS,
	ONLINE_CLIPBOARD_UNORDERED_LIST,
	ONLINE_CLIPBOARD_ORDERED_LIST,
	ONLINE_CLIPBOARD_ORDERED_LIST_3_LEVELS,
} from "./__fixtures__/word-online-samples";
import {
	DESKTOP_BOLD,
	DESKTOP_ITALIC,
	DESKTOP_UNDERLINE,
	DESKTOP_STRIKETHROUGH,
	DESKTOP_SUPERSCRIPT,
	DESKTOP_SUBSCRIPT,
	DESKTOP_BOLD_ITALIC,
	DESKTOP_BOLD_ITALIC_UNDERLINE,
	DESKTOP_BOLD_STRIKETHROUGH,
	DESKTOP_HEADING_1,
	DESKTOP_HEADING_2,
	DESKTOP_HEADING_3,
	DESKTOP_UNORDERED_LIST_NESTED,
	DESKTOP_ORDERED_LIST_NESTED,
	DESKTOP_JUNK_HEAVY,
} from "./__fixtures__/word-desktop-samples";
import { TOOLBAR_CONFIGS } from "../toolbar/toolbar-configs";
import type { ToolbarMode } from "@/shared/types/editor.types";

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Parses HTML and applies stripDisallowedContent logic for a given mode.
 * Replicates the PastePlugin pipeline: convert → parse → strip → serialise.
 */
function convertAndStrip(
	html: string,
	variant: "online" | "desktop",
	mode: ToolbarMode
): string {
	const converted = convertWordHTML(html, variant);
	const parser = new DOMParser();
	const doc = parser.parseFromString(converted, "text/html");

	// Replicate stripDisallowedContent from PastePlugin
	const config = TOOLBAR_CONFIGS[mode];

	// Strip lists
	if (!config.blocks.lists) {
		const listItems = doc.querySelectorAll("li");
		listItems.forEach((li) => {
			const p = doc.createElement("p");
			p.innerHTML = li.innerHTML;
			li.replaceWith(p);
		});
		const lists = doc.querySelectorAll("ul, ol");
		lists.forEach((list) => {
			const fragment = doc.createDocumentFragment();
			while (list.firstChild) {
				fragment.appendChild(list.firstChild);
			}
			list.replaceWith(fragment);
		});
	}

	// Strip tables
	if (!config.blocks.tables) {
		const tables = doc.querySelectorAll("table");
		tables.forEach((table) => {
			const fragment = doc.createDocumentFragment();
			const cells = table.querySelectorAll("td, th");
			cells.forEach((cell) => {
				const textContent = cell.textContent?.trim();
				if (textContent) {
					const p = doc.createElement("p");
					p.textContent = textContent;
					fragment.appendChild(p);
				}
			});
			table.replaceWith(fragment);
		});
	}

	// Strip headings
	if (!config.blocks.headings) {
		const headings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");
		headings.forEach((heading) => {
			const p = doc.createElement("p");
			p.innerHTML = heading.innerHTML;
			heading.replaceWith(p);
		});
	}

	// Strip bold
	if (!config.formatting.bold) {
		doc.querySelectorAll("strong, b").forEach((el) => {
			const fragment = doc.createDocumentFragment();
			while (el.firstChild) fragment.appendChild(el.firstChild);
			el.replaceWith(fragment);
		});
	}

	// Strip italic
	if (!config.formatting.italic) {
		doc.querySelectorAll("em, i").forEach((el) => {
			const fragment = doc.createDocumentFragment();
			while (el.firstChild) fragment.appendChild(el.firstChild);
			el.replaceWith(fragment);
		});
	}

	// Strip underline
	if (!config.formatting.underline) {
		doc.querySelectorAll("u").forEach((el) => {
			const fragment = doc.createDocumentFragment();
			while (el.firstChild) fragment.appendChild(el.firstChild);
			el.replaceWith(fragment);
		});
	}

	// Strip strikethrough
	if (!config.formatting.strikethrough) {
		doc.querySelectorAll("s, del").forEach((el) => {
			const fragment = doc.createDocumentFragment();
			while (el.firstChild) fragment.appendChild(el.firstChild);
			el.replaceWith(fragment);
		});
	}

	// Strip superscript
	if (!config.formatting.superscript) {
		doc.querySelectorAll("sup").forEach((el) => {
			const fragment = doc.createDocumentFragment();
			while (el.firstChild) fragment.appendChild(el.firstChild);
			el.replaceWith(fragment);
		});
	}

	// Strip subscript
	if (!config.formatting.subscript) {
		doc.querySelectorAll("sub").forEach((el) => {
			const fragment = doc.createDocumentFragment();
			while (el.firstChild) fragment.appendChild(el.firstChild);
			el.replaceWith(fragment);
		});
	}

	// Strip links
	if (!config.features.links) {
		doc.querySelectorAll("a").forEach((el) => {
			const fragment = doc.createDocumentFragment();
			while (el.firstChild) fragment.appendChild(el.firstChild);
			el.replaceWith(fragment);
		});
	}

	// Strip images
	if (!config.features.images) {
		doc.querySelectorAll("img").forEach((img) => img.remove());
	}

	return doc.body.innerHTML;
}

// ─── detectWordSource Tests ─────────────────────────────────────────────────

describe("detectWordSource", () => {
	it("detects Word Online from data-ccp-parastyle", () => {
		const result = detectWordSource(ONLINE_HEADING_1);
		expect(result).toEqual({ isWord: true, variant: "online" });
	});

	it("detects Word Desktop from MsoNormal class", () => {
		const result = detectWordSource(DESKTOP_BOLD);
		expect(result).toEqual({ isWord: true, variant: "desktop" });
	});

	it("returns non-Word for plain HTML", () => {
		const result = detectWordSource("<p>Just a normal paragraph</p>");
		expect(result).toEqual({ isWord: false, variant: null });
	});

	it("prefers Online when both Online and Desktop markers present", () => {
		const mixed = `<p class="MsoNormal"><span data-ccp-parastyle="Normal">Mixed</span></p>`;
		const result = detectWordSource(mixed);
		expect(result).toEqual({ isWord: true, variant: "online" });
	});
});

// ─── Inline Formatting Tests ────────────────────────────────────────────────

describe("convertWordHTML — inline formatting", () => {
	describe("Word Online", () => {
		it("converts bold span to <strong>", () => {
			const result = convertWordHTML(ONLINE_BOLD, "online");
			expect(result).toContain("<strong>");
			expect(result).toContain("Bold text");
			expect(result).not.toContain("MacChromeBold");
		});

		it("converts italic span to <em>", () => {
			const result = convertWordHTML(ONLINE_ITALIC, "online");
			expect(result).toContain("<em>");
			expect(result).toContain("Italic text");
			expect(result).not.toContain("font-style");
		});

		it("converts underline span to <u>", () => {
			const result = convertWordHTML(ONLINE_UNDERLINE, "online");
			expect(result).toContain("<u>");
			expect(result).toContain("Underline text");
			expect(result).not.toContain("Underlined");
		});

		it("converts strikethrough span to <s>", () => {
			const result = convertWordHTML(ONLINE_STRIKETHROUGH, "online");
			expect(result).toContain("<s>");
			expect(result).toContain("Strikethrough text");
			// Verify the Word-specific class is removed (class attribute gone)
			expect(result).not.toContain('class="Strikethrough"');
			expect(result).not.toContain("text-decoration");
		});

		it("converts superscript span to <sup>", () => {
			const result = convertWordHTML(ONLINE_SUPERSCRIPT, "online");
			expect(result).toContain("<sup>");
			expect(result).toContain("Superscript text");
			expect(result).not.toContain("vertical-align");
		});

		it("converts subscript span to <sub>", () => {
			const result = convertWordHTML(ONLINE_SUBSCRIPT, "online");
			expect(result).toContain("<sub>");
			expect(result).toContain("Subscript text");
			expect(result).not.toContain("vertical-align");
		});
	});

	describe("Word Desktop", () => {
		it("converts bold <b> tag (preserves semantic element)", () => {
			const result = convertWordHTML(DESKTOP_BOLD, "desktop");
			expect(result).toContain("Bold text");
			// Desktop uses <b> which is already semantic — cleanup removes junk
			expect(result).not.toContain("MsoNormal");
			expect(result).not.toContain("mso-");
		});

		it("converts italic <i> tag (preserves semantic element)", () => {
			const result = convertWordHTML(DESKTOP_ITALIC, "desktop");
			expect(result).toContain("Italic text");
			expect(result).not.toContain("MsoNormal");
		});

		it("converts underline <u> tag (preserves semantic element)", () => {
			const result = convertWordHTML(DESKTOP_UNDERLINE, "desktop");
			expect(result).toContain("Underline text");
			expect(result).not.toContain("MsoNormal");
		});

		it("converts strikethrough style to <s>", () => {
			const result = convertWordHTML(DESKTOP_STRIKETHROUGH, "desktop");
			expect(result).toContain("<s>");
			expect(result).toContain("Strikethrough text");
		});

		it("converts superscript style to <sup>", () => {
			const result = convertWordHTML(DESKTOP_SUPERSCRIPT, "desktop");
			expect(result).toContain("<sup>");
			expect(result).toContain("Superscript text");
		});

		it("converts subscript style to <sub>", () => {
			const result = convertWordHTML(DESKTOP_SUBSCRIPT, "desktop");
			expect(result).toContain("<sub>");
			expect(result).toContain("Subscript text");
		});
	});
});

// ─── Combination Formatting Tests ───────────────────────────────────────────

describe("convertWordHTML — combination formatting", () => {
	describe("Word Online", () => {
		it("converts bold+italic to nested <strong><em>", () => {
			const result = convertWordHTML(ONLINE_BOLD_ITALIC, "online");
			expect(result).toContain("<strong><em>");
			expect(result).toContain("Bold italic text");
		});

		it("converts bold+italic+underline to nested <strong><em><u>", () => {
			const result = convertWordHTML(ONLINE_BOLD_ITALIC_UNDERLINE, "online");
			expect(result).toContain("<strong><em><u>");
			expect(result).toContain("Bold italic underline text");
		});

		it("converts bold+strikethrough to nested <strong><s>", () => {
			const result = convertWordHTML(ONLINE_BOLD_STRIKETHROUGH, "online");
			expect(result).toContain("<strong>");
			expect(result).toContain("<s>");
			expect(result).toContain("Bold strikethrough text");
		});
	});

	describe("Word Desktop", () => {
		it("converts bold+italic to nested elements", () => {
			const result = convertWordHTML(DESKTOP_BOLD_ITALIC, "desktop");
			expect(result).toContain("Bold italic text");
			expect(result).not.toContain("MsoNormal");
			expect(result).not.toContain("mso-");
		});

		it("converts bold+italic+underline to nested elements", () => {
			const result = convertWordHTML(DESKTOP_BOLD_ITALIC_UNDERLINE, "desktop");
			expect(result).toContain("Bold italic underline text");
			expect(result).not.toContain("MsoNormal");
		});

		it("converts bold+strikethrough to nested elements", () => {
			const result = convertWordHTML(DESKTOP_BOLD_STRIKETHROUGH, "desktop");
			expect(result).toContain("Bold strikethrough text");
			expect(result).toContain("<s>");
			expect(result).not.toContain("MsoNormal");
		});
	});
});

// ─── Heading Conversion Tests ───────────────────────────────────────────────

describe("convertWordHTML — headings", () => {
	describe("Word Online", () => {
		it("converts role=heading aria-level=1 to <h1>", () => {
			const result = convertWordHTML(ONLINE_HEADING_1, "online");
			expect(result).toContain("<h1>");
			expect(result).toContain("Heading 1 Text");
			expect(result).not.toContain('role="heading"');
		});

		it("converts role=heading aria-level=2 to <h2>", () => {
			const result = convertWordHTML(ONLINE_HEADING_2, "online");
			expect(result).toContain("<h2>");
			expect(result).toContain("Heading 2 Text");
		});

		it("converts role=heading aria-level=3 to <h3>", () => {
			const result = convertWordHTML(ONLINE_HEADING_3, "online");
			expect(result).toContain("<h3>");
			expect(result).toContain("Heading 3 Text");
		});
	});

	describe("Word Desktop", () => {
		it("converts MsoHeading1 class to <h1>", () => {
			const result = convertWordHTML(DESKTOP_HEADING_1, "desktop");
			expect(result).toContain("<h1>");
			expect(result).toContain("Heading 1 Text");
			expect(result).not.toContain("MsoHeading");
		});

		it("converts MsoHeading2 class to <h2>", () => {
			const result = convertWordHTML(DESKTOP_HEADING_2, "desktop");
			expect(result).toContain("<h2>");
			expect(result).toContain("Heading 2 Text");
		});

		it("converts MsoHeading3 class to <h3>", () => {
			const result = convertWordHTML(DESKTOP_HEADING_3, "desktop");
			expect(result).toContain("<h3>");
			expect(result).toContain("Heading 3 Text");
		});
	});
});

// ─── Ordered List Tests ─────────────────────────────────────────────────────

describe("convertWordHTML — ordered lists", () => {
	it("converts Word Online ordered list with 3-level nesting (clipboard format)", () => {
		const result = convertWordHTML(
			ONLINE_CLIPBOARD_ORDERED_LIST_3_LEVELS,
			"online"
		);
		expect(result).toContain("<ol>");
		expect(result).toContain("<li>");
		expect(result).toContain("First item");
		expect(result).toContain("Sub item a");
		expect(result).toContain("Sub sub item i");
		// Verify nesting (nested <ol> inside <li>)
		expect(result).toMatch(/<li>.*<ol>/s);
		// Should NOT produce <ul> (Aptos font = ordered)
		expect(result).not.toContain("<ul>");
	});

	it("converts Word Online ordered list with 3-level nesting (rendered-page format)", () => {
		const result = convertWordHTML(ONLINE_ORDERED_LIST_NESTED, "online");
		expect(result).toContain("<ol>");
		expect(result).toContain("<li>");
		expect(result).toContain("First item");
		expect(result).toContain("Sub item a");
		expect(result).toContain("Sub sub item i");
		// Verify nesting (nested <ol> inside <li>)
		expect(result).toMatch(/<li>.*<ol>/s);
		// No marker spans remain
		expect(result).not.toContain("ListMarkerWrappingSpan");
		expect(result).not.toContain("ListMarker");
	});

	it("converts Word Desktop ordered list with 3-level nesting", () => {
		const result = convertWordHTML(DESKTOP_ORDERED_LIST_NESTED, "desktop");
		expect(result).toContain("<ol>");
		expect(result).toContain("<li>");
		expect(result).toContain("First item");
		expect(result).toContain("Sub item a");
		expect(result).toContain("Sub sub item i");
		// No Mso classes remain
		expect(result).not.toContain("MsoListParagraph");
		expect(result).not.toContain("mso-list");
	});
});

// ─── Unordered List Tests ───────────────────────────────────────────────────

describe("convertWordHTML — unordered lists", () => {
	it("converts Word Online unordered list with 2-level nesting (clipboard format)", () => {
		const result = convertWordHTML(ONLINE_CLIPBOARD_UNORDERED_LIST, "online");
		expect(result).toContain("<ul>");
		expect(result).toContain("<li>");
		expect(result).toContain("Level 1 bullet");
		expect(result).toContain("Level 2 bullet");
		// Verify nesting
		expect(result).toMatch(/<li>.*<ul>/s);
		// Should NOT produce <ol> (Symbol/Courier New font = bullet)
		expect(result).not.toContain("<ol>");
	});

	it("converts Word Online unordered list with 2-level nesting (rendered-page format)", () => {
		const result = convertWordHTML(ONLINE_UNORDERED_LIST_NESTED, "online");
		expect(result).toContain("<ul>");
		expect(result).toContain("<li>");
		expect(result).toContain("Level 1 item");
		expect(result).toContain("Level 2 item");
		// Verify nesting
		expect(result).toMatch(/<li>.*<ul>/s);
		// No marker spans remain
		expect(result).not.toContain("ListMarkerWrappingSpan");
	});

	it("converts Word Desktop unordered list with 2-level nesting", () => {
		const result = convertWordHTML(DESKTOP_UNORDERED_LIST_NESTED, "desktop");
		expect(result).toContain("<ul>");
		expect(result).toContain("<li>");
		expect(result).toContain("Level 1 item");
		expect(result).toContain("Level 2 item");
		// No Mso classes remain
		expect(result).not.toContain("MsoListParagraph");
	});
});

// ─── DOMPurify-Wrapped List Tests (Bug Fix Verification) ────────────────────

describe("convertWordHTML — DOMPurify-wrapped lists (browser auto-wrapping)", () => {
	it("handles unordered list items pre-wrapped in <ul> by DOMPurify", () => {
		const result = convertWordHTML(
			ONLINE_UNORDERED_LIST_NESTED_WRAPPED,
			"online"
		);
		expect(result).toContain("<ul>");
		expect(result).toContain("<li>");
		expect(result).toContain("Level 1 item");
		expect(result).toContain("Level 2 item");
		// Verify proper nesting (nested <ul> inside <li>)
		expect(result).toMatch(/<li>.*<ul>/s);
		// No marker spans remain
		expect(result).not.toContain("ListMarkerWrappingSpan");
		// No auto-generated wrapper attributes remain
		expect(result).not.toContain('role="listitem"');
	});

	it("handles ordered list items pre-wrapped in <ul> by DOMPurify", () => {
		const result = convertWordHTML(
			ONLINE_ORDERED_LIST_NESTED_WRAPPED,
			"online"
		);
		// Root should be <ol> (detected from first item's "1." marker)
		expect(result).toContain("<ol>");
		expect(result).toContain("<li>");
		expect(result).toContain("First item");
		expect(result).toContain("Second item");
		expect(result).toContain("Sub item a");
		expect(result).toContain("Sub sub item i");
		// Verify nesting (nested list inside <li>)
		expect(result).toMatch(/<li>.*<ol>/s);
		// No marker spans remain
		expect(result).not.toContain("ListMarkerWrappingSpan");
	});

	it("handles list items split across multiple <ul> wrappers", () => {
		const result = convertWordHTML(
			ONLINE_ORDERED_LIST_MULTIPLE_WRAPPERS,
			"online"
		);
		expect(result).toContain("<ol>");
		expect(result).toContain("First item");
		expect(result).toContain("Second item");
		// No marker spans remain
		expect(result).not.toContain("ListMarkerWrappingSpan");
	});

	it("nested ordered list uses <ol> for sub-levels (not <ul>)", () => {
		const result = convertWordHTML(
			ONLINE_ORDERED_LIST_NESTED_WRAPPED,
			"online"
		);
		// The nested sub-lists should be <ol> (since "a." and "i." are ordered markers)
		// Count occurrences of <ol> — should have root + nested levels
		const olCount = (result.match(/<ol>/g) || []).length;
		expect(olCount).toBeGreaterThanOrEqual(2);
		// Should NOT have any <ul> in an ordered list
		expect(result).not.toContain("<ul>");
	});
});

// ─── Actual Clipboard HTML Tests (data-aria-level format) ───────────────────

describe("convertWordHTML — actual Word Online clipboard HTML (data-aria-level)", () => {
	it("converts clipboard unordered list with data-font=Symbol", () => {
		const result = convertWordHTML(ONLINE_CLIPBOARD_UNORDERED_LIST, "online");
		expect(result).toContain("<ul>");
		expect(result).toContain("<li>");
		expect(result).toContain("Level 1 bullet");
		expect(result).toContain("Level 2 bullet");
		// Verify nesting (nested <ul> inside <li>)
		expect(result).toMatch(/<li>.*<ul>/s);
		// Should NOT produce <ol> (Symbol font = bullet)
		expect(result).not.toContain("<ol>");
	});

	it("converts clipboard ordered list with data-font=Aptos and data-leveltext=%1.", () => {
		const result = convertWordHTML(ONLINE_CLIPBOARD_ORDERED_LIST, "online");
		expect(result).toContain("<ol>");
		expect(result).toContain("<li>");
		expect(result).toContain("First ordered");
		expect(result).toContain("Second ordered");
		expect(result).toContain("Sub item a");
		// Verify nesting
		expect(result).toMatch(/<li>.*<ol>/s);
		// Should NOT produce <ul> (Aptos font = ordered)
		expect(result).not.toContain("<ul>");
	});

	it("converts clipboard ordered list with 3-level nesting", () => {
		const result = convertWordHTML(
			ONLINE_CLIPBOARD_ORDERED_LIST_3_LEVELS,
			"online"
		);
		expect(result).toContain("<ol>");
		expect(result).toContain("<li>");
		expect(result).toContain("First item");
		expect(result).toContain("Sub item a");
		expect(result).toContain("Sub sub item i");
		// Verify deep nesting (at least 2 nested <ol> elements)
		const olCount = (result.match(/<ol>/g) || []).length;
		expect(olCount).toBeGreaterThanOrEqual(2);
	});

	it("preserves text content from clipboard format (no marker text leaks)", () => {
		const result = convertWordHTML(ONLINE_CLIPBOARD_UNORDERED_LIST, "online");
		// Should not contain the raw Unicode bullet from data-leveltext
		expect(result).not.toContain("\uf0b7");
		// Should contain the actual text
		expect(result).toContain("Level 1 bullet");
		expect(result).toContain("Level 2 bullet");
	});

	it("detects list type from data-list-defn-props JSON", () => {
		// The unordered fixture has "469769226":"Symbol" in the JSON
		const ulResult = convertWordHTML(ONLINE_CLIPBOARD_UNORDERED_LIST, "online");
		expect(ulResult).toContain("<ul>");
		expect(ulResult).not.toContain("<ol>");

		// The ordered fixture has "469769226":"Aptos" in the JSON
		const olResult = convertWordHTML(ONLINE_CLIPBOARD_ORDERED_LIST, "online");
		expect(olResult).toContain("<ol>");
		expect(olResult).not.toContain("<ul>");
	});
});

// ─── Clipboard Attribute-Specific Tests ─────────────────────────────────────

describe("convertWordHTML — clipboard attribute behaviour", () => {
	it("uses data-aria-level for nesting when aria-level is absent", () => {
		// Clipboard format: only data-aria-level, no aria-level attribute
		const html = `<ul><li data-aria-level="1" role="listitem" data-font="Symbol" data-list-defn-props='{"469769226":"Symbol"}'><p><span>Top level</span></p></li><li data-aria-level="2" role="listitem" data-font="Symbol" data-list-defn-props='{"469769226":"Symbol"}'><p><span>Nested level</span></p></li><li data-aria-level="3" role="listitem" data-font="Symbol" data-list-defn-props='{"469769226":"Symbol"}'><p><span>Deep level</span></p></li></ul>`;
		const result = convertWordHTML(html, "online");

		// Should produce nested structure from data-aria-level
		expect(result).toContain("<ul>");
		expect(result).toContain("Top level");
		expect(result).toContain("Nested level");
		expect(result).toContain("Deep level");
		// Verify nesting exists (nested <ul> inside <li>)
		expect(result).toMatch(/<li>.*<ul>/s);
		// Count nesting depth — at least 2 nested <ul> elements (root + 2 sub-levels)
		const ulCount = (result.match(/<ul>/g) || []).length;
		expect(ulCount).toBeGreaterThanOrEqual(2);
	});

	it("data-font='Symbol' produces <ul> (unordered)", () => {
		const html = `<ul><li data-aria-level="1" role="listitem" data-font="Symbol" data-list-defn-props='{"469769226":"Symbol"}'><p><span>Bullet item</span></p></li></ul>`;
		const result = convertWordHTML(html, "online");
		expect(result).toContain("<ul>");
		expect(result).not.toContain("<ol>");
		expect(result).toContain("Bullet item");
	});

	it("data-font='Aptos' produces <ol> (ordered)", () => {
		const html = `<ul><li data-aria-level="1" role="listitem" data-font="Aptos" data-leveltext="%1." data-list-defn-props='{"469769226":"Aptos"}'><p><span>Numbered item</span></p></li></ul>`;
		const result = convertWordHTML(html, "online");
		expect(result).toContain("<ol>");
		expect(result).not.toContain("<ul>");
		expect(result).toContain("Numbered item");
	});

	it("data-font='Wingdings' produces <ul> (unordered)", () => {
		const html = `<ul><li data-aria-level="1" role="listitem" data-font="Wingdings" data-list-defn-props='{"469769226":"Wingdings"}'><p><span>Wingdings bullet</span></p></li></ul>`;
		const result = convertWordHTML(html, "online");
		expect(result).toContain("<ul>");
		expect(result).not.toContain("<ol>");
	});

	it("data-font='Courier New' produces <ul> (unordered)", () => {
		const html = `<ul><li data-aria-level="1" role="listitem" data-font="Courier New" data-list-defn-props='{"469769226":"Courier New"}'><p><span>Courier bullet</span></p></li></ul>`;
		const result = convertWordHTML(html, "online");
		expect(result).toContain("<ul>");
		expect(result).not.toContain("<ol>");
	});

	it("parses data-list-defn-props JSON correctly for type detection", () => {
		// Symbol font in JSON key "469769226" → unordered
		const ulHtml = `<ul><li data-aria-level="1" role="listitem" data-list-defn-props='{"335552541":1,"469769226":"Symbol","469777815":"hybridMultilevel"}'><p><span>From JSON Symbol</span></p></li></ul>`;
		const ulResult = convertWordHTML(ulHtml, "online");
		expect(ulResult).toContain("<ul>");
		expect(ulResult).not.toContain("<ol>");
		expect(ulResult).toContain("From JSON Symbol");

		// Aptos font in JSON key "469769226" → ordered
		const olHtml = `<ul><li data-aria-level="1" role="listitem" data-list-defn-props='{"335552541":0,"469769226":"Aptos","469777803":"left","469777815":"hybridMultilevel"}'><p><span>From JSON Aptos</span></p></li></ul>`;
		const olResult = convertWordHTML(olHtml, "online");
		expect(olResult).toContain("<ol>");
		expect(olResult).not.toContain("<ul>");
		expect(olResult).toContain("From JSON Aptos");
	});

	it("data-list-defn-props takes priority over data-font for type detection", () => {
		// Conflicting: data-font says Symbol (ul) but JSON says Aptos (ol)
		// JSON should win because it's checked first
		const html = `<ul><li data-aria-level="1" role="listitem" data-font="Symbol" data-list-defn-props='{"469769226":"Aptos"}'><p><span>JSON wins</span></p></li></ul>`;
		const result = convertWordHTML(html, "online");
		expect(result).toContain("<ol>");
		expect(result).not.toContain("<ul>");
	});

	it("falls back to data-font when data-list-defn-props JSON is malformed", () => {
		const html = `<ul><li data-aria-level="1" role="listitem" data-font="Symbol" data-list-defn-props='not valid json'><p><span>Fallback item</span></p></li></ul>`;
		const result = convertWordHTML(html, "online");
		// Should fall through to data-font="Symbol" → unordered
		expect(result).toContain("<ul>");
		expect(result).not.toContain("<ol>");
	});
});

// ─── Junk Removal Tests ─────────────────────────────────────────────────────

describe("convertWordHTML — junk removal", () => {
	it("removes all Word Online artefacts", () => {
		const result = convertWordHTML(ONLINE_JUNK_HEAVY, "online");
		expect(result).toContain("Clean content here");
		// No Word-specific classes
		expect(result).not.toContain("OutlineElement");
		expect(result).not.toContain("ParaWrappingDiv");
		expect(result).not.toContain("Paragraph");
		expect(result).not.toContain("TextRun");
		expect(result).not.toContain("NormalTextRun");
		expect(result).not.toContain("EOP");
		// No Word-specific attributes
		expect(result).not.toContain("paraid");
		expect(result).not.toContain("paraeid");
		expect(result).not.toContain("data-contrast");
		expect(result).not.toContain("data-fontsize");
		expect(result).not.toContain("xml:lang");
		// No non-semantic styles
		expect(result).not.toContain("font-kerning");
		expect(result).not.toContain("font-family");
		expect(result).not.toContain("font-size");
	});

	it("removes all Word Desktop artefacts", () => {
		const result = convertWordHTML(DESKTOP_JUNK_HEAVY, "desktop");
		expect(result).toContain("Clean content here");
		// No Mso classes
		expect(result).not.toContain("MsoNormal");
		// No mso- styles
		expect(result).not.toContain("mso-");
		// No non-semantic styles
		expect(result).not.toContain("font-family");
		expect(result).not.toContain("font-size");
		expect(result).not.toContain("color");
	});
});

// ─── Mode Stripping Tests ───────────────────────────────────────────────────

describe("convertWordHTML — mode stripping", () => {
	it("projectTitle mode: preserves italic, subscript, superscript; strips bold, underline, lists, headings", () => {
		const result = convertAndStrip(
			ONLINE_BOLD_ITALIC,
			"online",
			"projectTitle"
		);
		// Bold should be stripped
		expect(result).not.toContain("<strong>");
		expect(result).not.toContain("<b>");
		// Italic should be preserved
		expect(result).toContain("<em>");
		expect(result).toContain("Bold italic text");
	});

	it("minimal mode: preserves bold and italic; strips underline, lists, headings", () => {
		const result = convertAndStrip(
			ONLINE_BOLD_ITALIC_UNDERLINE,
			"online",
			"minimal"
		);
		// Bold and italic preserved
		expect(result).toContain("<strong>");
		expect(result).toContain("<em>");
		// Underline stripped
		expect(result).not.toContain("<u>");
		expect(result).toContain("Bold italic underline text");
	});

	it("simple mode: preserves bold, italic, lists; strips underline, headings", () => {
		const headingResult = convertAndStrip(ONLINE_HEADING_1, "online", "simple");
		// Headings stripped (converted to <p>)
		expect(headingResult).not.toContain("<h1>");
		expect(headingResult).toContain("Heading 1 Text");

		const listResult = convertAndStrip(
			ONLINE_UNORDERED_LIST_NESTED,
			"online",
			"simple"
		);
		// Lists preserved
		expect(listResult).toContain("<ul>");
	});

	it("full mode: preserves bold, italic, underline, subscript, superscript, headings, lists; strips strikethrough", () => {
		const result = convertAndStrip(ONLINE_BOLD_STRIKETHROUGH, "online", "full");
		// Bold preserved
		expect(result).toContain("<strong>");
		// Strikethrough stripped
		expect(result).not.toContain("<s>");
		expect(result).toContain("Bold strikethrough text");
	});

	it("none mode: strips all formatting, blocks, and features", () => {
		const result = convertAndStrip(
			ONLINE_BOLD_ITALIC_UNDERLINE,
			"online",
			"none"
		);
		expect(result).not.toContain("<strong>");
		expect(result).not.toContain("<em>");
		expect(result).not.toContain("<u>");
		// Text content preserved
		expect(result).toContain("Bold italic underline text");
	});
});

// ─── Non-Word Passthrough Tests ─────────────────────────────────────────────

describe("convertWordHTML — non-Word passthrough", () => {
	it("passes through plain HTML unchanged (Online variant)", () => {
		const plainHtml = "<p><strong>Already semantic</strong> text</p>";
		const result = convertWordHTML(plainHtml, "online");
		// Content preserved — cleanup may remove empty elements but text stays
		expect(result).toContain("Already semantic");
		expect(result).toContain("text");
	});

	it("passes through plain HTML unchanged (Desktop variant)", () => {
		const plainHtml = "<p><em>Italic</em> and <u>underline</u></p>";
		const result = convertWordHTML(plainHtml, "desktop");
		expect(result).toContain("<em>Italic</em>");
		expect(result).toContain("<u>underline</u>");
	});
});

// ─── Error Fallback Tests ───────────────────────────────────────────────────

describe("convertWordHTML — error fallback", () => {
	it("returns input HTML for severely malformed content", () => {
		// DOMParser handles malformed HTML gracefully, so this tests the pipeline
		// doesn't crash on unusual input
		const malformed =
			"<p>Unclosed <span>tags <div>nested wrong</p></span></div>";
		const result = convertWordHTML(malformed, "online");
		// Should not throw and should contain the text content
		expect(result).toContain("Unclosed");
		expect(result).toContain("tags");
		expect(result).toContain("nested wrong");
	});

	it("returns input HTML for empty content", () => {
		const result = convertWordHTML("", "online");
		// Empty input produces empty output (no crash)
		expect(result).toBeDefined();
		expect(typeof result).toBe("string");
	});
});

// ─── Property-Based Tests (fast-check) ──────────────────────────────────────

import fc from "fast-check";

/**
 * Property-based tests for the Word HTML conversion pipeline.
 *
 * These tests verify robustness guarantees across random inputs:
 * 1. The pipeline never throws for arbitrary HTML-like strings
 * 2. Plain text content is preserved through the pipeline
 * 3. Output contains no Word-specific artefacts (mso-* styles, Word classes)
 *
 * **Validates: Requirements 10.6**
 */

/** All toolbar modes to test against */
const MODES_UNDER_TEST: ToolbarMode[] = [
	"full",
	"simple",
	"minimal",
	"projectTitle",
	"none",
];

/** Variants to test */
const VARIANTS: Array<"online" | "desktop"> = ["online", "desktop"];

describe("convertWordHTML — property-based tests", () => {
	describe("Property 5: round-trip never throws", () => {
		for (const mode of MODES_UNDER_TEST) {
			it(`never throws for random HTML through convertWordHTML + stripDisallowedContent (mode: ${mode})`, () => {
				fc.assert(
					fc.property(
						fc.string({ minLength: 0, maxLength: 500 }),
						fc.constantFrom(...VARIANTS),
						(randomHtml: string, variant: "online" | "desktop") => {
							// convertWordHTML must not throw
							const converted = convertWordHTML(randomHtml, variant);
							expect(typeof converted).toBe("string");

							// stripDisallowedContent (replicated from convertAndStrip helper) must not throw
							const parser = new DOMParser();
							const doc = parser.parseFromString(converted, "text/html");
							const config = TOOLBAR_CONFIGS[mode];

							// Replicate stripDisallowedContent logic inline
							if (!config.blocks.lists) {
								doc.querySelectorAll("li").forEach((li) => {
									const p = doc.createElement("p");
									p.innerHTML = li.innerHTML;
									li.replaceWith(p);
								});
								doc.querySelectorAll("ul, ol").forEach((list) => {
									const fragment = doc.createDocumentFragment();
									while (list.firstChild) fragment.appendChild(list.firstChild);
									list.replaceWith(fragment);
								});
							}
							if (!config.blocks.tables) {
								doc.querySelectorAll("table").forEach((table) => {
									const fragment = doc.createDocumentFragment();
									table.querySelectorAll("td, th").forEach((cell) => {
										const text = cell.textContent?.trim();
										if (text) {
											const p = doc.createElement("p");
											p.textContent = text;
											fragment.appendChild(p);
										}
									});
									table.replaceWith(fragment);
								});
							}
							if (!config.blocks.headings) {
								doc.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
									const p = doc.createElement("p");
									p.innerHTML = h.innerHTML;
									h.replaceWith(p);
								});
							}
							if (!config.formatting.bold) {
								doc.querySelectorAll("strong, b").forEach((el) => {
									const f = doc.createDocumentFragment();
									while (el.firstChild) f.appendChild(el.firstChild);
									el.replaceWith(f);
								});
							}
							if (!config.formatting.italic) {
								doc.querySelectorAll("em, i").forEach((el) => {
									const f = doc.createDocumentFragment();
									while (el.firstChild) f.appendChild(el.firstChild);
									el.replaceWith(f);
								});
							}
							if (!config.formatting.underline) {
								doc.querySelectorAll("u").forEach((el) => {
									const f = doc.createDocumentFragment();
									while (el.firstChild) f.appendChild(el.firstChild);
									el.replaceWith(f);
								});
							}
							if (!config.formatting.strikethrough) {
								doc.querySelectorAll("s, del").forEach((el) => {
									const f = doc.createDocumentFragment();
									while (el.firstChild) f.appendChild(el.firstChild);
									el.replaceWith(f);
								});
							}
							if (!config.formatting.superscript) {
								doc.querySelectorAll("sup").forEach((el) => {
									const f = doc.createDocumentFragment();
									while (el.firstChild) f.appendChild(el.firstChild);
									el.replaceWith(f);
								});
							}
							if (!config.formatting.subscript) {
								doc.querySelectorAll("sub").forEach((el) => {
									const f = doc.createDocumentFragment();
									while (el.firstChild) f.appendChild(el.firstChild);
									el.replaceWith(f);
								});
							}
							if (!config.features.links) {
								doc.querySelectorAll("a").forEach((el) => {
									const f = doc.createDocumentFragment();
									while (el.firstChild) f.appendChild(el.firstChild);
									el.replaceWith(f);
								});
							}
							if (!config.features.images) {
								doc.querySelectorAll("img").forEach((img) => img.remove());
							}

							// If we reach here without throwing, the property holds
							expect(doc.body.innerHTML).toBeDefined();
						}
					),
					{ numRuns: 100 }
				);
			});
		}
	});

	describe("Property 2: content preservation", () => {
		it("plain text content is preserved through the pipeline", () => {
			fc.assert(
				fc.property(
					fc
						.string({ minLength: 1, maxLength: 200 })
						.filter((s) => s.trim().length > 0),
					fc.constantFrom(...VARIANTS),
					(plainText: string, variant: "online" | "desktop") => {
						// Wrap plain text in a paragraph (simulating simple HTML content)
						const html = `<p>${escapeHtml(plainText)}</p>`;
						const result = convertWordHTML(html, variant);

						// Parse the result and extract text content
						const parser = new DOMParser();
						const doc = parser.parseFromString(result, "text/html");
						const outputText = doc.body.textContent || "";

						// The original plain text must appear in the output
						expect(outputText).toContain(plainText);
					}
				),
				{ numRuns: 100 }
			);
		});
	});

	describe("Property 3: no Word artefacts in output", () => {
		it("output contains no mso-* styles or Word-specific classes", () => {
			fc.assert(
				fc.property(
					wordLikeHtmlArbitrary(),
					fc.constantFrom(...VARIANTS),
					(html: string, variant: "online" | "desktop") => {
						const result = convertWordHTML(html, variant);

						// No mso-* style properties in output
						expect(result).not.toMatch(/mso-[a-z-]+/i);

						// No Word-specific classes in output
						expect(result).not.toMatch(
							/class="[^"]*\b(MsoNormal|MsoHeading\d|MsoListParagraph|MacChromeBold|Underlined|Strikethrough|Superscript|Subscript|TextRun|NormalTextRun|EOP|ParaWrappingDiv|OutlineElement|Paragraph)\b[^"]*"/
						);
					}
				),
				{ numRuns: 100 }
			);
		});
	});
});

// ─── Property Test Helpers ──────────────────────────────────────────────────

/** Escapes HTML special characters for safe embedding in HTML strings. */
function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

/**
 * Generates random HTML strings that include Word-like markers.
 * This ensures the converter actually processes the content rather than
 * passing it through unchanged.
 */
function wordLikeHtmlArbitrary(): fc.Arbitrary<string> {
	const wordClasses = [
		"MsoNormal",
		"MsoHeading1",
		"MsoListParagraph",
		"MacChromeBold",
		"Underlined",
		"Strikethrough",
		"Superscript",
		"Subscript",
		"TextRun",
		"NormalTextRun",
		"EOP",
		"ParaWrappingDiv",
		"OutlineElement",
		"Paragraph",
	];

	const msoStyles = [
		"mso-bidi-font-family: Arial",
		"mso-list: l0 level1 lfo1",
		"mso-fareast-font-family: Times",
		"mso-ansi-language: EN-AU",
	];

	return fc
		.record({
			text: fc
				.string({ minLength: 1, maxLength: 50 })
				.filter((s) => s.trim().length > 0),
			wordClass: fc.constantFrom(...wordClasses),
			msoStyle: fc.constantFrom(...msoStyles),
			includeClass: fc.boolean(),
			includeStyle: fc.boolean(),
		})
		.map(({ text, wordClass, msoStyle, includeClass, includeStyle }) => {
			const safeText = escapeHtml(text);
			const classAttr = includeClass ? ` class="${wordClass}"` : "";
			const styleAttr = includeStyle ? ` style="${msoStyle}"` : "";
			return `<p${classAttr}${styleAttr}><span${classAttr}${styleAttr}>${safeText}</span></p>`;
		});
}
