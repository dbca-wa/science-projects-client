import { describe, it, expect } from "vitest";
import {
	detectFormatting,
	detectFormattingOnBoldItalicElement,
	wrapWithFormatting,
	convertInlineFormatting,
} from "./word-formatting";
import type { FormattingFlags } from "./word-formatting";

/**
 * Helper to create a minimal DOM document for testing.
 */
function createDoc(html: string): Document {
	const parser = new DOMParser();
	return parser.parseFromString(html, "text/html");
}

describe("detectFormatting", () => {
	it("detects bold from font-weight: bold", () => {
		const doc = createDoc('<span style="font-weight: bold;">text</span>');
		const span = doc.querySelector("span")!;
		const flags = detectFormatting(span);
		expect(flags.bold).toBe(true);
		expect(flags.italic).toBe(false);
	});

	it("detects bold from mso-bidi-font-weight: bold (Word Desktop)", () => {
		const doc = createDoc(
			'<span style="font-size:12.0pt;mso-bidi-font-weight:bold">text</span>'
		);
		const span = doc.querySelector("span")!;
		expect(detectFormatting(span).bold).toBe(true);
	});

	it("detects italic from mso-bidi-font-style: italic (Word Desktop)", () => {
		const doc = createDoc(
			'<span style="font-size:12.0pt;mso-bidi-font-style:italic">text</span>'
		);
		const span = doc.querySelector("span")!;
		expect(detectFormatting(span).italic).toBe(true);
	});

	it("detects bold from font-weight: 700", () => {
		const doc = createDoc('<span style="font-weight: 700;">text</span>');
		const span = doc.querySelector("span")!;
		expect(detectFormatting(span).bold).toBe(true);
	});

	it("detects bold from MacChromeBold class", () => {
		const doc = createDoc('<span class="TextRun MacChromeBold">text</span>');
		const span = doc.querySelector("span")!;
		expect(detectFormatting(span).bold).toBe(true);
	});

	it("detects italic from font-style: italic", () => {
		const doc = createDoc('<span style="font-style: italic;">text</span>');
		const span = doc.querySelector("span")!;
		expect(detectFormatting(span).italic).toBe(true);
	});

	it("detects underline from text-decoration: underline", () => {
		const doc = createDoc(
			'<span style="text-decoration: underline;">text</span>'
		);
		const span = doc.querySelector("span")!;
		expect(detectFormatting(span).underline).toBe(true);
	});

	it("detects underline from Underlined class", () => {
		const doc = createDoc('<span class="Underlined">text</span>');
		const span = doc.querySelector("span")!;
		expect(detectFormatting(span).underline).toBe(true);
	});

	it("detects strikethrough from text-decoration: line-through", () => {
		const doc = createDoc(
			'<span style="text-decoration: line-through;">text</span>'
		);
		const span = doc.querySelector("span")!;
		expect(detectFormatting(span).strikethrough).toBe(true);
	});

	it("detects strikethrough from Strikethrough class", () => {
		const doc = createDoc('<span class="Strikethrough">text</span>');
		const span = doc.querySelector("span")!;
		expect(detectFormatting(span).strikethrough).toBe(true);
	});

	it("detects both underline and strikethrough from combined text-decoration", () => {
		const doc = createDoc(
			'<span style="text-decoration: underline line-through;">text</span>'
		);
		const span = doc.querySelector("span")!;
		const flags = detectFormatting(span);
		expect(flags.underline).toBe(true);
		expect(flags.strikethrough).toBe(true);
	});

	it("detects superscript from vertical-align: super", () => {
		const doc = createDoc('<span style="vertical-align: super;">text</span>');
		const span = doc.querySelector("span")!;
		expect(detectFormatting(span).superscript).toBe(true);
		expect(detectFormatting(span).subscript).toBe(false);
	});

	it("detects superscript from Superscript class", () => {
		const doc = createDoc('<span class="Superscript">text</span>');
		const span = doc.querySelector("span")!;
		expect(detectFormatting(span).superscript).toBe(true);
	});

	it("detects subscript from vertical-align: sub", () => {
		const doc = createDoc('<span style="vertical-align: sub;">text</span>');
		const span = doc.querySelector("span")!;
		expect(detectFormatting(span).subscript).toBe(true);
		expect(detectFormatting(span).superscript).toBe(false);
	});

	it("detects subscript from Subscript class", () => {
		const doc = createDoc('<span class="Subscript">text</span>');
		const span = doc.querySelector("span")!;
		expect(detectFormatting(span).subscript).toBe(true);
	});

	it("handles superscript/subscript mutual exclusivity — subscript wins", () => {
		const doc = createDoc('<span class="Superscript Subscript">text</span>');
		const span = doc.querySelector("span")!;
		const flags = detectFormatting(span);
		expect(flags.superscript).toBe(false);
		expect(flags.subscript).toBe(true);
	});

	it("detects no formatting on a plain span", () => {
		const doc = createDoc(
			'<span class="TextRun" style="font-size: 12pt;">text</span>'
		);
		const span = doc.querySelector("span")!;
		const flags = detectFormatting(span);
		expect(Object.values(flags).some(Boolean)).toBe(false);
	});
});

