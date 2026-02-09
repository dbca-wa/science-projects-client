import { describe, it, expect } from "vitest";
import {
	sanitizeHtmlContent,
	sanitizeInput,
	sanitizeUrl,
	sanitizeRichText,
} from "./sanitize.utils";

describe("sanitize.utils", () => {
	describe("sanitizeHtmlContent", () => {
		it("should remove script tags", () => {
			const malicious = '<script>alert("XSS")</script><p>Safe content</p>';
			const result = sanitizeHtmlContent(malicious);
			expect(result).toBe("<p>Safe content</p>");
			expect(result).not.toContain("script");
		});

		it("should remove event handlers", () => {
			const malicious = '<p onclick="alert(\'XSS\')">Click me</p>';
			const result = sanitizeHtmlContent(malicious);
			expect(result).toBe("<p>Click me</p>");
			expect(result).not.toContain("onclick");
		});

		it("should preserve safe HTML tags", () => {
			const safe =
				"<p>Hello <strong>world</strong> with <em>emphasis</em></p>";
			const result = sanitizeHtmlContent(safe);
			expect(result).toContain("<p>");
			expect(result).toContain("<strong>");
			expect(result).toContain("<em>");
		});

		it("should allow safe links", () => {
			const safe = '<a href="https://example.com">Link</a>';
			const result = sanitizeHtmlContent(safe);
			expect(result).toContain('<a href="https://example.com">');
		});

		it("should remove javascript: protocol from links", () => {
			const malicious = '<a href="javascript:alert(\'XSS\')">Click</a>';
			const result = sanitizeHtmlContent(malicious);
			expect(result).not.toContain("javascript:");
		});
	});

	describe("sanitizeInput", () => {
		it("should remove all HTML tags", () => {
			const input = "<script>alert('XSS')</script>Hello";
			const result = sanitizeInput(input);
			expect(result).toBe("Hello");
			expect(result).not.toContain("<");
		});

		it("should remove safe HTML tags too", () => {
			const input = "<p>Hello <strong>world</strong></p>";
			const result = sanitizeInput(input);
			expect(result).toBe("Hello world");
			expect(result).not.toContain("<");
		});

		it("should preserve plain text", () => {
			const input = "Just plain text";
			const result = sanitizeInput(input);
			expect(result).toBe("Just plain text");
		});
	});

	describe("sanitizeUrl", () => {
		it("should allow https URLs", () => {
			const url = "https://example.com";
			const result = sanitizeUrl(url);
			expect(result).toBe("https://example.com/");
		});

		it("should allow http URLs", () => {
			const url = "http://example.com";
			const result = sanitizeUrl(url);
			expect(result).toBe("http://example.com/");
		});

		it("should allow mailto URLs", () => {
			const url = "mailto:test@example.com";
			const result = sanitizeUrl(url);
			expect(result).toBe("mailto:test@example.com");
		});

		it("should add https:// to URLs without protocol", () => {
			const url = "example.com";
			const result = sanitizeUrl(url);
			expect(result).toBe("https://example.com/");
		});

		it("should block javascript: protocol", () => {
			const malicious = "javascript:alert('XSS')";
			const result = sanitizeUrl(malicious);
			expect(result).toBe("");
		});

		it("should block data: protocol", () => {
			const malicious = "data:text/html,<script>alert('XSS')</script>";
			const result = sanitizeUrl(malicious);
			expect(result).toBe("");
		});

		it("should return empty string for invalid URLs", () => {
			const invalid = "not a url";
			const result = sanitizeUrl(invalid);
			expect(result).toBe("");
		});
	});

	describe("sanitizeRichText", () => {
		it("should allow more tags than sanitizeHtmlContent", () => {
			const richText =
				'<div><span class="highlight">Text</span><img src="image.jpg" alt="Image" /></div>';
			const result = sanitizeRichText(richText);
			expect(result).toContain("<div>");
			expect(result).toContain("<span");
			expect(result).toContain("<img");
		});

		it("should still remove script tags", () => {
			const malicious =
				'<div><script>alert("XSS")</script><p>Safe</p></div>';
			const result = sanitizeRichText(malicious);
			expect(result).not.toContain("script");
			expect(result).toContain("<p>Safe</p>");
		});

		it("should allow table elements", () => {
			const table =
				"<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Data</td></tr></tbody></table>";
			const result = sanitizeRichText(table);
			expect(result).toContain("<table>");
			expect(result).toContain("<thead>");
			expect(result).toContain("<tbody>");
		});
	});
});
