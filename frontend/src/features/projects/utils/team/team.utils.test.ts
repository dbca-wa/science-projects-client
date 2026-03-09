import { describe, it, expect } from "vitest";
import {
	sortTeamMembers,
	reorderTeamMembers,
	getTeamMemberLabel,
	getTeamMemberName,
	findProjectLeader,
	isLeader,
	getPositionUpdates,
} from "./team.utils";
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

describe("sortTeamMembers", () => {
	it("should sort members by position in ascending order", () => {
		const members = [
			createMockMember({ id: 1, position: 3 }),
			createMockMember({ id: 2, position: 1 }),
			createMockMember({ id: 3, position: 2 }),
		];

		const sorted = sortTeamMembers(members);

		expect(sorted[0].position).toBe(1);
		expect(sorted[1].position).toBe(2);
		expect(sorted[2].position).toBe(3);
	});

	it("should not mutate the original array", () => {
		const members = [
			createMockMember({ id: 1, position: 3 }),
			createMockMember({ id: 2, position: 1 }),
		];

		const original = [...members];
		sortTeamMembers(members);

		expect(members).toEqual(original);
	});

	it("should handle empty array", () => {
		const sorted = sortTeamMembers([]);
		expect(sorted).toEqual([]);
	});

	it("should handle single member", () => {
		const members = [createMockMember({ id: 1, position: 1 })];
		const sorted = sortTeamMembers(members);
		expect(sorted).toEqual(members);
	});

	it("should handle members with same position", () => {
		const members = [
			createMockMember({ id: 1, position: 1 }),
			createMockMember({ id: 2, position: 1 }),
		];

		const sorted = sortTeamMembers(members);
		expect(sorted.length).toBe(2);
	});
});

describe("reorderTeamMembers", () => {
	it("should move member from one position to another", () => {
		const members = [
			createMockMember({ id: 1, position: 1 }),
			createMockMember({ id: 2, position: 2 }),
			createMockMember({ id: 3, position: 3 }),
		];

		// Move member 1 to position of member 3
		const reordered = reorderTeamMembers(members, 1, 3);

		expect(reordered[0].id).toBe(2);
		expect(reordered[1].id).toBe(3);
		expect(reordered[2].id).toBe(1);
	});

	it("should update positions after reordering", () => {
		const members = [
			createMockMember({ id: 1, position: 1 }),
			createMockMember({ id: 2, position: 2 }),
			createMockMember({ id: 3, position: 3 }),
		];

		const reordered = reorderTeamMembers(members, 1, 3);

		expect(reordered[0].position).toBe(1);
		expect(reordered[1].position).toBe(2);
		expect(reordered[2].position).toBe(3);
	});

	it("should return original array if activeId not found", () => {
		const members = [
			createMockMember({ id: 1, position: 1 }),
			createMockMember({ id: 2, position: 2 }),
		];

		const reordered = reorderTeamMembers(members, 999, 2);
		expect(reordered).toEqual(members);
	});

	it("should return original array if overId not found", () => {
		const members = [
			createMockMember({ id: 1, position: 1 }),
			createMockMember({ id: 2, position: 2 }),
		];

		const reordered = reorderTeamMembers(members, 1, 999);
		expect(reordered).toEqual(members);
	});

	it("should handle moving to same position", () => {
		const members = [
			createMockMember({ id: 1, position: 1 }),
			createMockMember({ id: 2, position: 2 }),
		];

		const reordered = reorderTeamMembers(members, 1, 1);
		expect(reordered[0].id).toBe(1);
	});
});

describe("getTeamMemberLabel", () => {
	it("should format label with display name and role", () => {
		const member = createMockMember({
			user: {
				...createMockMember().user,
				display_first_name: "John",
				display_last_name: "Doe",
			},
			role: "Research Scientist",
		});

		expect(getTeamMemberLabel(member)).toBe("John Doe (Research Scientist)");
	});

	it("should fall back to first_name and last_name if display names not set", () => {
		const member = createMockMember({
			user: {
				...createMockMember().user,
				display_first_name: null,
				display_last_name: null,
				first_name: "Jane",
				last_name: "Smith",
			},
			role: "Technical Officer",
		});

		expect(getTeamMemberLabel(member)).toBe("Jane Smith (Technical Officer)");
	});

	it("should handle empty names gracefully", () => {
		const member = createMockMember({
			user: {
				...createMockMember().user,
				display_first_name: "",
				display_last_name: "",
				first_name: "",
				last_name: "",
			},
			role: "Researcher",
		});

		expect(getTeamMemberLabel(member)).toBe("(Researcher)");
	});
});

describe("getTeamMemberName", () => {
	it("should format name with display names", () => {
		const member = createMockMember({
			user: {
				...createMockMember().user,
				display_first_name: "John",
				display_last_name: "Doe",
			},
		});

		expect(getTeamMemberName(member)).toBe("John Doe");
	});

	it("should fall back to first_name and last_name", () => {
		const member = createMockMember({
			user: {
				...createMockMember().user,
				display_first_name: null,
				display_last_name: null,
				first_name: "Jane",
				last_name: "Smith",
			},
		});

		expect(getTeamMemberName(member)).toBe("Jane Smith");
	});
});

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

describe("isLeader", () => {
	it("should return true for project leader", () => {
		const member = createMockMember({ is_leader: true });
		expect(isLeader(member)).toBe(true);
	});

	it("should return false for non-leader", () => {
		const member = createMockMember({ is_leader: false });
		expect(isLeader(member)).toBe(false);
	});
});

describe("getPositionUpdates", () => {
	it("should return array of id and position objects", () => {
		const members = [
			createMockMember({ id: 1, position: 1 }),
			createMockMember({ id: 2, position: 2 }),
			createMockMember({ id: 3, position: 3 }),
		];

		const updates = getPositionUpdates(members);

		expect(updates).toEqual([
			{ id: 1, position: 1 },
			{ id: 2, position: 2 },
			{ id: 3, position: 3 },
		]);
	});

	it("should handle empty array", () => {
		const updates = getPositionUpdates([]);
		expect(updates).toEqual([]);
	});

	it("should only include id and position", () => {
		const members = [createMockMember({ id: 1, position: 1 })];
		const updates = getPositionUpdates(members);

		expect(Object.keys(updates[0])).toEqual(["id", "position"]);
	});
});
