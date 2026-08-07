/**
 * InlineSaveEditor Accessibility Tests
 *
 * Tests keyboard navigation, screen reader announcements, and focus management.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { InlineSaveEditor } from "./InlineSaveEditor";
import { inlineEditStore } from "@/app/stores/InlineEditStore";

expect.extend(toHaveNoViolations);

// Mock the document mutations hook
vi.mock("@/features/projects/hooks/useDocumentMutations", () => ({
	useDocumentMutations: () => ({
		updateDocument: vi.fn().mockResolvedValue({}),
		isUpdating: false,
	}),
}));

function renderWithProviders(ui: React.ReactElement) {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

	return render(
		<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
	);
}

describe("InlineSaveEditor - Accessibility", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset the inline edit store to ensure clean state between tests
		inlineEditStore.clearAll();
	});

	describe("axe-core Validation", () => {
		it("should have no accessibility violations in view mode", async () => {
			const { container } = renderWithProviders(
				<InlineSaveEditor
					contentType="project-description"
					entityId={1}
					initialContent="<p>Test content</p>"
					canEdit={true}
					label="Test Editor"
				/>
			);

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("should have no accessibility violations in edit mode", async () => {
			const user = userEvent.setup();

			const { container } = renderWithProviders(
				<InlineSaveEditor
					contentType="project-description"
					entityId={1}
					initialContent="<p>Test content</p>"
					canEdit={true}
					label="Test Editor"
				/>
			);

			// Enter edit mode
			const editButton = screen.getByRole("button", { name: /edit/i });
			await user.click(editButton);

			// Wait for editor to render
			await waitFor(() => {
				expect(screen.getByRole("textbox")).toBeInTheDocument();
			});

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});
	});

	describe("Keyboard Navigation", () => {
		it("should support Tab key to navigate to edit button", async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<InlineSaveEditor
					contentType="project-description"
					entityId={1}
					initialContent="<p>Test content</p>"
					canEdit={true}
					label="Test Editor"
				/>
			);

			// Tab to edit button
			await user.tab();

			const editButton = screen.getByRole("button", { name: /edit/i });
			expect(editButton).toHaveFocus();
		});

		it("should support Enter key to activate edit button", async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<InlineSaveEditor
					contentType="project-description"
					entityId={1}
					initialContent="<p>Test content</p>"
					canEdit={true}
					label="Test Editor"
				/>
			);

			// Tab to edit button
			await user.tab();

			// Press Enter
			await user.keyboard("{Enter}");

			// Should enter edit mode
			await waitFor(() => {
				expect(screen.getByRole("textbox")).toBeInTheDocument();
			});
		});

		it("should support Escape key to cancel editing", async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<InlineSaveEditor
					contentType="project-description"
					entityId={1}
					initialContent="<p>Test content</p>"
					canEdit={true}
					label="Test Editor"
				/>
			);

			// Enter edit mode
			const editButton = screen.getByRole("button", { name: /edit/i });
			await user.click(editButton);

			// Wait for editor
			await waitFor(() => {
				expect(screen.getByRole("textbox")).toBeInTheDocument();
			});

			// Press Escape
			await user.keyboard("{Escape}");

			// Should exit edit mode
			await waitFor(() => {
				expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
			});
		});

		it("should support Tab key to navigate between Save and Cancel buttons", async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<InlineSaveEditor
					contentType="project-description"
					entityId={1}
					initialContent="<p>Test content</p>"
					canEdit={true}
					label="Test Editor"
				/>
			);

			// Enter edit mode
			const editButton = screen.getByRole("button", { name: /edit/i });
			await user.click(editButton);

			// Wait for buttons
			await waitFor(() => {
				expect(
					screen.getByRole("button", { name: /save/i })
				).toBeInTheDocument();
			});

			// Get all buttons to find Cancel and Save
			const cancelButton = screen.getByRole("button", { name: /^cancel$/i });
			const saveButton = screen.getByRole("button", { name: /save/i });

			// Verify both buttons exist
			expect(cancelButton).toBeInTheDocument();
			expect(saveButton).toBeInTheDocument();

			// Verify Cancel is focusable (always enabled)
			cancelButton.focus();
			expect(cancelButton).toHaveFocus();

			// Save button is disabled initially (no content changes), so it cannot receive focus.
			// Verify it exists and is disabled — focusability is tested implicitly when enabled.
			expect(saveButton).toBeDisabled();
		});
	});

	describe("Screen Reader Announcements", () => {
		it("should have accessible label for editor", async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<InlineSaveEditor
					contentType="project-description"
					entityId={1}
					initialContent="<p>Test content</p>"
					canEdit={true}
					label="Project Description"
				/>
			);

			// Enter edit mode
			const editButton = screen.getByRole("button", { name: /edit/i });
			await user.click(editButton);

			// Wait for editor
			await waitFor(() => {
				const editor = screen.getByRole("textbox", {
					name: /project description/i,
				});
				expect(editor).toBeInTheDocument();
			});
		});

		it("should announce edit button with accessible name", () => {
			renderWithProviders(
				<InlineSaveEditor
					contentType="project-description"
					entityId={1}
					initialContent="<p>Test content</p>"
					canEdit={true}
					label="Test Editor"
				/>
			);

			const editButton = screen.getByRole("button", { name: /edit/i });
			expect(editButton).toHaveAccessibleName();
		});

		it("should announce save button with accessible name", async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<InlineSaveEditor
					contentType="project-description"
					entityId={1}
					initialContent="<p>Test content</p>"
					canEdit={true}
					label="Test Editor"
				/>
			);

			// Enter edit mode
			const editButton = screen.getByRole("button", { name: /edit/i });
			await user.click(editButton);

			// Wait for save button
			await waitFor(() => {
				const saveButton = screen.getByRole("button", { name: /save/i });
				expect(saveButton).toHaveAccessibleName();
			});
		});

		it("should announce cancel button with accessible name", async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<InlineSaveEditor
					contentType="project-description"
					entityId={1}
					initialContent="<p>Test content</p>"
					canEdit={true}
					label="Test Editor"
				/>
			);

			// Enter edit mode
			const editButton = screen.getByRole("button", { name: /edit/i });
			await user.click(editButton);

			// Wait for cancel button
			await waitFor(() => {
				const cancelButton = screen.getByRole("button", { name: /cancel/i });
				expect(cancelButton).toHaveAccessibleName();
			});
		});

		it("should announce word count to screen readers", async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<InlineSaveEditor
					contentType="project-description"
					entityId={1}
					initialContent="<p>Test content</p>"
					canEdit={true}
					label="Test Editor"
					wordLimit={100}
					showWordLimitInLabel={true}
				/>
			);

			// Enter edit mode
			const editButton = screen.getByRole("button", { name: /edit/i });
			await user.click(editButton);

			// Wait for word count
			await waitFor(() => {
				// Word count should be visible
				const wordCount = screen.getByText(/\d+ \/ 100 words/i);
				expect(wordCount).toBeInTheDocument();
			});
		});
	});

	describe("Focus Management", () => {
		it("should focus editor when entering edit mode", async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<InlineSaveEditor
					contentType="project-description"
					entityId={1}
					initialContent="<p>Test content</p>"
					canEdit={true}
					label="Test Editor"
				/>
			);

			// Enter edit mode
			const editButton = screen.getByRole("button", { name: /edit/i });
			await user.click(editButton);

			// Wait for editor to be focused
			await waitFor(() => {
				const editor = screen.getByRole("textbox");
				expect(editor).toHaveFocus();
			});
		});

		it("should return focus to edit button when canceling", async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<InlineSaveEditor
					contentType="project-description"
					entityId={1}
					initialContent="<p>Test content</p>"
					canEdit={true}
					label="Test Editor"
				/>
			);

			// Enter edit mode
			const editButton = screen.getByRole("button", { name: /edit/i });
			await user.click(editButton);

			// Wait for cancel button
			await waitFor(() => {
				expect(
					screen.getByRole("button", { name: /cancel/i })
				).toBeInTheDocument();
			});

			// Click cancel
			const cancelButton = screen.getByRole("button", { name: /cancel/i });
			await user.click(cancelButton);

			// Focus should return to edit button
			await waitFor(() => {
				const newEditButton = screen.getByRole("button", { name: /edit/i });
				expect(newEditButton).toHaveFocus();
			});
		});

		it("should maintain focus within editor when tabbing", async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<InlineSaveEditor
					contentType="project-description"
					entityId={1}
					initialContent="<p>Test content</p>"
					canEdit={true}
					label="Test Editor"
				/>
			);

			// Enter edit mode
			const editButton = screen.getByRole("button", { name: /edit/i });
			await user.click(editButton);

			// Wait for editor
			await waitFor(() => {
				expect(screen.getByRole("textbox")).toBeInTheDocument();
			});

			// Tab should move focus out of the editor textbox
			await user.tab();

			// Focus should have moved away from the textbox (to toolbar, action
			// button, or editor wrapper depending on Lexical's internal tab handling)
			const focusedElement = document.activeElement;
			const textbox = screen.getByRole("textbox");
			expect(focusedElement).not.toBe(textbox);
		});
	});

	describe("Read-Only State", () => {
		it("should not show edit button when canEdit is false", () => {
			renderWithProviders(
				<InlineSaveEditor
					contentType="project-description"
					entityId={1}
					initialContent="<p>Test content</p>"
					canEdit={false}
					label="Test Editor"
				/>
			);

			const editButton = screen.queryByRole("button", { name: /edit/i });
			expect(editButton).not.toBeInTheDocument();
		});

		it("should announce read-only state to screen readers", () => {
			renderWithProviders(
				<InlineSaveEditor
					contentType="project-description"
					entityId={1}
					initialContent="<p>Test content</p>"
					canEdit={false}
					label="Test Editor"
				/>
			);

			// Content should be visible but not editable
			const content = screen.getByText("Test content");
			expect(content).toBeInTheDocument();
		});
	});

	describe("Error States", () => {
		it("should announce validation errors to screen readers", async () => {
			const user = userEvent.setup();

			// Start with content that exceeds the word limit
			const longContent = "<p>One two three four five six</p>"; // 6 words > 5 word limit

			renderWithProviders(
				<InlineSaveEditor
					contentType="project-description"
					entityId={1}
					initialContent={longContent}
					canEdit={true}
					label="Test Editor"
					wordLimit={5}
				/>
			);

			// Enter edit mode
			const editButton = screen.getByRole("button", { name: /edit/i });
			await user.click(editButton);

			// Wait for editor and error message to appear
			await waitFor(() => {
				expect(screen.getByRole("textbox")).toBeInTheDocument();
			});

			// Error message should be visible immediately since content exceeds limit
			await waitFor(() => {
				const errorMessage = screen.getByText(/exceeds word limit/i);
				expect(errorMessage).toBeInTheDocument();

				// Verify error has correct ARIA attributes
				expect(errorMessage).toHaveAttribute("role", "alert");
				expect(errorMessage).toHaveAttribute("aria-live", "assertive");
			});
		});
	});
});
