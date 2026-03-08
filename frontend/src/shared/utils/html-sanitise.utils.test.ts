import { describe, it, expect } from "vitest";
import {
	sanitiseHtml,
	isHtmlSafe,
	sanitiseDiffHtml,
} from "./html-sanitise.utils";

describe("sanitiseHtml", () => {
	describe("Safe HTML", () => {
		it("should allow safe formatting tags", () => {
			expect(sanitiseHtml("<p>Paragraph</p>")).toBe("<p>Paragraph</p>");
			expect(sanitiseHtml("<strong>Bold</strong>")).toBe(
				"<strong>Bold</strong>"
			);
			expect(sanitiseHtml("<em>Italic</em>")).toBe("<em>Italic</em>");
			expect(sanitiseHtml("<u>Underline</u>")).toBe("<u>Underline</u>");
		});

		it("should allow safe heading tags", () => {
			expect(sanitiseHtml("<h2>Heading 2</h2>")).toBe("<h2>Heading 2</h2>");
			expect(sanitiseHtml("<h3>Heading 3</h3>")).toBe("<h3>Heading 3</h3>");
			expect(sanitiseHtml("<h4>Heading 4</h4>")).toBe("<h4>Heading 4</h4>");
		});

		it("should allow safe list tags", () => {
			expect(sanitiseHtml("<ul><li>Item</li></ul>")).toBe(
				"<ul><li>Item</li></ul>"
			);
			expect(sanitiseHtml("<ol><li>Item</li></ol>")).toBe(
				"<ol><li>Item</li></ol>"
			);
		});

		it("should allow safe link tags with href", () => {
			expect(sanitiseHtml('<a href="https://example.com">Link</a>')).toBe(
				'<a href="https://example.com">Link</a>'
			);
		});

		it("should allow line breaks", () => {
			expect(sanitiseHtml("Line 1<br>Line 2")).toBe("Line 1<br>Line 2");
			expect(sanitiseHtml("Line 1<br />Line 2")).toBe("Line 1<br>Line 2");
		});

		it("should allow blockquote and code tags", () => {
			expect(sanitiseHtml("<blockquote>Quote</blockquote>")).toBe(
				"<blockquote>Quote</blockquote>"
			);
			expect(sanitiseHtml("<code>code</code>")).toBe("<code>code</code>");
			expect(sanitiseHtml("<pre>preformatted</pre>")).toBe(
				"<pre>preformatted</pre>"
			);
		});
	});

	describe("Dangerous HTML removal", () => {
		it("should remove script tags", () => {
			expect(sanitiseHtml("<script>alert('xss')</script>")).toBe("");
			expect(sanitiseHtml("<p>Text</p><script>alert('xss')</script>")).toBe(
				"<p>Text</p>"
			);
		});

		it("should remove inline event handlers", () => {
			expect(sanitiseHtml("<p onclick='alert()'>Text</p>")).toBe("<p>Text</p>");
			expect(sanitiseHtml("<a href='#' onmouseover='alert()'>Link</a>")).toBe(
				'<a href="#">Link</a>'
			);
			expect(sanitiseHtml("<img src='x' onerror='alert()' />")).toBe("");
		});

		it("should remove dangerous protocols", () => {
			expect(sanitiseHtml("<a href='javascript:alert()'>Link</a>")).toBe(
				"<a>Link</a>"
			);
			expect(
				sanitiseHtml(
					"<a href='data:text/html,<script>alert()</script>'>Link</a>"
				)
			).toBe("<a>Link</a>");
		});

		it("should remove style tags and attributes", () => {
			expect(sanitiseHtml("<style>body { display: none; }</style>")).toBe("");
			expect(sanitiseHtml("<p style='color: red;'>Text</p>")).toBe(
				"<p>Text</p>"
			);
		});

		it("should remove iframe tags", () => {
			expect(sanitiseHtml("<iframe src='evil.com'></iframe>")).toBe("");
		});

		it("should remove object and embed tags", () => {
			expect(sanitiseHtml("<object data='evil.swf'></object>")).toBe("");
			expect(sanitiseHtml("<embed src='evil.swf' />")).toBe("");
		});

		it("should remove form tags", () => {
			expect(sanitiseHtml("<form><input type='text' /></form>")).toBe("");
		});
	});

	describe("XSS attack prevention", () => {
		it("should prevent XSS via img tag", () => {
			expect(sanitiseHtml("<img src=x onerror='alert(1)' />")).toBe("");
		});

		it("should prevent XSS via svg tag", () => {
			expect(sanitiseHtml("<svg onload='alert(1)'></svg>")).toBe("");
		});

		it("should prevent XSS via link href", () => {
			expect(sanitiseHtml("<a href='javascript:alert(1)'>Click</a>")).toBe(
				"<a>Click</a>"
			);
		});

		it("should prevent XSS via data attributes", () => {
			expect(
				sanitiseHtml("<p data-evil='<script>alert(1)</script>'>Text</p>")
			).toBe("<p>Text</p>");
		});

		it("should prevent XSS via nested tags", () => {
			expect(
				sanitiseHtml("<p><script>alert(1)</script><strong>Text</strong></p>")
			).toBe("<p><strong>Text</strong></p>");
		});
	});

	describe("Edge cases", () => {
		it("should handle empty strings", () => {
			expect(sanitiseHtml("")).toBe("");
			expect(sanitiseHtml("   ")).toBe("");
		});

		it("should handle plain text", () => {
			expect(sanitiseHtml("Plain text")).toBe("Plain text");
		});

		it("should handle malformed HTML", () => {
			expect(sanitiseHtml("<p>Unclosed paragraph")).toBe(
				"<p>Unclosed paragraph</p>"
			);
			expect(sanitiseHtml("<strong>Bold<em>Italic</strong></em>")).toBe(
				"<strong>Bold<em>Italic</em></strong>"
			);
		});

		it("should handle mixed safe and dangerous content", () => {
			const input = `
        <p>Safe paragraph</p>
        <script>alert('xss')</script>
        <strong>Bold text</strong>
        <p onclick='alert()'>Paragraph with event</p>
      `;
			const output = sanitiseHtml(input);
			expect(output).toContain("<p>Safe paragraph</p>");
			expect(output).toContain("<strong>Bold text</strong>");
			expect(output).not.toContain("script");
			expect(output).not.toContain("onclick");
		});
	});

	describe("Real-world examples", () => {
		it("should sanitise project description", () => {
			const input = `
        <p>This project aims to <strong>improve biodiversity</strong>.</p>
        <script>alert('xss')</script>
        <ul>
          <li>Survey native species</li>
          <li onclick='alert()'>Monitor habitat</li>
        </ul>
      `;
			const output = sanitiseHtml(input);
			expect(output).toContain(
				"<p>This project aims to <strong>improve biodiversity</strong>.</p>"
			);
			expect(output).toContain("<li>Survey native species</li>");
			expect(output).toContain("<li>Monitor habitat</li>");
			expect(output).not.toContain("script");
			expect(output).not.toContain("onclick");
		});

		it("should sanitise formatted text with links", () => {
			const input = `
        <h2>Background</h2>
        <p>Visit <a href="https://example.com">our website</a> for more info.</p>
        <p>Or click <a href="javascript:alert()">this malicious link</a>.</p>
      `;
			const output = sanitiseHtml(input);
			expect(output).toContain("<h2>Background</h2>");
			expect(output).toContain('<a href="https://example.com">our website</a>');
			expect(output).not.toContain("javascript:");
		});
	});
});

