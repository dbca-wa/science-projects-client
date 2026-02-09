import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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

describe("BaseCombobox - Keyboard Navigation", () => {
	let mockSearchFn: ReturnType<typeof vi.fn>;
	let mockOnChange: ReturnType<typeof vi.fn>;
	let mockOnCreateNew: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockSearchFn = vi.fn().mockImplementation(async (term: string) => {
			// Return empty array for "newitem" to test create option
			if (term === "newitem") {
				return [];
			}
			return mockItems;
		});
		mockOnChange = vi.fn();
		mockOnCreateNew = vi.fn().mockImplementation(async (term: string) => ({
			id: 999,
			name: term,
		}));
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
						<button onClick={onClear}>Clear</button>
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

	describe("ArrowDown Navigation", () => {
		it("highlights first item on ArrowDown", async () => {
			const user = userEvent.setup();
			renderCombobox();

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "item");

			await waitFor(() => {
				expect(screen.getByTestId("item-1")).toBeInTheDocument();
			});

			await user.keyboard("{ArrowDown}");

			await waitFor(() => {
				const item1 = screen.getByTestId("item-1");
				expect(item1).toHaveAttribute("data-highlighted", "true");
			});
		});

		it("moves highlight down on subsequent ArrowDown", async () => {
			const user = userEvent.setup();
			renderCombobox();

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "item");

			await waitFor(() => {
				expect(screen.getByTestId("item-1")).toBeInTheDocument();
			});

			await user.keyboard("{ArrowDown}");
			await user.keyboard("{ArrowDown}");

			await waitFor(() => {
				const item2 = screen.getByTestId("item-2");
				expect(item2).toHaveAttribute("data-highlighted", "true");
			});
		});

		it("stops at last item", async () => {
			const user = userEvent.setup();
			renderCombobox();

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "item");

			await waitFor(() => {
				expect(screen.getByTestId("item-1")).toBeInTheDocument();
			});

			// Press ArrowDown 5 times (more than items)
			await user.keyboard("{ArrowDown}");
			await user.keyboard("{ArrowDown}");
			await user.keyboard("{ArrowDown}");
			await user.keyboard("{ArrowDown}");
			await user.keyboard("{ArrowDown}");

			await waitFor(() => {
				const item3 = screen.getByTestId("item-3");
				expect(item3).toHaveAttribute("data-highlighted", "true");
			});
		});
	});

	describe("ArrowUp Navigation", () => {
		it("moves highlight up on ArrowUp", async () => {
			const user = userEvent.setup();
			renderCombobox();

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "item");

			await waitFor(() => {
				expect(screen.getByTestId("item-1")).toBeInTheDocument();
			});

			// Go down twice, then up once
			await user.keyboard("{ArrowDown}");
			await user.keyboard("{ArrowDown}");
			await user.keyboard("{ArrowUp}");

			await waitFor(() => {
				const item1 = screen.getByTestId("item-1");
				expect(item1).toHaveAttribute("data-highlighted", "true");
			});
		});

		it("resets highlight when going up from first item", async () => {
			const user = userEvent.setup();
			renderCombobox();

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "item");

			await waitFor(() => {
				expect(screen.getByTestId("item-1")).toBeInTheDocument();
			});

			await user.keyboard("{ArrowDown}");
			await user.keyboard("{ArrowUp}");

			await waitFor(() => {
				const item1 = screen.getByTestId("item-1");
				expect(item1).toHaveAttribute("data-highlighted", "false");
			});
		});
	});

	describe("Enter Key Selection", () => {
		it("selects highlighted item on Enter", async () => {
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

		it("selects correct item after navigation", async () => {
			const user = userEvent.setup();
			renderCombobox();

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "item");

			await waitFor(() => {
				expect(screen.getByTestId("item-1")).toBeInTheDocument();
			});

			await user.keyboard("{ArrowDown}");
			await user.keyboard("{ArrowDown}");
			await user.keyboard("{Enter}");

			expect(mockOnChange).toHaveBeenCalledWith(mockItems[1]);
		});

		it("selects create option on Enter when highlighted", async () => {
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

			await user.keyboard("{ArrowDown}");
			await user.keyboard("{Enter}");

			await waitFor(() => {
				expect(mockOnCreateNew).toHaveBeenCalledWith("newitem");
			});
		});
	});

	describe("Escape Key", () => {
		it("closes menu on Escape", async () => {
			const user = userEvent.setup();
			renderCombobox();

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "item");

			await waitFor(() => {
				expect(screen.getByTestId("item-1")).toBeInTheDocument();
			});

			await user.keyboard("{Escape}");

			await waitFor(() => {
				expect(screen.queryByTestId("item-1")).not.toBeInTheDocument();
			});
		});

		it("resets highlight on Escape", async () => {
			const user = userEvent.setup();
			renderCombobox();

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "item");

			await waitFor(() => {
				expect(screen.getByTestId("item-1")).toBeInTheDocument();
			});

			await user.keyboard("{ArrowDown}");
			await user.keyboard("{Escape}");

			// Type again to reopen
			await user.clear(input);
			await user.type(input, "item");

			await waitFor(() => {
				const item1 = screen.getByTestId("item-1");
				expect(item1).toHaveAttribute("data-highlighted", "false");
			});
		});
	});

	describe("Mouse and Keyboard Integration", () => {
		it("updates highlight on mouse hover", async () => {
			const user = userEvent.setup();
			renderCombobox();

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "item");

			await waitFor(() => {
				expect(screen.getByTestId("item-2")).toBeInTheDocument();
			});

			// Hover over item 2
			await user.hover(screen.getByTestId("item-2"));

			await waitFor(() => {
				const item2 = screen.getByTestId("item-2");
				expect(item2).toHaveAttribute("data-highlighted", "true");
			});
		});

		it("keyboard navigation works after mouse hover", async () => {
			const user = userEvent.setup();
			renderCombobox();

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "item");

			await waitFor(() => {
				expect(screen.getByTestId("item-2")).toBeInTheDocument();
			});

			// Hover over item 2
			await user.hover(screen.getByTestId("item-2"));

			// Then use keyboard
			await user.keyboard("{ArrowDown}");

			await waitFor(() => {
				const item3 = screen.getByTestId("item-3");
				expect(item3).toHaveAttribute("data-highlighted", "true");
			});
		});
	});

	describe("Only One Item Highlighted", () => {
		it("only highlights one item at a time", async () => {
			const user = userEvent.setup();
			renderCombobox();

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "item");

			await waitFor(() => {
				expect(screen.getByTestId("item-1")).toBeInTheDocument();
			});

			await user.keyboard("{ArrowDown}");
			await user.keyboard("{ArrowDown}");

			await waitFor(() => {
				const item1 = screen.getByTestId("item-1");
				const item2 = screen.getByTestId("item-2");
				const item3 = screen.getByTestId("item-3");

				expect(item1).toHaveAttribute("data-highlighted", "false");
				expect(item2).toHaveAttribute("data-highlighted", "true");
				expect(item3).toHaveAttribute("data-highlighted", "false");
			});
		});
	});

	describe("Typing Resets Highlight", () => {
		it("resets highlight when search term changes", async () => {
			const user = userEvent.setup();
			renderCombobox();

			const input = screen.getByPlaceholderText("Search...");
			await user.type(input, "item");

			await waitFor(() => {
				expect(screen.getByTestId("item-1")).toBeInTheDocument();
			});

			await user.keyboard("{ArrowDown}");

			await waitFor(() => {
				const item1 = screen.getByTestId("item-1");
				expect(item1).toHaveAttribute("data-highlighted", "true");
			});

			// Type more
			await user.type(input, " one");

			await waitFor(() => {
				const item1 = screen.getByTestId("item-1");
				expect(item1).toHaveAttribute("data-highlighted", "false");
			});
		});
	});
});
