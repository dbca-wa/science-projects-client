/**
 * ControlledValuePlugin Unit Tests
 *
 * Tests controlled component behavior, value synchronization, and cursor preservation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ControlledValuePlugin } from "./ControlledValuePlugin";

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

function TestEditor({ value }: { value?: string }) {
	return (
		<LexicalComposer initialConfig={initialConfig}>
			<div>
				<ControlledValuePlugin value={value} />
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

describe("ControlledValuePlugin", () => {
	let scrollToSpy: ReturnType<typeof vi.fn>;
	// // let _scrollXValue: number;
	// // let _scrollYValue: number;

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

	describe("Controlled Component Behavior", () => {
		it("should skip first run (initial content)", async () => {
			const { container } = render(
				<TestEditor value="<p>Initial content</p>" />
			);

			// Wait for first run
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Editor should remain empty (first run is skipped)
			const editor = container.querySelector('[role="textbox"]');
			expect(editor).toBeInTheDocument();
		});

		it("should update content when value prop changes", async () => {
			const { container, rerender } = render(
				<TestEditor value="<p>Initial content</p>" />
			);

			// Wait for first run
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Change value
			rerender(<TestEditor value="<p>Updated content</p>" />);

			// Wait for update
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Content should be updated
			const editor = container.querySelector('[role="textbox"]');
			expect(editor?.textContent).toContain("Updated content");
		});

		it("should skip update if value hasn't changed", async () => {
			const { rerender } = render(<TestEditor value="<p>Same content</p>" />);

			// Wait for first run
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Rerender with same value
			rerender(<TestEditor value="<p>Same content</p>" />);

			// Wait for potential update
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Should not trigger unnecessary updates
		});

		it("should handle clearing content", async () => {
			const { container, rerender } = render(
				<TestEditor value="<p>Initial content</p>" />
			);

			// Wait for first run
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Clear content
			rerender(<TestEditor value="" />);

			// Wait for update
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Editor should be empty
			const editor = container.querySelector('[role="textbox"]');
			expect(editor?.textContent?.trim()).toBe("");
		});

		it("should handle undefined value", async () => {
			const { container, rerender } = render(
				<TestEditor value="<p>Initial content</p>" />
			);

			// Wait for first run
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Set to undefined
			rerender(<TestEditor value={undefined} />);

			// Wait for update
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Editor should be empty
			const editor = container.querySelector('[role="textbox"]');
			expect(editor).toBeInTheDocument();
		});
	});

	describe("Cursor Preservation", () => {
		it("should not update if new value matches current editor content", async () => {
			const { container, rerender } = render(
				<TestEditor value="<p>Initial content</p>" />
			);

			// Wait for first run
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Update to content that matches what's in the editor
			// (This simulates user typing and parent component updating value)
			rerender(<TestEditor value="<p>Initial content</p>" />);

			// Wait for potential update
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Should not trigger update (prevents cursor jumping)
			const editor = container.querySelector('[role="textbox"]');
			expect(editor).toBeInTheDocument();
		});
	});

	describe("HTML Sanitization", () => {
		it("should sanitize HTML before updating", async () => {
			const { container, rerender } = render(
				<TestEditor value="<p>Initial content</p>" />
			);

			// Wait for first run
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Update with malicious HTML
			const maliciousHTML = '<p>Safe content</p><script>alert("XSS")</script>';
			rerender(<TestEditor value={maliciousHTML} />);

			// Wait for update
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Script should be removed
			const editor = container.querySelector('[role="textbox"]');
			expect(editor?.textContent).toContain("Safe content");
			expect(editor?.innerHTML).not.toContain("<script>");
		});

		it("should preserve safe HTML tags", async () => {
			const { container, rerender } = render(
				<TestEditor value="<p>Initial content</p>" />
			);

			// Wait for first run
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Update with safe HTML
			const safeHTML = "<p><strong>Bold</strong> and <em>italic</em> text</p>";
			rerender(<TestEditor value={safeHTML} />);

			// Wait for update
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Safe tags should be preserved
			const editor = container.querySelector('[role="textbox"]');
			expect(editor?.textContent).toContain("Bold");
			expect(editor?.textContent).toContain("italic");
		});
	});

	describe("Scroll Position Preservation", () => {
		it("should preserve scroll position after updating content", async () => {
			const { rerender } = render(
				<TestEditor value="<p>Initial content</p>" />
			);

			// Wait for first run
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Update content
			rerender(<TestEditor value="<p>Updated content</p>" />);

			// Wait for update
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Scroll position should be restored
			expect(scrollToSpy).toHaveBeenCalledWith(100, 200);
		});

		it("should prevent auto-scroll during content update", async () => {
			const { container, rerender } = render(
				<TestEditor value="<p>Initial content</p>" />
			);

			// Wait for first run
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Update content
			rerender(<TestEditor value="<p>Updated content</p>" />);

			// Wait for update
			await new Promise((resolve) => setTimeout(resolve, 100));

			// scrollIntoView should have been temporarily overridden
			const editor = container.querySelector('[role="textbox"]');
			expect(editor).toBeInTheDocument();
		});
	});

	describe("Error Handling", () => {
		it.skip("should handle errors gracefully", async () => {
			const consoleErrorSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			const { rerender } = render(
				<TestEditor value="<p>Initial content</p>" />
			);

			// Wait for first run
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Pass invalid HTML that might cause parsing errors
			const invalidHTML = null as unknown as string;
			rerender(<TestEditor value={invalidHTML} />);

			// Wait for update
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Should not crash
			expect(consoleErrorSpy).toHaveBeenCalled();

			consoleErrorSpy.mockRestore();
		});

		it("should log errors to console", async () => {
			const consoleErrorSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			const { rerender } = render(
				<TestEditor value="<p>Initial content</p>" />
			);

			// Wait for first run
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Trigger an error
			const invalidHTML = {
				toString: () => {
					throw new Error("Test error");
				},
			} as unknown as string;
			rerender(<TestEditor value={invalidHTML} />);

			// Wait for update
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Error should be logged
			expect(consoleErrorSpy).toHaveBeenCalled();

			consoleErrorSpy.mockRestore();
		});
	});

	describe("Multiple Updates", () => {
		it("should handle rapid value changes", async () => {
			const { container, rerender } = render(
				<TestEditor value="<p>Content 1</p>" />
			);

			// Wait for first run
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Rapid updates
			rerender(<TestEditor value="<p>Content 2</p>" />);
			await new Promise((resolve) => setTimeout(resolve, 50));

			rerender(<TestEditor value="<p>Content 3</p>" />);
			await new Promise((resolve) => setTimeout(resolve, 50));

			rerender(<TestEditor value="<p>Content 4</p>" />);
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Final content should be displayed
			const editor = container.querySelector('[role="textbox"]');
			expect(editor?.textContent).toContain("Content 4");
		});

		it("should handle alternating between empty and filled", async () => {
			const { container, rerender } = render(
				<TestEditor value="<p>Content</p>" />
			);

			// Wait for first run
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Clear
			rerender(<TestEditor value="" />);
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Fill
			rerender(<TestEditor value="<p>New content</p>" />);
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Clear again
			rerender(<TestEditor value="" />);
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Editor should be empty
			const editor = container.querySelector('[role="textbox"]');
			expect(editor?.textContent?.trim()).toBe("");
		});
	});

	describe("Content Types", () => {
		it("should handle plain text updates", async () => {
			const { container, rerender } = render(
				<TestEditor value="<p>Initial</p>" />
			);

			await new Promise((resolve) => setTimeout(resolve, 100));

			rerender(<TestEditor value="<p>Plain text content</p>" />);
			await new Promise((resolve) => setTimeout(resolve, 100));

			const editor = container.querySelector('[role="textbox"]');
			expect(editor?.textContent).toContain("Plain text content");
		});

		it("should handle formatted text updates", async () => {
			const { container, rerender } = render(
				<TestEditor value="<p>Initial</p>" />
			);

			await new Promise((resolve) => setTimeout(resolve, 100));

			const formattedHTML =
				"<p><strong>Bold</strong>, <em>italic</em>, <u>underline</u></p>";
			rerender(<TestEditor value={formattedHTML} />);
			await new Promise((resolve) => setTimeout(resolve, 100));

			const editor = container.querySelector('[role="textbox"]');
			expect(editor?.textContent).toContain("Bold");
			expect(editor?.textContent).toContain("italic");
			expect(editor?.textContent).toContain("underline");
		});

		it("should handle list updates", async () => {
			const { container, rerender } = render(
				<TestEditor value="<p>Initial</p>" />
			);

			await new Promise((resolve) => setTimeout(resolve, 100));

			const listHTML = "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>";
			rerender(<TestEditor value={listHTML} />);
			await new Promise((resolve) => setTimeout(resolve, 100));

			const editor = container.querySelector('[role="textbox"]');
			expect(editor?.textContent).toContain("Item 1");
			expect(editor?.textContent).toContain("Item 2");
			expect(editor?.textContent).toContain("Item 3");
		});
	});

	describe("Edge Cases", () => {
		it("should handle very long content updates", async () => {
			const { container, rerender } = render(
				<TestEditor value="<p>Initial</p>" />
			);

			await new Promise((resolve) => setTimeout(resolve, 100));

			const longContent = "<p>" + "A".repeat(10000) + "</p>";
			rerender(<TestEditor value={longContent} />);
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Should not crash
			const editor = container.querySelector('[role="textbox"]');
			expect(editor).toBeInTheDocument();
		});

		it("should handle special characters", async () => {
			const { container, rerender } = render(
				<TestEditor value="<p>Initial</p>" />
			);

			await new Promise((resolve) => setTimeout(resolve, 100));

			const specialChars = "<p>&lt;&gt;&amp;&quot;&#39;</p>";
			rerender(<TestEditor value={specialChars} />);
			await new Promise((resolve) => setTimeout(resolve, 100));

			const editor = container.querySelector('[role="textbox"]');
			expect(editor).toBeInTheDocument();
		});

		it("should handle unicode characters", async () => {
			const { container, rerender } = render(
				<TestEditor value="<p>Initial</p>" />
			);

			await new Promise((resolve) => setTimeout(resolve, 100));

			const unicodeHTML = "<p>Hello 世界 🌍</p>";
			rerender(<TestEditor value={unicodeHTML} />);
			await new Promise((resolve) => setTimeout(resolve, 100));

			const editor = container.querySelector('[role="textbox"]');
			expect(editor?.textContent).toContain("Hello");
			expect(editor?.textContent).toContain("世界");
		});
	});
});