describe("wrapWithFormatting", () => {
	it("wraps with strong for bold", () => {
		const doc = createDoc("<p>text</p>");
		const text = doc.createTextNode("hello");
		const fragment = doc.createDocumentFragment();
		fragment.appendChild(text);

		const flags: FormattingFlags = {
			bold: true,
			italic: false,
			underline: false,
			strikethrough: false,
			superscript: false,
			subscript: false,
		};

		const result = wrapWithFormatting(doc, fragment, flags) as HTMLElement;
		expect(result.tagName).toBe("STRONG");
		expect(result.textContent).toBe("hello");
	});

	it("nests in correct order: strong > em > u > s > sub", () => {
		const doc = createDoc("<p>text</p>");
		const text = doc.createTextNode("hello");
		const fragment = doc.createDocumentFragment();
		fragment.appendChild(text);

		const flags: FormattingFlags = {
			bold: true,
			italic: true,
			underline: true,
			strikethrough: true,
			superscript: false,
			subscript: true,
		};

		const result = wrapWithFormatting(doc, fragment, flags) as HTMLElement;
		// Outermost: strong
		expect(result.tagName).toBe("STRONG");
		// Next: em
		const em = result.firstChild as HTMLElement;
		expect(em.tagName).toBe("EM");
		// Next: u
		const u = em.firstChild as HTMLElement;
		expect(u.tagName).toBe("U");
		// Next: s
		const s = u.firstChild as HTMLElement;
		expect(s.tagName).toBe("S");
		// Innermost: sub
		const sub = s.firstChild as HTMLElement;
		expect(sub.tagName).toBe("SUB");
		expect(sub.textContent).toBe("hello");
	});

	it("uses sup when superscript is true and subscript is false", () => {
		const doc = createDoc("<p>text</p>");
		const text = doc.createTextNode("2");
		const fragment = doc.createDocumentFragment();
		fragment.appendChild(text);

		const flags: FormattingFlags = {
			bold: false,
			italic: false,
			underline: false,
			strikethrough: false,
			superscript: true,
			subscript: false,
		};

		const result = wrapWithFormatting(doc, fragment, flags) as HTMLElement;
		expect(result.tagName).toBe("SUP");
		expect(result.textContent).toBe("2");
	});

	it("returns content unchanged when no flags are set", () => {
		const doc = createDoc("<p>text</p>");
		const text = doc.createTextNode("plain");
		const fragment = doc.createDocumentFragment();
		fragment.appendChild(text);

		const flags: FormattingFlags = {
			bold: false,
			italic: false,
			underline: false,
			strikethrough: false,
			superscript: false,
			subscript: false,
		};

		const result = wrapWithFormatting(doc, fragment, flags);
		// Fragment is returned as-is (no wrapping)
		expect(result.textContent).toBe("plain");
	});
});

