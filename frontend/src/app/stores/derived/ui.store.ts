import { makeAutoObservable, runInAction } from "mobx";
import { BaseStore, type BaseStoreState } from "@/app/stores/base.store";

export type Theme = "light" | "dark";
export type Layout = "modern" | "traditional";
export type DataView = "grid" | "list";

interface UIStoreState extends BaseStoreState {
	theme: Theme;
	layout: Layout;
	sidebarOpen: boolean;
	dataViewMode: DataView;
}

export class UIStore extends BaseStore<UIStoreState> {
	constructor() {
		super({
			theme: "light",
			layout: "traditional",
			sidebarOpen: false,
			dataViewMode: "grid",
			loading: false,
			error: null,
			initialised: false,
		});

		makeAutoObservable(this);
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

	/**
	 * Initialize store - load from localStorage
	 */
	async initialise(): Promise<void> {
		runInAction(() => {
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
		});

		// Apply theme after loading
		this.applyTheme();
	}

	/**
	 * Toggle theme between light and dark
	 */
	toggleTheme = (): void => {
		runInAction(() => {
			this.state.theme = this.state.theme === "light" ? "dark" : "light";
			localStorage.setItem("theme", this.state.theme);
		});
		this.applyTheme();
	};

	/**
	 * Toggle layout between modern and traditional
	 */
	toggleLayout = (): void => {
		runInAction(() => {
			this.state.layout =
				this.state.layout === "modern" ? "traditional" : "modern";
			localStorage.setItem("layout", this.state.layout);
		});
	};

	/**
	 * Toggle sidebar collapsed state
	 */
	toggleSidebar = (): void => {
		runInAction(() => {
			this.state.sidebarOpen = !this.state.sidebarOpen;
		});
	};

	/**
	 * Set theme directly
	 */
	setTheme = (theme: Theme): void => {
		runInAction(() => {
			this.state.theme = theme;
			localStorage.setItem("theme", this.state.theme);
		});
		this.applyTheme();
	};

	/**
	 * Set layout directly
	 */
	setLayout = (layout: Layout): void => {
		runInAction(() => {
			this.state.layout = layout;
			localStorage.setItem("layout", this.state.layout);
		});
	};

	/**
	 * Set data view mode
	 */
	setDataViewMode = (mode: DataView): void => {
		runInAction(() => {
			this.state.dataViewMode = mode;
		});
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
		runInAction(() => {
			this.state.theme = "light";
			this.state.layout = "traditional";
			this.state.sidebarOpen = false;
			this.state.dataViewMode = "grid";
			this.state.loading = false;
			this.state.error = null;
		});
		this.applyTheme();
	}

	/**
	 * Cleanup
	 */
	async dispose(): Promise<void> {
		// No async cleanup needed for UI store
	}
}
