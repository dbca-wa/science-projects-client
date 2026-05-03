import { describe, it, expect } from "vitest";
import { getApprovalState, getCurrentApprovalStage } from "./approval.utils";
import type { IMainDoc } from "@/shared/types/document.types";

// Helper to create mock document
function createMockDocument(
	approvals: {
		projectLead?: boolean;
		businessAreaLead?: boolean;
		directorate?: boolean;
	} = {}
): IMainDoc {
	return {
		id: 1,
		kind: "concept_plan",
		created_year: 2024,
		created_at: new Date("2024-01-01"),
		creator: 1,
		modifier: 1,
		updated_at: new Date("2024-01-01"),
		status: "active",
		project_lead_approval_granted: approvals.projectLead ?? false,
		business_area_lead_approval_granted: approvals.businessAreaLead ?? false,
		directorate_approval_granted: approvals.directorate ?? false,
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

describe("getApprovalState", () => {
	it("should return all required when no approvals granted", () => {
		const doc = createMockDocument();
		const state = getApprovalState(doc);

		expect(state.projectLead).toBe("required");
		expect(state.businessAreaLead).toBe("required");
		expect(state.directorate).toBe("required");
	});

	it("should return granted for project lead when approved", () => {
		const doc = createMockDocument({ projectLead: true });
		const state = getApprovalState(doc);

		expect(state.projectLead).toBe("granted");
		expect(state.businessAreaLead).toBe("required");
		expect(state.directorate).toBe("required");
	});

	it("should return granted for business area lead when approved", () => {
		const doc = createMockDocument({
			projectLead: true,
			businessAreaLead: true,
		});
		const state = getApprovalState(doc);

		expect(state.projectLead).toBe("granted");
		expect(state.businessAreaLead).toBe("granted");
		expect(state.directorate).toBe("required");
	});

	it("should return all granted when all approvals granted", () => {
		const doc = createMockDocument({
			projectLead: true,
			businessAreaLead: true,
			directorate: true,
		});
		const state = getApprovalState(doc);

		expect(state.projectLead).toBe("granted");
		expect(state.businessAreaLead).toBe("granted");
		expect(state.directorate).toBe("granted");
	});
});

describe("getCurrentApprovalStage", () => {
	it("should return project_lead when no approvals granted", () => {
		const doc = createMockDocument();
		expect(getCurrentApprovalStage(doc)).toBe("project_lead");
	});

	it("should return business_area_lead when only project lead approved", () => {
		const doc = createMockDocument({ projectLead: true });
		expect(getCurrentApprovalStage(doc)).toBe("business_area_lead");
	});

	it("should return directorate when project lead and BA lead approved", () => {
		const doc = createMockDocument({
			projectLead: true,
			businessAreaLead: true,
		});
		expect(getCurrentApprovalStage(doc)).toBe("directorate");
	});

	it("should return complete when all approvals granted", () => {
		const doc = createMockDocument({
			projectLead: true,
			businessAreaLead: true,
			directorate: true,
		});
		expect(getCurrentApprovalStage(doc)).toBe("complete");
	});
});
