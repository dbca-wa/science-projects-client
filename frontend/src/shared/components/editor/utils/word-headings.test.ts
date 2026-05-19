import { describe, it, expect } from "vitest";
import { convertHeadings } from "./word-headings";

function createDoc(html: string): Document {
	const parser = new DOMParser();
	return parser.parseFromString(html, "text/html");
}

describe("convertHeadings", () => {
	describe("Word Online — role + aria-level", () => {
		it("converts p with role=heading and valid aria-level to heading element", () => {
			const doc = createDoc(
				'<p role="heading" aria-level="1"><span>Title</span></p>'
			);
			convertHeadings(doc, "online");
			expect(doc.body.innerHTML).toBe("<h1><span>Title</span></h1>");
		});

		it("converts all levels 1 through 6", () => {
			const html = Array.from({ length: 6 }, (_, i) => {
				const level = i + 1;
				return `<p role="heading" aria-level="${level}">H${level}</p>`;
			}).join("");

			const doc = createDoc(html);
			convertHeadings(doc, "online");

			for (let level = 1; level <= 6; level++) {
				const heading = doc.querySelector(`h${level}`);
				expect(heading).not.toBeNull();
				expect(heading?.textContent).toBe(`H${level}`);
			}
		});

		it("treats aria-level outside 1-6 as regular paragraph", () => {
			const doc = createDoc(
				'<p role="heading" aria-level="7"><span>Not a heading</span></p>'
			);
			convertHeadings(doc, "online");
			expect(doc.querySelector("h7")).toBeNull();
			expect(doc.querySelector("p")).not.toBeNull();
		});

		it("treats aria-level=0 as regular paragraph", () => {
			const doc = createDoc(
				'<p role="heading" aria-level="0"><span>Not a heading</span></p>'
			);
			convertHeadings(doc, "online");
			expect(doc.querySelector("p")).not.toBeNull();
		});

		it("treats non-numeric aria-level as regular paragraph", () => {
			const doc = createDoc(
				'<p role="heading" aria-level="abc"><span>Not a heading</span></p>'
			);
			convertHeadings(doc, "online");
			expect(doc.querySelector("p")).not.toBeNull();
		});

		it("treats empty aria-level as regular paragraph", () => {
			const doc = createDoc(
				'<p role="heading" aria-level=""><span>Not a heading</span></p>'
			);
			convertHeadings(doc, "online");
			expect(doc.querySelector("p")).not.toBeNull();
		});

		it("invalid aria-level takes precedence over data-ccp-parastyle", () => {
			const doc = createDoc(
				'<p role="heading" aria-level="99"><span data-ccp-parastyle="heading 2">Text</span></p>'
			);
			convertHeadings(doc, "online");
			// Should remain a paragraph despite valid data-ccp-parastyle
			expect(doc.querySelector("h2")).toBeNull();
			expect(doc.querySelector("p")).not.toBeNull();
		});

		it("preserves innerHTML when converting", () => {
			const doc = createDoc(
				'<p role="heading" aria-level="2"><span class="TextRun"><strong>Bold Title</strong></span></p>'
			);
			convertHeadings(doc, "online");
			const h2 = doc.querySelector("h2");
			expect(h2).not.toBeNull();
			expect(h2?.innerHTML).toBe(
				'<span class="TextRun"><strong>Bold Title</strong></span>'
			);
		});
	});

	describe("Word Online — data-ccp-parastyle", () => {
		it("detects heading from data-ccp-parastyle on inner span", () => {
			const doc = createDoc(
				'<p><span data-ccp-parastyle="heading 3">Subtitle</span></p>'
			);
			convertHeadings(doc, "online");
			expect(doc.querySelector("h3")?.textContent).toBe("Subtitle");
		});

		it("handles case-insensitive data-ccp-parastyle", () => {
			const doc = createDoc(
				'<p><span data-ccp-parastyle="Heading 1">Title</span></p>'
			);
			convertHeadings(doc, "online");
			expect(doc.querySelector("h1")?.textContent).toBe("Title");
		});

		it("ignores invalid heading level in data-ccp-parastyle", () => {
			const doc = createDoc(
				'<p><span data-ccp-parastyle="heading 9">Text</span></p>'
			);
			convertHeadings(doc, "online");
			expect(doc.querySelector("p")).not.toBeNull();
		});

		it("does not match partial parastyle values", () => {
			const doc = createDoc(
				'<p><span data-ccp-parastyle="heading 1 extra">Text</span></p>'
			);
			convertHeadings(doc, "online");
			// "heading 1 extra" should NOT match the pattern "heading N"
			expect(doc.querySelector("h1")).toBeNull();
			expect(doc.querySelector("p")).not.toBeNull();
		});
	});

	describe("Word Desktop — MsoHeading class", () => {
		it("converts p with MsoHeading1 class to h1", () => {
			const doc = createDoc('<p class="MsoHeading1">Desktop Heading</p>');
			convertHeadings(doc, "desktop");
			expect(doc.querySelector("h1")?.textContent).toBe("Desktop Heading");
		});

		it("converts all levels 1 through 6", () => {
			const html = Array.from({ length: 6 }, (_, i) => {
				const level = i + 1;
				return `<p class="MsoHeading${level}">H${level}</p>`;
			}).join("");

			const doc = createDoc(html);
			convertHeadings(doc, "desktop");

			for (let level = 1; level <= 6; level++) {
				const heading = doc.querySelector(`h${level}`);
				expect(heading).not.toBeNull();
				expect(heading?.textContent).toBe(`H${level}`);
			}
		});

		it("handles case-insensitive class matching", () => {
			const doc = createDoc('<p class="msoheading2">Case Test</p>');
			convertHeadings(doc, "desktop");
			expect(doc.querySelector("h2")?.textContent).toBe("Case Test");
		});

		it("ignores MsoHeading with level outside 1-6", () => {
			const doc = createDoc('<p class="MsoHeading8">Not valid</p>');
			convertHeadings(doc, "desktop");
			expect(doc.querySelector("p")).not.toBeNull();
		});

		it("detects MsoHeading among multiple classes", () => {
			const doc = createDoc(
				'<p class="MsoNormal MsoHeading4 SomeOther">Multi-class</p>'
			);
			convertHeadings(doc, "desktop");
			expect(doc.querySelector("h4")?.textContent).toBe("Multi-class");
		});

		it("preserves innerHTML when converting desktop headings", () => {
			const doc = createDoc(
				'<p class="MsoHeading1"><b>Bold</b> and <i>italic</i></p>'
			);
			convertHeadings(doc, "desktop");
			const h1 = doc.querySelector("h1");
			expect(h1?.innerHTML).toBe("<b>Bold</b> and <i>italic</i>");
		});
	});

	describe("non-heading paragraphs", () => {
		it("leaves regular paragraphs untouched", () => {
			const doc = createDoc("<p>Just a paragraph</p>");
			convertHeadings(doc, "online");
			expect(doc.querySelector("p")?.textContent).toBe("Just a paragraph");
		});

		it("leaves paragraphs without role=heading untouched in online mode", () => {
			const doc = createDoc('<p class="MsoHeading1">Desktop style</p>');
			convertHeadings(doc, "online");
			// Online mode should not detect desktop-style headings
			expect(doc.querySelector("h1")).toBeNull();
			expect(doc.querySelector("p")).not.toBeNull();
		});

		it("leaves paragraphs without MsoHeading class untouched in desktop mode", () => {
			const doc = createDoc(
				'<p role="heading" aria-level="1">Online style</p>'
			);
			convertHeadings(doc, "desktop");
			// Desktop mode should not detect online-style headings
			expect(doc.querySelector("h1")).toBeNull();
			expect(doc.querySelector("p")).not.toBeNull();
		});
	});
});
