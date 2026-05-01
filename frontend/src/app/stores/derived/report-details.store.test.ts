import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReportDetailsStore } from "./report-details.store";

vi.mock("@/shared/services/logger.service", () => ({
	logger: { info: vi.fn(), warn: vi.fn(), debug: vi.fn(), error: vi.fn() },
}));

describe("ReportDetailsStore", () => {
	let store: ReportDetailsStore;

	beforeEach(() => {
		localStorage.clear();
		store = new ReportDetailsStore();
	});

	it("should default to BCS division", () => {
		expect(store.state.selectedDivisionSlug).toBe("BCS");
	});

	it("should default to null year", () => {
		expect(store.state.selectedYear).toBeNull();
	});

	it("setDivisionSlug should update slug and reset year", () => {
		store.setYear(2025);
		store.setDivisionSlug("RFMS");
		expect(store.state.selectedDivisionSlug).toBe("RFMS");
		expect(store.state.selectedYear).toBeNull();
	});

	it("setYear should update year", () => {
		store.setYear(2025);
		expect(store.state.selectedYear).toBe(2025);
	});

	it("hasActiveFilters should be false with defaults", () => {
		expect(store.hasActiveFilters).toBe(false);
	});

	it("hasActiveFilters should be true with non-default division", () => {
		store.setDivisionSlug("RFMS");
		expect(store.hasActiveFilters).toBe(true);
	});

	it("hasActiveFilters should be true with year set", () => {
		store.setYear(2025);
		expect(store.hasActiveFilters).toBe(true);
	});

	it("clearState should reset to defaults", () => {
		store.setDivisionSlug("RFMS");
		store.setYear(2025);
		store.clearState();
		expect(store.state.selectedDivisionSlug).toBe("BCS");
		expect(store.state.selectedYear).toBeNull();
	});

	it("reset should reset all state", () => {
		store.setDivisionSlug("RFMS");
		store.setYear(2025);
		store.reset();
		expect(store.state.selectedDivisionSlug).toBe("BCS");
		expect(store.state.selectedYear).toBeNull();
		expect(store.state.saveSearch).toBe(true);
	});

	it("toggleSaveSearch should toggle the flag", () => {
		expect(store.state.saveSearch).toBe(true);
		store.toggleSaveSearch();
		expect(store.state.saveSearch).toBe(false);
	});
});
