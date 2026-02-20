/**
 * Accessibility tests for Dashboard page
 * Tests WCAG 2.2 Level AA compliance using axe-core
 */

import { describe, it, expect, vi } from "vitest";
import { renderPage, testAccessibility } from "@/test/page-test-utils";
import Dashboard from "./Dashboard";

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

vi.mock("@/features/dashboard/hooks/useDashboardData", () => ({
	useDashboardData: () => ({
		data: {
			recentProjects: [],
			pendingTasks: [],
			notifications: [],
		},
		isLoading: false,
	}),
}));

describe("Dashboard Page - Accessibility", () => {
	it("should have no accessibility violations", async () => {
		const { container } = renderPage(<Dashboard />);
		const results = await testAccessibility(container);
		expect(results).toHaveNoViolations();
	});
});
