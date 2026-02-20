/**
 * Accessibility tests for MyProfilePage
 * Tests WCAG 2.2 Level AA compliance using axe-core
 */

import { describe, it, expect, vi } from "vitest";
import { renderPage, testAccessibility } from "@/test/page-test-utils";
import MyProfilePage from "./MyProfilePage";

// Mock hooks
vi.mock("@/features/users/hooks/useCurrentUser", () => ({
	useCurrentUser: () => ({
		data: {
			id: 1,
			username: "testuser",
			display_first_name: "Test",
			display_last_name: "User",
			email: "test@example.com",
		},
		isLoading: false,
	}),
}));

describe("MyProfilePage - Accessibility", () => {
	it("should have no accessibility violations", async () => {
		const { container } = renderPage(<MyProfilePage />);
		const results = await testAccessibility(container);
		expect(results).toHaveNoViolations();
	});
});
