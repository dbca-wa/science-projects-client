/**
 * Accessibility tests for BranchesPage
 */

import { describe, it, expect, vi } from "vitest";
import { renderPage, testAccessibility } from "@/test/page-test-utils";
import BranchesPage from "./BranchesPage";

vi.mock("@/features/admin/hooks/useBranches", () => ({
	useBranches: () => ({ data: [], isLoading: false }),
	useCreateBranch: () => ({ mutate: vi.fn(), isPending: false }),
	useUpdateBranch: () => ({ mutate: vi.fn(), isPending: false }),
	useDeleteBranch: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/features/auth", () => ({
	useCurrentUser: () => ({ data: { id: 1, is_superuser: true } }),
}));

describe("BranchesPage - Accessibility", () => {
	it("should have no accessibility violations", async () => {
		const { container } = renderPage(<BranchesPage />);
		const results = await testAccessibility(container);
		expect(results).toHaveNoViolations();
	});
});
