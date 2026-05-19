import { describe, it, expect } from "vitest";
import { detectWordSource } from "./word-detector";

describe("detectWordSource", () => {
	describe("Word Online detection", () => {
		it("detects data-ccp-parastyle attribute", () => {
			const html = `<p><span data-ccp-parastyle="Normal">Hello</span></p>`;
			const result = detectWordSource(html);
			expect(result).toEqual({ isWord: true, variant: "online" });
		});

		it("detects ListMarkerWrappingSpan class", () => {
			const html = `<li><span class="ListMarkerWrappingSpan">1.</span><span>Item</span></li>`;
			const result = detectWordSource(html);
			expect(result).toEqual({ isWord: true, variant: "online" });
		});

		it("detects role=heading combined with aria-level", () => {
			const html = `<p role="heading" aria-level="1"><span>Heading</span></p>`;
			const result = detectWordSource(html);
			expect(result).toEqual({ isWord: true, variant: "online" });
		});

		it("does not detect role=heading without aria-level", () => {
			const html = `<p role="heading"><span>Not a Word heading</span></p>`;
			const result = detectWordSource(html);
			expect(result).toEqual({ isWord: false, variant: null });
		});

		it("does not detect aria-level without role=heading", () => {
			const html = `<p aria-level="2"><span>Not a Word heading</span></p>`;
			const result = detectWordSource(html);
			expect(result).toEqual({ isWord: false, variant: null });
		});
	});

	describe("Word Desktop detection", () => {
		it("detects urn:schemas-microsoft-com:office:word namespace", () => {
			const html = `<html xmlns:w="urn:schemas-microsoft-com:office:word"><body><p>Hello</p></body></html>`;
			const result = detectWordSource(html);
			expect(result).toEqual({ isWord: true, variant: "desktop" });
		});

		it("detects MsoNormal class", () => {
			const html = `<p class="MsoNormal">Normal paragraph</p>`;
			const result = detectWordSource(html);
			expect(result).toEqual({ isWord: true, variant: "desktop" });
		});

		it("detects MsoListParagraph class", () => {
			const html = `<p class="MsoListParagraph" style="margin-left:36pt">List item</p>`;
			const result = detectWordSource(html);
			expect(result).toEqual({ isWord: true, variant: "desktop" });
		});
	});

	describe("Generic Word detection", () => {
		it("detects mso- style prefix as desktop variant", () => {
			const html = `<p style="mso-line-height-rule:exactly;mso-pagination:widow-orphan">Text</p>`;
			const result = detectWordSource(html);
			expect(result).toEqual({ isWord: true, variant: "desktop" });
		});

		it("detects mso- in inline styles without other markers", () => {
			const html = `<span style="font-size:11pt;mso-bidi-font-size:12pt">Text</span>`;
			const result = detectWordSource(html);
			expect(result).toEqual({ isWord: true, variant: "desktop" });
		});
	});

	describe("Non-Word content", () => {
		it("returns isWord false for plain HTML", () => {
			const html = `<p>Just a normal paragraph</p>`;
			const result = detectWordSource(html);
			expect(result).toEqual({ isWord: false, variant: null });
		});

		it("returns isWord false for Google Docs content", () => {
			const html = `<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-abc123"><span style="font-size:11pt;font-family:Arial">Google Docs text</span></b>`;
			const result = detectWordSource(html);
			expect(result).toEqual({ isWord: false, variant: null });
		});

		it("returns isWord false for empty string", () => {
			const result = detectWordSource("");
			expect(result).toEqual({ isWord: false, variant: null });
		});
	});

	describe("Mixed content (Online + Desktop markers)", () => {
		it("prefers Online detection when both markers are present", () => {
			const html = `<html xmlns:w="urn:schemas-microsoft-com:office:word"><body><p class="MsoNormal"><span data-ccp-parastyle="Normal">Mixed</span></p></body></html>`;
			const result = detectWordSource(html);
			expect(result).toEqual({ isWord: true, variant: "online" });
		});

		it("prefers Online when Desktop namespace and ListMarkerWrappingSpan both present", () => {
			const html = `<html xmlns:w="urn:schemas-microsoft-com:office:word"><body><li><span class="ListMarkerWrappingSpan">1.</span>Item</li></body></html>`;
			const result = detectWordSource(html);
			expect(result).toEqual({ isWord: true, variant: "online" });
		});

		it("prefers Online when mso- styles and data-ccp-parastyle both present", () => {
			const html = `<p style="mso-line-height-rule:exactly"><span data-ccp-parastyle="heading 1">Heading</span></p>`;
			const result = detectWordSource(html);
			expect(result).toEqual({ isWord: true, variant: "online" });
		});
	});
});
