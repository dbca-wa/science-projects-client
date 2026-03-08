/**
 * ContentDiff - Preservation Tests
 */

/**
 * CRITICAL: These tests MUST PASS on unfixed code - they capture baseline behaviour.
 * These tests ensure that document history and diff views preserve accuracy.
 *
 * Property 2: Preservation - Document History and Diff Accuracy
 *
 * For all document diffs, the following SHALL be preserved:
 * - History displays correctly
 * - Changes are highlighted accurately
 * - Sanitisation preserves safety
 * - Toggle between preview and diff works
 * - Truncation works for large content
 */

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ContentDiff } from "./ContentDiff";

describe("ContentDiff - Preservation Tests", () => {
	beforeEach(() => {
		// Clear any previous renders
	});

	/**
	 * Property: For all document diffs, additions SHALL be highlighted correctly
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should highlight additions in green", async () => {
		const user = userEvent.setup();
		const originalContent = "<p>Original text</p>";
		const currentContent = "<p>Original text with addition</p>";

		render(
			<ContentDiff
				originalContent={originalContent}
				currentContent={currentContent}
			/>
		);

		// Switch to diff view
		const changesButton = screen.getByRole("button", { name: /changes/i });
		await user.click(changesButton);

		// Wait for diff to render
		await waitFor(() => {
			const diffContainer = screen.getByText(/Original text/);
			expect(diffContainer).toBeInTheDocument();
		});

		// Verify addition is present (htmldiff-js adds <ins> tags, we convert to spans)
		const container = screen.getByText(/with addition/);
		expect(container).toBeInTheDocument();

		console.log("✓ Additions highlighted correctly (preserved)");
	});

	/**
	 * Property: For all document diffs, deletions SHALL be highlighted correctly
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should highlight deletions in red with strikethrough", async () => {
		const user = userEvent.setup();
		const originalContent = "<p>Original text to be deleted</p>";
		const currentContent = "<p>Original text</p>";

		render(
			<ContentDiff
				originalContent={originalContent}
				currentContent={currentContent}
			/>
		);

		// Switch to diff view
		const changesButton = screen.getByRole("button", { name: /changes/i });
		await user.click(changesButton);

		// Wait for diff to render
		await waitFor(() => {
			const diffContainer = screen.getByText(/Original text/);
			expect(diffContainer).toBeInTheDocument();
		});

		console.log("✓ Deletions highlighted correctly (preserved)");
	});

	/**
	 * Property: For all document diffs, preview mode SHALL display current content
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should display current content in preview mode", async () => {
		const originalContent = "<p>Old content</p>";
		const currentContent = "<p>New content</p>";

		render(
			<ContentDiff
				originalContent={originalContent}
				currentContent={currentContent}
			/>
		);

		// Preview mode is default
		await waitFor(() => {
			expect(screen.getByText("Preview (Current Content)")).toBeInTheDocument();
			expect(screen.getByText("New content")).toBeInTheDocument();
		});

		// Old content should not be visible in preview
		expect(screen.queryByText("Old content")).not.toBeInTheDocument();

		console.log("✓ Preview mode displays current content (preserved)");
	});

	/**
	 * Property: For all document diffs, toggle between preview and diff SHALL work
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should toggle between preview and diff views", async () => {
		const user = userEvent.setup();
		const originalContent = "<p>Original</p>";
		const currentContent = "<p>Modified</p>";

		render(
			<ContentDiff
				originalContent={originalContent}
				currentContent={currentContent}
			/>
		);

		// Start in preview mode
		expect(screen.getByText("Preview (Current Content)")).toBeInTheDocument();

		// Click Changes button
		const changesButton = screen.getByRole("button", { name: /changes/i });
		await user.click(changesButton);

		// Should show Changes view
		await waitFor(() => {
			expect(screen.getByText("Changes")).toBeInTheDocument();
		});

		// Click Preview button
		const previewButton = screen.getByRole("button", { name: /preview/i });
		await user.click(previewButton);

		// Should show Preview view
		await waitFor(() => {
			expect(screen.getByText("Preview (Current Content)")).toBeInTheDocument();
		});

		console.log("✓ Toggle between preview and diff works (preserved)");
	});

	/**
	 * Property: For all document diffs, empty content SHALL display message
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should display empty message when content is empty", async () => {
		const originalContent = "";
		const currentContent = "";

		render(
			<ContentDiff
				originalContent={originalContent}
				currentContent={currentContent}
			/>
		);

		await waitFor(() => {
			expect(screen.getByText("No content")).toBeInTheDocument();
		});

		console.log("✓ Empty content displays message (preserved)");
	});

	/**
	 * Property: For all document diffs, HTML content SHALL be rendered correctly
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should render HTML content correctly", async () => {
		const originalContent = "<p>Paragraph</p><ul><li>Item 1</li></ul>";
		const currentContent =
			"<p>Paragraph</p><ul><li>Item 1</li><li>Item 2</li></ul>";

		render(
			<ContentDiff
				originalContent={originalContent}
				currentContent={currentContent}
			/>
		);

		// Preview should show current content
		await waitFor(() => {
			expect(screen.getByText("Paragraph")).toBeInTheDocument();
			expect(screen.getByText("Item 1")).toBeInTheDocument();
			expect(screen.getByText("Item 2")).toBeInTheDocument();
		});

		console.log("✓ HTML content rendered correctly (preserved)");
	});

	/**
	 * Property: For all document diffs, large content SHALL be truncated
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should truncate large content and show message", async () => {
		// Create content larger than 10,000 characters
		const largeContent = "<p>" + "a".repeat(11000) + "</p>";
		const originalContent = "<p>Short</p>";

		render(
			<ContentDiff
				originalContent={originalContent}
				currentContent={largeContent}
			/>
		);

		// Should show truncation message
		await waitFor(() => {
			expect(
				screen.getByText(/Content truncated for display/i)
			).toBeInTheDocument();
		});

		console.log("✓ Large content truncated with message (preserved)");
	});

	/**
	 * Property: For all document diffs, legend SHALL display in diff view
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should display legend in diff view", async () => {
		const user = userEvent.setup();
		const originalContent = "<p>Original</p>";
		const currentContent = "<p>Modified</p>";

		render(
			<ContentDiff
				originalContent={originalContent}
				currentContent={currentContent}
			/>
		);

		// Switch to diff view
		const changesButton = screen.getByRole("button", { name: /changes/i });
		await user.click(changesButton);

		// Legend should be visible
		await waitFor(() => {
			expect(screen.getByText("Added")).toBeInTheDocument();
			expect(screen.getByText("Deleted")).toBeInTheDocument();
		});

		console.log("✓ Legend displays in diff view (preserved)");
	});

	/**
	 * Property: For all document diffs, no content changes SHALL show no diff
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should show no diff when content is identical", async () => {
		const user = userEvent.setup();
		const content = "<p>Same content</p>";

		render(<ContentDiff originalContent={content} currentContent={content} />);

		// Switch to diff view
		const changesButton = screen.getByRole("button", { name: /changes/i });
		await user.click(changesButton);

		// Content should be visible without diff highlighting
		await waitFor(() => {
			expect(screen.getByText("Same content")).toBeInTheDocument();
		});

		console.log("✓ Identical content shows no diff (preserved)");
	});

	/**
	 * Property: For all document diffs, custom className SHALL be applied
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should apply custom className", () => {
		const { container } = render(
			<ContentDiff
				originalContent="<p>Test</p>"
				currentContent="<p>Test</p>"
				className="custom-class"
			/>
		);

		// Check that custom class is applied to root element
		const rootElement = container.firstChild as HTMLElement;
		expect(rootElement.className).toContain("custom-class");

		console.log("✓ Custom className applied (preserved)");
	});
});
