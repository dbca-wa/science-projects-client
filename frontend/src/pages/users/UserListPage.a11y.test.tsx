/**
 * Accessibility tests for UserListPage
 * Tests WCAG 2.2 Level AA compliance using axe-core
 */

import { describe, it, expect, vi } from "vitest";
import { renderPage, testAccessibility } from "@/test/page-test-utils";

// Mock all dependencies BEFORE importing the component
vi.mock("@/features/users/hooks/useUsers", () => ({
	useUsers: () => ({
		data: {
			results: [],
			count: 0,
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
		checkAuth: vi.fn(),
		login: vi.fn(),
		logout: vi.fn(),
	}),
	useUserSearchStore: () => ({
		state: {
			searchTerm: "",
			filters: {
				onlyExternal: false,
				onlyStaff: false,
				onlySuperuser: false,
				onlyBALead: false,
				businessArea: undefined,
			},
			currentPage: 1,
			saveSearch: true,
			totalResults: 0,
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
const UserListPage = await import("./UserListPage").then((m) => m.default);

describe("UserListPage - Accessibility", () => {
	it("should have no accessibility violations", async () => {
		const { container } = renderPage(<UserListPage />);
		const results = await testAccessibility(container);
		expect(results).toHaveNoViolations();
	});
});
