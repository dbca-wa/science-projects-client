import { describe, it, expect, beforeEach } from "vitest";
import { UIStore } from "./ui.store";

describe("UIStore", () => {
	let store: UIStore;

	beforeEach(() => {
		localStorage.clear();
		store = new UIStore();
	});

	describe("initial state", () => {
		it("should default to light theme", () => {
			expect(store.theme).toBe("light");
		});

		it("should have sidebar closed", () => {
			expect(store.sidebarOpen).toBe(false);
		});

		it("should default to grid view", () => {
			expect(store.dataViewMode).toBe("grid");
		});

		it("should have navitar closed", () => {
			expect(store.navitarOpen).toBe(false);
		});
	});

	describe("toggleTheme", () => {
		it("should toggle from light to dark", () => {
			store.toggleTheme();
			expect(store.theme).toBe("dark");
		});

		it("should toggle from dark back to light", () => {
			store.toggleTheme();
			store.toggleTheme();
			expect(store.theme).toBe("light");
		});

		it("should persist theme to localStorage", () => {
			store.toggleTheme();
			expect(localStorage.getItem("theme")).toBe("dark");
		});
	});

	describe("toggleSidebar", () => {
		it("should toggle sidebar open state", () => {
			store.toggleSidebar();
			expect(store.sidebarOpen).toBe(true);
			store.toggleSidebar();
			expect(store.sidebarOpen).toBe(false);
		});
	});

	describe("toggleNavitar", () => {
		it("should toggle navitar open state", () => {
			store.toggleNavitar();
			expect(store.navitarOpen).toBe(true);
		});
	});

	describe("toggleHamburgerMenu", () => {
		it("should toggle hamburger menu open state", () => {
			store.toggleHamburgerMenu();
			expect(store.hamburgerMenuOpen).toBe(true);
		});
	});

	describe("setTheme", () => {
		it("should set theme directly", () => {
			store.setTheme("dark");
			expect(store.theme).toBe("dark");
		});
	});

	describe("setDataViewMode", () => {
		it("should set data view mode", () => {
			store.setDataViewMode("list");
			expect(store.dataViewMode).toBe("list");
		});
	});

	describe("reset", () => {
		it("should reset all state to defaults", () => {
			store.toggleTheme();
			store.toggleSidebar();
			store.setDataViewMode("list");
			store.reset();
			expect(store.theme).toBe("light");
			expect(store.sidebarOpen).toBe(false);
			expect(store.dataViewMode).toBe("grid");
		});
	});
});
