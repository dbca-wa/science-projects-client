/**
 * Accessibility tests for ProjectCreatePage
 * Tests WCAG 2.2 Level AA compliance using axe-core
 */

import { describe, it, expect, vi } from "vitest";
import { renderPage, testAccessibility } from "@/test/page-test-utils";
import ProjectCreatePage from "./ProjectCreatePage";

// Mock hooks
vi.mock("@/features/projects/hooks/useCreateProject", () => ({
	useCreateProject: () => ({
		mutate: vi.fn(),
		isPending: false,
	}),
}));

vi.mock("@/features/users/hooks/useCurrentUser", () => ({
	useCurrentUser: () => ({
		data: {
			id: 1,
			username: "testuser",
		},
		isLoading: false,
	}),
}));

describe("ProjectCreatePage - Accessibility", () => {
	it("should have no accessibility violations", async () => {
		const { container } = renderPage(<ProjectCreatePage />);
		const results = await testAccessibility(container);
		expect(results).toHaveNoViolations();
	});
});
