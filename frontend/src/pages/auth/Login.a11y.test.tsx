/**
 * Accessibility tests for Login page
 * Tests WCAG 2.2 Level AA compliance using axe-core
 */

import { describe, it, expect, vi } from "vitest";
import { renderPage, testAccessibility } from "@/test/page-test-utils";
import Login from "./Login";

// Mock authentication hook
vi.mock("@/features/auth/hooks/useAuth", () => ({
	useLogin: () => ({
		mutate: vi.fn(),
		isPending: false,
		error: null,
	}),
}));

describe("Login Page - Accessibility", () => {
	it("should have no accessibility violations", async () => {
		const { container } = renderPage(<Login />);
		const results = await testAccessibility(container);
		expect(results).toHaveNoViolations();
	});
});
