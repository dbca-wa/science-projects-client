import { makeObservable, action } from "mobx";
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
		});
		
		this.initialise();
	}

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
	 * Initialises store and loads persisted settings from localStorage.
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
		// Apply theme after loading
		this.state.initialised = true;
		this.applyTheme();
	}

	/**
	 * Toggles theme between light and dark.
	 */
	toggleTheme = (): void => {
		this.state.theme = this.state.theme === "light" ? "dark" : "light";
		localStorage.setItem("theme", this.state.theme);
		this.applyTheme();
	};

	/**
	 * Toggles layout between modern and traditional.
	 */
	toggleLayout = (): void => {
		this.state.layout =
			this.state.layout === "modern" ? "traditional" : "modern";
		localStorage.setItem("layout", this.state.layout);
	};

	/**
	 * Toggles sidebar open state.
	 */
	toggleSidebar = (): void => {
		this.state.sidebarOpen = !this.state.sidebarOpen;
	};

	/**
	 * Toggles navitar dropdown open state.
	 */
	toggleNavitar = (): void => {
		this.state.navitarOpen = !this.state.navitarOpen;
	};

	/**
	 * Toggles hamburger menu open state.
	 */
	toggleHamburgerMenu = (): void => {
		this.state.hamburgerMenuOpen = !this.state.hamburgerMenuOpen;
	};

	/**
	 * Sets navitar open state.
	 */
	setNavitarOpen = (open: boolean): void => {
		this.state.navitarOpen = open;
	};

	/**
	 * Sets hamburger menu open state.
	 */
	setHamburgerMenuOpen = (open: boolean): void => {
		this.state.hamburgerMenuOpen = open;
	};

	/**
	 * Sets theme.
	 */
	setTheme = (theme: Theme): void => {
		this.state.theme = theme;
		localStorage.setItem("theme", this.state.theme);
		this.applyTheme();
	};

	/**
	 * Sets layout.
	 */
	setLayout = (layout: Layout): void => {
		this.state.layout = layout;
		localStorage.setItem("layout", this.state.layout);
	};

	/**
	 * Sets data view mode.
	 */
	setDataViewMode = (mode: DataView): void => {
		this.state.dataViewMode = mode;
	};

	/**
	 * Applies current theme to document.
	 */
	private applyTheme = (): void => {
		if (this.state.theme === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	};

	/**
	 * Resets store to default values.
	 */
	reset(): void {
		this.state.theme = "light";
		this.state.layout = "traditional";
		this.state.sidebarOpen = false;
		this.state.dataViewMode = "grid";
		this.state.navitarOpen = false;
		// this.state.hamburgerMenuOpen = false;
		this.state.loading = false;
		this.state.error = null;
		this.applyTheme();
	}

	/**
	 * Performs cleanup when store is disposed.
	 */
	async dispose(): Promise<void> {
		// No async cleanup needed
	}
}