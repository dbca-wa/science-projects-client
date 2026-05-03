/**
 * Accessibility tests for MyDivisionPage
 */

import { describe, it, expect, vi } from "vitest";
import { renderPage, testAccessibility } from "@/test/page-test-utils";
import MyDivisionPage from "./MyDivisionPage";

vi.mock("@/features/reports/hooks/useReports", () => ({
	useLatestReport: () => ({ data: null, isLoading: false }),
	useReportsForDivision: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/features/reports/hooks/useBusinessAreaLead", () => ({
	useMyBusinessAreas: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/features/auth", () => ({
	useCurrentUser: () => ({ data: { id: 1, is_superuser: false } }),
}));

describe("MyDivisionPage - Accessibility", () => {
	it("should have no accessibility violations", async () => {
		const { container } = renderPage(<MyDivisionPage />);
		const results = await testAccessibility(container);
		expect(results).toHaveNoViolations();
	});
});
