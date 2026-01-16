import { makeObservable, action, computed } from "mobx";
import { BaseStore, type BaseStoreState } from "@/app/stores/base.store";

export type Theme = "light" | "dark";
export type Layout = "modern" | "traditional";
export type DataView = "grid" | "list";

interface UIStoreState extends BaseStoreState {
	theme: Theme;
	layout: Layout;
	sidebarOpen: boolean;
	dataViewMode: DataView;
	navitarOpen: boolean;
	hamburgerMenuOpen: boolean;
}

export class UIStore extends BaseStore<UIStoreState> {
	constructor() {
		super({
			theme: "light",
			layout: "traditional",
			sidebarOpen: false,
			dataViewMode: "grid",
			navitarOpen: false,
			hamburgerMenuOpen: false,
			loading: false,
			error: null,
			initialised: false,
		});

		// Use makeObservable instead of makeAutoObservable for classes with inheritance
		makeObservable(this, {
			// Actions
			toggleTheme: action,
			toggleLayout: action,
			toggleSidebar: action,
			toggleNavitar: action,
			toggleHamburgerMenu: action,
			setTheme: action,
			setLayout: action,
			setDataViewMode: action,
			setNavitarOpen: action,
			setHamburgerMenuOpen: action,
			reset: action,
			
			// Computed
			theme: computed,
			layout: computed,
			sidebarOpen: computed,
			dataViewMode: computed,
			navitarOpen: computed,
			hamburgerMenuOpen: computed,
		});
		
		this.initialise();
	}

	// Computed getters for accessing state
	get theme(): Theme {
		return this.state.theme;
	}

	get layout(): Layout {
		return this.state.layout;
	}

	get sidebarOpen(): boolean {
		return this.state.sidebarOpen;
	}

	get dataViewMode(): DataView {
		return this.state.dataViewMode;
	}

	get navitarOpen(): boolean {
		return this.state.navitarOpen;
	}

	get hamburgerMenuOpen(): boolean {
		return this.state.hamburgerMenuOpen;
	}

	/**
	 * Initialize store - load from localStorage
	 */
	async initialise(): Promise<void> {
		// Load theme from localStorage
		const savedTheme = localStorage.getItem("theme") as Theme;
		if (savedTheme) {
			this.state.theme = savedTheme;
		}

		// Load layout from localStorage
		const savedLayout = localStorage.getItem("layout") as Layout;
		if (savedLayout) {
			this.state.layout = savedLayout;
		}

		this.state.initialised = true;

		// Apply theme after loading
		this.applyTheme();
	}

	/**
	 * Toggle theme between light and dark
	 */
	toggleTheme = (): void => {
		this.state.theme = this.state.theme === "light" ? "dark" : "light";
		localStorage.setItem("theme", this.state.theme);
		this.applyTheme();
	};

	/**
	 * Toggle layout between modern and traditional
	 */
	toggleLayout = (): void => {
		this.state.layout =
			this.state.layout === "modern" ? "traditional" : "modern";
		localStorage.setItem("layout", this.state.layout);
	};

	/**
	 * Toggle sidebar collapsed state
	 */
	toggleSidebar = (): void => {
		this.state.sidebarOpen = !this.state.sidebarOpen;
	};

	/**
	 * Toggle navitar dropdown
	 */
	toggleNavitar = (): void => {
		this.state.navitarOpen = !this.state.navitarOpen;
	};

	/**
	 * Toggle hamburger menu
	 */
	toggleHamburgerMenu = (): void => {
		this.state.hamburgerMenuOpen = !this.state.hamburgerMenuOpen;
	};

	/**
	 * Set navitar open state directly
	 */
	setNavitarOpen = (open: boolean): void => {
		this.state.navitarOpen = open;
	};

	/**
	 * Set hamburger menu open state directly
	 */
	setHamburgerMenuOpen = (open: boolean): void => {
		this.state.hamburgerMenuOpen = open;
	};

	/**
	 * Set theme directly
	 */
	setTheme = (theme: Theme): void => {
		this.state.theme = theme;
		localStorage.setItem("theme", this.state.theme);
		this.applyTheme();
	};

	/**
	 * Set layout directly
	 */
	setLayout = (layout: Layout): void => {
		this.state.layout = layout;
		localStorage.setItem("layout", this.state.layout);
	};

	/**
	 * Set data view mode
	 */
	setDataViewMode = (mode: DataView): void => {
		this.state.dataViewMode = mode;
	};

	/**
	 * Apply theme to document
	 */
	private applyTheme = (): void => {
		if (this.state.theme === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	};

	/**
	 * Reset store to defaults
	 */
	reset(): void {
		this.state.theme = "light";
		this.state.layout = "traditional";
		this.state.sidebarOpen = false;
		this.state.dataViewMode = "grid";
		this.state.navitarOpen = false;
		this.state.hamburgerMenuOpen = false;
		this.state.loading = false;
		this.state.error = null;
		this.applyTheme();
	}

	/**
	 * Cleanup
	 */
	async dispose(): Promise<void> {
		// No async cleanup needed for UI store
	}
}
