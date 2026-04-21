import { describe, it, expect, beforeEach } from "vitest";
import { UnapprovedDocsFilterStore } from "./unapproved-docs-filter.store";

const STORAGE_KEY = "unapprovedDocsFilterState";

describe("UnapprovedDocsFilterStore", () => {
	let store: UnapprovedDocsFilterStore;

	beforeEach(() => {
		sessionStorage.clear();
		store = new UnapprovedDocsFilterStore();
	});

	describe("initial state", () => {
		it("should have all stage filters checked by default", () => {
			expect(store.state.stageFilters.stage1).toBe(true);
			expect(store.state.stageFilters.stage2).toBe(true);
			expect(store.state.stageFilters.stage3).toBe(true);
		});

		it("should have empty search term", () => {
			expect(store.state.searchTerm).toBe("");
		});

		it("should not have active filters initially", () => {
			expect(store.hasActiveFilters).toBe(false);
		});

		it("should have all stages active initially", () => {
			expect(store.activeStages).toEqual(new Set([1, 2, 3]));
		});
	});

	describe("toggleStageFilter", () => {
		it("should toggle stage 1 off", () => {
			store.toggleStageFilter(1);
			expect(store.state.stageFilters.stage1).toBe(false);
			expect(store.state.stageFilters.stage2).toBe(true);
			expect(store.state.stageFilters.stage3).toBe(true);
		});

		it("should toggle stage 2 off", () => {
			store.toggleStageFilter(2);
			expect(store.state.stageFilters.stage2).toBe(false);
		});

		it("should toggle stage 3 off", () => {
			store.toggleStageFilter(3);
			expect(store.state.stageFilters.stage3).toBe(false);
		});

		it("should toggle a stage back on", () => {
			store.toggleStageFilter(1);
			expect(store.state.stageFilters.stage1).toBe(false);
			store.toggleStageFilter(1);
			expect(store.state.stageFilters.stage1).toBe(true);
		});
	});

	describe("setSearchTerm", () => {
		it("should update the search term", () => {
			store.setSearchTerm("test project");
			expect(store.state.searchTerm).toBe("test project");
		});

		it("should allow clearing the search term", () => {
			store.setSearchTerm("test");
			store.setSearchTerm("");
			expect(store.state.searchTerm).toBe("");
		});
	});

	describe("resetFilters", () => {
		it("should reset all filters to defaults", () => {
			store.toggleStageFilter(1);
			store.toggleStageFilter(3);
			store.setSearchTerm("something");

			store.resetFilters();

			expect(store.state.stageFilters.stage1).toBe(true);
			expect(store.state.stageFilters.stage2).toBe(true);
			expect(store.state.stageFilters.stage3).toBe(true);
			expect(store.state.searchTerm).toBe("");
		});
	});

	describe("hasActiveFilters computed", () => {
		it("should return false with default state", () => {
			expect(store.hasActiveFilters).toBe(false);
		});

		it("should return true when a stage is unchecked", () => {
			store.toggleStageFilter(2);
			expect(store.hasActiveFilters).toBe(true);
		});

		it("should return true when search term is set", () => {
			store.setSearchTerm("test");
			expect(store.hasActiveFilters).toBe(true);
		});

		it("should return true when both filters and search are active", () => {
			store.toggleStageFilter(1);
			store.setSearchTerm("query");
			expect(store.hasActiveFilters).toBe(true);
		});

		it("should return false after reset", () => {
			store.toggleStageFilter(1);
			store.setSearchTerm("test");
			store.resetFilters();
			expect(store.hasActiveFilters).toBe(false);
		});
	});

	describe("activeStages computed", () => {
		it("should return all stages when all checked", () => {
			expect(store.activeStages).toEqual(new Set([1, 2, 3]));
		});

		it("should exclude unchecked stages", () => {
			store.toggleStageFilter(2);
			expect(store.activeStages).toEqual(new Set([1, 3]));
		});

		it("should return empty set when all unchecked", () => {
			store.toggleStageFilter(1);
			store.toggleStageFilter(2);
			store.toggleStageFilter(3);
			expect(store.activeStages).toEqual(new Set());
		});
	});

	describe("sessionStorage persistence", () => {
		it("should save state to sessionStorage on toggle", () => {
			store.toggleStageFilter(1);
			const stored = sessionStorage.getItem(STORAGE_KEY);
			expect(stored).not.toBeNull();
			const parsed = JSON.parse(stored!);
			expect(parsed.stageFilters.stage1).toBe(false);
		});

		it("should save state to sessionStorage on search term change", () => {
			store.setSearchTerm("hello");
			const stored = sessionStorage.getItem(STORAGE_KEY);
			expect(stored).not.toBeNull();
			const parsed = JSON.parse(stored!);
			expect(parsed.searchTerm).toBe("hello");
		});

		it("should restore state from sessionStorage on construction", () => {
			sessionStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({
					stageFilters: { stage1: false, stage2: true, stage3: false },
					searchTerm: "restored",
				})
			);

			const newStore = new UnapprovedDocsFilterStore();
			expect(newStore.state.stageFilters.stage1).toBe(false);
			expect(newStore.state.stageFilters.stage2).toBe(true);
			expect(newStore.state.stageFilters.stage3).toBe(false);
			expect(newStore.state.searchTerm).toBe("restored");
		});

		it("should ignore invalid sessionStorage data", () => {
			sessionStorage.setItem(STORAGE_KEY, "not valid json {{{");

			const newStore = new UnapprovedDocsFilterStore();
			expect(newStore.state.stageFilters.stage1).toBe(true);
			expect(newStore.state.searchTerm).toBe("");
		});

		it("should ignore sessionStorage data with wrong shape", () => {
			sessionStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({ unrelated: "data" })
			);

			const newStore = new UnapprovedDocsFilterStore();
			expect(newStore.state.stageFilters.stage1).toBe(true);
		});

		it("should clear sessionStorage on reset", () => {
			store.toggleStageFilter(1);
			expect(sessionStorage.getItem(STORAGE_KEY)).not.toBeNull();

			store.reset();
			expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
		});
	});

	describe("reset", () => {
		it("should reset to initial state", () => {
			store.toggleStageFilter(1);
			store.setSearchTerm("test");

			store.reset();

			expect(store.state.stageFilters.stage1).toBe(true);
			expect(store.state.stageFilters.stage2).toBe(true);
			expect(store.state.stageFilters.stage3).toBe(true);
			expect(store.state.searchTerm).toBe("");
			expect(store.state.loading).toBe(false);
			expect(store.state.error).toBeNull();
			expect(store.state.initialised).toBe(false);
		});
	});
});
