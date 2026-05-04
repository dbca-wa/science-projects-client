import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const readTab = (filename: string) =>
	readFileSync(join(__dirname, filename), "utf-8");

describe("UnapprovedDocsTab", () => {
	const content = readTab("UnapprovedDocsTab.tsx");

	it("uses useUnapprovedDocs hook", () => {
		expect(content).toContain("useUnapprovedDocs");
	});

	it("uses the DataTable component with sortable columns", () => {
		expect(content).toContain("DataTable");
		expect(content).toContain("sortable: true");
	});

	it("renders project titles as links with sanitisation", () => {
		expect(content).toContain("sanitizeInput");
		expect(content).toContain("<Link");
		expect(content).toContain("/overview");
	});

	it("uses break-words for title wrapping", () => {
		expect(content).toContain("break-words");
		expect(content).not.toContain("truncate");
	});
});

describe("ProblematicProjectsTab", () => {
	const content = readTab("ProblematicProjectsTab.tsx");

	it("renders all eight categories", () => {
		expect(content).toContain("no_progress");
		expect(content).toContain("inactive_lead_active_project");
		expect(content).toContain("open_with_closure");
		expect(content).toContain("no_business_area");
		expect(content).toContain("memberless");
		expect(content).toContain("leaderless");
		expect(content).toContain("multiple_leaders");
		expect(content).toContain("external_leaders");
	});

	it("has remedy hooks for remediable categories", () => {
		expect(content).toContain("useRemedyOpenClosed");
		expect(content).toContain("useRemedyMemberless");
		expect(content).toContain("useRemedyLeaderless");
		expect(content).toContain("useRemedyMultipleLeaders");
		expect(content).toContain("useRemedyExternalLeaders");
	});

	it("has a download TXT button for inactive leads", () => {
		expect(content).toContain("Download TXT List");
		expect(content).toContain("downloadProjectsAsTxt");
	});

	it("uses shared CollapsibleCard for collapsible sections", () => {
		expect(content).toContain("CollapsibleCard");
		expect(content).toContain("@/shared/components/CollapsibleCard");
	});

	it("CollapsibleCard has chevron toggle, tooltips, and accessibility", () => {
		const collapsibleCard = readFileSync(
			join(__dirname, "../../../../shared/components/CollapsibleCard.tsx"),
			"utf-8"
		);
		expect(collapsibleCard).toContain("ChevronDown");
		expect(collapsibleCard).toContain("isExpanded");
		expect(collapsibleCard).toContain("Collapse section");
		expect(collapsibleCard).toContain("Expand section");
		expect(collapsibleCard).toContain("Tooltip");
		expect(collapsibleCard).toContain("TooltipTrigger");
		expect(collapsibleCard).toContain("TooltipContent");
		expect(collapsibleCard).toContain("aria-expanded");
	});

	it("open/closed remedy has status selector", () => {
		expect(content).toContain("StatusOption");
		expect(content).toContain("RemedyOpenClosedDialog");
	});

	it("uses DataTable with sortable columns", () => {
		expect(content).toContain("DataTable");
		expect(content).toContain("sortable: true");
	});
});

describe("DataListsTabs", () => {
	const content = readTab("DataListsTabs.tsx");

	it("renders only two tabs", () => {
		expect(content).toContain("UnapprovedDocsTab");
		expect(content).toContain("ProblematicProjectsTab");
		expect(content).not.toContain("EmailListTab");
		expect(content).not.toContain("StaffUsersTab");
	});

	it("shows count badges on tabs", () => {
		expect(content).toContain("unapprovedCount");
		expect(content).toContain("problematicCount");
		expect(content).toContain("<Badge");
	});

	it("fetches data for count badges", () => {
		expect(content).toContain("useUnapprovedDocs");
		expect(content).toContain("useProblematicProjects");
	});
});
