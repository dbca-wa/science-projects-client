import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const pagePath = join(__dirname, "../../../../pages/admin/ApproversPage.tsx");
const pageContent = readFileSync(pagePath, "utf-8");

const contentPath = join(__dirname, "ApproversPageContent.tsx");
const contentFile = readFileSync(contentPath, "utf-8");

const tabPath = join(__dirname, "DivisionalApproversTab.tsx");
const tabContent = readFileSync(tabPath, "utf-8");

const routesPath = join(__dirname, "../../../../app/router/routes.config.ts");
const routesContent = readFileSync(routesPath, "utf-8");

const routerPath = join(__dirname, "../../../../app/router/index.tsx");
const routerContent = readFileSync(routerPath, "utf-8");

describe("ApproversPage", () => {
	it("renders 'Divisional Approvers' heading", () => {
		expect(pageContent).toContain("Divisional Approvers");
	});

	it("sets document title to 'Divisional Approvers'", () => {
		expect(pageContent).toContain('useDocumentTitle("Divisional Approvers")');
	});

	it("renders ApproversPageContent", () => {
		expect(pageContent).toContain("<ApproversPageContent");
	});

	it("does not render email styling tab", () => {
		expect(pageContent).not.toContain("email-styling");
		expect(pageContent).not.toContain("EmailStyling");
	});
});

describe("ApproversPageContent", () => {
	it("renders DivisionalApproversTab directly without tabs wrapper", () => {
		expect(contentFile).toContain("<DivisionalApproversTab");
		expect(contentFile).not.toContain("TabsList");
		expect(contentFile).not.toContain("TabsTrigger");
	});
});

describe("DivisionalApproversTab", () => {
	it("console.logs directorate email list data when present", () => {
		expect(tabContent).toContain("console.log");
		expect(tabContent).toContain("Directorate email list (deprecated)");
	});

	it("does not render directorate email list table", () => {
		expect(tabContent).not.toContain("Directorate Email List");
		expect(tabContent).not.toContain("<table");
		expect(tabContent).not.toContain("<thead");
	});

	it("renders KeyStakeholderSection", () => {
		expect(tabContent).toContain("<KeyStakeholderSection");
	});

	it("renders ApproversSection", () => {
		expect(tabContent).toContain("<ApproversSection");
	});
});

describe("Route configuration", () => {
	it("has /manage/approvers route pointing to ApproversPage", () => {
		expect(routesContent).toContain('path: "/manage/approvers"');
		expect(routesContent).toContain("component: ApproversPage");
	});

	it("does not have /manage/emails route", () => {
		expect(routesContent).not.toContain('path: "/manage/emails"');
	});

	it("has redirect from /manage/emails to /manage/approvers", () => {
		expect(routerContent).toContain("manage/emails");
		expect(routerContent).toContain("/manage/approvers");
	});
});
