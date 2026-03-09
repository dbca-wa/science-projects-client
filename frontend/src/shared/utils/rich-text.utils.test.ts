import { describe, it, expect } from "vitest";
import {
	isPlainText,
	convertPlainTextToRichText,
	ensureRichText,
} from "./rich-text.utils";

describe("rich-text.utils", () => {
	describe("isPlainText", () => {
		it("should return true for plain text", () => {
			expect(isPlainText("This is plain text")).toBe(true);
			expect(
				isPlainText("subsequent attempts to contact Kirsten also failed")
			).toBe(true);
		});

		it("should return false for HTML text", () => {
			expect(
				isPlainText(
					'<p class="editor-p-light"><span style="">Provisional Approval</span></p>'
				)
			).toBe(false);
			expect(isPlainText("<p>Some text</p>")).toBe(false);
			expect(isPlainText("<div>Content</div>")).toBe(false);
		});

		it("should return true for empty string", () => {
			expect(isPlainText("")).toBe(true);
		});
	});

	describe("convertPlainTextToRichText", () => {
		it("should wrap plain text in proper HTML structure", () => {
			const result = convertPlainTextToRichText("Provisional Approval");
			expect(result).toBe(
				'<p class="editor-p-light"><span style="">Provisional Approval</span></p>'
			);
		});

		it("should handle multi-line text", () => {
			const text = "Line 1\nLine 2\nLine 3";
			const result = convertPlainTextToRichText(text);
			expect(result).toContain(
				'<p class="editor-p-light"><span style="">Line 1</span></p>'
			);
			expect(result).toContain(
				'<p class="editor-p-light"><span style="">Line 2</span></p>'
			);
			expect(result).toContain(
				'<p class="editor-p-light"><span style="">Line 3</span></p>'
			);
		});

		it("should escape HTML entities in plain text", () => {
			const text = "Text with <tags> & special chars";
			const result = convertPlainTextToRichText(text);
			expect(result).toContain("&lt;tags&gt;");
			expect(result).toContain("&amp;");
		});

		it("should return default HTML for empty string", () => {
			const result = convertPlainTextToRichText("");
			expect(result).toBe(
				'<p class="editor-p-light"><span style=""></span></p>'
			);
		});

		it("should return HTML as-is if already has tags", () => {
			const html =
				'<p class="editor-p-light"><span style="">Already HTML</span></p>';
			const result = convertPlainTextToRichText(html);
			expect(result).toBe(html);
		});
	});

	describe("ensureRichText", () => {
		it("should convert plain text to rich text", () => {
			const result = ensureRichText("Plain text");
			expect(result).toBe(
				'<p class="editor-p-light"><span style="">Plain text</span></p>'
			);
		});

		it("should leave HTML unchanged", () => {
			const html =
				'<p class="editor-p-light"><span style="">HTML text</span></p>';
			const result = ensureRichText(html);
			expect(result).toBe(html);
		});

		it("should handle empty string", () => {
			const result = ensureRichText("");
			expect(result).toBe(
				'<p class="editor-p-light"><span style=""></span></p>'
			);
		});

		it("should handle the example plain text comment", () => {
			const plainText =
				"subsequent attempts to contact Kirsten also failed. BNHCRC has funded projects with ANU and DFES on fuel moisture calibration and with Murdoch on fuel accumulation, patterns and Yanchep bushfire severity. They are seeking to extend this research through the new NHRA.";
			const result = ensureRichText(plainText);
			expect(result).toContain('<p class="editor-p-light">');
			expect(result).toContain(
				"subsequent attempts to contact Kirsten also failed"
			);
			expect(result).toContain("</span></p>");
		});
	});
});
