import { describe, it, expect } from "vitest";
import { formatAuthors } from "./authors.utils";
import type { IProjectMember } from "@/shared/types/project.types";

// Helper to create mock project member
function createMockMember(
	firstName: string | null,
	lastName: string | null,
	position: number
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
		is_leader: false,
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

	it("should filter out members with null first name", () => {
		const members = [
			createMockMember("John", "Smith", 0),
			createMockMember(null, "Doe", 1),
		];
		expect(formatAuthors(members)).toBe("J. Smith");
	});

	it("should filter out members with null last name", () => {
		const members = [
			createMockMember("John", "Smith", 0),
			createMockMember("Jane", null, 1),
		];
		expect(formatAuthors(members)).toBe("J. Smith");
	});

	it("should filter out members with 'None' as first name", () => {
		const members = [
			createMockMember("John", "Smith", 0),
			createMockMember("None", "Doe", 1),
		];
		expect(formatAuthors(members)).toBe("J. Smith");
	});

	it("should filter out members with 'None' as last name", () => {
		const members = [
			createMockMember("John", "Smith", 0),
			createMockMember("Jane", "None", 1),
		];
		expect(formatAuthors(members)).toBe("J. Smith");
	});

	it("should return empty string when no valid members", () => {
		const members = [
			createMockMember(null, "Smith", 0),
			createMockMember("John", null, 1),
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
});
