import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BaseCombobox } from "./BaseCombobox";

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

describe("BaseCombobox", () => {
	let mockSearchFn: (searchTerm: string) => Promise<MockItem[]>;
	let mockOnChange: (value: MockItem | null) => void;
	let mockOnCreateNew: (term: string) => Promise<MockItem>;

	beforeEach(() => {
		mockSearchFn = vi.fn().mockImplementation(async (term: string) => {
			return mockItems.filter((item) =>
				item.name.toLowerCase().includes(term.toLowerCase())
			);
		}) as (searchTerm: string) => Promise<MockItem[]>;
		mockOnChange = vi.fn() as (value: MockItem | null) => void;
		mockOnCreateNew = vi.fn().mockImplementation(async (term: string) => ({
			id: 999,
			name: term,
		})) as (term: string) => Promise<MockItem>;
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
						<button onClick={onClear} data-testid="clear-btn">
							Clear
						</button>
					</div>
				)}
				renderMenuItem={(item, onSelect, isHighlighted) => (
					<button
						data-testid={`item-${item.id}`}
						data-highlighted={isHighlighted}
						onClick={() => onSelect(item)}
					>
						{item.name}
					</button>
				)}
				placeholder="Search..."
				{...props}
			/>
		);
	};

	describe("Rendering", () => {
		it("renders with placeholder", () => {
			renderCombobox();
			expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
		});

		it("renders with label when provided", () => {
			renderCombobox({ label: "Select Item" });
			expect(screen.getByText("Select Item")).toBeInTheDocument();
		});

		it("renders with helper text when provided", () => {
			renderCombobox({ helperText: "Choose an item" });
			expect(screen.getByText("Choose an item")).toBeInTheDocument();
		});

		it("renders with icon when showIcon is true", () => {
			const icon = <span data-testid="test-icon">🔍</span>;
			renderCombobox({ showIcon: true, icon });
			expect(screen.getByTestId("test-icon")).toBeInTheDocument();
		});
	});

	describe("Search Functionality", () => {
		it("calls searchFn with debounced search term", async () => {
			const user = userEvent.setup();
			renderCombobox();

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "item");

			// Wait for debounce
			await waitFor(() => {
				expect(mockSearchFn).toHaveBeenCalledWith("item");
			});
		});

		it("displays search results", async () => {
			const user = userEvent.setup();
			renderCombobox();

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "item");

			await waitFor(() => {
				expect(screen.getByTestId("item-1")).toBeInTheDocument();
				expect(screen.getByTestId("item-2")).toBeInTheDocument();
				expect(screen.getByTestId("item-3")).toBeInTheDocument();
			});
		});

		it("filters results based on search term", async () => {
			const user = userEvent.setup();
			renderCombobox();

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "one");

			await waitFor(() => {
				expect(screen.getByTestId("item-1")).toBeInTheDocument();
			});

			// Wait a bit more to ensure filtering is complete
			await waitFor(() => {
				expect(screen.queryByTestId("item-2")).not.toBeInTheDocument();
			});
		});

		it("does not open menu on page load", () => {
			renderCombobox();
			expect(screen.queryByTestId("item-1")).not.toBeInTheDocument();
		});

		it("opens menu when typing", async () => {
			const user = userEvent.setup();
			renderCombobox();

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "item");

			await waitFor(() => {
				expect(screen.getByTestId("item-1")).toBeInTheDocument();
			});
		});
	});

	describe("Selection", () => {
		it("calls onChange when item selected", async () => {
			const user = userEvent.setup();
			renderCombobox();

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "item");

			await waitFor(() => {
				expect(screen.getByTestId("item-1")).toBeInTheDocument();
			});

			// Use fireEvent for portal elements
			const item = screen.getByTestId("item-1");
			fireEvent.click(item);

			await waitFor(() => {
				expect(mockOnChange).toHaveBeenCalledWith(mockItems[0]);
			});
		});

		it("displays selected item using renderSelected", () => {
			renderCombobox({ value: mockItems[0] });
			expect(screen.getByTestId("selected")).toHaveTextContent("Item One");
		});

		it("hides input when item is selected", () => {
			renderCombobox({ value: mockItems[0] });
			expect(
				screen.queryByPlaceholderText("Search...")
			).not.toBeInTheDocument();
		});

		it("clears selection when clear button clicked", async () => {
			const user = userEvent.setup();
			renderCombobox({ value: mockItems[0] });

			await user.click(screen.getByTestId("clear-btn"));

			expect(mockOnChange).toHaveBeenCalledWith(null);
		});
	});

	describe("Create New Functionality", () => {
		it("shows create option when no results and onCreateNew provided", async () => {
			const user = userEvent.setup();
			renderCombobox({
				onCreateNew: mockOnCreateNew,
				createNewLabel: (term: string) => `Add "${term}"`,
			});

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "nonexistent");

			await waitFor(() => {
				expect(screen.getByText('Add "nonexistent"')).toBeInTheDocument();
			});
		});

		it("does not show create option when results exist", async () => {
			const user = userEvent.setup();
			renderCombobox({
				onCreateNew: mockOnCreateNew,
				createNewLabel: (term: string) => `Add "${term}"`,
			});

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "item");

			await waitFor(() => {
				expect(screen.getByTestId("item-1")).toBeInTheDocument();
			});

			expect(screen.queryByText(/Add "/)).not.toBeInTheDocument();
		});

		it("calls onCreateNew when create option clicked", async () => {
			const user = userEvent.setup();
			renderCombobox({
				onCreateNew: mockOnCreateNew,
				createNewLabel: (term: string) => `Add "${term}"`,
			});

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "newitem");

			await waitFor(() => {
				expect(screen.getByText('Add "newitem"')).toBeInTheDocument();
			});

			// Use fireEvent for portal elements
			const createButton = screen.getByText('Add "newitem"');
			fireEvent.click(createButton);

			await waitFor(() => {
				expect(mockOnCreateNew).toHaveBeenCalledWith("newitem");
			});
		});

		it("selects newly created item", async () => {
			const user = userEvent.setup();
			renderCombobox({
				onCreateNew: mockOnCreateNew,
				createNewLabel: (term: string) => `Add "${term}"`,
			});

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "newitem");

			await waitFor(() => {
				expect(screen.getByText('Add "newitem"')).toBeInTheDocument();
			});

			// Use fireEvent for portal elements
			const createButton = screen.getByText('Add "newitem"');
			fireEvent.click(createButton);

			await waitFor(() => {
				expect(mockOnChange).toHaveBeenCalledWith({
					id: 999,
					name: "newitem",
				});
			});
		});
	});

	describe("Disabled State", () => {
		it("disables input when disabled prop is true", () => {
			renderCombobox({ disabled: true });
			expect(screen.getByPlaceholderText("Search...")).toBeDisabled();
		});

		it("does not open menu when disabled", async () => {
			const user = userEvent.setup();
			renderCombobox({ disabled: true });

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "item");

			// Wait a bit to ensure no menu appears
			await new Promise((resolve) => setTimeout(resolve, 400));

			expect(screen.queryByTestId("item-1")).not.toBeInTheDocument();
		});
	});

	describe("Click-Away Detection", () => {
		it("closes menu when clicking outside", async () => {
			const user = userEvent.setup();
			renderCombobox();

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "item");

			await waitFor(() => {
				expect(screen.getByTestId("item-1")).toBeInTheDocument();
			});

			// Click outside
			await user.click(document.body);

			await waitFor(() => {
				expect(screen.queryByTestId("item-1")).not.toBeInTheDocument();
			});
		});
	});
});
