import { describe, it, expect } from "vitest";
import { getDocumentTypeName } from "./document.utils";

describe("getDocumentTypeName", () => {
	it("should return 'Concept Plan' for concept", () => {
		expect(getDocumentTypeName("concept")).toBe("Concept Plan");
	});

	it("should return 'Project Plan' for projectplan", () => {
		expect(getDocumentTypeName("projectplan")).toBe("Project Plan");
	});

	it("should return 'Progress Report' for progressreport", () => {
		expect(getDocumentTypeName("progressreport")).toBe("Progress Report");
	});

	it("should return 'Student Report' for studentreport", () => {
		expect(getDocumentTypeName("studentreport")).toBe("Student Report");
	});

	it("should return 'Project Closure' for projectclosure", () => {
		expect(getDocumentTypeName("projectclosure")).toBe("Project Closure");
	});
});
