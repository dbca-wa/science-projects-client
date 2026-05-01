/**
 * Accessibility tests for LatestReportPage
 */

import { describe, it, expect, vi } from "vitest";
import { renderPage, testAccessibility } from "@/test/page-test-utils";
import LatestReportPage from "./LatestReportPage";

vi.mock("@/features/reports/hooks/useReports", () => ({
	useLatestReport: () => ({ data: null, isLoading: false }),
	useLatestYear: () => ({ data: { year: 2025 }, isLoading: false }),
	useLatestProgressReports: () => ({ data: [], isLoading: false }),
	useLatestStudentReports: () => ({ data: [], isLoading: false }),
	useLatestInactiveReports: () => ({
		data: { progress: [], student: [] },
		isLoading: false,
	}),
	useReportPDF: () => ({ data: null, isLoading: false }),
	useGenerateReportPDF: () => ({ mutate: vi.fn(), isPending: false }),
	useCancelReportPDFGen: () => ({ mutate: vi.fn(), isPending: false }),
	usePublishReportPDF: () => ({ mutate: vi.fn(), isPending: false }),
	useApproveReport: () => ({ mutate: vi.fn(), isPending: false }),
	useReportDetail: () => ({ data: null, isLoading: false }),
	useReportsForDivision: () => ({ data: [], isLoading: false }),
	useToggleReportPublished: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/features/auth", () => ({
	useCurrentUser: () => ({ data: { id: 1, is_superuser: true } }),
}));

vi.mock("@/shared/hooks/queries/useDivisions", () => ({
	useDivisions: () => ({ data: [], isLoading: false }),
}));

describe("LatestReportPage - Accessibility", () => {
	it("should have no accessibility violations", async () => {
		const { container } = renderPage(<LatestReportPage />);
		const results = await testAccessibility(container);
		expect(results).toHaveNoViolations();
	});
});
