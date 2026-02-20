/**
 * Accessibility tests for UserEditPage
 * Tests WCAG 2.2 Level AA compliance using axe-core
 */

import { describe, it, expect, vi } from "vitest";
import { renderPage, testAccessibility } from "@/test/page-test-utils";
import UserEditPage from "./UserEditPage";

// Mock hooks
vi.mock("@/features/users/hooks/useUser", () => ({
	useUser: () => ({
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

vi.mock("@/features/users/hooks/useUpdateUser", () => ({
	useUpdateUser: () => ({
		mutate: vi.fn(),
		isPending: false,
	}),
}));

vi.mock("react-router", async () => {
	const actual = await vi.importActual("react-router");
	return {
		...actual,
		useParams: () => ({ id: "1" }),
	};
});

describe("UserEditPage - Accessibility", () => {
	it("should have no accessibility violations", async () => {
		const { container } = renderPage(<UserEditPage />, {
			initialEntries: ["/users/1/edit"],
		});
		const results = await testAccessibility(container);
		expect(results).toHaveNoViolations();
	});
});
