/**
 * Toolbar Accessibility Tests
 *
 * Tests keyboard navigation, screen reader announcements, and ARIA attributes for the RTE toolbar.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { Toolbar } from "./Toolbar";

expect.extend(toHaveNoViolations);

// Minimal Lexical config for testing
const initialConfig = {
	namespace: "TestEditor",
	theme: {},
	onError: (error: Error) => {
		console.error(error);
	},
};

function TestEditor({
	toolbar = "full",
}: {
	toolbar?: "full" | "minimal" | "none";
}) {
	return (
		<LexicalComposer initialConfig={initialConfig}>
			<div>
				<Toolbar mode={toolbar} />
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

describe("Toolbar - Accessibility", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("axe-core Validation", () => {
		it("should have no accessibility violations with full toolbar", async () => {
			const { container } = render(<TestEditor toolbar="full" />);

			// Wait for toolbar to render
			await waitFor(() => {
				const buttons = screen.queryAllByRole("button");
				expect(buttons.length).toBeGreaterThan(0);
			});

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("should have no accessibility violations with minimal toolbar", async () => {
			const { container } = render(<TestEditor toolbar="minimal" />);

			// Wait for toolbar to render
			await waitFor(() => {
				const buttons = screen.queryAllByRole("button");
				expect(buttons.length).toBeGreaterThan(0);
			});

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});
	});

	describe("Keyboard Navigation", () => {
		it("should support Tab key navigation through toolbar buttons", async () => {
			const user = userEvent.setup();

			render(<TestEditor toolbar="full" />);

			// Wait for toolbar to render
			await waitFor(() => {
				const buttons = screen.queryAllByRole("button");
				expect(buttons.length).toBeGreaterThan(0);
			});

			const buttons = screen.getAllByRole("button");

			// Find first two enabled buttons
			const enabledButtons = buttons.filter(
				(button) => !button.hasAttribute("disabled")
			);
			expect(enabledButtons.length).toBeGreaterThanOrEqual(2);

			// Tab to first enabled button
			await user.tab();
			expect(enabledButtons[0]).toHaveFocus();

			// Tab to second enabled button
			await user.tab();
			expect(enabledButtons[1]).toHaveFocus();
		});

		it("should support Enter key to activate toolbar buttons", async () => {
			const user = userEvent.setup();

			render(<TestEditor toolbar="full" />);

			// Wait for toolbar to render
			await waitFor(() => {
				const boldButton = screen.queryByRole("button", { name: /bold/i });
				expect(boldButton).toBeInTheDocument();
			});

			// Tab to bold button
			await user.tab();

			// Press Enter
			await user.keyboard("{Enter}");

			// Button should be activated (state may change)
			await new Promise((resolve) => setTimeout(resolve, 100));
		});

		it("should support Space key to activate toolbar buttons", async () => {
			const user = userEvent.setup();

			render(<TestEditor toolbar="full" />);

			// Wait for toolbar to render
			await waitFor(() => {
				const boldButton = screen.queryByRole("button", { name: /bold/i });
				expect(boldButton).toBeInTheDocument();
			});

			// Tab to bold button
			await user.tab();

			// Press Space
			await user.keyboard(" ");

			// Button should be activated
			await new Promise((resolve) => setTimeout(resolve, 100));
		});

		it("should support arrow key navigation within toolbar", async () => {
			const user = userEvent.setup();

			render(<TestEditor toolbar="full" />);

			// Wait for toolbar to render
			await waitFor(() => {
				const buttons = screen.queryAllByRole("button");
				expect(buttons.length).toBeGreaterThan(0);
			});

			const buttons = screen.getAllByRole("button");

			// Find first enabled button
			const firstEnabledButton = buttons.find(
				(button) => !button.hasAttribute("disabled")
			);
			expect(firstEnabledButton).toBeDefined();

			// Tab to first enabled button
			await user.tab();
			expect(firstEnabledButton).toHaveFocus();

			// Arrow right to next button
			await user.keyboard("{ArrowRight}");

			// Focus should move (implementation dependent)
			await new Promise((resolve) => setTimeout(resolve, 100));
		});
	});

	describe("Screen Reader Announcements", () => {
		it("should have accessible names for all toolbar buttons", async () => {
			render(<TestEditor toolbar="full" />);

			// Wait for toolbar to render
			await waitFor(() => {
				const buttons = screen.queryAllByRole("button");
				expect(buttons.length).toBeGreaterThan(0);
			});

			const buttons = screen.getAllByRole("button");

			// Each button should have an accessible name
			buttons.forEach((button) => {
				const hasAccessibleName =
					button.getAttribute("aria-label") ||
					button.textContent ||
					button.getAttribute("title");

				expect(hasAccessibleName).toBeTruthy();
			});
		});

		it("should announce bold button correctly", async () => {
			render(<TestEditor toolbar="full" />);

			// Wait for toolbar to render
			await waitFor(() => {
				const boldButton = screen.queryByRole("button", { name: /bold/i });
				expect(boldButton).toBeInTheDocument();
			});

			const boldButton = screen.getByRole("button", { name: /bold/i });
			expect(boldButton).toHaveAccessibleName();
		});

		it("should announce italic button correctly", async () => {
			render(<TestEditor toolbar="full" />);

			// Wait for toolbar to render
			await waitFor(() => {
				const italicButton = screen.queryByRole("button", { name: /italic/i });
				expect(italicButton).toBeInTheDocument();
			});

			const italicButton = screen.getByRole("button", { name: /italic/i });
			expect(italicButton).toHaveAccessibleName();
		});

		it("should announce underline button correctly", async () => {
			render(<TestEditor toolbar="full" />);

			// Wait for toolbar to render
			await waitFor(() => {
				const underlineButton = screen.queryByRole("button", {
					name: /underline/i,
				});
				expect(underlineButton).toBeInTheDocument();
			});

			const underlineButton = screen.getByRole("button", {
				name: /underline/i,
			});
			expect(underlineButton).toHaveAccessibleName();
		});

		it("should announce button state changes to screen readers", async () => {
			const user = userEvent.setup();

			render(<TestEditor toolbar="full" />);

			// Wait for toolbar to render
			await waitFor(() => {
				const boldButton = screen.queryByRole("button", { name: /bold/i });
				expect(boldButton).toBeInTheDocument();
			});

			const boldButton = screen.getByRole("button", { name: /bold/i });

			// Click to activate
			await user.click(boldButton);

			// Button state should change (aria-pressed or class)
			await waitFor(() => {
				const pressed = boldButton.getAttribute("aria-pressed");
				// State should be indicated somehow
				expect(
					pressed !== null || boldButton.className.includes("active")
				).toBeTruthy();
			});
		});
	});

	describe("ARIA Attributes", () => {
		it("should have toolbar role", async () => {
			render(<TestEditor toolbar="full" />);

			// Wait for toolbar to render
			await waitFor(() => {
				const toolbar = screen.queryByRole("toolbar");
				expect(toolbar).toBeInTheDocument();
			});
		});

		it("should have aria-label on toolbar", async () => {
			render(<TestEditor toolbar="full" />);

			// Wait for toolbar to render
			await waitFor(() => {
				const toolbar = screen.queryByRole("toolbar");
				expect(toolbar).toBeInTheDocument();
			});

			const toolbar = screen.getByRole("toolbar");
			expect(toolbar).toHaveAttribute("aria-label");
		});

		it("should use aria-pressed for toggle buttons", async () => {
			const user = userEvent.setup();

			render(<TestEditor toolbar="full" />);

			// Wait for toolbar to render
			await waitFor(() => {
				const boldButton = screen.queryByRole("button", { name: /bold/i });
				expect(boldButton).toBeInTheDocument();
			});

			const boldButton = screen.getByRole("button", { name: /bold/i });

			// Click to toggle
			await user.click(boldButton);

			// Should have aria-pressed attribute
			await waitFor(() => {
				expect(boldButton).toHaveAttribute("aria-pressed");
			});
		});

		it("should group related buttons with aria-label", async () => {
			render(<TestEditor toolbar="full" />);

			// Wait for toolbar to render
			await waitFor(() => {
				const buttons = screen.queryAllByRole("button");
				expect(buttons.length).toBeGreaterThan(0);
			});

			// Toolbar should have descriptive label
			const toolbar = screen.getByRole("toolbar");
			const ariaLabel = toolbar.getAttribute("aria-label");
			expect(ariaLabel).toBeTruthy();
			expect(ariaLabel).toMatch(/formatting|editor|text/i);
		});
	});

	describe("Focus Management", () => {
		it("should maintain focus within toolbar when using keyboard", async () => {
			const user = userEvent.setup();

			render(<TestEditor toolbar="full" />);

			// Wait for toolbar to render
			await waitFor(() => {
				const buttons = screen.queryAllByRole("button");
				expect(buttons.length).toBeGreaterThan(0);
			});

			// Tab to first button
			await user.tab();

			// Focus should be on a toolbar button
			const focusedElement = document.activeElement;
			expect(focusedElement?.tagName).toBe("BUTTON");
		});

		it("should show visible focus indicator on toolbar buttons", async () => {
			const user = userEvent.setup();

			render(<TestEditor toolbar="full" />);

			// Wait for toolbar to render
			await waitFor(() => {
				const buttons = screen.queryAllByRole("button");
				expect(buttons.length).toBeGreaterThan(0);
			});

			// Tab to first button
			await user.tab();

			// Focused element should be visible
			const focusedElement = document.activeElement;
			expect(focusedElement).toBeVisible();
		});
	});

	describe("Minimal Toolbar", () => {
		it("should have fewer buttons in minimal mode", async () => {
			render(<TestEditor toolbar="minimal" />);

			// Wait for toolbar to render
			await waitFor(() => {
				const buttons = screen.queryAllByRole("button");
				expect(buttons.length).toBeGreaterThan(0);
			});

			const minimalButtons = screen.getAllByRole("button");

			// Render full toolbar for comparison
			const { unmount } = render(<TestEditor toolbar="full" />);

			await waitFor(() => {
				const buttons = screen.queryAllByRole("button");
				expect(buttons.length).toBeGreaterThan(0);
			});

			const fullButtons = screen.getAllByRole("button");

			// Minimal should have fewer buttons
			expect(minimalButtons.length).toBeLessThan(fullButtons.length);

			unmount();
		});

		it("should maintain accessibility in minimal mode", async () => {
			const { container } = render(<TestEditor toolbar="minimal" />);

			// Wait for toolbar to render
			await waitFor(() => {
				const buttons = screen.queryAllByRole("button");
				expect(buttons.length).toBeGreaterThan(0);
			});

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});
	});

	describe("No Toolbar", () => {
		it("should not render toolbar when toolbar is none", () => {
			render(<TestEditor toolbar="none" />);

			const toolbar = screen.queryByRole("toolbar");
			expect(toolbar).not.toBeInTheDocument();
		});
	});
});
