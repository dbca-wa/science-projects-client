/**
 * Tests for ReopenProjectModal — verifies the "Open Project" button
 * enables/disables correctly based on form state.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReopenProjectModal } from "./ReopenProjectModal";

// Mock react-router
vi.mock("react-router", () => ({
	useNavigate: () => vi.fn(),
}));

// Mock the useReopenProject hook
vi.mock("@/features/projects/hooks/useReopenProject", () => ({
	useReopenProject: () => ({
		mutate: vi.fn(),
		isPending: false,
	}),
}));

// Mock the FormRichTextEditor since it has complex dependencies
vi.mock("@/shared/components/editor/FormRichTextEditor", () => ({
	FormRichTextEditor: ({
		value,
		onChange,
		placeholder,
	}: {
		value: string;
		onChange: (val: string) => void;
		placeholder?: string;
	}) => (
		<textarea
			data-testid="rich-text-editor"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			aria-label="Reason for reopening"
		/>
	),
}));

// Mock the Checkbox to avoid Radix internals in tests
vi.mock("@/shared/components/ui/checkbox", () => ({
	Checkbox: ({
		checked,
		onCheckedChange,
		id,
		"aria-label": ariaLabel,
	}: {
		checked?: boolean;
		onCheckedChange?: (checked: boolean) => void;
		id?: string;
		"aria-label"?: string;
	}) => (
		<input
			type="checkbox"
			role="checkbox"
			id={id}
			checked={checked}
			onChange={(e) => onCheckedChange?.(e.target.checked)}
			aria-label={ariaLabel}
		/>
	),
}));

describe("ReopenProjectModal", () => {
	const defaultProps = {
		isOpen: true,
		onClose: vi.fn(),
		projectId: 123,
	};

	it("renders with submit button disabled initially", () => {
		render(<ReopenProjectModal {...defaultProps} />);

		const submitButton = screen.getByRole("button", { name: /open project/i });
		expect(submitButton).toBeDisabled();
	});

	it("enables submit button when checkbox is ticked and reason has 10+ characters", async () => {
		render(<ReopenProjectModal {...defaultProps} />);

		// Tick the checkbox
		const checkbox = screen.getByRole("checkbox", {
			name: /are you sure you want to reopen this project/i,
		});
		fireEvent.click(checkbox);

		// Enter a reason with 10+ characters in the rich text editor
		const editor = screen.getByTestId("rich-text-editor");
		fireEvent.change(editor, {
			target: { value: "Need to fix progress report" },
		});

		// Button should now be enabled
		await waitFor(
			() => {
				const submitButton = screen.getByRole("button", {
					name: /open project/i,
				});
				expect(submitButton).not.toBeDisabled();
			},
			{ timeout: 3000 }
		);
	});

	it("keeps submit button disabled when only checkbox is ticked (no reason)", () => {
		render(<ReopenProjectModal {...defaultProps} />);

		// Tick the checkbox
		const checkbox = screen.getByRole("checkbox", {
			name: /are you sure you want to reopen this project/i,
		});
		fireEvent.click(checkbox);

		// Don't enter a reason — button should remain disabled
		const submitButton = screen.getByRole("button", { name: /open project/i });
		expect(submitButton).toBeDisabled();
	});

	it("keeps submit button disabled when reason is too short", async () => {
		const user = userEvent.setup();
		render(<ReopenProjectModal {...defaultProps} />);

		// Tick the checkbox
		const checkbox = screen.getByRole("checkbox", {
			name: /are you sure you want to reopen this project/i,
		});
		fireEvent.click(checkbox);

		// Enter a short reason (less than 10 chars)
		const editor = screen.getByTestId("rich-text-editor");
		await user.type(editor, "Short");

		// Button should remain disabled
		const submitButton = screen.getByRole("button", { name: /open project/i });
		expect(submitButton).toBeDisabled();
	});

	it("disables submit button when checkbox is unticked after being ticked", async () => {
		render(<ReopenProjectModal {...defaultProps} />);

		// Tick the checkbox
		const checkbox = screen.getByRole("checkbox", {
			name: /are you sure you want to reopen this project/i,
		});
		fireEvent.click(checkbox);

		// Enter a valid reason
		const editor = screen.getByTestId("rich-text-editor");
		fireEvent.change(editor, {
			target: { value: "Need to fix progress report" },
		});

		// Verify button is enabled
		await waitFor(
			() => {
				const submitButton = screen.getByRole("button", {
					name: /open project/i,
				});
				expect(submitButton).not.toBeDisabled();
			},
			{ timeout: 3000 }
		);

		// Untick the checkbox
		fireEvent.click(checkbox);

		// Button should be disabled again
		await waitFor(
			() => {
				const submitButton = screen.getByRole("button", {
					name: /open project/i,
				});
				expect(submitButton).toBeDisabled();
			},
			{ timeout: 3000 }
		);
	});

	it("shows reason field as disabled (greyed out) before checkbox is ticked", () => {
		render(<ReopenProjectModal {...defaultProps} />);

		// The reason section should have opacity-50 and pointer-events-none
		const editor = screen.getByTestId("rich-text-editor");
		const editorContainer = editor.closest("[class*='opacity-50']");
		expect(editorContainer).not.toBeNull();
	});

	it("shows required indicator (red star) on reason label", () => {
		render(<ReopenProjectModal {...defaultProps} />);

		const label = screen.getByText(/reason for reopening/i);
		const star = label.querySelector(".text-destructive");
		expect(star).not.toBeNull();
		expect(star?.textContent).toBe("*");
	});
});
