import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { InviteTeamMemberPanel } from "./InviteTeamMemberPanel";
import type { IPendingInvite } from "../../types/team.types";

// Mock crypto.randomUUID
let uuidCounter = 0;
vi.stubGlobal("crypto", {
	randomUUID: () => `uuid-${++uuidCounter}`,
});

// Track excludeUserIds passed to the form
let capturedExcludeUserIds: number[] = [];

vi.mock("./InviteMemberForm", () => ({
	InviteMemberForm: (props: {
		excludeUserIds: number[];
		onAdd: (invite: IPendingInvite) => void;
		disabled?: boolean;
	}) => {
		capturedExcludeUserIds = props.excludeUserIds;
		return (
			<div data-testid="mock-invite-form">
				<button
					data-testid="add-staff-user"
					onClick={() =>
						props.onAdd({
							id: `uuid-${++uuidCounter}`,
							user: {
								id: 100,
								display_first_name: "Alice",
								display_last_name: "Staff",
								is_staff: true,
								is_superuser: false,
								image: null,
							},
							role: "technical",
							roleLabel: "Technical Support",
							timeAllocation: 0.5,
							shortCode: "",
						})
					}
				>
					Add Staff User
				</button>
				<button
					data-testid="add-external-user"
					onClick={() =>
						props.onAdd({
							id: `uuid-${++uuidCounter}`,
							user: {
								id: 200,
								display_first_name: "Bob",
								display_last_name: "External",
								is_staff: false,
								is_superuser: false,
								image: null,
							},
							role: "consulted",
							roleLabel: "Consulted Peer",
							timeAllocation: 0,
							shortCode: "",
						})
					}
				>
					Add External User
				</button>
				{props.disabled && <span data-testid="form-disabled">disabled</span>}
			</div>
		);
	},
}));

const mockInviteTeamMember = vi.fn();

vi.mock("../../services/team.service", () => ({
	inviteTeamMember: (...args: unknown[]) => mockInviteTeamMember(...args),
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

const createWrapper = () => {
	const qc = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	return ({ children }: { children: ReactNode }) =>
		createElement(QueryClientProvider, { client: qc }, children);
};

describe("InviteTeamMemberPanel", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		uuidCounter = 0;
		capturedExcludeUserIds = [];
	});

	it("adding a user to pending list shows a chip", async () => {
		const user = userEvent.setup();

		render(
			<InviteTeamMemberPanel
				projectId={1}
				excludeUserIds={[]}
				onClose={vi.fn()}
			/>,
			{ wrapper: createWrapper() }
		);

		await user.click(screen.getByTestId("add-staff-user"));

		expect(screen.getByText("Alice Staff")).toBeInTheDocument();
		expect(screen.getByText("Technical Support")).toBeInTheDocument();
	});

	it("removing a chip removes from pending list", async () => {
		const user = userEvent.setup();

		render(
			<InviteTeamMemberPanel
				projectId={1}
				excludeUserIds={[]}
				onClose={vi.fn()}
			/>,
			{ wrapper: createWrapper() }
		);

		await user.click(screen.getByTestId("add-staff-user"));
		expect(screen.getByText("Alice Staff")).toBeInTheDocument();

		const removeButton = screen.getByRole("button", {
			name: /remove alice staff from pending invites/i,
		});
		await user.click(removeButton);

		expect(screen.queryByText("Alice Staff")).not.toBeInTheDocument();
	});

	it("pending user IDs are excluded from search (combined exclusion)", async () => {
		const user = userEvent.setup();

		render(
			<InviteTeamMemberPanel
				projectId={1}
				excludeUserIds={[50, 60]}
				onClose={vi.fn()}
			/>,
			{ wrapper: createWrapper() }
		);

		// Initially only existing members excluded
		expect(capturedExcludeUserIds).toEqual([50, 60]);

		// Add a user
		await user.click(screen.getByTestId("add-staff-user"));

		// Now pending user ID should also be excluded
		expect(capturedExcludeUserIds).toContain(100);
		expect(capturedExcludeUserIds).toContain(50);
		expect(capturedExcludeUserIds).toContain(60);
	});

	it("removing a pending invite makes user searchable again", async () => {
		const user = userEvent.setup();

		render(
			<InviteTeamMemberPanel
				projectId={1}
				excludeUserIds={[]}
				onClose={vi.fn()}
			/>,
			{ wrapper: createWrapper() }
		);

		await user.click(screen.getByTestId("add-staff-user"));
		expect(capturedExcludeUserIds).toContain(100);

		const removeButton = screen.getByRole("button", {
			name: /remove alice staff from pending invites/i,
		});
		await user.click(removeButton);

		expect(capturedExcludeUserIds).not.toContain(100);
	});

	it("submit button is disabled when pending list is empty", () => {
		render(
			<InviteTeamMemberPanel
				projectId={1}
				excludeUserIds={[]}
				onClose={vi.fn()}
			/>,
			{ wrapper: createWrapper() }
		);

		const submitButton = screen.getByRole("button", {
			name: /add all members/i,
		});
		expect(submitButton).toBeDisabled();
	});

	it("submit all calls mutation and closes panel on full success", async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();
		mockInviteTeamMember.mockResolvedValue({ id: 1 });

		render(
			<InviteTeamMemberPanel
				projectId={1}
				excludeUserIds={[]}
				onClose={onClose}
			/>,
			{ wrapper: createWrapper() }
		);

		await user.click(screen.getByTestId("add-staff-user"));
		await user.click(screen.getByTestId("add-external-user"));

		const submitButton = screen.getByRole("button", {
			name: /add all members/i,
		});
		await user.click(submitButton);

		await waitFor(() => {
			expect(onClose).toHaveBeenCalled();
		});

		expect(mockInviteTeamMember).toHaveBeenCalledTimes(2);
	});

	it("partial failure keeps failed invites in pending list", async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();

		// First call succeeds, second fails
		mockInviteTeamMember
			.mockResolvedValueOnce({ id: 1 })
			.mockRejectedValueOnce(new Error("Duplicate member"));

		render(
			<InviteTeamMemberPanel
				projectId={1}
				excludeUserIds={[]}
				onClose={onClose}
			/>,
			{ wrapper: createWrapper() }
		);

		await user.click(screen.getByTestId("add-staff-user"));
		await user.click(screen.getByTestId("add-external-user"));

		const submitButton = screen.getByRole("button", {
			name: /add all members/i,
		});
		await user.click(submitButton);

		await waitFor(() => {
			// Panel should NOT close on partial failure
			expect(onClose).not.toHaveBeenCalled();
		});

		// The failed invite (Bob External) should still be visible
		expect(screen.getByText("Bob External")).toBeInTheDocument();
		// The successful invite (Alice Staff) should be removed
		expect(screen.queryByText("Alice Staff")).not.toBeInTheDocument();
	});
});
