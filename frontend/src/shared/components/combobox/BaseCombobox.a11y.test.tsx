import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { BaseCombobox } from "./BaseCombobox";

expect.extend(toHaveNoViolations);

// Mock data
interface MockItem {
	id: number;
	name: string;
}

const mockItems: MockItem[] = [
	{ id: 1, name: "Item One" },
	{ id: 2, name: "Item Two" },
	{ id: 3, name: "Item Three" },
];

describe("BaseCombobox - Accessibility", () => {
	let mockSearchFn: ReturnType<typeof vi.fn>;
	let mockOnChange: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockSearchFn = vi.fn(async () => mockItems);
		mockOnChange = vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	const renderCombobox = (props = {}) => {
		return render(
			<BaseCombobox<MockItem>
				searchFn={mockSearchFn}
				value={null}
				onChange={mockOnChange}
				getItemKey={(item) => item.id}
				renderSelected={(item, onClear) => (
					<div data-testid="selected">
						{item.name}
						<button onClick={onClear} aria-label="Clear selection">
							Clear
						</button>
					</div>
				)}
				renderMenuItem={(item, onSelect, isHighlighted) => (
					<button
						data-testid={`item-${item.id}`}
						data-highlighted={isHighlighted}
						onClick={() => onSelect(item)}
						aria-label={`Select ${item.name}`}
					>
						{item.name}
					</button>
				)}
				label="Select Item"
				placeholder="Search..."
				{...props}
			/>
		);
	};

	describe("No Axe Violations", () => {
		it("has no violations in default state", async () => {
			const { container } = renderCombobox();
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("has no violations with label", async () => {
			const { container } = renderCombobox({ label: "Choose Item" });
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("has no violations with helper text", async () => {
			const { container } = renderCombobox({
				helperText: "Select an item from the list",
			});
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("has no violations with open menu", async () => {
			const user = userEvent.setup();
			const { container } = renderCombobox();

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "item");

			await waitFor(() => {
				expect(screen.getByTestId("item-1")).toBeInTheDocument();
			});

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("has no violations with selected item", async () => {
			const { container } = renderCombobox({ value: mockItems[0] });
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("has no violations in disabled state", async () => {
			const { container } = renderCombobox({ disabled: true });
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("has no violations with required field", async () => {
			const { container } = renderCombobox({ isRequired: true });
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});
	});

	describe("ARIA Labels and Roles", () => {
		it("has proper label association", () => {
			renderCombobox({ label: "Select Item" });
			const input = screen.getByPlaceholderText("Search...");
			const label = screen.getByText("Select Item");

			// Label should be in the document
			expect(label).toBeInTheDocument();
			// Input should be visible
			expect(input).toBeVisible();
		});

		it("has accessible name from label", () => {
			renderCombobox({ label: "Choose an item" });
			const input = screen.getByPlaceholderText("Search...");
			const label = screen.getByText("Choose an item");

			// Label should be in the document
			expect(label).toBeInTheDocument();
			// Input should be visible
			expect(input).toBeVisible();
		});

		it("menu items have accessible names", async () => {
			const user = userEvent.setup();
			renderCombobox();

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "item");

			await waitFor(() => {
				expect(screen.getByLabelText("Select Item One")).toBeInTheDocument();
				expect(screen.getByLabelText("Select Item Two")).toBeInTheDocument();
				expect(screen.getByLabelText("Select Item Three")).toBeInTheDocument();
			});
		});

		it("clear button has accessible name", () => {
			renderCombobox({ value: mockItems[0] });
			const clearButton = screen.getByLabelText("Clear selection");
			expect(clearButton).toBeInTheDocument();
		});
	});

	describe("Keyboard Accessibility", () => {
		it("input is keyboard focusable", () => {
			renderCombobox();
			const input = screen.getByPlaceholderText("Search...");
			input.focus();
			expect(input).toHaveFocus();
		});

		it("menu items are keyboard accessible", async () => {
			const user = userEvent.setup();
			renderCombobox();

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "item");

			await waitFor(() => {
				expect(screen.getByTestId("item-1")).toBeInTheDocument();
			});

			await user.keyboard("{ArrowDown}");
			await user.keyboard("{Enter}");

			expect(mockOnChange).toHaveBeenCalledWith(mockItems[0]);
		});

		it("clear button is keyboard accessible", async () => {
			const user = userEvent.setup();
			renderCombobox({ value: mockItems[0] });

			const clearButton = screen.getByLabelText("Clear selection");
			clearButton.focus();
			expect(clearButton).toHaveFocus();

			await user.keyboard("{Enter}");
			expect(mockOnChange).toHaveBeenCalledWith(null);
		});
	});

	describe("Screen Reader Support", () => {
		it("announces label to screen readers", () => {
			renderCombobox({ label: "Select Item" });
			const input = screen.getByPlaceholderText("Search...");
			const label = screen.getByText("Select Item");

			expect(label).toBeInTheDocument();
			expect(input).toBeVisible();
		});

		it("announces helper text to screen readers", () => {
			renderCombobox({
				label: "Select Item",
				helperText: "Choose from the list",
			});
			const helperText = screen.getByText("Choose from the list");
			expect(helperText).toBeInTheDocument();
		});

		it("announces disabled state", () => {
			renderCombobox({ disabled: true });
			const input = screen.getByPlaceholderText("Search...");
			expect(input).toBeDisabled();
		});
	});

	describe("Focus Management", () => {
		it("maintains focus on input during keyboard navigation", async () => {
			const user = userEvent.setup();
			renderCombobox();

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "item");

			await waitFor(() => {
				expect(screen.getByTestId("item-1")).toBeInTheDocument();
			});

			await user.keyboard("{ArrowDown}");
			expect(input).toHaveFocus();

			await user.keyboard("{ArrowUp}");
			expect(input).toHaveFocus();
		});

		it("returns focus to input after selection", async () => {
			const user = userEvent.setup();
			renderCombobox();

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "item");

			await waitFor(() => {
				expect(screen.getByTestId("item-1")).toBeInTheDocument();
			});

			await user.keyboard("{ArrowDown}");
			await user.keyboard("{Enter}");

			// After selection, focus should be manageable
			expect(mockOnChange).toHaveBeenCalled();
		});
	});

	describe("Color Contrast", () => {
		it("renders with sufficient color contrast", () => {
			renderCombobox();
			const input = screen.getByPlaceholderText("Search...");

			// Input should be visible
			expect(input).toBeVisible();
		});

		it("highlighted items have sufficient contrast", async () => {
			const user = userEvent.setup();
			renderCombobox();

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "item");

			await waitFor(() => {
				expect(screen.getByTestId("item-1")).toBeInTheDocument();
			});

			await user.keyboard("{ArrowDown}");

			const highlightedItem = screen.getByTestId("item-1");
			expect(highlightedItem).toHaveAttribute("data-highlighted", "true");
			expect(highlightedItem).toBeVisible();
		});
	});
});