describe("isHtmlSafe", () => {
	it("should return true for safe HTML", () => {
		expect(isHtmlSafe("<p>Safe content</p>")).toBe(true);
		expect(isHtmlSafe("<strong>Bold</strong> <em>italic</em>")).toBe(true);
		expect(isHtmlSafe('<a href="https://example.com">Link</a>')).toBe(true);
	});

	it("should return false for dangerous HTML", () => {
		expect(isHtmlSafe("<script>alert('xss')</script>")).toBe(false);
		expect(isHtmlSafe("<p onclick='alert()'>Text</p>")).toBe(false);
		expect(isHtmlSafe("<a href='javascript:alert()'>Link</a>")).toBe(false);
	});

	it("should return true for plain text", () => {
		expect(isHtmlSafe("Plain text")).toBe(true);
	});

	it("should return true for empty strings", () => {
		expect(isHtmlSafe("")).toBe(true);
		expect(isHtmlSafe("   ")).toBe(true);
	});
});

describe("sanitiseDiffHtml", () => {
	it("should allow span tags with class attributes for diff highlighting", () => {
		const input =
			'<p>Text with <span class="diff-addition">added</span> content</p>';
		const output = sanitiseDiffHtml(input);
		expect(output).toContain('<span class="diff-addition">added</span>');
	});

	it("should allow span tags with aria-label for accessibility", () => {
		const input =
			'<span class="diff-deletion" aria-label="Deleted text">removed</span>';
		const output = sanitiseDiffHtml(input);
		expect(output).toContain('aria-label="Deleted text"');
	});

	it("should preserve rich text formatting with diff spans", () => {
		const input = `
      <p>This is <strong>bold</strong> text.</p>
      <p>This has <span class="diff-addition">added content</span>.</p>
      <ul>
        <li>Item with <span class="diff-deletion" aria-label="Deleted">removed</span> text</li>
      </ul>
    `;
		const output = sanitiseDiffHtml(input);
		expect(output).toContain("<strong>bold</strong>");
		expect(output).toContain(
			'<span class="diff-addition">added content</span>'
		);
		expect(output).toContain('<span class="diff-deletion"');
	});

	it("should still remove dangerous content", () => {
		const input = `
      <p>Safe content</p>
      <script>alert('xss')</script>
      <span class="diff-addition">Added</span>
      <p onclick="alert()">Dangerous</p>
    `;
		const output = sanitiseDiffHtml(input);
		expect(output).toContain("<p>Safe content</p>");
		expect(output).toContain('<span class="diff-addition">Added</span>');
		expect(output).not.toContain("script");
		expect(output).not.toContain("onclick");
	});

	it("should remove style attributes even in diff mode", () => {
		// Style attributes should still be removed for security
		const input = '<span class="diff-addition" style="color: red;">Text</span>';
		const output = sanitiseDiffHtml(input);
		expect(output).toContain('<span class="diff-addition">Text</span>');
		expect(output).not.toContain("style=");
	});

	it("should handle empty strings", () => {
		expect(sanitiseDiffHtml("")).toBe("");
		expect(sanitiseDiffHtml("   ")).toBe("");
	});
});
