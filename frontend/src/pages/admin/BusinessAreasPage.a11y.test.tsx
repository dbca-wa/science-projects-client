/**
 * Accessibility tests for BusinessAreasPage
 */

import { describe, it, expect, vi } from "vitest";
import { renderPage, testAccessibility } from "@/test/page-test-utils";
import BusinessAreasPage from "./BusinessAreasPage";

vi.mock("@/features/admin/hooks/useBusinessAreas", () => ({
	useBusinessAreas: () => ({ data: [], isLoading: false }),
	useDeleteBusinessArea: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/shared/hooks/queries/useDivisions", () => ({
	useDivisions: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/features/auth", () => ({
	useCurrentUser: () => ({ data: { id: 1, is_superuser: true } }),
}));

describe("BusinessAreasPage - Accessibility", () => {
	it("should have no accessibility violations", async () => {
		const { container } = renderPage(<BusinessAreasPage />);
		const results = await testAccessibility(container);
		expect(results).toHaveNoViolations();
	});
});
