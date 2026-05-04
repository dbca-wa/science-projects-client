import { describe, it, expect } from "vitest";
import { findProjectLeader } from "./team.utils";
import type { IProjectMember } from "@/shared/types/project.types";

/**
 * Helper to create mock team member
 */
function createMockMember(
	overrides: Partial<IProjectMember> = {}
): IProjectMember {
	return {
		id: 1,
		project: 1,
		is_leader: false,
		user: {
			id: 1,
			is_staff: true,
			is_superuser: false,
			username: "testuser",
			display_first_name: "Test",
			display_last_name: "User",
			first_name: "Test",
			last_name: "User",
			email: "test@example.com",
			business_area: null,
			branch: null,
			role: "Test Role",
			image: { id: 1, file: "", old_file: "" },
		},
		role: "Research",
		time_allocation: 50,
		position: 1,
		short_code: null,
		affiliation: { id: 1, name: "Test Affiliation" },
		...overrides,
	} as IProjectMember;
}

describe("findProjectLeader", () => {
	it("should find the project leader", () => {
		const members = [
			createMockMember({ id: 1, is_leader: false }),
			createMockMember({ id: 2, is_leader: true }),
			createMockMember({ id: 3, is_leader: false }),
		];

		const leader = findProjectLeader(members);
		expect(leader?.id).toBe(2);
	});

	it("should return undefined if no leader found", () => {
		const members = [
			createMockMember({ id: 1, is_leader: false }),
			createMockMember({ id: 2, is_leader: false }),
		];

		const leader = findProjectLeader(members);
		expect(leader).toBeUndefined();
	});

	it("should return first leader if multiple leaders exist", () => {
		const members = [
			createMockMember({ id: 1, is_leader: true }),
			createMockMember({ id: 2, is_leader: true }),
		];

		const leader = findProjectLeader(members);
		expect(leader?.id).toBe(1);
	});
});
