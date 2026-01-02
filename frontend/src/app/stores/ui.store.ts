import { makeAutoObservable } from "mobx";

type Theme = "light" | "dark";

export class UIStore {
	theme: Theme = "light";
	sidebarCollapsed = false;

	constructor() {
		makeAutoObservable(this);
		// Load theme from localStorage
		this.loadTheme();
	}

	/**
	 * Load theme from localStorage
	 */
	private loadTheme() {
		const savedTheme = localStorage.getItem("theme") as Theme;
		if (savedTheme) {
			this.theme = savedTheme;
			this.applyTheme();
		}
	}

	/**
	 * Toggle theme between light and dark
	 */
	toggleTheme() {
		this.theme = this.theme === "light" ? "dark" : "light";
		localStorage.setItem("theme", this.theme);
		this.applyTheme();
	}

	/**
	 * Apply theme to document
	 */
	private applyTheme() {
		if (this.theme === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}

	/**
	 * Toggle sidebar collapsed state
	 */
	toggleSidebar() {
		this.sidebarCollapsed = !this.sidebarCollapsed;
	}
}
