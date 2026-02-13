import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BaseUserSearch } from "./BaseUserSearch";
import type { IUserData } from "@/shared/types/user.types";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

// Mock user data
const mockUsers = [
	{
		id: 1,
		display_first_name: "Adrian",
		display_last_name: "Smith",
		email: "adrian@example.com",
		is_staff: true,
		is_superuser: false,
		image: null,
	},
	{
		id: 2,
		display_first_name: "Adrian",
		display_last_name: "Jones",
		email: "ajones@example.com",
		is_staff: true,
		is_superuser: false,
		image: null,
	},
	{
		id: 3,
		display_first_name: "Adrian",
		display_last_name: "Brown",
		email: "abrown@example.com",
		is_staff: false,
		is_superuser: false,
		image: null,
	},
] as unknown as IUserData[];

// Mock the user service
vi.mock("@/features/users/services/user.service", () => ({
	getUsersBasedOnSearchTerm: vi.fn((searchTerm: string) => {
		if (searchTerm.toLowerCase().includes("adrian")) {
			return Promise.resolve({ users: mockUsers, total: mockUsers.length });
		}
		return Promise.resolve({ users: [], total: 0 });
	}),
	getFullUser: vi.fn((id: number) => {
		const user = mockUsers.find((u) => u.id === id);
		return user
			? Promise.resolve(user)
			: Promise.reject(new Error("User not found"));
	}),
}));

