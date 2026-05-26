import { describe, it, expect } from "vitest";
import { formatAuthors } from "./authors.utils";
import type { IProjectMember } from "@/shared/types/project.types";

// Helper to create mock project member
function createMockMember(
	firstName: string | null,
	lastName: string | null,
	position: number,
	isLeader = false
): IProjectMember {
	return {
		id: 1,
		user: {
			id: 1,
			is_staff: false,
			is_superuser: false,
			is_active: true,
			username: "test",
			display_first_name: firstName,
			display_last_name: lastName,
			first_name: firstName,
			last_name: lastName,
			email: "test@example.com",
			phone: null,
			business_area: null,
			branch: null,
			agency: null,
			role: null,
			image: { id: 1, file: "", old_file: "", user: 1 },
			affiliation: { id: 1, name: "Test Affiliation" },
			about: null,
			expertise: null,
			date_joined: null,
		},
		project: 1,
		position,
		role: "Research Scientist",
		short_code: null,
		time_allocation: 0,
		is_leader: isLeader,
		affiliation: { id: 1, name: "Test Affiliation" },
	};
}

describe("formatAuthors", () => {
	it("should format single member correctly", () => {
		const members = [createMockMember("John", "Smith", 0)];
		expect(formatAuthors(members)).toBe("J. Smith");
	});

	it("should format multiple members sorted by position", () => {
		const members = [
			createMockMember("John", "Smith", 1),
			createMockMember("Alice", "Johnson", 0),
			createMockMember("Bob", "Williams", 2),
		];
		expect(formatAuthors(members)).toBe("A. Johnson, J. Smith, B. Williams");
	});

	it("should include members with null first name using last name only", () => {
		const members = [
			createMockMember("John", "Smith", 0),
			createMockMember(null, "Doe", 1),
		];
		expect(formatAuthors(members)).toBe("J. Smith, Doe");
	});

	it("should include members with null last name using first name only", () => {
		const members = [
			createMockMember("John", "Smith", 0),
			createMockMember("Jane", null, 1),
		];
		expect(formatAuthors(members)).toBe("J. Smith, Jane");
	});

	it("should include members with 'None' as first name using last name only", () => {
		const members = [
			createMockMember("John", "Smith", 0),
			createMockMember("None", "Doe", 1),
		];
		expect(formatAuthors(members)).toBe("J. Smith, Doe");
	});

	it("should include members with 'None' as last name using first name only", () => {
		const members = [
			createMockMember("John", "Smith", 0),
			createMockMember("Jane", "None", 1),
		];
		expect(formatAuthors(members)).toBe("J. Smith, Jane");
	});

	it("should return empty string when all members have both names invalid", () => {
		const members = [
			createMockMember(null, null, 0),
			createMockMember("None", "None", 1),
		];
		expect(formatAuthors(members)).toBe("");
	});

	it("should return empty string for empty array", () => {
		expect(formatAuthors([])).toBe("");
	});

	it("should handle members with same position", () => {
		const members = [
			createMockMember("John", "Smith", 0),
			createMockMember("Alice", "Johnson", 0),
		];
		// Should maintain order when positions are equal
		const result = formatAuthors(members);
		expect(result).toMatch(/^[A-Z]\. \w+, [A-Z]\. \w+$/);
	});

	it("should handle single character names", () => {
		const members = [createMockMember("J", "S", 0)];
		expect(formatAuthors(members)).toBe("J. S");
	});

	it("should handle long names", () => {
		const members = [createMockMember("Christopher", "Montgomery-Smith", 0)];
		expect(formatAuthors(members)).toBe("C. Montgomery-Smith");
	});

	it("should always show leader first regardless of position value", () => {
		const members = [
			createMockMember("Alice", "Johnson", 2),
			createMockMember("Bob", "Prince", 5, true), // Leader with higher position
			createMockMember("Charlie", "Smith", 3),
		];
		expect(formatAuthors(members)).toBe("B. Prince, A. Johnson, C. Smith");
	});

	it("should sort non-leaders by position after leader", () => {
		const members = [
			createMockMember("Charlie", "Smith", 4),
			createMockMember("Bob", "Prince", 1, true),
			createMockMember("Alice", "Johnson", 2),
			createMockMember("Dave", "Williams", 3),
		];
		expect(formatAuthors(members)).toBe(
			"B. Prince, A. Johnson, D. Williams, C. Smith"
		);
	});
});
