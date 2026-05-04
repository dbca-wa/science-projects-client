import { describe, it, expect } from "vitest";
import { formatProjectTag } from "./project-tag.utils";
import type { IProjectData } from "@/shared/types/project.types";

/**
 * Helper to create mock project data
 */
function createMockProject(
	overrides: Partial<IProjectData> = {}
): IProjectData {
	return {
		id: 1,
		areas: [],
		kind: "science",
		title: "Test Project",
		status: "active",
		description: "",
		tagline: "",
		image: null,
		keywords: "",
		year: 2024,
		number: 6,
		start_date: new Date("2024-01-01"),
		end_date: new Date("2024-12-31"),
		business_area: {
			id: 1,
			name: "Test BA",
			slug: "test-ba",
			leader: null,
			introduction: "",
			image: null,
			focus: "",
			old_id: null,
		},
		deletion_requested: false,
		deletion_request_id: null,
		created_at: new Date(),
		updated_at: new Date(),
		...overrides,
	} as IProjectData;
}

describe("formatProjectTag", () => {
	it("should format science project tag", () => {
		const project = createMockProject({
			kind: "science",
			year: 2024,
			number: 6,
		});
		expect(formatProjectTag(project)).toBe("SP-2024-6");
	});

	it("should format student project tag", () => {
		const project = createMockProject({
			kind: "student",
			year: 2024,
			number: 12,
		});
		expect(formatProjectTag(project)).toBe("STP-2024-12");
	});

	it("should format external project tag", () => {
		const project = createMockProject({
			kind: "external",
			year: 2024,
			number: 3,
		});
		expect(formatProjectTag(project)).toBe("EXT-2024-3");
	});

	it("should format core function project tag", () => {
		const project = createMockProject({
			kind: "core_function",
			year: 2024,
			number: 1,
		});
		expect(formatProjectTag(project)).toBe("CF-2024-1");
	});

	it("should handle large project numbers", () => {
		const project = createMockProject({
			kind: "science",
			year: 2024,
			number: 999,
		});
		expect(formatProjectTag(project)).toBe("SP-2024-999");
	});
});
