/**
 * Accessibility tests for ProjectListPage
 * Tests WCAG 2.2 Level AA compliance using axe-core
 */

import { describe, it, expect, vi } from "vitest";
import { renderPage, testAccessibility } from "@/test/page-test-utils";

// Mock all dependencies BEFORE importing the component
vi.mock("@/features/projects/hooks/useProjects", () => ({
	useProjects: () => ({
		data: {
			projects: [],
			total_results: 0,
			total_pages: 0,
		},
		isLoading: false,
		error: null,
		refetch: vi.fn(),
	}),
}));

vi.mock("@/shared/hooks/useSearchStoreInit", () => ({
	useSearchStoreInit: vi.fn(),
}));

vi.mock("@/app/stores/store-context", () => ({
	useAuthStore: () => ({
		state: {
			isAuthenticated: true,
			user: {
				id: 1,
				username: "testuser",
				is_staff: false,
			},
		},
		isSuperuser: false,
		checkAuth: vi.fn(),
		login: vi.fn(),
		logout: vi.fn(),
	}),
	useProjectSearchStore: () => ({
		state: {
			searchTerm: "",
			filters: {
				businessArea: "All",
				projectKind: "All",
				projectStatus: "All",
				year: 0,
				user: null,
				onlyActive: false,
				onlyInactive: false,
			},
			currentPage: 1,
			totalPages: 0,
			totalResults: 0,
			saveSearch: true,
		},
		setSearchTerm: vi.fn(),
		setFilters: vi.fn(),
		setCurrentPage: vi.fn(),
		setPagination: vi.fn(),
		resetFilters: vi.fn(),
		toggleSaveSearch: vi.fn(),
		hasActiveFilters: false,
		filterCount: 0,
		searchParams: new URLSearchParams(),
	}),
}));

// Mock react-router to avoid navigation issues
vi.mock("react-router", async () => {
	const actual = await vi.importActual("react-router");
	return {
		...actual,
		useSearchParams: () => [new URLSearchParams(), vi.fn()],
	};
});

// Now import the component AFTER all mocks are set up
const ProjectListPage = await import("./ProjectListPage").then(
	(m) => m.default
);

describe("ProjectListPage - Accessibility", () => {
	it("should have no accessibility violations", async () => {
		const { container } = renderPage(<ProjectListPage />);
		const results = await testAccessibility(container);
		expect(results).toHaveNoViolations();
	});
});
