import { describe, it, expect, beforeEach } from "vitest";
import { ProjectSearchStore } from "./project-search.store";

describe("ProjectSearchStore", () => {
	let store: ProjectSearchStore;

	beforeEach(() => {
		store = new ProjectSearchStore();
	});

	describe("initial state", () => {
		it("should have empty search term", () => {
			expect(store.state.searchTerm).toBe("");
		});

		it("should have default filters", () => {
			expect(store.state.filters.businessArea).toBe("All");
			expect(store.state.filters.projectKind).toBe("All");
			expect(store.state.filters.projectStatus).toBe("All");
			expect(store.state.filters.year).toBe(0);
			expect(store.state.filters.user).toBe(null);
		});

		it("should start on page 1", () => {
			expect(store.state.currentPage).toBe(1);
		});

		it("should have initial pagination values", () => {
			expect(store.state.totalPages).toBe(1);
			expect(store.state.totalResults).toBe(0);
		});
	});

	describe("setSearchTerm", () => {
		it("should update search term", () => {
			store.setSearchTerm("test project");
			expect(store.state.searchTerm).toBe("test project");
		});

		it("should reset to page 1 when search term changes", () => {
			store.setCurrentPage(3);
			store.setSearchTerm("new search");
			expect(store.state.currentPage).toBe(1);
		});
	});

	describe("setFilters", () => {
		it("should update business area filter", () => {
			store.setFilters({ businessArea: "5" });
			expect(store.state.filters.businessArea).toBe("5");
		});

		it("should update project kind filter", () => {
			store.setFilters({ projectKind: "science" });
			expect(store.state.filters.projectKind).toBe("science");
		});

		it("should update project status filter", () => {
			store.setFilters({ projectStatus: "active" });
			expect(store.state.filters.projectStatus).toBe("active");
		});

		it("should update year filter", () => {
			store.setFilters({ year: 2024 });
			expect(store.state.filters.year).toBe(2024);
		});

		it("should update user filter", () => {
			store.setFilters({ user: 42 });
			expect(store.state.filters.user).toBe(42);
		});

		it("should update multiple filters at once", () => {
			store.setFilters({
				businessArea: "3",
				projectKind: "student",
				year: 2023,
			});
			expect(store.state.filters.businessArea).toBe("3");
			expect(store.state.filters.projectKind).toBe("student");
			expect(store.state.filters.year).toBe(2023);
		});

		it("should reset to page 1 when filters change", () => {
			store.setCurrentPage(5);
			store.setFilters({ businessArea: "2" });
			expect(store.state.currentPage).toBe(1);
		});

		it("should preserve other filters when updating one", () => {
			store.setFilters({ businessArea: "1", projectKind: "science" });
			store.setFilters({ year: 2024 });
			expect(store.state.filters.businessArea).toBe("1");
			expect(store.state.filters.projectKind).toBe("science");
			expect(store.state.filters.year).toBe(2024);
		});
	});

	describe("setCurrentPage", () => {
		it("should update current page", () => {
			store.setCurrentPage(3);
			expect(store.state.currentPage).toBe(3);
		});

		it("should allow setting page to 1", () => {
			store.setCurrentPage(5);
			store.setCurrentPage(1);
			expect(store.state.currentPage).toBe(1);
		});
	});

	describe("setPagination", () => {
		it("should update total pages and results", () => {
			store.setPagination({ totalPages: 10, totalResults: 95 });
			expect(store.state.totalPages).toBe(10);
			expect(store.state.totalResults).toBe(95);
		});

		it("should handle zero results", () => {
			store.setPagination({ totalPages: 0, totalResults: 0 });
			expect(store.state.totalPages).toBe(0);
			expect(store.state.totalResults).toBe(0);
		});
	});

	describe("resetFilters", () => {
		it("should reset all filters to defaults", () => {
			store.setSearchTerm("test");
			store.setFilters({
				businessArea: "5",
				projectKind: "science",
				projectStatus: "active",
				year: 2024,
				user: 42,
			});
			store.setCurrentPage(3);

			store.resetFilters();

			expect(store.state.searchTerm).toBe("");
			expect(store.state.filters.businessArea).toBe("All");
			expect(store.state.filters.projectKind).toBe("All");
			expect(store.state.filters.projectStatus).toBe("All");
			expect(store.state.filters.year).toBe(0);
			expect(store.state.filters.user).toBe(null);
			expect(store.state.currentPage).toBe(1);
		});
	});

	describe("hasActiveFilters computed", () => {
		it("should return false with no filters", () => {
			expect(store.hasActiveFilters).toBe(false);
		});

		it("should return true with search term", () => {
			store.setSearchTerm("test");
			expect(store.hasActiveFilters).toBe(true);
		});

		it("should return true with business area filter", () => {
			store.setFilters({ businessArea: "5" });
			expect(store.hasActiveFilters).toBe(true);
		});

		it("should return true with project kind filter", () => {
			store.setFilters({ projectKind: "science" });
			expect(store.hasActiveFilters).toBe(true);
		});

		it("should return true with project status filter", () => {
			store.setFilters({ projectStatus: "active" });
			expect(store.hasActiveFilters).toBe(true);
		});

		it("should return true with year filter", () => {
			store.setFilters({ year: 2024 });
			expect(store.hasActiveFilters).toBe(true);
		});

		it("should return true with user filter", () => {
			store.setFilters({ user: 42 });
			expect(store.hasActiveFilters).toBe(true);
		});

		it("should return false after reset", () => {
			store.setSearchTerm("test");
			store.setFilters({ businessArea: "5" });
			store.resetFilters();
			expect(store.hasActiveFilters).toBe(false);
		});
	});

	describe("filterCount computed", () => {
		it("should return 0 with no filters", () => {
			expect(store.filterCount).toBe(0);
		});

		it("should count search term", () => {
			store.setSearchTerm("test");
			expect(store.filterCount).toBe(1);
		});

		it("should count business area filter", () => {
			store.setFilters({ businessArea: "5" });
			expect(store.filterCount).toBe(1);
		});

		it("should count project kind filter", () => {
			store.setFilters({ projectKind: "science" });
			expect(store.filterCount).toBe(1);
		});

		it("should count project status filter", () => {
			store.setFilters({ projectStatus: "active" });
			expect(store.filterCount).toBe(1);
		});

		it("should count year filter", () => {
			store.setFilters({ year: 2024 });
			expect(store.filterCount).toBe(1);
		});

		it("should count user filter", () => {
			store.setFilters({ user: 42 });
			expect(store.filterCount).toBe(1);
		});

		it("should count multiple filters", () => {
			store.setSearchTerm("test");
			store.setFilters({
				businessArea: "5",
				projectKind: "science",
				year: 2024,
			});
			expect(store.filterCount).toBe(4);
		});

		it("should return 0 after reset", () => {
			store.setSearchTerm("test");
			store.setFilters({ businessArea: "5", year: 2024 });
			store.resetFilters();
			expect(store.filterCount).toBe(0);
		});

		it("should not count default filter values", () => {
			store.setFilters({
				businessArea: "All",
				projectKind: "All",
				projectStatus: "All",
				year: 0,
				user: null,
			});
			expect(store.filterCount).toBe(0);
		});
	});
});
