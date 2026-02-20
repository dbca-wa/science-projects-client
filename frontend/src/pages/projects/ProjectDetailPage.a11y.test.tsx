/**
 * Accessibility tests for ProjectDetailPage
 * Tests WCAG 2.2 Level AA compliance using axe-core
 */

import { describe, it, expect, vi } from "vitest";
import { renderPage, testAccessibility } from "@/test/page-test-utils";
import ProjectDetailPage from "./ProjectDetailPage";

// Mock hooks
vi.mock("@/features/projects/hooks/useProject", () => ({
	useProject: () => ({
		data: {
			id: 1,
			title: "Test Project",
			description: "Test description",
			status: "active",
			created_at: "2024-01-01",
		},
		isLoading: false,
	}),
}));

vi.mock("react-router", async () => {
	const actual = await vi.importActual("react-router");
	return {
		...actual,
		useParams: () => ({ id: "1" }),
	};
});

describe("ProjectDetailPage - Accessibility", () => {
	it("should have no accessibility violations", async () => {
		const { container } = renderPage(<ProjectDetailPage />, {
			initialEntries: ["/projects/1"],
		});
		const results = await testAccessibility(container);
		expect(results).toHaveNoViolations();
	});
});
