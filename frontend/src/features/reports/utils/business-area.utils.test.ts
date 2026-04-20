import { describe, it, expect } from "vitest";
import type { IUnapprovedDoc } from "../types/business-area.types";
import {
	getApprovalStage,
	getFinancialYearLabel,
	getProjectTag,
	getWaitingOnLabel,
	isReportKind,
	sortUnapprovedDocs,
	DOC_KIND_ORDER,
	STATUS_ORDER,
} from "./business-area.utils";

/** Helper to build a minimal IUnapprovedDoc for testing */
function makeDoc(
	overrides: Omit<Partial<IUnapprovedDoc>, "project"> & {
		project?: Partial<IUnapprovedDoc["project"]>;
	} = {}
): IUnapprovedDoc {
	const { project: projOverrides, ...docOverrides } = overrides;
	return {
		id: 1,
		kind: "progressreport",
		status: "active",
		project_lead_approval_granted: false,
		business_area_lead_approval_granted: false,
		directorate_approval_granted: false,
		report_year: null,
		waiting_on: null,
		project: {
			id: 10,
			title: "Test Project",
			status: "active",
			kind: "science",
			year: 2025,
			number: 1,
			business_area: { id: 1, name: "Biodiversity" },
			...projOverrides,
		},
		...docOverrides,
	};
}

// ── getApprovalStage ────────────────────────────────────────────────────────

describe("getApprovalStage", () => {
	it("returns stage 1 when project lead has not approved", () => {
		const doc = makeDoc({ project_lead_approval_granted: false });
		expect(getApprovalStage(doc)).toBe(1);
	});

	it("returns stage 2 when project lead approved but BA lead has not", () => {
		const doc = makeDoc({
			project_lead_approval_granted: true,
			business_area_lead_approval_granted: false,
		});
		expect(getApprovalStage(doc)).toBe(2);
	});

	it("returns stage 3 when both project lead and BA lead approved", () => {
		const doc = makeDoc({
			project_lead_approval_granted: true,
			business_area_lead_approval_granted: true,
			directorate_approval_granted: false,
		});
		expect(getApprovalStage(doc)).toBe(3);
	});
});

// ── getFinancialYearLabel ───────────────────────────────────────────────────

describe("getFinancialYearLabel", () => {
	it("formats 2025 as 'FY 24-25'", () => {
		expect(getFinancialYearLabel(2025)).toBe("FY 24-25");
	});

	it("formats 2100 as 'FY 99-00'", () => {
		expect(getFinancialYearLabel(2100)).toBe("FY 99-00");
	});

	it("returns em dash for null", () => {
		expect(getFinancialYearLabel(null)).toBe("—");
	});

	it("returns em dash for undefined", () => {
		expect(getFinancialYearLabel(undefined)).toBe("—");
	});
});

// ── getProjectTag ───────────────────────────────────────────────────────────

describe("getProjectTag", () => {
	it("maps science kind to SP prefix", () => {
		expect(getProjectTag({ kind: "science", year: 2025, number: 1 })).toBe(
			"SP-2025-001"
		);
	});

	it("maps student kind to STP prefix", () => {
		expect(getProjectTag({ kind: "student", year: 2024, number: 42 })).toBe(
			"STP-2024-042"
		);
	});

	it("maps external kind to EXT prefix", () => {
		expect(getProjectTag({ kind: "external", year: 2023, number: 100 })).toBe(
			"EXT-2023-100"
		);
	});

	it("maps core_function kind to CF prefix", () => {
		expect(
			getProjectTag({ kind: "core_function", year: 2025, number: 7 })
		).toBe("CF-2025-007");
	});

	it("falls back to uppercased kind for unknown kinds", () => {
		expect(getProjectTag({ kind: "custom", year: 2025, number: 3 })).toBe(
			"CUSTOM-2025-003"
		);
	});
});

// ── sortUnapprovedDocs ──────────────────────────────────────────────────────

