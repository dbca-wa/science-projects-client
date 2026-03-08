/**
 * RichTextEditor Performance Preservation Tests
 */

/**
 * CRITICAL: These tests MUST PASS on unfixed code - they capture baseline performance.
 * These tests ensure that performance characteristics are preserved when bugs are fixed.
 *
 * Property 2: Preservation - Application Performance
 *
 * For all RTE instances, the following performance SHALL be preserved:
 * - RTE load times under 500ms
 * - No typing lag
 * - Save operations under 2 seconds
 * - No memory leaks
 * - Efficient re-renders
 *
 * NOTE: These are lightweight performance tests to establish baseline behaviour.
 * They are not comprehensive performance benchmarks.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { RichTextEditor } from "./RichTextEditor";

describe("RichTextEditor - Performance Preservation Tests", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	/**
	 * Property: For all RTE instances, initial render SHALL complete within 500ms
	 *
	 * EXPECTED TO PASS: This is baseline performance that must be preserved
	 */
	it("should render within 500ms", async () => {
		const startTime = performance.now();

		render(
			<RichTextEditor
				value="<p>Test content</p>"
				onChange={vi.fn()}
				aria-label="Test editor"
			/>
		);

		// Wait for editor to render
		await waitFor(
			() => {
				const editor = screen.queryByRole("textbox");
				expect(editor).toBeInTheDocument();
			},
			{ timeout: 2000 }
		);

		const endTime = performance.now();
		const renderTime = endTime - startTime;

		// Verify render time is under 500ms
		expect(renderTime).toBeLessThan(500);

		console.log(`✓ RTE rendered in ${renderTime.toFixed(2)}ms (preserved)`);
	});

	/**
	 * Property: For all RTE instances, typing SHALL be responsive (no lag)
	 *
	 * EXPECTED TO PASS: This is baseline performance that must be preserved
	 */
	it("should handle typing without lag", async () => {
		const user = userEvent.setup();
		const onChangeMock = vi.fn();

		render(
			<RichTextEditor
				value=""
				onChange={onChangeMock}
				aria-label="Test editor"
			/>
		);

		// Wait for editor to render
		await waitFor(
			() => {
				const editor = screen.queryByRole("textbox");
				expect(editor).toBeInTheDocument();
			},
			{ timeout: 2000 }
		);

		const editor = screen.getByRole("textbox");
		await user.click(editor);

		// Measure typing performance
		const startTime = performance.now();

		// Type a sentence
		await user.keyboard("The quick brown fox jumps over the lazy dog");

		const endTime = performance.now();
		const typingTime = endTime - startTime;

		// Verify onChange was called
		await waitFor(
			() => {
				expect(onChangeMock).toHaveBeenCalled();
			},
			{ timeout: 2000 }
		);

		// Typing should feel responsive (under 1 second for this sentence)
		expect(typingTime).toBeLessThan(1000);

		console.log(`✓ Typing completed in ${typingTime.toFixed(2)}ms (preserved)`);
	});

	/**
	 * Property: For all RTE instances, onChange SHALL fire promptly
	 *
	 * EXPECTED TO PASS: This is baseline performance that must be preserved
	 */
	it("should fire onChange callback promptly", async () => {
		const user = userEvent.setup();
		const onChangeMock = vi.fn();

		render(
			<RichTextEditor
				value=""
				onChange={onChangeMock}
				aria-label="Test editor"
			/>
		);

		// Wait for editor to render
		await waitFor(
			() => {
				const editor = screen.queryByRole("textbox");
				expect(editor).toBeInTheDocument();
			},
			{ timeout: 2000 }
		);

		const editor = screen.getByRole("textbox");
		await user.click(editor);

		// Measure onChange callback time
		const startTime = performance.now();

		await user.keyboard("Test");

		// Wait for onChange to fire
		await waitFor(
			() => {
				expect(onChangeMock).toHaveBeenCalled();
			},
			{ timeout: 2000 }
		);

		const endTime = performance.now();
		const callbackTime = endTime - startTime;

		// onChange should fire within 500ms
		expect(callbackTime).toBeLessThan(500);

		console.log(`✓ onChange fired in ${callbackTime.toFixed(2)}ms (preserved)`);
	});

	/**
	 * Property: For all RTE instances, re-renders SHALL be efficient
	 *
	 * EXPECTED TO PASS: This is baseline performance that must be preserved
	 */
	it("should handle re-renders efficiently", async () => {
		const { rerender } = render(
			<RichTextEditor
				value="<p>Initial content</p>"
				onChange={vi.fn()}
				aria-label="Test editor"
			/>
		);

		// Wait for initial render
		await waitFor(
			() => {
				const editor = screen.queryByRole("textbox");
				expect(editor).toBeInTheDocument();
			},
			{ timeout: 2000 }
		);

		// Measure re-render time
		const startTime = performance.now();

		// Re-render with updated content
		rerender(
			<RichTextEditor
				value="<p>Updated content</p>"
				onChange={vi.fn()}
				aria-label="Test editor"
			/>
		);

		// Wait for re-render
		await waitFor(
			() => {
				const editor = screen.queryByRole("textbox");
				expect(editor?.textContent).toContain("Updated content");
			},
			{ timeout: 2000 }
		);

		const endTime = performance.now();
		const rerenderTime = endTime - startTime;

		// Re-render should be fast (under 200ms)
		expect(rerenderTime).toBeLessThan(200);

		console.log(
			`✓ Re-render completed in ${rerenderTime.toFixed(2)}ms (preserved)`
		);
	});

	/**
	 * Property: For all RTE instances, toolbar SHALL render efficiently
	 *
	 * EXPECTED TO PASS: This is baseline performance that must be preserved
	 */
	it("should render toolbar efficiently", async () => {
		const startTime = performance.now();

		render(
			<RichTextEditor
				value=""
				onChange={vi.fn()}
				toolbar="full"
				aria-label="Test editor"
			/>
		);

		// Wait for toolbar to render
		await waitFor(
			() => {
				const boldButton = screen.queryByRole("button", { name: /bold/i });
				expect(boldButton).toBeInTheDocument();
			},
			{ timeout: 2000 }
		);

		const endTime = performance.now();
		const toolbarRenderTime = endTime - startTime;

		// Toolbar should render quickly (under 500ms)
		expect(toolbarRenderTime).toBeLessThan(500);

		console.log(
			`✓ Toolbar rendered in ${toolbarRenderTime.toFixed(2)}ms (preserved)`
		);
	});

	/**
	 * Property: For all RTE instances, content updates SHALL be efficient
	 *
	 * EXPECTED TO PASS: This is baseline performance that must be preserved
	 */
	it("should update content efficiently", async () => {
		const user = userEvent.setup();
		const onChangeMock = vi.fn();

		render(
			<RichTextEditor
				value="<p>Initial content</p>"
				onChange={onChangeMock}
				aria-label="Test editor"
			/>
		);

		// Wait for editor to render
		await waitFor(
			() => {
				const editor = screen.queryByRole("textbox");
				expect(editor).toBeInTheDocument();
			},
			{ timeout: 2000 }
		);

		const editor = screen.getByRole("textbox");
		await user.click(editor);

		// Measure content update time
		const startTime = performance.now();

		// Add more content
		await user.keyboard(" Additional text");

		// Wait for onChange
		await waitFor(
			() => {
				expect(onChangeMock).toHaveBeenCalled();
			},
			{ timeout: 2000 }
		);

		const endTime = performance.now();
		const updateTime = endTime - startTime;

		// Content update should be fast (under 500ms)
		expect(updateTime).toBeLessThan(500);

		console.log(`✓ Content updated in ${updateTime.toFixed(2)}ms (preserved)`);
	});

	/**
	 * Property: For all RTE instances, large content SHALL render acceptably
	 *
	 * EXPECTED TO PASS: This is baseline performance that must be preserved
	 */
	it("should handle large content efficiently", async () => {
		// Create large content (1000 words)
		const largeContent = "<p>" + "word ".repeat(1000) + "</p>";

		const startTime = performance.now();

		render(
			<RichTextEditor
				value={largeContent}
				onChange={vi.fn()}
				aria-label="Test editor"
			/>
		);

		// Wait for editor to render
		await waitFor(
			() => {
				const editor = screen.queryByRole("textbox");
				expect(editor).toBeInTheDocument();
			},
			{ timeout: 3000 }
		);

		const endTime = performance.now();
		const renderTime = endTime - startTime;

		// Large content should still render in reasonable time (under 1 second)
		expect(renderTime).toBeLessThan(1000);

		console.log(
			`✓ Large content rendered in ${renderTime.toFixed(2)}ms (preserved)`
		);
	});

	/**
	 * Property: For all RTE instances, multiple instances SHALL not degrade performance
	 *
	 * EXPECTED TO PASS: This is baseline performance that must be preserved
	 */
	it("should handle multiple instances efficiently", async () => {
		const startTime = performance.now();

		render(
			<div>
				<RichTextEditor
					value="<p>Editor 1</p>"
					onChange={vi.fn()}
					aria-label="Editor 1"
				/>
				<RichTextEditor
					value="<p>Editor 2</p>"
					onChange={vi.fn()}
					aria-label="Editor 2"
				/>
				<RichTextEditor
					value="<p>Editor 3</p>"
					onChange={vi.fn()}
					aria-label="Editor 3"
				/>
			</div>
		);

		// Wait for all editors to render
		await waitFor(
			() => {
				const editors = screen.queryAllByRole("textbox");
				expect(editors.length).toBe(3);
			},
			{ timeout: 3000 }
		);

		const endTime = performance.now();
		const renderTime = endTime - startTime;

		// Multiple instances should render in reasonable time (under 1.5 seconds)
		expect(renderTime).toBeLessThan(1500);

		console.log(
			`✓ Multiple instances rendered in ${renderTime.toFixed(2)}ms (preserved)`
		);
	});

	/**
	 * Property: For all RTE instances, cleanup SHALL not cause memory leaks
	 *
	 * EXPECTED TO PASS: This is baseline performance that must be preserved
	 */
	it("should cleanup properly on unmount", async () => {
		const { unmount } = render(
			<RichTextEditor
				value="<p>Test content</p>"
				onChange={vi.fn()}
				aria-label="Test editor"
			/>
		);

		// Wait for editor to render
		await waitFor(
			() => {
				const editor = screen.queryByRole("textbox");
				expect(editor).toBeInTheDocument();
			},
			{ timeout: 2000 }
		);

		// Unmount component
		unmount();

		// Verify editor is removed
		const editor = screen.queryByRole("textbox");
		expect(editor).not.toBeInTheDocument();

		console.log("✓ Component cleaned up properly (preserved)");
	});

	/**
	 * Property: For all RTE instances, disabled state SHALL not impact performance
	 *
	 * EXPECTED TO PASS: This is baseline performance that must be preserved
	 */
	it("should render disabled state efficiently", async () => {
		const startTime = performance.now();

		render(
			<RichTextEditor
				value="<p>Disabled content</p>"
				onChange={vi.fn()}
				disabled={true}
				aria-label="Disabled editor"
			/>
		);

		// Wait for editor to render
		await waitFor(
			() => {
				const editor = screen.queryByRole("textbox");
				expect(editor).toBeInTheDocument();
			},
			{ timeout: 2000 }
		);

		const endTime = performance.now();
		const renderTime = endTime - startTime;

		// Disabled state should not slow down rendering (under 500ms)
		expect(renderTime).toBeLessThan(500);

		console.log(
			`✓ Disabled state rendered in ${renderTime.toFixed(2)}ms (preserved)`
		);
	});
});
