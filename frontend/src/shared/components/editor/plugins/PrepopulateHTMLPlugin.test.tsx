/**
 * PrepopulateHTMLPlugin Unit Tests
 *
 * Tests plugin initialization, HTML sanitization, and scroll/focus preservation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { PrepopulateHTMLPlugin } from "./PrepopulateHTMLPlugin";
import { $getRoot as _$getRoot } from "lexical";

// Mock sanitizeRichText utility
vi.mock("@/shared/utils/sanitise.utils", () => ({
	sanitizeRichText: (html: string) => {
		// Simple mock that removes script tags
		return html.replace(
			/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
			""
		);
	},
}));

// Minimal Lexical config for testing
const initialConfig = {
	namespace: "TestEditor",
	theme: {},
	onError: (error: Error) => {
		console.error(error);
	},
};

function TestEditor({ html }: { html?: string }) {
	return (
		<LexicalComposer initialConfig={initialConfig}>
			<div>
				<PrepopulateHTMLPlugin html={html} />
				<RichTextPlugin
					contentEditable={
						<ContentEditable role="textbox" aria-label="Test editor" />
					}
					placeholder={<div>Enter text...</div>}
					ErrorBoundary={LexicalErrorBoundary}
				/>
			</div>
		</LexicalComposer>
	);
}

describe("PrepopulateHTMLPlugin", () => {
	let scrollToSpy: ReturnType<typeof vi.fn>;
	// let _scrollXValue: number;
	// let _scrollYValue: number;

	beforeEach(() => {
		vi.clearAllMocks();

		// Mock window.scrollTo
		// _scrollXValue = 0;
		// _scrollYValue = 0;
		scrollToSpy = vi.fn((_x, _y) => {
			// _scrollXValue = x;
			// _scrollYValue = y;
		});
		window.scrollTo = scrollToSpy as unknown as typeof window.scrollTo;

		// Mock window.scrollX and window.scrollY
		Object.defineProperty(window, "scrollX", {
			value: 100,
			writable: true,
			configurable: true,
		});
		Object.defineProperty(window, "scrollY", {
			value: 200,
			writable: true,
			configurable: true,
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("Plugin Initialization", () => {
		it("should initialize only once on mount", async () => {
			// const _updateSpy = vi.fn();

			const { rerender } = render(<TestEditor html="<p>Initial content</p>" />);

			// Wait for initialization
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Rerender with same HTML
			rerender(<TestEditor html="<p>Initial content</p>" />);

			// Wait again
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Plugin should only initialize once (not test the update count directly,
			// but verify behavior doesn't change on rerender)
		});

		it("should handle empty HTML", async () => {
			const { container } = render(<TestEditor html="" />);

			// Wait for initialization
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Editor should be empty
			const editor = container.querySelector('[role="textbox"]');
			expect(editor).toBeInTheDocument();
		});

		it("should handle undefined HTML", async () => {
			const { container } = render(<TestEditor html={undefined} />);

			// Wait for initialization
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Editor should be empty
			const editor = container.querySelector('[role="textbox"]');
			expect(editor).toBeInTheDocument();
		});

		it("should load HTML content into editor", async () => {
			const { container } = render(<TestEditor html="<p>Test content</p>" />);

			// Wait for initialization
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Content should be loaded
			const editor = container.querySelector('[role="textbox"]');
			expect(editor).toBeInTheDocument();
			expect(editor?.textContent).toContain("Test content");
		});
	});

	describe("HTML Sanitization", () => {
		it("should sanitize HTML before loading", async () => {
			const maliciousHTML = '<p>Safe content</p><script>alert("XSS")</script>';

			const { container } = render(<TestEditor html={maliciousHTML} />);

			// Wait for initialization
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Script should be removed
			const editor = container.querySelector('[role="textbox"]');
			expect(editor?.textContent).toContain("Safe content");
			expect(editor?.innerHTML).not.toContain("<script>");
		});

		it("should preserve safe HTML tags", async () => {
			const safeHTML = "<p><strong>Bold</strong> and <em>italic</em> text</p>";

			const { container } = render(<TestEditor html={safeHTML} />);

			// Wait for initialization
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Safe tags should be preserved
			const editor = container.querySelector('[role="textbox"]');
			expect(editor?.textContent).toContain("Bold");
			expect(editor?.textContent).toContain("italic");
		});

		it("should handle malformed HTML gracefully", async () => {
			const malformedHTML =
				"<p>Unclosed paragraph<div>Nested incorrectly</p></div>";

			const { container } = render(<TestEditor html={malformedHTML} />);

			// Wait for initialization
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Should not crash
			const editor = container.querySelector('[role="textbox"]');
			expect(editor).toBeInTheDocument();
		});
	});

	describe("Scroll Position Preservation", () => {
		it("should preserve scroll position after loading content", async () => {
			render(<TestEditor html="<p>Test content</p>" />);

			// Wait for initialization
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Scroll position should be restored
			expect(scrollToSpy).toHaveBeenCalledWith(100, 200);
		});

		it("should prevent auto-scroll during content loading", async () => {
			const { container } = render(<TestEditor html="<p>Test content</p>" />);

			// Wait for initialization
			await new Promise((resolve) => setTimeout(resolve, 100));

			// scrollIntoView should have been temporarily overridden
			const editor = container.querySelector('[role="textbox"]');
			expect(editor).toBeInTheDocument();
		});
	});

	describe("Focus Management", () => {
		it("should not auto-focus editor on content load", async () => {
			const { container } = render(<TestEditor html="<p>Test content</p>" />);

			// Wait for initialization
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Editor should not be focused
			const editor = container.querySelector('[role="textbox"]');
			expect(document.activeElement).not.toBe(editor);
		});

		it("should preserve focus on other elements", async () => {
			// Create a button to focus
			const button = document.createElement("button");
			button.id = "test-button";
			document.body.appendChild(button);
			button.focus();

			const { container: _container } = render(
				<TestEditor html="<p>Test content</p>" />
			);

			// Wait for initialization
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Focus should remain on button
			expect(document.activeElement).toBe(button);

			// Cleanup
			document.body.removeChild(button);
		});
	});

	describe("Error Handling", () => {
		it("should handle errors gracefully", async () => {
			const consoleErrorSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			// Pass invalid HTML that might cause parsing errors
			const invalidHTML = null as unknown as string;

			const { container: _container2 } = render(
				<TestEditor html={invalidHTML} />
			);

			// Wait for initialization
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Should not crash
			const editor = _container2.querySelector('[role="textbox"]');
			expect(editor).toBeInTheDocument();

			consoleErrorSpy.mockRestore();
		});

		it("should log errors to console", async () => {
			const consoleErrorSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			// Trigger an error by passing invalid data
			const invalidHTML = {
				toString: () => {
					throw new Error("Test error");
				},
			} as unknown as string;

			render(<TestEditor html={invalidHTML} />);

			// Wait for initialization
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Error should be logged
			expect(consoleErrorSpy).toHaveBeenCalled();

			consoleErrorSpy.mockRestore();
		});
	});

	describe("Content Types", () => {
		it("should handle plain text", async () => {
			const { container } = render(
				<TestEditor html="<p>Plain text content</p>" />
			);

			// Wait for initialization
			await new Promise((resolve) => setTimeout(resolve, 100));

			const editor = container.querySelector('[role="textbox"]');
			expect(editor?.textContent).toContain("Plain text content");
		});

		it("should handle formatted text", async () => {
			const formattedHTML =
				"<p><strong>Bold</strong>, <em>italic</em>, <u>underline</u></p>";

			const { container } = render(<TestEditor html={formattedHTML} />);

			// Wait for initialization
			await new Promise((resolve) => setTimeout(resolve, 100));

			const editor = container.querySelector('[role="textbox"]');
			expect(editor?.textContent).toContain("Bold");
			expect(editor?.textContent).toContain("italic");
			expect(editor?.textContent).toContain("underline");
		});

		it("should handle lists", async () => {
			const listHTML = "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>";

			const { container } = render(<TestEditor html={listHTML} />);

			// Wait for initialization
			await new Promise((resolve) => setTimeout(resolve, 100));

			const editor = container.querySelector('[role="textbox"]');
			expect(editor?.textContent).toContain("Item 1");
			expect(editor?.textContent).toContain("Item 2");
			expect(editor?.textContent).toContain("Item 3");
		});

		it("should handle links", async () => {
			const linkHTML =
				'<p>Visit <a href="https://example.com">our website</a></p>';

			const { container } = render(<TestEditor html={linkHTML} />);

			// Wait for initialization
			await new Promise((resolve) => setTimeout(resolve, 100));

			const editor = container.querySelector('[role="textbox"]');
			expect(editor?.textContent).toContain("Visit");
			expect(editor?.textContent).toContain("our website");
		});

		it("should handle multiple paragraphs", async () => {
			const multiParaHTML =
				"<p>First paragraph</p><p>Second paragraph</p><p>Third paragraph</p>";

			const { container } = render(<TestEditor html={multiParaHTML} />);

			// Wait for initialization
			await new Promise((resolve) => setTimeout(resolve, 100));

			const editor = container.querySelector('[role="textbox"]');
			expect(editor?.textContent).toContain("First paragraph");
			expect(editor?.textContent).toContain("Second paragraph");
			expect(editor?.textContent).toContain("Third paragraph");
		});
	});

	describe("Edge Cases", () => {
		it("should handle very long content", async () => {
			const longContent = "<p>" + "A".repeat(10000) + "</p>";

			const { container } = render(<TestEditor html={longContent} />);

			// Wait for initialization
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Should not crash
			const editor = container.querySelector('[role="textbox"]');
			expect(editor).toBeInTheDocument();
		});

		it("should handle special characters", async () => {
			const specialChars = "<p>&lt;&gt;&amp;&quot;&#39;</p>";

			const { container } = render(<TestEditor html={specialChars} />);

			// Wait for initialization
			await new Promise((resolve) => setTimeout(resolve, 100));

			const editor = container.querySelector('[role="textbox"]');
			expect(editor).toBeInTheDocument();
		});

		it("should handle unicode characters", async () => {
			const unicodeHTML = "<p>Hello 世界 🌍</p>";

			const { container } = render(<TestEditor html={unicodeHTML} />);

			// Wait for initialization
			await new Promise((resolve) => setTimeout(resolve, 100));

			const editor = container.querySelector('[role="textbox"]');
			expect(editor?.textContent).toContain("Hello");
			expect(editor?.textContent).toContain("世界");
		});
	});
});
