import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PendingInviteList } from "./PendingInviteList";
import type { IPendingInvite } from "../../types/team.types";

const createInvite = (
	overrides: Partial<IPendingInvite> = {}
): IPendingInvite => ({
	id: `invite-${Math.random()}`,
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

describe("PendingInviteList", () => {
	it("returns null when invites array is empty", () => {
		const { container } = render(
			<PendingInviteList invites={[]} onRemove={vi.fn()} />
		);
		expect(container.firstChild).toBeNull();
	});

	it("renders correct number of chips", () => {
		const invites = [
			createInvite({ id: "a" }),
			createInvite({ id: "b" }),
			createInvite({ id: "c" }),
		];

		render(<PendingInviteList invites={invites} onRemove={vi.fn()} />);

		const listItems = screen.getAllByRole("listitem");
		expect(listItems).toHaveLength(3);
	});

	it("displays singular count label for one invite", () => {
		render(
			<PendingInviteList
				invites={[createInvite({ id: "a" })]}
				onRemove={vi.fn()}
			/>
		);

		// Text appears in both visible label and aria-live region
		const matches = screen.getAllByText("1 member pending");
		expect(matches.length).toBeGreaterThanOrEqual(1);
	});

	it("displays plural count label for multiple invites", () => {
		const invites = [createInvite({ id: "a" }), createInvite({ id: "b" })];

		render(<PendingInviteList invites={invites} onRemove={vi.fn()} />);

		// Text appears in both visible label and aria-live region
		const matches = screen.getAllByText("2 members pending");
		expect(matches.length).toBeGreaterThanOrEqual(1);
	});

	it("passes onRemove through to chips", async () => {
		const user = userEvent.setup();
		const onRemove = vi.fn();

		render(
			<PendingInviteList
				invites={[
					createInvite({
						id: "test-remove",
						user: {
							id: 10,
							display_first_name: "Alice",
							display_last_name: "Smith",
							is_staff: true,
							is_superuser: false,
							image: null,
						},
					}),
				]}
				onRemove={onRemove}
			/>
		);

		const removeButton = screen.getByRole("button", {
			name: /remove alice smith from pending invites/i,
		});
		await user.click(removeButton);

		expect(onRemove).toHaveBeenCalledWith("test-remove");
	});

	it("has aria-live region for screen reader announcements", () => {
		render(
			<PendingInviteList
				invites={[createInvite({ id: "a" })]}
				onRemove={vi.fn()}
			/>
		);

		const liveRegion = document.querySelector("[aria-live='polite']");
		expect(liveRegion).toBeInTheDocument();
	});

	it("has a list role with accessible label", () => {
		render(
			<PendingInviteList
				invites={[createInvite({ id: "a" })]}
				onRemove={vi.fn()}
			/>
		);

		expect(
			screen.getByRole("list", { name: /pending team member invites/i })
		).toBeInTheDocument();
	});
});
