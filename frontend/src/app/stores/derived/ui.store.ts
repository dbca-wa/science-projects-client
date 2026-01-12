import { makeAutoObservable } from "mobx";

type Theme = "light" | "dark";
type Layout = "modern" | "traditional";

export class UIStore {
	theme: Theme = "light";
	layout: Layout = "traditional";
	sidebarCollapsed = false;
	soundEnabled = true;

	constructor() {
		makeAutoObservable(this);
		// Load theme from localStorage
		this.loadTheme();
		// Load layout from localStorage
		this.loadLayout();
		// Load sound preference from localStorage
		this.loadSoundPreference();
	}

	/**
	 * Load from localStorage
	 */
	private loadTheme = () => {
		const savedTheme = localStorage.getItem("theme") as Theme;
		if (savedTheme) {
			this.theme = savedTheme;
			this.applyTheme();
		}
	};

	/*
	 * Load from localStorage
	 */
	private loadLayout = () => {
		const savedLayout = localStorage.getItem("layout") as Layout;
		if (savedLayout) {
			this.layout = savedLayout;
			this.applyTheme();
		}
	};

	private loadSoundPreference = () => {
		const savedSound = localStorage.getItem("soundEnabled");
		if (savedSound !== null) {
			this.soundEnabled = savedSound === "true";
		}
	};

	/**
	 * Toggle theme between light and dark
	 */
	toggleTheme = () => {
		this.theme = this.theme === "light" ? "dark" : "light";
		localStorage.setItem("theme", this.theme);
		this.applyTheme();
	};

	/**
	 * Toggle layout between modern and traditional
	 */

	toggleLayout = () => {
		this.layout = this.layout === "modern" ? "traditional" : "modern";
		localStorage.setItem("layout", this.layout);
	};

	/**
	 * Apply theme to document
	 */
	private applyTheme = () => {
		if (this.theme === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	};

	/**
	 * Toggle sidebar collapsed state
	 */
	toggleSidebar = () => {
		this.sidebarCollapsed = !this.sidebarCollapsed;
	};

	// Direct setters
	setSoundEnabled = (enabled: boolean) => {
		this.soundEnabled = enabled;
		localStorage.setItem("soundEnabled", String(enabled));
	};

	setTheme = (theme: Theme) => {
		this.theme = theme;
		localStorage.setItem("theme", this.theme);
		this.applyTheme();
	};
}
