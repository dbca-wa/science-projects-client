import { describe, it, expect, vi } from "vitest";
import { resolveWordDesktopStyles } from "./word-style-resolver";

describe("word-style-resolver", () => {
	describe("resolveWordDesktopStyles", () => {
		it("should inline font-weight: bold from style block onto matching elements", () => {
			const html = `
				<style>.Bold0 { font-weight: bold; }</style>
				<p><span class="Bold0">Bold text</span></p>
			`;
			const result = resolveWordDesktopStyles(html);
			expect(result).toContain("font-weight: bold");
			expect(result).toContain("Bold text");
			expect(result).not.toContain("<style>");
		});

		it("should inline font-style: italic from style block onto matching elements", () => {
			const html = `
				<style>.Italic0 { font-style: italic; }</style>
				<p><span class="Italic0">Italic text</span></p>
			`;
			const result = resolveWordDesktopStyles(html);
			expect(result).toContain("font-style: italic");
			expect(result).toContain("Italic text");
		});

		it("should resolve multiple classes on one element", () => {
			const html = `
				<style>
					.Bold0 { font-weight: bold; }
					.Italic0 { font-style: italic; }
				</style>
				<p><span class="Bold0 Italic0">Bold and italic</span></p>
			`;
			const result = resolveWordDesktopStyles(html);
			expect(result).toContain("font-weight: bold");
			expect(result).toContain("font-style: italic");
		});

		it("should NOT inline non-formatting properties (font-family, font-size, color)", () => {
			const html = `
				<style>
					.Normal0 {
						font-family: Calibri;
						font-size: 11pt;
						color: #000000;
						line-height: 1.5;
						font-weight: bold;
					}
				</style>
				<p><span class="Normal0">Text</span></p>
			`;
			const result = resolveWordDesktopStyles(html);
			expect(result).toContain("font-weight: bold");
			expect(result).not.toContain("font-family");
			expect(result).not.toContain("font-size");
			expect(result).not.toContain("color");
			expect(result).not.toContain("line-height");
		});

		it("should preserve existing inline styles and not overwrite them", () => {
			const html = `
				<style>.Bold0 { font-weight: bold; font-style: italic; }</style>
				<p><span class="Bold0" style="font-style: normal">Not italic but bold</span></p>
			`;
			const result = resolveWordDesktopStyles(html);
			// font-style: normal was already inline — should not be overwritten
			expect(result).toContain("font-style: normal");
			// font-weight: bold should be added
			expect(result).toContain("font-weight: bold");
		});

		it("should handle text-decoration (underline) from style block", () => {
			const html = `
				<style>.Underline0 { text-decoration: underline; }</style>
				<p><span class="Underline0">Underlined</span></p>
			`;
			const result = resolveWordDesktopStyles(html);
			expect(result).toContain("text-decoration: underline");
		});

		it("should handle vertical-align (superscript/subscript) from style block", () => {
			const html = `
				<style>.Super0 { vertical-align: super; }</style>
				<p><span class="Super0">superscript</span></p>
			`;
			const result = resolveWordDesktopStyles(html);
			expect(result).toContain("vertical-align: super");
		});

		it("should return HTML unchanged when there is no style block", () => {
			const html = '<p><span class="Bold0">Text</span></p>';
			const result = resolveWordDesktopStyles(html);
			expect(result).toContain("Text");
			// No style attribute should have been added (no style block to resolve from)
			expect(result).not.toContain("font-weight");
		});

		it("should return HTML unchanged when style block has no formatting rules", () => {
			const html = `
				<style>.Normal0 { font-family: Calibri; font-size: 11pt; }</style>
				<p><span class="Normal0">Text</span></p>
			`;
			const result = resolveWordDesktopStyles(html);
			// No formatting-relevant properties found, so no inline styles added to elements
			// The function returns original HTML unchanged (including the style block text)
			expect(result).toContain("Text");
			expect(result).not.toContain('style="');
		});

		it("should handle malformed/empty style block gracefully", () => {
			const html = `
				<style></style>
				<p>Text</p>
			`;
			const result = resolveWordDesktopStyles(html);
			expect(result).toContain("Text");
		});

		it("should handle multiple style blocks", () => {
			const html = `
				<style>.Bold0 { font-weight: bold; }</style>
				<style>.Italic0 { font-style: italic; }</style>
				<p><span class="Bold0">Bold</span> <span class="Italic0">Italic</span></p>
			`;
			const result = resolveWordDesktopStyles(html);
			expect(result).toContain("font-weight: bold");
			expect(result).toContain("font-style: italic");
		});

		it("should remove style elements from output", () => {
			const html = `
				<style>.Bold0 { font-weight: bold; }</style>
				<p><span class="Bold0">Text</span></p>
			`;
			const result = resolveWordDesktopStyles(html);
			expect(result).not.toContain("<style>");
			expect(result).not.toContain("</style>");
		});

		it("should return original HTML on parsing error", () => {
			// Mock DOMParser to throw
			const originalDOMParser = global.DOMParser;
			global.DOMParser = class {
				parseFromString() {
					throw new Error("Parse failed");
				}
			} as unknown as typeof DOMParser;

			const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

			const html = "<p>Some content</p>";
			const result = resolveWordDesktopStyles(html);
			expect(result).toBe(html);
			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("[WordStyleResolver]")
			);

			consoleSpy.mockRestore();
			global.DOMParser = originalDOMParser;
		});

		it("should handle Word Desktop MsoNormal with formatting in style block", () => {
			const html = `
				<style>
					.MsoNormal { font-family: Calibri; font-size: 11pt; }
					.BoldChar { font-weight: bold; }
				</style>
				<p class="MsoNormal"><span class="BoldChar">Important text</span> normal text</p>
			`;
			const result = resolveWordDesktopStyles(html);
			expect(result).toContain("font-weight: bold");
			expect(result).toContain("Important text");
			expect(result).not.toContain("font-family");
		});
	});
});
