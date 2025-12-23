import { runInAction } from "mobx";
import { BaseStore, type BaseStoreState } from "@/app/stores/base.store";
import { logger } from "@/shared/services/logger.service";
import { storage } from "@/shared/services/storage.service";

type Theme = "dark" | "light" | "system";
type Loader = "cook" | "base" | "minimal";
type ContentWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "full";
type ItemsPerPage = 10 | 25 | 50 | 100;

interface UIStoreState extends BaseStoreState {
  theme: Theme;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  dataViewMode: "grid" | "list";
  selectedLoader: Loader;
  lastSyncTimestamp: number | null; // Track last successful sync
  // Mobile responsive state
  mobileSidebarOpen: boolean; // Mobile sidebar overlay state
  // Layout preferences
  defaultContentWidth: ContentWidth; // Default content width preference
  // Pagination preferences
  itemsPerPage: ItemsPerPage; // Global pagination preference
}

export class UIStore extends BaseStore<UIStoreState> {
  private storageKey: string = "cannabis-theme";
  private loaderStorageKey: string = "cannabis-loader";
  private itemsPerPageStorageKey: string = "cannabis-items-per-page";

  // Content width class mappings
  private readonly maxWidthClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full",
  } as const;

  constructor() {
    super({
      theme: "system", // Match backend default
      sidebarOpen: false,
      sidebarCollapsed: false,
      loading: false,
      error: null,
      initialised: false,
      dataViewMode: "grid",
      selectedLoader: "minimal",
      lastSyncTimestamp: null,
      // Mobile responsive state
      mobileSidebarOpen: false,
      // Layout preferences
      defaultContentWidth: "lg", // Default to large width
      // Pagination preferences
      itemsPerPage: 25, // Match backend default
    });
  }

  public toggleDataViewMode = async (syncToServer: boolean = true) => {
    const newMode = this.state.dataViewMode === "grid" ? "list" : "grid";

    runInAction(() => {
      this.state.dataViewMode = newMode;
    });

    // Sync to server if user is authenticated
    if (syncToServer && this.isUserAuthenticated()) {
      try {
        // TODO: Implement user preferences sync when backend supports it
        logger.info("User preferences sync not implemented yet", {
          mode: newMode,
        });

        runInAction(() => {
          this.state.lastSyncTimestamp = Date.now();
        });

        logger.info("Data view mode synced to server", {
          mode: newMode,
        });
      } catch (error) {
        logger.error("Failed to sync data view mode to server", {
          error,
          mode: newMode,
        });
        // Continue with local change - don't block UI
      }
    }

    logger.info("Data view mode changed", {
      mode: newMode,
      synced: syncToServer && this.isUserAuthenticated(),
    });
  };

  get currentDataViewMode() {
    return this.state.dataViewMode;
  }

  async initialise(): Promise<void> {
    await this.executeAsync(
      async () => {
        // If user is authenticated, try to load server preferences first
        if (this.isUserAuthenticated()) {
          try {
            // TODO: Implement preferences sync when backend supports it
            logger.info("Server preferences sync not implemented yet");
            this.initFromStorage();
          } catch (error) {
            logger.error("Failed to load server preferences", { error });
            this.initFromStorage();
          }
        } else {
          this.initFromStorage();
        }

        this.applyTheme();

        runInAction(() => {
          this.state.initialised = true;
        });

        logger.info("UI store initialised");
      },
      "initialise_ui",
      { silent: true },
    );
  }

  private initFromStorage() {
    try {
      const storedTheme = storage.getItem<Theme>(this.storageKey);
      const storedLoader = storage.getItem<Loader>(this.loaderStorageKey);
      const storedItemsPerPage = storage.getItem<ItemsPerPage>(
        this.itemsPerPageStorageKey,
      );

      logger.info("🔍 initFromStorage called", {
        storedTheme,
        storedLoader,
        storedItemsPerPage,
        lastSyncTimestamp: this.state.lastSyncTimestamp,
        currentTheme: this.state.theme,
        currentLoader: this.state.selectedLoader,
        currentItemsPerPage: this.state.itemsPerPage,
      });

      // Don't override server preferences if we have recent server data
      if (this.state.lastSyncTimestamp) {
        logger.info(
          "Skipping localStorage init - server preferences already loaded",
          {
            lastSyncTimestamp: this.state.lastSyncTimestamp,
            timeSinceSync: Date.now() - this.state.lastSyncTimestamp,
          },
        );
        return;
      }

      if (storedTheme) {
        runInAction(() => {
          this.state.theme = storedTheme;
        });
        logger.info("📱 Theme loaded from localStorage", {
          theme: storedTheme,
        });
      }
      if (storedLoader && ["cook", "base", "minimal"].includes(storedLoader)) {
        runInAction(() => {
          this.state.selectedLoader = storedLoader;
        });
        logger.info("Loader loaded from localStorage", {
          loader: storedLoader,
        });
      }

      if (
        storedItemsPerPage &&
        [10, 25, 50, 100].includes(storedItemsPerPage)
      ) {
        runInAction(() => {
          this.state.itemsPerPage = storedItemsPerPage;
        });
        logger.info("📄 Items per page loaded from localStorage", {
          itemsPerPage: storedItemsPerPage,
        });
      }

      logger.info("UI store initialized from localStorage", {
        finalTheme: this.state.theme,
        finalLoader: this.state.selectedLoader,
        finalItemsPerPage: this.state.itemsPerPage,
      });
    } catch (error) {
      logger.error("Failed to initialise UI state from storage", {
        error,
      });
    }
  }

  setTheme = async (newTheme: Theme, syncToServer: boolean = true) => {
    runInAction(() => {
      this.state.theme = newTheme;
    });

    // Always update localStorage for offline fallback
    storage.setItem(this.storageKey, newTheme);
    this.applyTheme();

    // Sync to server if user is authenticated
    if (syncToServer && this.isUserAuthenticated()) {
      try {
        const syncSuccess = await this.syncThemeToServer(newTheme);
        if (syncSuccess) {
          runInAction(() => {
            this.state.lastSyncTimestamp = Date.now();
          });
        }
      } catch (error) {
        logger.error("Failed to sync theme to server", {
          theme: newTheme,
          error,
        });
      }
    }

    logger.info(`Theme changed to ${newTheme} mode`);
  };

  toggleTheme = async () => {
    // Toggle based on current appearance, not just theme setting
    const isCurrentlyDark =
      this.state.theme === "dark" ||
      (this.state.theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    const newTheme = isCurrentlyDark ? "light" : "dark";
    await this.setTheme(newTheme);
  };

  setLoader = async (newLoader: Loader, syncToServer: boolean = true) => {
    runInAction(() => {
      this.state.selectedLoader = newLoader;
    });

    // Always update localStorage for offline fallback
    storage.setItem(this.loaderStorageKey, newLoader);

    // Sync to server if user is authenticated
    if (syncToServer && this.isUserAuthenticated()) {
      const syncSuccess = await this.syncLoaderToServer(newLoader);
      if (syncSuccess) {
        runInAction(() => {
          this.state.lastSyncTimestamp = Date.now();
        });
      }
    }

    logger.info("Loader changed", {
      loader: newLoader,
      synced: syncToServer && this.isUserAuthenticated(),
    });
  };

  applyTheme = () => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (this.state.theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(this.state.theme);
  };

  setSidebarOpen = (open: boolean) => {
    runInAction(() => {
      this.state.sidebarOpen = open;
    });
  };

  setSidebarCollapsed = async (
    collapsed: boolean,
    syncToServer: boolean = true,
  ) => {
    runInAction(() => {
      this.state.sidebarCollapsed = collapsed;
    });

    // Sync to server if user is authenticated
    if (syncToServer && this.isUserAuthenticated()) {
      try {
        // TODO: Implement user preferences sync when backend supports it
        logger.info("User preferences sync not implemented yet", {
          collapsed,
        });

        runInAction(() => {
          this.state.lastSyncTimestamp = Date.now();
        });

        logger.info("Sidebar collapsed state synced to server", {
          collapsed,
        });
      } catch (error) {
        logger.error("Failed to sync sidebar state to server", {
          error,
          collapsed,
        });
        // Continue with local change - don't block UI
      }
    }

    logger.info("Sidebar collapsed state changed", {
      collapsed,
      synced: syncToServer && this.isUserAuthenticated(),
    });
  };

  // Mobile sidebar state management
  setMobileSidebarOpen = (open: boolean) => {
    runInAction(() => {
      this.state.mobileSidebarOpen = open;
    });

    logger.info("Mobile sidebar state changed", { open });
  };

  toggleMobileSidebar = () => {
    this.setMobileSidebarOpen(!this.state.mobileSidebarOpen);
  };

  // Content width management
  setDefaultContentWidth = async (
    width: ContentWidth,
    syncToServer: boolean = true,
  ) => {
    runInAction(() => {
      this.state.defaultContentWidth = width;
    });

    // Sync to server if user is authenticated
    if (syncToServer && this.isUserAuthenticated()) {
      try {
        // TODO: Implement user preferences sync when backend supports it
        logger.info("User preferences sync not implemented yet", {
          width,
        });

        runInAction(() => {
          this.state.lastSyncTimestamp = Date.now();
        });

        logger.info("Default content width synced to server", {
          width,
        });
      } catch (error) {
        logger.error("Failed to sync content width to server", {
          error,
          width,
        });
        // Continue with local change - don't block UI
      }
    }

    logger.info("Default content width changed", {
      width,
      synced: syncToServer && this.isUserAuthenticated(),
    });
  };

  // Pagination management
  setItemsPerPage = async (
    itemsPerPage: ItemsPerPage,
    syncToServer: boolean = true,
  ) => {
    logger.info("Setting items per page", {
      itemsPerPage,
      syncToServer,
      isAuthenticated: this.isUserAuthenticated(),
      currentValue: this.state.itemsPerPage,
    });

    // Save to localStorage first for immediate persistence
    storage.setItem(this.itemsPerPageStorageKey, itemsPerPage);

    runInAction(() => {
      this.state.itemsPerPage = itemsPerPage;
    });

    // Sync to server if user is authenticated
    if (syncToServer && this.isUserAuthenticated()) {
      try {
        // TODO: Implement user preferences sync when backend supports it
        logger.info("User preferences sync not implemented yet", {
          itemsPerPage,
        });

        runInAction(() => {
          this.state.lastSyncTimestamp = Date.now();
        });

        logger.info("Items per page synced to server", {
          itemsPerPage,
        });
      } catch (error) {
        logger.error("❌ Failed to sync items per page to server", {
          error,
          itemsPerPage,
        });
        // Continue with local change - don't block UI
      }
    } else {
      logger.info("Skipping server sync for items per page", {
        syncToServer,
        isAuthenticated: this.isUserAuthenticated(),
      });
    }

    logger.info("Items per page changed", {
      itemsPerPage,
      synced: syncToServer && this.isUserAuthenticated(),
    });
  };

  // Getters
  get currentLoader() {
    return this.state.selectedLoader;
  }

  get currentTheme() {
    return this.state.theme;
  }

  /**
   * Get the resolved theme (what's actually applied to the document)
   */
  get resolvedTheme(): "light" | "dark" {
    if (this.state.theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return this.state.theme;
  }

  get isSidebarOpen() {
    return this.state.sidebarOpen;
  }

  get isSidebarCollapsed() {
    return this.state.sidebarCollapsed;
  }

  get isMobileSidebarOpen() {
    return this.state.mobileSidebarOpen;
  }

  get defaultContentWidth() {
    return this.state.defaultContentWidth;
  }

  get itemsPerPage() {
    return this.state.itemsPerPage;
  }

  getMaxWidthClass = (width?: ContentWidth): string => {
    const targetWidth = width || this.state.defaultContentWidth;
    return this.maxWidthClasses[targetWidth];
  };

  /**
   * Check if user is authenticated by checking for tokens
   */
  isUserAuthenticated(): boolean {
    try {
      // Use localStorage directly since tokens are stored there by TokenStorageService
      const accessToken = localStorage.getItem("cannabis_access_token");
      const refreshToken = localStorage.getItem("cannabis_refresh_token");

      return !!(accessToken && refreshToken);
    } catch (error) {
      logger.error("Token check failed", { error });
      return false;
    }
  }

  reset() {
    try {
      // Clear localStorage FIRST to prevent any race conditions
      storage.removeItem(this.storageKey);
      storage.removeItem(this.loaderStorageKey);
      storage.removeItem(this.itemsPerPageStorageKey);

      // Clear sync service localStorage items
      storage.removeItem("preferences-migrated-to-server");
      storage.removeItem("preferences-last-sync");
      storage.removeItem("preference-sync-notification-shown");

      // Clear removed search filter localStorage items
      storage.removeItem("userkind-filter");
      storage.removeItem("usersearch-filter");
    } catch (error) {
      logger.error("Failed to clear UI storage", { error });
    }

    runInAction(() => {
      this.state.theme = "system"; // Match backend and constructor default
      this.state.sidebarOpen = false;
      this.state.sidebarCollapsed = false;
      this.state.loading = false;
      this.state.error = null;
      this.state.initialised = false;
      this.state.dataViewMode = "grid";
      this.state.selectedLoader = "minimal";
      this.state.lastSyncTimestamp = null;
      // Reset mobile state
      this.state.mobileSidebarOpen = false;
      // Reset layout preferences
      this.state.defaultContentWidth = "lg";
      // Reset pagination preferences
      this.state.itemsPerPage = 25;
    });

    // Apply the reset theme
    this.applyTheme();

    logger.info("UI store reset complete");
  }

  /**
   * Load preferences from server data (called after successful server fetch)
   * TODO: Implement when backend supports user preferences
   */
  // loadFromServerPreferences = (preferences: UserPreferences) => {
  //   try {
  //     logger.info("Loading preferences from server", {
  //       theme: preferences.theme,
  //       loader: preferences.loader_style,
  //       currentTheme: this.state.theme,
  //       currentLoader: this.state.selectedLoader,
  //     });
  //     // ... implementation commented out
  //   } catch (error) {
  //     logger.error("Failed to load preferences from server", { error });
  //   }
  // };

  /**
   * Get current UI preferences in server format
   * TODO: Implement when backend supports user preferences
   */
  // getServerPreferencesData = (): Partial<UserPreferences> => {
  //   return {
  //     theme: this.state.theme,
  //     loader_style: this.state.selectedLoader,
  //     items_per_page: this.state.itemsPerPage,
  //     ui_preferences: {
  //       dataViewMode: this.state.dataViewMode,
  //       sidebarCollapsed: this.state.sidebarCollapsed,
  //       defaultContentWidth: this.state.defaultContentWidth,
  //     },
  //   };
  // };

  /**
   * Get last sync timestamp
   */
  get lastSyncTimestamp() {
    return this.state.lastSyncTimestamp;
  }

  async dispose() {
    logger.info("UI store disposed");
  }

  /**
   * Debug method to check current theme state
   */
  debugThemeState() {
    const debugInfo = {
      currentTheme: this.state.theme,
      lastSyncTimestamp: this.state.lastSyncTimestamp,
      isAuthenticated: this.isUserAuthenticated(),
      localStorageTheme: storage.getItem<Theme>(this.storageKey),
      documentClasses: document.documentElement.className,
      hasTokens: !!(
        localStorage.getItem("cannabis_access_token") &&
        localStorage.getItem("cannabis_refresh_token")
      ),
    };

    logger.info("🔍 Theme Debug State", debugInfo);
    console.table(debugInfo);

    return debugInfo;
  }

  /**
   * Sync theme to server with retry logic
   */
  private async syncThemeToServer(
    theme: Theme,
    retryCount: number = 0,
  ): Promise<boolean> {
    const maxRetries = 2;

    try {
      // TODO: Implement theme sync when backend supports it
      logger.info("Theme sync not implemented yet", { theme });
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const isNetworkError =
        errorMessage.includes("fetch") ||
        errorMessage.includes("network") ||
        errorMessage.includes("timeout");

      // Retry on network errors
      if (isNetworkError && retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.syncThemeToServer(theme, retryCount + 1);
      }

      logger.error("Failed to sync theme to server", {
        theme,
        error: errorMessage,
      });
      return false;
    }
  }

  /**
   * Sync loader to server
   */
  private async syncLoaderToServer(loader: Loader): Promise<boolean> {
    try {
      // TODO: Implement loader sync when backend supports it
      logger.info("Loader sync not implemented yet", { loader });
      return true;
    } catch (error) {
      logger.error("Failed to sync loader style to server", {
        error,
        loader,
      });
      return false;
    }
  }
}