describe("convertInlineFormatting", () => {
	it("converts a bold span to <strong>", () => {
		const doc = createDoc(
			'<p><span style="font-weight: bold;">Bold text</span></p>'
		);
		convertInlineFormatting(doc);
		expect(doc.body.innerHTML).toBe("<p><strong>Bold text</strong></p>");
	});

	it("converts an italic span to <em>", () => {
		const doc = createDoc(
			'<p><span style="font-style: italic;">Italic text</span></p>'
		);
		convertInlineFormatting(doc);
		expect(doc.body.innerHTML).toBe("<p><em>Italic text</em></p>");
	});

	it("converts bold+italic span to nested <strong><em>", () => {
		const doc = createDoc(
			'<p><span style="font-weight: bold; font-style: italic;">Both</span></p>'
		);
		convertInlineFormatting(doc);
		expect(doc.body.innerHTML).toBe("<p><strong><em>Both</em></strong></p>");
	});

	it("unwraps spans with no formatting", () => {
		const doc = createDoc(
			'<p><span class="TextRun" style="font-size: 12pt;">Plain text</span></p>'
		);
		convertInlineFormatting(doc);
		expect(doc.body.innerHTML).toBe("<p>Plain text</p>");
	});

	it("skips ListMarkerWrappingSpan spans", () => {
		const doc = createDoc(
			'<p><span class="ListMarkerWrappingSpan">1.</span><span style="font-weight: bold;">Item</span></p>'
		);
		convertInlineFormatting(doc);
		const html = doc.body.innerHTML;
		expect(html).toContain("ListMarkerWrappingSpan");
		expect(html).toContain("<strong>Item</strong>");
	});

	it("removes EOP spans", () => {
		const doc = createDoc(
			'<p><span style="font-weight: bold;">Text</span><span class="EOP"> </span></p>'
		);
		convertInlineFormatting(doc);
		expect(doc.body.innerHTML).toBe("<p><strong>Text</strong></p>");
	});

	it("preserves child elements within formatted spans", () => {
		const doc = createDoc(
			'<p><span style="font-weight: bold;"><a href="http://example.com">Link</a> text</span></p>'
		);
		convertInlineFormatting(doc);
		expect(doc.body.innerHTML).toBe(
			'<p><strong><a href="http://example.com">Link</a> text</strong></p>'
		);
	});

	it("handles combined underline and strikethrough in text-decoration", () => {
		const doc = createDoc(
			'<p><span style="text-decoration: underline line-through;">Both</span></p>'
		);
		convertInlineFormatting(doc);
		expect(doc.body.innerHTML).toBe("<p><u><s>Both</s></u></p>");
	});

	it("handles superscript/subscript mutual exclusivity — subscript wins", () => {
		const doc = createDoc(
			'<p><span class="Superscript Subscript">x</span></p>'
		);
		convertInlineFormatting(doc);
		expect(doc.body.innerHTML).toBe("<p><sub>x</sub></p>");
	});

	// Word Desktop <b> and <i> element handling

	it("converts <b> element to <strong>", () => {
		const doc = createDoc("<p><b>Bold text</b></p>");
		convertInlineFormatting(doc);
		expect(doc.body.innerHTML).toBe("<p><strong>Bold text</strong></p>");
	});

	it("converts <i> element to <em>", () => {
		const doc = createDoc("<p><i>Italic text</i></p>");
		convertInlineFormatting(doc);
		expect(doc.body.innerHTML).toBe("<p><em>Italic text</em></p>");
	});

	it("unwraps <b style='font-weight:normal'> (not actually bold)", () => {
		const doc = createDoc('<p><b style="font-weight: normal">Not bold</b></p>');
		convertInlineFormatting(doc);
		expect(doc.body.innerHTML).toBe("<p>Not bold</p>");
	});

	it("unwraps <i style='font-style:normal'> (not actually italic)", () => {
		const doc = createDoc(
			'<p><i style="font-style: normal">Not italic</i></p>'
		);
		convertInlineFormatting(doc);
		expect(doc.body.innerHTML).toBe("<p>Not italic</p>");
	});

	it("preserves <b style='mso-bidi-font-weight:normal'> as bold (Word Desktop)", () => {
		const doc = createDoc(
			'<p><b style="mso-bidi-font-weight:normal">Bold text</b></p>'
		);
		convertInlineFormatting(doc);
		expect(doc.body.innerHTML).toBe("<p><strong>Bold text</strong></p>");
	});

	it("preserves <i style='mso-bidi-font-style:normal'> as italic (Word Desktop)", () => {
		const doc = createDoc(
			'<p><i style="mso-bidi-font-style:normal">Italic text</i></p>'
		);
		convertInlineFormatting(doc);
		expect(doc.body.innerHTML).toBe("<p><em>Italic text</em></p>");
	});

	it("converts <b> with additional italic style to <strong><em>", () => {
		const doc = createDoc(
			'<p><b style="font-style: italic">Bold and italic</b></p>'
		);
		convertInlineFormatting(doc);
		expect(doc.body.innerHTML).toBe(
			"<p><strong><em>Bold and italic</em></strong></p>"
		);
	});

	it("converts <i> with additional bold style to <strong><em>", () => {
		const doc = createDoc(
			'<p><i style="font-weight: bold">Bold and italic</i></p>'
		);
		convertInlineFormatting(doc);
		expect(doc.body.innerHTML).toBe(
			"<p><strong><em>Bold and italic</em></strong></p>"
		);
	});

	it("handles nested <b><i>text</i></b> from Word Desktop", () => {
		const doc = createDoc("<p><b><i>Bold italic</i></b></p>");
		convertInlineFormatting(doc);
		// <b> becomes <strong>, <i> inside becomes <em>
		expect(doc.body.innerHTML).toBe(
			"<p><strong><em>Bold italic</em></strong></p>"
		);
	});

	it("preserves child elements within <b> tags", () => {
		const doc = createDoc(
			'<p><b><a href="http://example.com">Bold link</a></b></p>'
		);
		convertInlineFormatting(doc);
		expect(doc.body.innerHTML).toBe(
			'<p><strong><a href="http://example.com">Bold link</a></strong></p>'
		);
	});

	it("handles mixed spans and <b>/<i> elements", () => {
		const doc = createDoc(
			'<p><span style="font-weight: bold;">Span bold</span> and <b>Tag bold</b></p>'
		);
		convertInlineFormatting(doc);
		expect(doc.body.innerHTML).toBe(
			"<p><strong>Span bold</strong> and <strong>Tag bold</strong></p>"
		);
	});
});