describe("sortUnapprovedDocs", () => {
	it("returns docs unchanged when column is null", () => {
		const docs = [makeDoc({ id: 1 }), makeDoc({ id: 2 })];
		const result = sortUnapprovedDocs(docs, {
			column: null,
			direction: null,
		});
		expect(result).toEqual(docs);
	});

	it("sorts by title alphabetically ascending", () => {
		const docs = [
			makeDoc({ id: 1, project: { title: "Zebra Project" } }),
			makeDoc({ id: 2, project: { title: "Alpha Project" } }),
		];
		const result = sortUnapprovedDocs(docs, {
			column: "title",
			direction: "asc",
		});
		expect(result[0].project.title).toBe("Alpha Project");
		expect(result[1].project.title).toBe("Zebra Project");
	});

	it("sorts by title with HTML stripped", () => {
		const docs = [
			makeDoc({ id: 1, project: { title: "<b>Zebra</b>" } }),
			makeDoc({ id: 2, project: { title: "<i>Alpha</i>" } }),
		];
		const result = sortUnapprovedDocs(docs, {
			column: "title",
			direction: "asc",
		});
		expect(result[0].id).toBe(2);
		expect(result[1].id).toBe(1);
	});

	it("sorts by kind using DOC_KIND_ORDER, not alphabetically", () => {
		const docs = [
			makeDoc({ id: 1, kind: "projectclosure" }),
			makeDoc({ id: 2, kind: "concept" }),
			makeDoc({ id: 3, kind: "progressreport" }),
		];
		const result = sortUnapprovedDocs(docs, {
			column: "kind",
			direction: "asc",
		});
		expect(result.map((d) => d.kind)).toEqual([
			"concept",
			"progressreport",
			"projectclosure",
		]);
	});

	it("sorts by status using STATUS_ORDER", () => {
		const docs = [
			makeDoc({ id: 1, status: "completed" }),
			makeDoc({ id: 2, status: "active" }),
			makeDoc({ id: 3, status: "new" }),
		];
		const result = sortUnapprovedDocs(docs, {
			column: "status",
			direction: "asc",
		});
		expect(result.map((d) => d.status)).toEqual(["active", "new", "completed"]);
	});

	it("sorts by FY numerically with non-report kinds at end", () => {
		const docs = [
			makeDoc({
				id: 1,
				kind: "progressreport",
				report_year: 2026,
				project: { year: 2026 },
			}),
			makeDoc({ id: 2, kind: "concept", project: { year: 2024 } }),
			makeDoc({
				id: 3,
				kind: "studentreport",
				report_year: 2024,
				project: { year: 2024 },
			}),
		];
		const result = sortUnapprovedDocs(docs, {
			column: "fy",
			direction: "asc",
		});
		// Student report 2024 first, progress report 2026 second, concept (Infinity) last
		expect(result.map((d) => d.id)).toEqual([3, 1, 2]);
	});

	it("reverses order for descending direction", () => {
		const docs = [
			makeDoc({ id: 1, project: { title: "Alpha" } }),
			makeDoc({ id: 2, project: { title: "Zebra" } }),
		];
		const result = sortUnapprovedDocs(docs, {
			column: "title",
			direction: "desc",
		});
		expect(result[0].project.title).toBe("Zebra");
		expect(result[1].project.title).toBe("Alpha");
	});
});

// ── Constants ───────────────────────────────────────────────────────────────

describe("DOC_KIND_ORDER", () => {
	it("has concept as lowest order", () => {
		expect(DOC_KIND_ORDER["concept"]).toBe(0);
	});

	it("has projectclosure as highest order", () => {
		expect(DOC_KIND_ORDER["projectclosure"]).toBe(4);
	});
});

describe("STATUS_ORDER", () => {
	it("has final_update as lowest order", () => {
		expect(STATUS_ORDER["final_update"]).toBe(0);
	});

	it("has terminated as highest order", () => {
		expect(STATUS_ORDER["terminated"]).toBe(8);
	});
});

// ── isReportKind ────────────────────────────────────────────────────────────

describe("isReportKind", () => {
	it("returns true for progressreport", () => {
		expect(isReportKind("progressreport")).toBe(true);
	});

	it("returns true for studentreport", () => {
		expect(isReportKind("studentreport")).toBe(true);
	});

	it("returns false for concept", () => {
		expect(isReportKind("concept")).toBe(false);
	});

	it("returns false for projectplan", () => {
		expect(isReportKind("projectplan")).toBe(false);
	});

	it("returns false for projectclosure", () => {
		expect(isReportKind("projectclosure")).toBe(false);
	});
});

// ── getWaitingOnLabel ───────────────────────────────────────────────────────

describe("getWaitingOnLabel", () => {
	it("returns 'Unknown' when waiting_on is null", () => {
		const doc = makeDoc({ waiting_on: null });
		expect(getWaitingOnLabel(doc, 99)).toBe("Unknown");
	});

	it("returns name with Project Lead role for stage 1 docs", () => {
		const doc = makeDoc({
			waiting_on: {
				id: 5,
				display_first_name: "Jane",
				display_last_name: "Smith",
				role: "Project Lead",
			},
		});
		expect(getWaitingOnLabel(doc, 99)).toBe("Jane Smith (Project Lead)");
	});

	it("returns name with '(You)' when waiting_on user matches currentUserId", () => {
		const doc = makeDoc({
			waiting_on: {
				id: 42,
				display_first_name: "Alice",
				display_last_name: "Jones",
				role: "Business Area Lead",
			},
		});
		expect(getWaitingOnLabel(doc, 42)).toBe("Alice Jones (You)");
	});

	it("returns name with Business Area Lead role when not current user", () => {
		const doc = makeDoc({
			waiting_on: {
				id: 7,
				display_first_name: "Bob",
				display_last_name: "Brown",
				role: "Business Area Lead",
			},
		});
		expect(getWaitingOnLabel(doc, 99)).toBe("Bob Brown (Business Area Lead)");
	});

	it("returns name with Directorate role for stage 3 docs", () => {
		const doc = makeDoc({
			waiting_on: {
				id: 12,
				display_first_name: "Carol",
				display_last_name: "White",
				role: "Directorate",
			},
		});
		expect(getWaitingOnLabel(doc, 99)).toBe("Carol White (Directorate)");
	});
});

