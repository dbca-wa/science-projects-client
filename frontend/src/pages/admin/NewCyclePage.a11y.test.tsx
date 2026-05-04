/**
 * Accessibility and rendering tests for NewCyclePage
 */

import { describe, it, expect, vi } from "vitest";
import { renderPage, testAccessibility } from "@/test/page-test-utils";
import NewCyclePage from "./NewCyclePage";

vi.mock("@/features/admin/hooks/useAdminActions", () => ({
	useOpenNewCycle: () => ({ mutate: vi.fn(), isPending: false }),
	useBatchApprove: () => ({ mutate: vi.fn(), isPending: false }),
	useNewCycleDraft: () => ({ data: { draft: null }, isLoading: false }),
}));

vi.mock("@/shared/hooks/queries/useBumpEmails", () => ({
	useNewCyclePreview: () => ({
		data: {
			recipients: {
				ba_leads: [],
				project_leads: [],
				team_members: [],
			},
			not_in_it_assets: {
				ba_leads: [],
				project_leads: [],
				team_members: [],
			},
			total_recipients: 0,
			total_not_in_it_assets: 0,
			it_assets_available: true,
		},
		isLoading: false,
	}),
	useNewCycleEmailPreview: () => ({
		data: null,
		isLoading: false,
		refetch: vi.fn(),
	}),
}));

vi.mock("@/features/admin/hooks/useDivisions", () => ({
	useDivisions: () => ({
		data: [{ id: 1, name: "BCS", slug: "bcs", key_stakeholder: { id: 1 } }],
		isLoading: false,
	}),
}));

vi.mock("@/shared/hooks/queries/useReportsForDivision", () => ({
	useReportsForDivision: () => ({
		data: [{ year: 2025 }],
		isLoading: false,
	}),
}));

vi.mock("@/features/auth", () => ({
	useCurrentUser: () => ({
		data: { id: 1, is_superuser: true },
	}),
}));

vi.mock("@/shared/components/editor", () => ({
	RichTextEditor: ({ placeholder }: { placeholder?: string }) => (
		<div data-testid="rich-text-editor">{placeholder}</div>
	),
}));

describe("NewCyclePage - Accessibility", () => {
	it("should have no accessibility violations", async () => {
		const { container } = renderPage(<NewCyclePage />);
		const results = await testAccessibility(container);
		expect(results).toHaveNoViolations();
	});
});
