/**
 * Accessibility tests for LocationsPage
 */

import { describe, it, expect, vi } from "vitest";
import { renderPage, testAccessibility } from "@/test/page-test-utils";
import LocationsPage from "./LocationsPage";

vi.mock("@/features/admin/hooks/useLocations", () => ({
	useLocations: () => ({ data: [], isLoading: false }),
	useCreateLocation: () => ({ mutate: vi.fn(), isPending: false }),
	useUpdateLocation: () => ({ mutate: vi.fn(), isPending: false }),
	useDeleteLocation: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/features/auth", () => ({
	useCurrentUser: () => ({ data: { id: 1, is_superuser: true } }),
}));

describe("LocationsPage - Accessibility", () => {
	it("should have no accessibility violations", async () => {
		const { container } = renderPage(<LocationsPage />);
		const results = await testAccessibility(container);
		expect(results).toHaveNoViolations();
	});
});
