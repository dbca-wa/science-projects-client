import { describe, it, expect, vi, beforeEach } from "vitest";
import { MyProjectsStore } from "./my-projects.store";

vi.mock("@/shared/services/logger.service", () => ({
	logger: { info: vi.fn(), warn: vi.fn(), debug: vi.fn(), error: vi.fn() },
}));

describe("MyProjectsStore", () => {
	let store: MyProjectsStore;

	beforeEach(() => {
		localStorage.clear();
		store = new MyProjectsStore();
	});

	it("should have empty search term initially", () => {
		expect(store.state.searchTerm).toBe("");
	});

	it("should have hideInactive false initially", () => {
		expect(store.state.filters.hideInactive).toBe(false);
	});

	it("setSearchTerm should update search term", () => {
		store.setSearchTerm("fauna");
		expect(store.state.searchTerm).toBe("fauna");
	});

	it("setHideInactive should update filter", () => {
		store.setHideInactive(true);
		expect(store.state.filters.hideInactive).toBe(true);
	});

	it("setFilters should merge filters", () => {
		store.setFilters({ hideInactive: true });
		expect(store.state.filters.hideInactive).toBe(true);
	});

	it("hasActiveFilters should be false with defaults", () => {
		expect(store.hasActiveFilters).toBe(false);
	});

	it("hasActiveFilters should be true with search term", () => {
		store.setSearchTerm("test");
		expect(store.hasActiveFilters).toBe(true);
	});

	it("hasActiveFilters should be true with hideInactive", () => {
		store.setHideInactive(true);
		expect(store.hasActiveFilters).toBe(true);
	});

	it("filterCount should count active filters", () => {
		expect(store.filterCount).toBe(0);
		store.setSearchTerm("test");
		expect(store.filterCount).toBe(1);
		store.setHideInactive(true);
		expect(store.filterCount).toBe(2);
	});

	it("resetFilters should clear filters and search", () => {
		store.setSearchTerm("test");
		store.setHideInactive(true);
		store.resetFilters();
		expect(store.state.searchTerm).toBe("");
		expect(store.state.filters.hideInactive).toBe(false);
	});

	it("reset should reset all state", () => {
		store.setSearchTerm("test");
		store.setHideInactive(true);
		store.reset();
		expect(store.state.searchTerm).toBe("");
		expect(store.state.filters.hideInactive).toBe(false);
		expect(store.state.saveSearch).toBe(true);
	});

	it("searchParams should include search term", () => {
		store.setSearchTerm("fauna");
		expect(store.searchParams.get("search")).toBe("fauna");
	});

	it("searchParams should include hideInactive", () => {
		store.setHideInactive(true);
		expect(store.searchParams.get("hideInactive")).toBe("true");
	});

	it("getFilteredProjects should filter by search term", () => {
		store.setSearchTerm("fauna");
		const projects = [
			{ title: "Fauna Survey", status: "active" },
			{ title: "Flora Mapping", status: "active" },
		] as Parameters<typeof store.getFilteredProjects>[0];
		const filtered = store.getFilteredProjects(projects);
		expect(filtered).toHaveLength(1);
		expect(filtered[0].title).toBe("Fauna Survey");
	});

	it("getFilteredProjects should filter inactive when hideInactive is true", () => {
		store.setHideInactive(true);
		const projects = [
			{ title: "Active Project", status: "active" },
			{ title: "Completed Project", status: "completed" },
			{ title: "Terminated Project", status: "terminated" },
		] as Parameters<typeof store.getFilteredProjects>[0];
		const filtered = store.getFilteredProjects(projects);
		expect(filtered).toHaveLength(1);
		expect(filtered[0].title).toBe("Active Project");
	});

	it("toggleSaveSearch should toggle the flag", () => {
		expect(store.state.saveSearch).toBe(true);
		store.toggleSaveSearch();
		expect(store.state.saveSearch).toBe(false);
	});
});
