/**
 * Accessibility tests for CaretakerModePage
 * Tests WCAG 2.2 Level AA compliance using axe-core
 */

import { describe, it, expect, vi } from "vitest";
import { renderPage, testAccessibility } from "@/test/page-test-utils";
import CaretakerModePage from "./CaretakerModePage";

// Mock hooks
vi.mock("@/features/caretakers/hooks/useCaretakerRequests", () => ({
	useCaretakerRequests: () => ({
		data: {
			results: [],
			count: 0,
		},
		isLoading: false,
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

describe("CaretakerModePage - Accessibility", () => {
	it("should have no accessibility violations", async () => {
		const { container } = renderPage(<CaretakerModePage />);
		const results = await testAccessibility(container);
		expect(results).toHaveNoViolations();
	});
});
