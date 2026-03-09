import { describe, it, expect } from "vitest";
import {
	getDocumentTypeName,
	getDocumentTypeId,
	formatDocumentId,
	type DocumentType,
} from "./document.utils";
import type { IMainDoc } from "@/shared/types/document.types";

// Helper to create mock document
function createMockDocument(id: number, kind: DocumentType): IMainDoc {
	return {
		id,
		kind,
		created_year: 2024,
		created_at: new Date("2024-01-01"),
		creator: 1,
		modifier: 1,
		updated_at: new Date("2024-01-01"),
		status: "active",
		project_lead_approval_granted: false,
		business_area_lead_approval_granted: false,
		directorate_approval_granted: false,
		pdf_generation_in_progress: false,
		pdf: { file: "" },
		project: {
			id: 1,
			kind: "science",
			title: "Test Project",
			status: "active",
		} as IMainDoc["project"],
	};
}

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

describe("getDocumentTypeId", () => {
	it("should return 'CP' for concept", () => {
		expect(getDocumentTypeId("concept")).toBe("CP");
	});

	it("should return 'PP' for projectplan", () => {
		expect(getDocumentTypeId("projectplan")).toBe("PP");
	});

	it("should return 'PR' for progressreport", () => {
		expect(getDocumentTypeId("progressreport")).toBe("PR");
	});

	it("should return 'SR' for studentreport", () => {
		expect(getDocumentTypeId("studentreport")).toBe("SR");
	});

	it("should return 'PC' for projectclosure", () => {
		expect(getDocumentTypeId("projectclosure")).toBe("PC");
	});
});

describe("formatDocumentId", () => {
	it("should format concept plan document ID", () => {
		const doc = createMockDocument(123, "concept");
		expect(formatDocumentId(doc)).toBe("123 (CP)");
	});

	it("should format project plan document ID", () => {
		const doc = createMockDocument(456, "projectplan");
		expect(formatDocumentId(doc)).toBe("456 (PP)");
	});

	it("should format progress report document ID", () => {
		const doc = createMockDocument(789, "progressreport");
		expect(formatDocumentId(doc)).toBe("789 (PR)");
	});

	it("should format student report document ID", () => {
		const doc = createMockDocument(101, "studentreport");
		expect(formatDocumentId(doc)).toBe("101 (SR)");
	});

	it("should format project closure document ID", () => {
		const doc = createMockDocument(202, "projectclosure");
		expect(formatDocumentId(doc)).toBe("202 (PC)");
	});

	it("should handle single digit IDs", () => {
		const doc = createMockDocument(5, "concept");
		expect(formatDocumentId(doc)).toBe("5 (CP)");
	});

	it("should handle large IDs", () => {
		const doc = createMockDocument(999999, "projectplan");
		expect(formatDocumentId(doc)).toBe("999999 (PP)");
	});
});
