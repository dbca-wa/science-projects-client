/**
 * Accessibility tests for StaffProfileDetailPage
 */

import { describe, it, expect, vi } from "vitest";
import { renderPage, testAccessibility } from "@/test/page-test-utils";
import StaffProfileDetailPage from "./StaffProfileDetailPage";

vi.mock("react-router", async () => {
	const actual = await vi.importActual("react-router");
	return { ...actual, useParams: () => ({ staffProfilePk: "1" }) };
});

vi.mock("@/features/staff-profiles/hooks/useStaffProfileDetail", () => ({
	useStaffProfileDetail: () => ({ data: null, isLoading: false }),
}));

vi.mock("@/features/staff-profiles/hooks/useStaffProfileHero", () => ({
	useStaffProfileHero: () => ({ data: null, isLoading: false }),
}));

vi.mock("@/features/staff-profiles/hooks/useStaffProfileOverview", () => ({
	useStaffProfileOverview: () => ({ data: null, isLoading: false }),
}));

vi.mock("@/features/staff-profiles/hooks/useStaffProfileCV", () => ({
	useStaffProfileCV: () => ({ data: null, isLoading: false }),
}));

vi.mock("@/features/staff-profiles/hooks/useStaffProfileProjects", () => ({
	useStaffProfileProjects: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/features/staff-profiles/hooks/usePublications", () => ({
	usePublications: () => ({ data: null, isLoading: false }),
}));

vi.mock("@/features/auth", () => ({
	useCurrentUser: () => ({ data: { id: 1, is_superuser: false } }),
}));

describe("StaffProfileDetailPage - Accessibility", () => {
	it("should have no accessibility violations", async () => {
		const { container } = renderPage(<StaffProfileDetailPage />, {
			initialEntries: ["/staff/1"],
		});
		const results = await testAccessibility(container);
		expect(results).toHaveNoViolations();
	});
});