describe("BaseUserSearch - Keyboard Navigation", () => {
	let queryClient: QueryClient;
	let user: ReturnType<typeof userEvent.setup>;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					retry: false,
				},
			},
		});
		user = userEvent.setup();
		vi.clearAllMocks();
	});

	const renderWithProviders = (
		props: Partial<React.ComponentProps<typeof BaseUserSearch>> = {}
	) => {
		const defaultProps = {
			onSelect: vi.fn(),
			placeholder: "Search for a user...",
		};

		return render(
			<QueryClientProvider client={queryClient}>
				<BaseUserSearch {...defaultProps} {...props} />
			</QueryClientProvider>
		);
	};

	describe("Arrow Key Navigation", () => {
		it("should highlight first item when pressing ArrowDown", async () => {
			const onSelect = vi.fn();
			renderWithProviders({ onSelect });

			const input = screen.getByPlaceholderText("Search for a user...");
			await user.type(input, "adrian");

			// Wait for results to appear
			await waitFor(() => {
				expect(screen.getByText("Adrian Smith")).toBeInTheDocument();
			});

			// Press ArrowDown
			await user.keyboard("{ArrowDown}");

			// First item should be highlighted (have gray background)
			const firstItem = screen.getByText("Adrian Smith").closest("button");
			expect(firstItem).toHaveClass("bg-gray-200");
		});

		it("should navigate down through results with ArrowDown", async () => {
			const onSelect = vi.fn();
			renderWithProviders({ onSelect });

			const input = screen.getByPlaceholderText("Search for a user...");
			await user.type(input, "adrian");

			await waitFor(() => {
				expect(screen.getByText("Adrian Smith")).toBeInTheDocument();
			});

			// Press ArrowDown twice
			await user.keyboard("{ArrowDown}");
			await user.keyboard("{ArrowDown}");

			// Second item should be highlighted
			const secondItem = screen.getByText("Adrian Jones").closest("button");
			expect(secondItem).toHaveClass("bg-gray-200");
		});

		it("should navigate up with ArrowUp", async () => {
			const onSelect = vi.fn();
			renderWithProviders({ onSelect });

			const input = screen.getByPlaceholderText("Search for a user...");
			await user.type(input, "adrian");

			await waitFor(() => {
				expect(screen.getByText("Adrian Smith")).toBeInTheDocument();
			});

			// Navigate down twice, then up once
			await user.keyboard("{ArrowDown}");
			await user.keyboard("{ArrowDown}");
			await user.keyboard("{ArrowUp}");

			// First item should be highlighted again
			const firstItem = screen.getByText("Adrian Smith").closest("button");
			expect(firstItem).toHaveClass("bg-gray-200");
		});

		it("should clear highlight when pressing ArrowUp from first item", async () => {
			const onSelect = vi.fn();
			renderWithProviders({ onSelect });

			const input = screen.getByPlaceholderText("Search for a user...");
			await user.type(input, "adrian");

			await waitFor(() => {
				expect(screen.getByText("Adrian Smith")).toBeInTheDocument();
			});

			// Navigate to first item, then press ArrowUp
			await user.keyboard("{ArrowDown}");
			await user.keyboard("{ArrowUp}");

			// No item should be highlighted
			const items = screen.getAllByRole("button");
			items.forEach((item) => {
				expect(item).not.toHaveClass("bg-gray-200");
			});
		});

		it("should stay on last item when pressing ArrowDown at the end", async () => {
			const onSelect = vi.fn();
			renderWithProviders({ onSelect });

			const input = screen.getByPlaceholderText("Search for a user...");
			await user.type(input, "adrian");

			await waitFor(() => {
				expect(screen.getByText("Adrian Smith")).toBeInTheDocument();
			});

			// Navigate to last item
			await user.keyboard("{ArrowDown}");
			await user.keyboard("{ArrowDown}");
			await user.keyboard("{ArrowDown}");
			// Try to go past the last item
			await user.keyboard("{ArrowDown}");

			// Last item should still be highlighted
			const lastItem = screen.getByText("Adrian Brown").closest("button");
			expect(lastItem).toHaveClass("bg-gray-200");
		});
	});

	describe("Enter Key Selection", () => {
		it("should select highlighted user when pressing Enter", async () => {
			const onSelect = vi.fn();
			renderWithProviders({ onSelect });

			const input = screen.getByPlaceholderText("Search for a user...");
			await user.type(input, "adrian");

			await waitFor(() => {
				expect(screen.getByText("Adrian Smith")).toBeInTheDocument();
			});

			// Navigate to second item and press Enter
			await user.keyboard("{ArrowDown}");
			await user.keyboard("{ArrowDown}");
			await user.keyboard("{Enter}");

			// onSelect should be called with the second user
			expect(onSelect).toHaveBeenCalledWith(mockUsers[1]);
		});

		it("should not select anything when pressing Enter with no highlight", async () => {
			const onSelect = vi.fn();
			renderWithProviders({ onSelect });

			const input = screen.getByPlaceholderText("Search for a user...");
			await user.type(input, "adrian");

			await waitFor(() => {
				expect(screen.getByText("Adrian Smith")).toBeInTheDocument();
			});

			// Press Enter without navigating
			await user.keyboard("{Enter}");

			// onSelect should not be called
			expect(onSelect).not.toHaveBeenCalled();
		});
	});

	describe("Escape Key", () => {
		it("should close dropdown when pressing Escape", async () => {
			const onSelect = vi.fn();
			renderWithProviders({ onSelect });

			const input = screen.getByPlaceholderText("Search for a user...");
			await user.type(input, "adrian");

			await waitFor(() => {
				expect(screen.getByText("Adrian Smith")).toBeInTheDocument();
			});

			// Press Escape
			await user.keyboard("{Escape}");

			// Dropdown should be closed (results not visible)
			await waitFor(() => {
				expect(screen.queryByText("Adrian Smith")).not.toBeInTheDocument();
			});
		});

		it("should reopen dropdown when typing after Escape", async () => {
			const onSelect = vi.fn();
			renderWithProviders({ onSelect });

			const input = screen.getByPlaceholderText("Search for a user...");
			await user.type(input, "adrian");

			await waitFor(() => {
				expect(screen.getByText("Adrian Smith")).toBeInTheDocument();
			});

			// Press Escape to close
			await user.keyboard("{Escape}");

			await waitFor(() => {
				expect(screen.queryByText("Adrian Smith")).not.toBeInTheDocument();
			});

			// Type more characters
			await user.type(input, " s");

			// Dropdown should reopen with results
			await waitFor(() => {
				expect(screen.getByText("Adrian Smith")).toBeInTheDocument();
			});
		});
	});

	describe("Click-Away Behavior", () => {
		it("should close dropdown when clicking outside", async () => {
			const onSelect = vi.fn();
			const { container } = renderWithProviders({ onSelect });

			const input = screen.getByPlaceholderText("Search for a user...");
			await user.type(input, "adrian");

			await waitFor(() => {
				expect(screen.getByText("Adrian Smith")).toBeInTheDocument();
			});

			// Click outside the component
			await user.click(container);

			// Dropdown should be closed
			await waitFor(() => {
				expect(screen.queryByText("Adrian Smith")).not.toBeInTheDocument();
			});
		});
	});

	describe("Mouse Click Selection", () => {
		it("should select user when clicking on menu item", async () => {
			const onSelect = vi.fn();
			renderWithProviders({ onSelect });

			const input = screen.getByPlaceholderText("Search for a user...");
			await user.type(input, "adrian");

			await waitFor(() => {
				expect(screen.getByText("Adrian Smith")).toBeInTheDocument();
			});

			// Click on the first user
			const firstItem = screen.getByText("Adrian Smith").closest("button");
			if (firstItem) {
				await user.click(firstItem);
			}

			// onSelect should be called with the first user
			await waitFor(() => {
				expect(onSelect).toHaveBeenCalledWith(mockUsers[0]);
			});
		});

		it("should select user when clicking on different menu item", async () => {
			const onSelect = vi.fn();
			renderWithProviders({ onSelect });

			const input = screen.getByPlaceholderText("Search for a user...");
			await user.type(input, "adrian");

			await waitFor(() => {
				expect(screen.getByText("Adrian Jones")).toBeInTheDocument();
			});

			// Click on the second user
			const secondItem = screen.getByText("Adrian Jones").closest("button");
			if (secondItem) {
				await user.click(secondItem);
			}

			// onSelect should be called with the second user
			await waitFor(() => {
				expect(onSelect).toHaveBeenCalledWith(mockUsers[1]);
			});
		});
	});

	describe("Focus Management", () => {
		it("should keep focus on input while navigating with arrow keys", async () => {
			const onSelect = vi.fn();
			renderWithProviders({ onSelect });

			const input = screen.getByPlaceholderText("Search for a user...");
			await user.type(input, "adrian");

			await waitFor(() => {
				expect(screen.getByText("Adrian Smith")).toBeInTheDocument();
			});

			// Navigate with arrow keys
			await user.keyboard("{ArrowDown}");
			await user.keyboard("{ArrowDown}");

			// Input should still have focus
			expect(input).toHaveFocus();
		});

		it("should clear highlight when typing after navigation", async () => {
			const onSelect = vi.fn();
			renderWithProviders({ onSelect });

			const input = screen.getByPlaceholderText("Search for a user...");
			await user.type(input, "adrian");

			await waitFor(() => {
				expect(screen.getByText("Adrian Smith")).toBeInTheDocument();
			});

			// Navigate to an item
			await user.keyboard("{ArrowDown}");

			// Type more characters
			await user.type(input, " s");

			// Wait for new results
			await waitFor(() => {
				// Highlight should be cleared (no items with gray background)
				const items = screen.queryAllByRole("button");
				items.forEach((item) => {
					expect(item).not.toHaveClass("bg-gray-200");
				});
			});
		});
	});

	describe("Accessibility", () => {
		it("should have no accessibility violations", async () => {
			const onSelect = vi.fn();
			const { container } = renderWithProviders({ onSelect });

			const input = screen.getByPlaceholderText("Search for a user...");
			await user.type(input, "adrian");

			await waitFor(() => {
				expect(screen.getByText("Adrian Smith")).toBeInTheDocument();
			});

			// Run accessibility checks
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("should have no accessibility violations with highlighted item", async () => {
			const onSelect = vi.fn();
			const { container } = renderWithProviders({ onSelect });

			const input = screen.getByPlaceholderText("Search for a user...");
			await user.type(input, "adrian");

			await waitFor(() => {
				expect(screen.getByText("Adrian Smith")).toBeInTheDocument();
			});

			// Navigate to highlight an item
			await user.keyboard("{ArrowDown}");

			// Run accessibility checks
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});
	});
});
