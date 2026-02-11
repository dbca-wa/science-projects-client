import { describe, it, expect } from "vitest";
import {
	styleHtmlForDisplay,
	isEmptyRichTextContent,
	getStyledHtmlOrFallback,
	extractTextFromHTML,
} from "./html-display.utils";

describe("html-display.utils", () => {
	describe("styleHtmlForDisplay", () => {
		it("should remove bold tags but keep content", () => {
			const html = "<p><b>Bold text</b> normal text</p>";
			const result = styleHtmlForDisplay(html);
			expect(result).not.toContain("<b>");
			expect(result).toContain("Bold text");
			expect(result).toContain("normal text");
		});

		it("should remove strong tags but keep content", () => {
			const html = "<p><strong>Strong text</strong> normal text</p>";
			const result = styleHtmlForDisplay(html);
			expect(result).not.toContain("<strong>");
			expect(result).toContain("Strong text");
			expect(result).toContain("normal text");
		});

		it("should style links with Tailwind classes", () => {
			const html = '<a href="https://example.com">Link</a>';
			const result = styleHtmlForDisplay(html);
			expect(result).toContain(
				'class="text-blue-600 dark:text-blue-400 underline'
			);
			expect(result).toContain('target="_blank"');
			expect(result).toContain('rel="noopener noreferrer"');
		});

		it("should remove inline styles from elements", () => {
			const html = '<p style="color: red;">Text</p>';
			const result = styleHtmlForDisplay(html);
			expect(result).not.toContain("style=");
			expect(result).toContain("<p>");
			expect(result).toContain("Text");
		});

		it("should handle empty string", () => {
			const result = styleHtmlForDisplay("");
			expect(result).toBe("");
		});

		it("should preserve paragraph structure", () => {
			const html = "<p>First paragraph</p><p>Second paragraph</p>";
			const result = styleHtmlForDisplay(html);
			expect(result).toContain("<p>First paragraph</p>");
			expect(result).toContain("<p>Second paragraph</p>");
		});

		it("should handle mixed content", () => {
			const html =
				'<p><b>Bold</b> and <a href="https://example.com" style="color: red;">link</a></p>';
			const result = styleHtmlForDisplay(html);
			expect(result).not.toContain("<b>");
			expect(result).toContain("Bold");
			expect(result).toContain('class="text-blue-600');
			expect(result).not.toContain('style="color: red;"');
		});
	});

	describe("isEmptyRichTextContent", () => {
		it("should return true for undefined", () => {
			expect(isEmptyRichTextContent(undefined)).toBe(true);
		});

		it("should return true for empty string", () => {
			expect(isEmptyRichTextContent("")).toBe(true);
		});

		it("should return true for empty paragraph", () => {
			expect(isEmptyRichTextContent("<p></p>")).toBe(true);
		});

		it("should return true for light editor empty paragraph", () => {
			expect(isEmptyRichTextContent('<p class="editor-p-light"><br></p>')).toBe(
				true
			);
		});

		it("should return true for dark editor empty paragraph", () => {
			expect(isEmptyRichTextContent('<p class="editor-p-dark"><br></p>')).toBe(
				true
			);
		});

		it("should return false for content with text", () => {
			expect(isEmptyRichTextContent("<p>Some text</p>")).toBe(false);
		});

		it("should return false for content with formatted text", () => {
			expect(isEmptyRichTextContent("<p><strong>Bold</strong></p>")).toBe(
				false
			);
		});
	});

	describe("getStyledHtmlOrFallback", () => {
		it("should return fallback for undefined content", () => {
			const result = getStyledHtmlOrFallback(undefined);
			expect(result).toBe("<p>(Not Provided)</p>");
		});

		it("should return fallback for empty content", () => {
			const result = getStyledHtmlOrFallback("");
			expect(result).toBe("<p>(Not Provided)</p>");
		});

		it("should return fallback for empty paragraph", () => {
			const result = getStyledHtmlOrFallback("<p></p>");
			expect(result).toBe("<p>(Not Provided)</p>");
		});

		it("should use custom fallback text", () => {
			const result = getStyledHtmlOrFallback(undefined, "No data");
			expect(result).toBe("<p>No data</p>");
		});

		it("should style and return non-empty content", () => {
			const html = "<p><b>Bold text</b></p>";
			const result = getStyledHtmlOrFallback(html);
			expect(result).not.toContain("<b>");
			expect(result).toContain("Bold text");
		});

		it("should handle content with links", () => {
			const html = '<p><a href="https://example.com">Link</a></p>';
			const result = getStyledHtmlOrFallback(html);
			expect(result).toContain('class="text-blue-600');
			expect(result).toContain('target="_blank"');
		});
	});

	describe("extractTextFromHTML", () => {
		it("should extract plain text from HTML", () => {
			const html = "<p>Hello <strong>world</strong></p>";
			const result = extractTextFromHTML(html);
			expect(result).toBe("Hello world");
		});

		it("should remove all HTML tags", () => {
			const html = '<div><p>Text with <a href="#">link</a></p></div>';
			const result = extractTextFromHTML(html);
			expect(result).toBe("Text with link");
			expect(result).not.toContain("<");
		});

		it("should handle empty HTML", () => {
			const result = extractTextFromHTML("");
			expect(result).toBe("");
		});

		it("should handle nested tags", () => {
			const html = "<div><p><strong><em>Nested</em></strong> text</p></div>";
			const result = extractTextFromHTML(html);
			expect(result).toBe("Nested text");
		});

		it("should preserve spaces", () => {
			const html = "<p>Word1 Word2  Word3</p>";
			const result = extractTextFromHTML(html);
			expect(result).toContain("Word1 Word2");
		});
	});
});
