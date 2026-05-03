import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const dropdownPath = join(__dirname, "ManageDropdownContent.tsx");
const dropdownContent = readFileSync(dropdownPath, "utf-8");

const headerPath = join(__dirname, "HeaderContent.tsx");
const headerContent = readFileSync(headerPath, "utf-8");

describe("ManageDropdownContent navigation", () => {
	it("displays 'Approvers' label (not 'Email')", () => {
		expect(dropdownContent).toContain('label: "Approvers"');
		expect(dropdownContent).not.toContain('label: "Email"');
	});

	it("uses CircleCheckBig icon (not Mail)", () => {
		expect(dropdownContent).toContain("CircleCheckBig");
		expect(dropdownContent).not.toMatch(/\bMail\b/);
	});

	it("displays 'Lists & Approvers' section label", () => {
		expect(dropdownContent).toContain("Lists & Approvers");
		expect(dropdownContent).not.toContain("Lists & Emails");
	});

	it("navigates to /manage/approvers (not /manage/emails)", () => {
		expect(dropdownContent).toContain("/manage/approvers");
		expect(dropdownContent).not.toContain("/manage/emails");
	});
});

describe("HeaderContent navigation", () => {
	it("displays 'Approvers' label in mobile sidebar", () => {
		expect(headerContent).toContain("Approvers");
	});

	it("uses CircleCheckBig icon in mobile sidebar", () => {
		expect(headerContent).toContain("CircleCheckBig");
	});

	it("displays 'Lists & Approvers' section label", () => {
		expect(headerContent).toContain("Lists & Approvers");
		expect(headerContent).not.toContain("Lists & Emails");
	});

	it("navigates to /manage/approvers (not /manage/emails)", () => {
		expect(headerContent).toContain("/manage/approvers");
		expect(headerContent).not.toContain("/manage/emails");
	});
});
