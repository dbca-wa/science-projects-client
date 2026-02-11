import { describe, it, expect } from "vitest";
import {
	getProjectStatusDisplay,
	getProjectKindDisplay,
	getProjectYearDisplay,
	parseProjectKeywords,
	formatProjectNumber,
	getProjectTag,
	getProjectStatusColor,
	getProjectKindColor,
} from "./project.utils";
import type { IProjectData } from "@/shared/types/project.types";

describe("getProjectStatusDisplay", () => {
	it("should return formatted status for valid status", () => {
		expect(getProjectStatusDisplay("new")).toBe("New");
		expect(getProjectStatusDisplay("pending")).toBe("Pending");
		expect(getProjectStatusDisplay("active")).toBe("Active");
		expect(getProjectStatusDisplay("updating")).toBe("Updating");
		expect(getProjectStatusDisplay("closure_requested")).toBe(
			"Closure Requested"
		);
		expect(getProjectStatusDisplay("closing")).toBe("Closing");
		expect(getProjectStatusDisplay("final_update")).toBe("Final Update");
		expect(getProjectStatusDisplay("completed")).toBe("Completed");
		expect(getProjectStatusDisplay("terminated")).toBe("Terminated");
		expect(getProjectStatusDisplay("suspended")).toBe("Suspended");
	});

	it("should return empty string for null", () => {
		expect(getProjectStatusDisplay(null)).toBe("");
	});

	it("should return empty string for undefined", () => {
		expect(getProjectStatusDisplay(undefined)).toBe("");
	});

	it("should return original value for unknown status", () => {
		expect(getProjectStatusDisplay("unknown_status")).toBe("unknown_status");
	});
});

describe("getProjectKindDisplay", () => {
	it("should return formatted kind for valid kind", () => {
		expect(getProjectKindDisplay("core_function")).toBe("Core Function");
		expect(getProjectKindDisplay("science")).toBe("Science");
		expect(getProjectKindDisplay("student")).toBe("Student");
		expect(getProjectKindDisplay("external")).toBe("External Partnership");
	});

	it("should return empty string for null", () => {
		expect(getProjectKindDisplay(null)).toBe("");
	});

	it("should return empty string for undefined", () => {
		expect(getProjectKindDisplay(undefined)).toBe("");
	});

	it("should return original value for unknown kind", () => {
		expect(getProjectKindDisplay("unknown_kind")).toBe("unknown_kind");
	});
});

describe("getProjectYearDisplay", () => {
	it("should return year as string for valid project", () => {
		const project = { year: 2024 } as IProjectData;
		expect(getProjectYearDisplay(project)).toBe("2024");
	});

	it("should return empty string for null project", () => {
		expect(getProjectYearDisplay(null)).toBe("");
	});

	it("should return empty string for undefined project", () => {
		expect(getProjectYearDisplay(undefined)).toBe("");
	});

	it("should return empty string for project with no year", () => {
		const project = {} as IProjectData;
		expect(getProjectYearDisplay(project)).toBe("");
	});
});

describe("parseProjectKeywords", () => {
	it("should parse comma-separated keywords", () => {
		expect(parseProjectKeywords("keyword1, keyword2, keyword3")).toEqual([
			"keyword1",
			"keyword2",
			"keyword3",
		]);
	});

	it("should trim whitespace from keywords", () => {
		expect(
			parseProjectKeywords("  keyword1  ,  keyword2  ,  keyword3  ")
		).toEqual(["keyword1", "keyword2", "keyword3"]);
	});

	it("should filter empty keywords", () => {
		expect(parseProjectKeywords("keyword1, , keyword2, ,")).toEqual([
			"keyword1",
			"keyword2",
		]);
	});

	it("should return empty array for null", () => {
		expect(parseProjectKeywords(null)).toEqual([]);
	});

	it("should return empty array for undefined", () => {
		expect(parseProjectKeywords(undefined)).toEqual([]);
	});

	it("should return empty array for empty string", () => {
		expect(parseProjectKeywords("")).toEqual([]);
	});

	it("should handle single keyword", () => {
		expect(parseProjectKeywords("keyword1")).toEqual(["keyword1"]);
	});

	it("should handle keywords with no spaces", () => {
		expect(parseProjectKeywords("keyword1,keyword2,keyword3")).toEqual([
			"keyword1",
			"keyword2",
			"keyword3",
		]);
	});
});

