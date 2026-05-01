import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserSearchStore } from "./user-search.store";

vi.mock("@/shared/services/logger.service", () => ({
	logger: { info: vi.fn(), warn: vi.fn(), debug: vi.fn(), error: vi.fn() },
}));

describe("UserSearchStore", () => {
	let store: UserSearchStore;

	beforeEach(() => {
		localStorage.clear();
		store = new UserSearchStore();
	});

	describe("initial state", () => {
		it("should have empty search term", () => {
			expect(store.state.searchTerm).toBe("");
		});

		it("should have default filters", () => {
			expect(store.state.filters.roleFilter).toBe("all");
			expect(store.state.filters.businessArea).toBeUndefined();
		});

		it("should start on page 1", () => {
			expect(store.state.currentPage).toBe(1);
		});

		it("should have saveSearch enabled by default", () => {
			expect(store.state.saveSearch).toBe(true);
		});
	});

	describe("setSearchTerm", () => {
		it("should update search term", () => {
			store.setSearchTerm("john");
			expect(store.state.searchTerm).toBe("john");
		});

		it("should reset to page 1", () => {
			store.setCurrentPage(3);
			store.setSearchTerm("test");
			expect(store.state.currentPage).toBe(1);
		});
	});

	describe("setFilters", () => {
		it("should update filters", () => {
			store.setFilters({ roleFilter: "staff" });
			expect(store.state.filters.roleFilter).toBe("staff");
		});

		it("should merge with existing filters", () => {
			store.setFilters({ roleFilter: "staff" });
			store.setFilters({ businessArea: 5 });
			expect(store.state.filters.roleFilter).toBe("staff");
			expect(store.state.filters.businessArea).toBe(5);
		});

		it("should reset to page 1", () => {
			store.setCurrentPage(3);
			store.setFilters({ roleFilter: "admin" });
			expect(store.state.currentPage).toBe(1);
		});
	});

	describe("computed: hasActiveFilters", () => {
		it("should be false with defaults", () => {
			expect(store.hasActiveFilters).toBe(false);
		});

		it("should be true with search term", () => {
			store.setSearchTerm("test");
			expect(store.hasActiveFilters).toBe(true);
		});

		it("should be true with role filter", () => {
			store.setFilters({ roleFilter: "staff" });
			expect(store.hasActiveFilters).toBe(true);
		});

		it("should be true with business area filter", () => {
			store.setFilters({ businessArea: 5 });
			expect(store.hasActiveFilters).toBe(true);
		});
	});

	describe("computed: filterCount", () => {
		it("should be 0 with defaults", () => {
			expect(store.filterCount).toBe(0);
		});

		it("should count search term as a filter", () => {
			store.setSearchTerm("test");
			expect(store.filterCount).toBe(1);
		});

		it("should count multiple active filters", () => {
			store.setSearchTerm("test");
			store.setFilters({ roleFilter: "staff", businessArea: 5 });
			expect(store.filterCount).toBe(3);
		});
	});

	describe("resetFilters", () => {
		it("should reset filters and search term to defaults", () => {
			store.setSearchTerm("test");
			store.setFilters({ roleFilter: "staff", businessArea: 5 });
			store.resetFilters();
			expect(store.state.searchTerm).toBe("");
			expect(store.state.filters.roleFilter).toBe("all");
			expect(store.state.filters.businessArea).toBeUndefined();
			expect(store.state.currentPage).toBe(1);
		});
	});

	describe("clearSearchAndFilters", () => {
		it("should clear all search state", () => {
			store.setSearchTerm("test");
			store.setFilters({ roleFilter: "admin" });
			store.setTotalResults(100);
			store.clearSearchAndFilters();
			expect(store.state.searchTerm).toBe("");
			expect(store.state.filters.roleFilter).toBe("all");
			expect(store.state.totalResults).toBe(0);
		});
	});

	describe("toggleSaveSearch", () => {
		it("should toggle saveSearch flag", () => {
			expect(store.state.saveSearch).toBe(true);
			store.toggleSaveSearch();
			expect(store.state.saveSearch).toBe(false);
			store.toggleSaveSearch();
			expect(store.state.saveSearch).toBe(true);
		});
	});

	describe("reset", () => {
		it("should reset all state to initial values", () => {
			store.setSearchTerm("test");
			store.setFilters({ roleFilter: "admin" });
			store.setCurrentPage(5);
			store.setTotalResults(100);
			store.reset();
			expect(store.state.searchTerm).toBe("");
			expect(store.state.filters.roleFilter).toBe("all");
			expect(store.state.currentPage).toBe(1);
			expect(store.state.totalResults).toBe(0);
			expect(store.state.saveSearch).toBe(false);
		});
	});

	describe("searchParams computed", () => {
		it("should return empty params with defaults", () => {
			const params = store.searchParams;
			expect(params.toString()).toBe("");
		});

		it("should include search term", () => {
			store.setSearchTerm("test");
			expect(store.searchParams.get("search")).toBe("test");
		});

		it("should include page when > 1", () => {
			store.setCurrentPage(3);
			expect(store.searchParams.get("page")).toBe("3");
		});

		it("should include role filter when not 'all'", () => {
			store.setFilters({ roleFilter: "staff" });
			expect(store.searchParams.get("roleFilter")).toBe("staff");
		});
	});
});
