/**
 * Accessibility tests for ProjectMapPage
 * Tests WCAG 2.2 Level AA compliance using axe-core
 */

import { describe, it, expect, vi } from "vitest";
import { renderPage, testAccessibility } from "@/test/page-test-utils";
import ProjectMapPage from "./ProjectMapPage";

// Mock map components
vi.mock("@/features/projects/components/map/FullMapContainer", () => ({
	FullMapContainer: () => <div data-testid="map-container">Map</div>,
}));

vi.mock("@/features/projects/components/map/MapFilters", () => ({
	MapFilters: () => <div data-testid="map-filters">Filters</div>,
}));

vi.mock("@/features/projects/hooks/useProjectsForMap", () => ({
	useProjectsForMap: () => ({
		data: {
			projects: [],
			total_projects: 0,
		},
		isLoading: false,
	}),
}));

vi.mock("@/shared/hooks/useSearchStoreInit", () => ({
	useSearchStoreInit: vi.fn(),
}));

vi.mock("@/app/stores/store-context", () => ({
	useProjectMapStore: () => ({
		state: {
			mapFullscreen: false,
			filtersMinimized: false,
		},
		toggleMapFullscreen: vi.fn(),
		toggleFiltersMinimized: vi.fn(),
	}),
}));

describe("ProjectMapPage - Accessibility", () => {
	it("should have no accessibility violations", async () => {
		const { container } = renderPage(<ProjectMapPage />);
		const results = await testAccessibility(container);
		expect(results).toHaveNoViolations();
	});
});