describe("formatProjectNumber", () => {
	it("should format project number with year prefix", () => {
		expect(formatProjectNumber(2024, 1)).toBe("2024-001");
		expect(formatProjectNumber(2024, 42)).toBe("2024-042");
		expect(formatProjectNumber(2024, 123)).toBe("2024-123");
	});

	it("should pad number with leading zeros", () => {
		expect(formatProjectNumber(2024, 1)).toBe("2024-001");
		expect(formatProjectNumber(2024, 10)).toBe("2024-010");
		expect(formatProjectNumber(2024, 100)).toBe("2024-100");
	});

	it("should return empty string for null year", () => {
		expect(formatProjectNumber(null, 1)).toBe("");
	});

	it("should return empty string for undefined year", () => {
		expect(formatProjectNumber(undefined, 1)).toBe("");
	});

	it("should return empty string for null number", () => {
		expect(formatProjectNumber(2024, null)).toBe("");
	});

	it("should return empty string for undefined number", () => {
		expect(formatProjectNumber(2024, undefined)).toBe("");
	});

	it("should return empty string for both null", () => {
		expect(formatProjectNumber(null, null)).toBe("");
	});
});

describe("getProjectTag", () => {
	it("should return formatted project tag", () => {
		const project = { year: 2024, number: 42 } as IProjectData;
		expect(getProjectTag(project)).toBe("2024-042");
	});

	it("should return empty string for null project", () => {
		expect(getProjectTag(null)).toBe("");
	});

	it("should return empty string for undefined project", () => {
		expect(getProjectTag(undefined)).toBe("");
	});

	it("should return empty string for project with no year", () => {
		const project = { number: 42 } as IProjectData;
		expect(getProjectTag(project)).toBe("");
	});

	it("should return empty string for project with no number", () => {
		const project = { year: 2024 } as IProjectData;
		expect(getProjectTag(project)).toBe("");
	});
});

describe("getProjectStatusColor", () => {
	it("should return correct color for each status", () => {
		expect(getProjectStatusColor("new")).toBe("blue");
		expect(getProjectStatusColor("pending")).toBe("yellow");
		expect(getProjectStatusColor("active")).toBe("green");
		expect(getProjectStatusColor("updating")).toBe("orange");
		expect(getProjectStatusColor("closure_requested")).toBe("purple");
		expect(getProjectStatusColor("closing")).toBe("purple");
		expect(getProjectStatusColor("final_update")).toBe("purple");
		expect(getProjectStatusColor("completed")).toBe("gray");
		expect(getProjectStatusColor("terminated")).toBe("red");
		expect(getProjectStatusColor("suspended")).toBe("red");
	});

	it("should return gray for null", () => {
		expect(getProjectStatusColor(null)).toBe("gray");
	});

	it("should return gray for undefined", () => {
		expect(getProjectStatusColor(undefined)).toBe("gray");
	});

	it("should return gray for unknown status", () => {
		expect(getProjectStatusColor("unknown_status")).toBe("gray");
	});
});

describe("getProjectKindColor", () => {
	it("should return correct color for each kind", () => {
		expect(getProjectKindColor("core_function")).toBe("blue");
		expect(getProjectKindColor("science")).toBe("green");
		expect(getProjectKindColor("student")).toBe("purple");
		expect(getProjectKindColor("external")).toBe("orange");
	});

	it("should return gray for null", () => {
		expect(getProjectKindColor(null)).toBe("gray");
	});

	it("should return gray for undefined", () => {
		expect(getProjectKindColor(undefined)).toBe("gray");
	});

	it("should return gray for unknown kind", () => {
		expect(getProjectKindColor("unknown_kind")).toBe("gray");
	});
});