// ── sortUnapprovedDocs: waitingOn column ────────────────────────────────────

describe("sortUnapprovedDocs – waitingOn column", () => {
	it("sorts alphabetically by name ascending", () => {
		const docs = [
			makeDoc({
				id: 1,
				waiting_on: {
					id: 1,
					display_first_name: "Zara",
					display_last_name: "Adams",
					role: "Project Lead",
				},
			}),
			makeDoc({
				id: 2,
				waiting_on: {
					id: 2,
					display_first_name: "Alice",
					display_last_name: "Brown",
					role: "Business Area Lead",
				},
			}),
		];
		const result = sortUnapprovedDocs(docs, {
			column: "waitingOn",
			direction: "asc",
		});
		expect(result.map((d) => d.id)).toEqual([2, 1]);
	});

	it("sorts alphabetically by name descending", () => {
		const docs = [
			makeDoc({
				id: 1,
				waiting_on: {
					id: 1,
					display_first_name: "Alice",
					display_last_name: "Brown",
					role: "Project Lead",
				},
			}),
			makeDoc({
				id: 2,
				waiting_on: {
					id: 2,
					display_first_name: "Zara",
					display_last_name: "Adams",
					role: "Business Area Lead",
				},
			}),
		];
		const result = sortUnapprovedDocs(docs, {
			column: "waitingOn",
			direction: "desc",
		});
		expect(result.map((d) => d.id)).toEqual([2, 1]);
	});

	it("sorts null waiting_on to end", () => {
		const docs = [
			makeDoc({ id: 1, waiting_on: null }),
			makeDoc({
				id: 2,
				waiting_on: {
					id: 2,
					display_first_name: "Alice",
					display_last_name: "Brown",
					role: "Project Lead",
				},
			}),
		];
		const result = sortUnapprovedDocs(docs, {
			column: "waitingOn",
			direction: "asc",
		});
		expect(result.map((d) => d.id)).toEqual([2, 1]);
	});
});

// ── sortUnapprovedDocs: FY sort fix ─────────────────────────────────────────

describe("sortUnapprovedDocs – FY sort fix", () => {
	it("non-report kinds always sort to end regardless of ascending direction", () => {
		const docs = [
			makeDoc({ id: 1, kind: "concept" }),
			makeDoc({ id: 2, kind: "projectplan" }),
			makeDoc({ id: 3, kind: "projectclosure" }),
			makeDoc({ id: 4, kind: "progressreport", report_year: 2025 }),
		];
		const result = sortUnapprovedDocs(docs, { column: "fy", direction: "asc" });
		// The report doc should come first; non-report kinds at end
		expect(result[0].id).toBe(4);
		expect(
			result
				.slice(1)
				.every((d) => !["progressreport", "studentreport"].includes(d.kind))
		).toBe(true);
	});

	it("non-report kinds always sort to end regardless of descending direction", () => {
		const docs = [
			makeDoc({ id: 1, kind: "concept" }),
			makeDoc({ id: 2, kind: "projectplan" }),
			makeDoc({ id: 3, kind: "projectclosure" }),
			makeDoc({ id: 4, kind: "progressreport", report_year: 2025 }),
		];
		const result = sortUnapprovedDocs(docs, {
			column: "fy",
			direction: "desc",
		});
		// The report doc should still come first; non-report kinds at end
		expect(result[0].id).toBe(4);
		expect(
			result
				.slice(1)
				.every((d) => !["progressreport", "studentreport"].includes(d.kind))
		).toBe(true);
	});

	it("ascending: latest year first, then earlier, dashes at end", () => {
		const docs = [
			makeDoc({ id: 1, kind: "progressreport", report_year: 2023 }),
			makeDoc({ id: 2, kind: "studentreport", report_year: 2025 }),
			makeDoc({ id: 3, kind: "progressreport", report_year: null }),
			makeDoc({ id: 4, kind: "concept" }),
		];
		const result = sortUnapprovedDocs(docs, { column: "fy", direction: "asc" });
		// 2023 first, 2025 second, then null report year and concept at end
		expect(result[0].id).toBe(1);
		expect(result[1].id).toBe(2);
	});

	it("descending: earliest year first, then later, dashes at end", () => {
		const docs = [
			makeDoc({ id: 1, kind: "progressreport", report_year: 2023 }),
			makeDoc({ id: 2, kind: "studentreport", report_year: 2025 }),
			makeDoc({ id: 3, kind: "progressreport", report_year: null }),
			makeDoc({ id: 4, kind: "concept" }),
		];
		const result = sortUnapprovedDocs(docs, {
			column: "fy",
			direction: "desc",
		});
		// Descending reverses the numeric comparison: 2025 first, 2023 second
		// But null/non-report always at end
		expect(result[0].id).toBe(2);
		expect(result[1].id).toBe(1);
	});
});
