import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PendingInviteChip } from "./PendingInviteChip";
import type { IPendingInvite } from "../../types/team.types";

const createInvite = (
	overrides: Partial<IPendingInvite> = {}
): IPendingInvite => ({
	id: "invite-1",
	user: {
		id: 10,
		display_first_name: "Jane",
		display_last_name: "Doe",
		is_staff: true,
		is_superuser: false,
		image: null,
	},
	role: "technical",
	roleLabel: "Technical Support",
	timeAllocation: 0.5,
	shortCode: "",
	...overrides,
});

describe("PendingInviteChip", () => {
	it("renders user name and role label", () => {
		render(<PendingInviteChip invite={createInvite()} onRemove={vi.fn()} />);

		expect(screen.getByText("Jane Doe")).toBeInTheDocument();
		expect(screen.getByText("Technical Support")).toBeInTheDocument();
	});

	it("calls onRemove with correct inviteId when remove button clicked", async () => {
		const user = userEvent.setup();
		const onRemove = vi.fn();

		render(
			<PendingInviteChip
				invite={createInvite({ id: "test-id-123" })}
				onRemove={onRemove}
			/>
		);

		const removeButton = screen.getByRole("button", {
			name: /remove jane doe from pending invites/i,
		});
		await user.click(removeButton);

		expect(onRemove).toHaveBeenCalledWith("test-id-123");
		expect(onRemove).toHaveBeenCalledTimes(1);
	});

	it("applies green background for staff users", () => {
		const { container } = render(
			<PendingInviteChip
				invite={createInvite({
					user: {
						id: 10,
						display_first_name: "Jane",
						display_last_name: "Doe",
						is_staff: true,
						is_superuser: false,
						image: null,
					},
				})}
				onRemove={vi.fn()}
			/>
		);

		const chip = container.querySelector(
			"[data-testid='pending-invite-chip-invite-1']"
		);
		expect(chip?.className).toContain("bg-green-50");
	});

	it("applies blue background for admin users", () => {
		const { container } = render(
			<PendingInviteChip
				invite={createInvite({
					id: "admin-invite",
					user: {
						id: 20,
						display_first_name: "Admin",
						display_last_name: "User",
						is_staff: true,
						is_superuser: true,
						image: null,
					},
				})}
				onRemove={vi.fn()}
			/>
		);

		const chip = container.querySelector(
			"[data-testid='pending-invite-chip-admin-invite']"
		);
		expect(chip?.className).toContain("bg-blue-50");
	});

	it("applies grey background for external users", () => {
		const { container } = render(
			<PendingInviteChip
				invite={createInvite({
					id: "ext-invite",
					user: {
						id: 30,
						display_first_name: "External",
						display_last_name: "Person",
						is_staff: false,
						is_superuser: false,
						image: null,
					},
				})}
				onRemove={vi.fn()}
			/>
		);

		const chip = container.querySelector(
			"[data-testid='pending-invite-chip-ext-invite']"
		);
		expect(chip?.className).toContain("bg-gray-50");
	});

	it("remove button has correct aria-label", () => {
		render(
			<PendingInviteChip
				invite={createInvite({
					user: {
						id: 10,
						display_first_name: "Alice",
						display_last_name: "Smith",
						is_staff: true,
						is_superuser: false,
						image: null,
					},
				})}
				onRemove={vi.fn()}
			/>
		);

		expect(
			screen.getByRole("button", {
				name: "Remove Alice Smith from pending invites",
			})
		).toBeInTheDocument();
	});
});
