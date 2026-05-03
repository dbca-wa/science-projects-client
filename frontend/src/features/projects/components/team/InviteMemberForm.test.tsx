import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { InviteMemberForm } from "./InviteMemberForm";
import type { IPendingInvite } from "../../types/team.types";

// Mock crypto.randomUUID
vi.stubGlobal("crypto", {
	randomUUID: () => "mock-uuid-123",
});

// Track the last onValueChange callback passed to UserCombobox
let capturedExcludeUserIds: number[] = [];
let capturedDisabled: boolean | undefined;

vi.mock("@/shared/components/user", () => ({
	UserCombobox: (props: {
		onValueChange: (userId: number | null) => void;
		excludeUserIds?: number[];
		disabled?: boolean;
		value?: number | null;
	}) => {
		capturedExcludeUserIds = props.excludeUserIds ?? [];
		capturedDisabled = props.disabled;
		return (
			<div data-testid="mock-user-combobox">
				<button
					data-testid="select-staff-user"
					onClick={() => props.onValueChange(10)}
				>
					Select Staff User
				</button>
				<button
					data-testid="select-external-user"
					onClick={() => props.onValueChange(20)}
				>
					Select External User
				</button>
				{props.value && <span data-testid="selected-value">{props.value}</span>}
			</div>
		);
	},
}));

const mockGetFullUser = vi.fn();

vi.mock("@/features/users/services/user.service", () => ({
	getFullUser: (...args: unknown[]) => mockGetFullUser(...args),
}));

const staffUser = {
	id: 10,
	display_first_name: "Jane",
	display_last_name: "Doe",
	is_staff: true,
	is_superuser: false,
	image: null,
	email: "jane@example.com",
};

const createWrapper = () => {
	const qc = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	return ({ children }: { children: ReactNode }) =>
		createElement(QueryClientProvider, { client: qc }, children);
};

describe("InviteMemberForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		capturedExcludeUserIds = [];
		capturedDisabled = undefined;
	});

	it("'Add to List' button is disabled when no user is selected", () => {
		render(<InviteMemberForm excludeUserIds={[]} onAdd={vi.fn()} />, {
			wrapper: createWrapper(),
		});

		const addButton = screen.getByRole("button", { name: /add to list/i });
		expect(addButton).toBeDisabled();
	});

	it("calls onAdd with correct IPendingInvite data for staff user", async () => {
		const user = userEvent.setup();
		const onAdd = vi.fn();
		mockGetFullUser.mockResolvedValue(staffUser);

		render(<InviteMemberForm excludeUserIds={[]} onAdd={onAdd} />, {
			wrapper: createWrapper(),
		});

		// Select a staff user
		await user.click(screen.getByTestId("select-staff-user"));

		// Wait for user data to load and role fields to appear
		await waitFor(() => {
			expect(screen.getByText(/project role/i)).toBeInTheDocument();
		});

		// Click add
		const addButton = screen.getByRole("button", { name: /add to list/i });
		await user.click(addButton);

		expect(onAdd).toHaveBeenCalledTimes(1);
		const invite: IPendingInvite = onAdd.mock.calls[0][0];
		expect(invite.user.id).toBe(10);
		expect(invite.user.display_first_name).toBe("Jane");
		expect(invite.role).toBe("technical"); // Default staff role
		expect(invite.roleLabel).toBe("Technical Support");
		expect(invite.timeAllocation).toBe(0);
		expect(invite.id).toBe("mock-uuid-123");
	});

	it("resets form after adding a user", async () => {
		const user = userEvent.setup();
		const onAdd = vi.fn();
		mockGetFullUser.mockResolvedValue(staffUser);

		render(<InviteMemberForm excludeUserIds={[]} onAdd={onAdd} />, {
			wrapper: createWrapper(),
		});

		// Select user
		await user.click(screen.getByTestId("select-staff-user"));
		await waitFor(() => {
			expect(screen.getByText(/project role/i)).toBeInTheDocument();
		});

		// Add user
		await user.click(screen.getByRole("button", { name: /add to list/i }));

		// After add, the selected value should be cleared (no selected-value element)
		await waitFor(() => {
			expect(screen.queryByTestId("selected-value")).not.toBeInTheDocument();
		});

		// Add button should be disabled again (no user selected)
		expect(screen.getByRole("button", { name: /add to list/i })).toBeDisabled();
	});

	it("passes excludeUserIds to UserCombobox", () => {
		render(<InviteMemberForm excludeUserIds={[1, 2, 3]} onAdd={vi.fn()} />, {
			wrapper: createWrapper(),
		});

		expect(capturedExcludeUserIds).toEqual([1, 2, 3]);
	});

	it("disabled prop disables the form", () => {
		render(
			<InviteMemberForm excludeUserIds={[]} onAdd={vi.fn()} disabled={true} />,
			{ wrapper: createWrapper() }
		);

		expect(capturedDisabled).toBe(true);
		expect(screen.getByRole("button", { name: /add to list/i })).toBeDisabled();
	});
});
