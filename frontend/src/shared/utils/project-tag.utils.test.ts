import { describe, it, expect } from "vitest";
import {
	formatProjectYear,
	formatProjectTag,
	parseProjectTag,
	isValidProjectTag,
	getProjectKindColour,
} from "./project-tag.utils";
import type {
	IProjectData,
	ProjectKind as _ProjectKind,
} from "@/shared/types/project.types";

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

describe("formatProjectYear", () => {
	it("should return single year when start equals end", () => {
		expect(formatProjectYear(2024, 2024)).toBe("2024");
	});

	it("should return year range when start differs from end", () => {
		expect(formatProjectYear(2024, 2025)).toBe("2024-2025");
	});

	it("should return open-ended range when end is null", () => {
		expect(formatProjectYear(2024, null)).toBe("2024-");
	});

	it("should handle multi-year ranges", () => {
		expect(formatProjectYear(2020, 2024)).toBe("2020-2024");
	});
});

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

describe("parseProjectTag", () => {
	it("should parse science project tag with single year", () => {
		const result = parseProjectTag("SP-2024-6");
		expect(result).toEqual({
			type: "SP",
			kind: "science",
			startYear: 2024,
			endYear: null,
			number: 6,
		});
	});

	it("should parse student project tag with year range", () => {
		const result = parseProjectTag("STP-2024-2025-12");
		expect(result).toEqual({
			type: "STP",
			kind: "student",
			startYear: 2024,
			endYear: 2025,
			number: 12,
		});
	});

	it("should parse external project tag with open-ended range", () => {
		const result = parseProjectTag("EXT-2024--3");
		expect(result).toEqual({
			type: "EXT",
			kind: "external",
			startYear: 2024,
			endYear: null,
			number: 3,
		});
	});

	it("should parse core function project tag", () => {
		const result = parseProjectTag("CF-2024-1");
		expect(result).toEqual({
			type: "CF",
			kind: "core_function",
			startYear: 2024,
			endYear: null,
			number: 1,
		});
	});

	it("should return null for invalid format", () => {
		expect(parseProjectTag("INVALID-2024-6")).toBeNull();
		expect(parseProjectTag("SP-2024")).toBeNull();
		expect(parseProjectTag("SP-ABCD-6")).toBeNull();
		expect(parseProjectTag("")).toBeNull();
	});

	it("should return null for invalid year range", () => {
		// End year before start year
		expect(parseProjectTag("SP-2025-2024-6")).toBeNull();
	});

	it("should handle large numbers", () => {
		const result = parseProjectTag("SP-2024-999");
		expect(result?.number).toBe(999);
	});
});

describe("isValidProjectTag", () => {
	it("should return true for valid tags", () => {
		expect(isValidProjectTag("SP-2024-6")).toBe(true);
		expect(isValidProjectTag("STP-2024-2025-12")).toBe(true);
		expect(isValidProjectTag("EXT-2024--3")).toBe(true);
		expect(isValidProjectTag("CF-2024-1")).toBe(true);
	});

	it("should return false for invalid tags", () => {
		expect(isValidProjectTag("INVALID-2024-6")).toBe(false);
		expect(isValidProjectTag("SP-2024")).toBe(false);
		expect(isValidProjectTag("SP-ABCD-6")).toBe(false);
		expect(isValidProjectTag("")).toBe(false);
		expect(isValidProjectTag("SP-2025-2024-6")).toBe(false);
	});
});

describe("getProjectKindColour", () => {
	it("should return correct colour for science projects", () => {
		const result = getProjectKindColour("science");
		expect(result).toEqual({
			backgroundColor: "#2A6096",
			color: "white",
		});
	});

	it("should return correct colour for student projects", () => {
		const result = getProjectKindColour("student");
		expect(result).toEqual({
			backgroundColor: "#FFC530",
			color: "white",
		});
	});

	it("should return correct colour for external projects", () => {
		const result = getProjectKindColour("external");
		expect(result).toEqual({
			backgroundColor: "#1E5456",
			color: "white",
		});
	});

	it("should return correct colour for core function projects", () => {
		const result = getProjectKindColour("core_function");
		expect(result).toEqual({
			backgroundColor: "#01A7B2",
			color: "white",
		});
	});
});