describe("detectFormattingOnBoldItalicElement", () => {
	it("detects implicit bold on <b> element", () => {
		const doc = createDoc("<b>text</b>");
		const el = doc.querySelector("b")!;
		const flags = detectFormattingOnBoldItalicElement(el, "b");
		expect(flags.bold).toBe(true);
		expect(flags.italic).toBe(false);
	});

	it("detects implicit italic on <i> element", () => {
		const doc = createDoc("<i>text</i>");
		const el = doc.querySelector("i")!;
		const flags = detectFormattingOnBoldItalicElement(el, "i");
		expect(flags.italic).toBe(true);
		expect(flags.bold).toBe(false);
	});

	it("overrides bold to false on <b style='font-weight:normal'>", () => {
		const doc = createDoc('<b style="font-weight: normal">text</b>');
		const el = doc.querySelector("b")!;
		const flags = detectFormattingOnBoldItalicElement(el, "b");
		expect(flags.bold).toBe(false);
	});

	it("overrides italic to false on <i style='font-style:normal'>", () => {
		const doc = createDoc('<i style="font-style: normal">text</i>');
		const el = doc.querySelector("i")!;
		const flags = detectFormattingOnBoldItalicElement(el, "i");
		expect(flags.italic).toBe(false);
	});

	it("does NOT override bold when only mso-bidi-font-weight:normal is present (Word Desktop)", () => {
		const doc = createDoc('<b style="mso-bidi-font-weight:normal">text</b>');
		const el = doc.querySelector("b")!;
		const flags = detectFormattingOnBoldItalicElement(el, "b");
		expect(flags.bold).toBe(true);
	});

	it("does NOT override italic when only mso-bidi-font-style:normal is present (Word Desktop)", () => {
		const doc = createDoc('<i style="mso-bidi-font-style:normal">text</i>');
		const el = doc.querySelector("i")!;
		const flags = detectFormattingOnBoldItalicElement(el, "i");
		expect(flags.italic).toBe(true);
	});

	it("detects additional italic on <b> from style", () => {
		const doc = createDoc('<b style="font-style: italic">text</b>');
		const el = doc.querySelector("b")!;
		const flags = detectFormattingOnBoldItalicElement(el, "b");
		expect(flags.bold).toBe(true);
		expect(flags.italic).toBe(true);
	});

	it("detects additional bold on <i> from style", () => {
		const doc = createDoc('<i style="font-weight: bold">text</i>');
		const el = doc.querySelector("i")!;
		const flags = detectFormattingOnBoldItalicElement(el, "i");
		expect(flags.italic).toBe(true);
		expect(flags.bold).toBe(true);
	});

	it("detects underline on <b> from style", () => {
		const doc = createDoc('<b style="text-decoration: underline">text</b>');
		const el = doc.querySelector("b")!;
		const flags = detectFormattingOnBoldItalicElement(el, "b");
		expect(flags.bold).toBe(true);
		expect(flags.underline).toBe(true);
	});
});
