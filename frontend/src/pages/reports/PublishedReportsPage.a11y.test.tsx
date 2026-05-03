/**
 * Accessibility tests for PublishedReportsPage
 */

import { describe, it, expect, vi } from "vitest";
import { renderPage, testAccessibility } from "@/test/page-test-utils";
import PublishedReportsPage from "./PublishedReportsPage";

vi.mock("@/features/reports/hooks/useReports", () => ({
	usePublishedReports: () => ({ data: [], isLoading: false }),
	useLegacyReports: () => ({ data: [], isLoading: false }),
	useReportsWithoutPDF: () => ({ data: [], isLoading: false }),
	useAllReportPDFs: () => ({
		data: { published: [], drafts: [], legacy: [] },
		isLoading: false,
	}),
	useAddReportPDF: () => ({ mutate: vi.fn(), isPending: false }),
	useAddLegacyPDF: () => ({ mutate: vi.fn(), isPending: false }),
	useUpdateReportPDF: () => ({ mutate: vi.fn(), isPending: false }),
	useDeleteReportPDFFile: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/features/auth", () => ({
	useCurrentUser: () => ({ data: { id: 1, is_superuser: true } }),
}));

describe("PublishedReportsPage - Accessibility", () => {
	it("should have no accessibility violations", async () => {
		const { container } = renderPage(<PublishedReportsPage />);
		const results = await testAccessibility(container);
		expect(results).toHaveNoViolations();
	});
});
