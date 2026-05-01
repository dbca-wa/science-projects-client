/**
 * Accessibility tests for UserCreatePage
 */

import { describe, it, expect, vi } from "vitest";
import { renderPage, testAccessibility } from "@/test/page-test-utils";
import UserCreatePage from "./UserCreatePage";

vi.mock("@/features/users/hooks/useCreateUser", () => ({
	useCreateUser: () => ({ mutate: vi.fn(), isPending: false }),
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

vi.mock("@/shared/hooks/queries/useAffiliations", () => ({
	useAffiliations: () => ({ data: [], isLoading: false }),
}));

describe("UserCreatePage - Accessibility", () => {
	it("should have no accessibility violations", async () => {
		const { container } = renderPage(<UserCreatePage />);
		const results = await testAccessibility(container);
		expect(results).toHaveNoViolations();
	});
});
