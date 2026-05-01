/**
 * Accessibility tests for UserCreateStaffPage
 */

import { describe, it, expect, vi } from "vitest";
import { renderPage, testAccessibility } from "@/test/page-test-utils";
import UserCreateStaffPage from "./UserCreateStaffPage";

vi.mock("@/features/users/hooks/useCreateStaffUser", () => ({
	useCreateStaffUser: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/features/users/hooks/useITAssetsSearch", () => ({
	useITAssetsSearch: () => ({ data: [], isLoading: false, mutate: vi.fn() }),
}));

vi.mock("@/features/users/hooks/useCheckEmailUnique", () => ({
	useCheckEmailUnique: () => ({
		mutateAsync: vi.fn().mockResolvedValue(false),
	}),
}));

vi.mock("@/features/users/hooks/useUserExistenceCheck", () => ({
	useUserExistenceCheck: () => ({
		checkExists: vi.fn().mockResolvedValue(false),
	}),
}));

vi.mock("@/shared/hooks/queries/useBranches", () => ({
	useBranches: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/shared/hooks/queries/useBusinessAreas", () => ({
	useBusinessAreas: () => ({ data: [], isLoading: false }),
}));

describe("UserCreateStaffPage - Accessibility", () => {
	it("should have no accessibility violations", async () => {
		const { container } = renderPage(<UserCreateStaffPage />);
		const results = await testAccessibility(container);
		expect(results).toHaveNoViolations();
	});
});
