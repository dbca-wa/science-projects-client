import { BaseStore, type BaseStoreState } from "@/app/stores/base.store";
import { getUsersBasedOnSearchTerm } from "@/features/users/services/users.service";
import type { IUserData } from "@/shared/types";
import { logger } from "@/shared/services/logger.service";
import { runInAction, computed, makeObservable, action } from "mobx";

interface UserSearchFilters {
  onlySuperuser: boolean;
  onlyExternal: boolean;
  onlyStaff: boolean;
  businessArea: string;
}

interface UserSearchStoreState extends BaseStoreState {
  searchTerm: string;
  filteredItems: IUserData[];
  currentUserResultsPage: number;
  totalPages: number;
  totalResults: number;
  isOnUserPage: boolean;
  filters: UserSearchFilters;
}

export class UserSearchStore extends BaseStore<UserSearchStoreState> {
  constructor() {
    super({
      searchTerm: "",
      filteredItems: [],
      currentUserResultsPage: 1,
      totalPages: 1,
      totalResults: 0,
      isOnUserPage: false,
      filters: {
        onlySuperuser: false,
        onlyExternal: false,
        onlyStaff: false,
        businessArea: "All",
      },
      loading: false,
      error: null,
      initialised: true, // No async initialization needed
    });

    // Configure observability
    makeObservable(this, {
      // Actions
      setSearchTerm: action,
      setCurrentUserResultsPage: action,
      setIsOnUserPage: action,
      setSearchFilters: action,
      reFetch: action,
      
      // Computed values
      searchTerm: computed,
      filteredItems: computed,
      currentUserResultsPage: computed,
      totalPages: computed,
      totalResults: computed,
      isOnUserPage: computed,
      filters: computed,
    });
  }

  // Computed getters
  get searchTerm() {
    return this.state.searchTerm;
  }

  get filteredItems() {
    return this.state.filteredItems;
  }

  get currentUserResultsPage() {
    return this.state.currentUserResultsPage;
  }

  get totalPages() {
    return this.state.totalPages;
  }

  get totalResults() {
    return this.state.totalResults;
  }

  get isOnUserPage() {
    return this.state.isOnUserPage;
  }

  get filters() {
    return this.state.filters;
  }

  get onlySuperuser() {
    return this.state.filters.onlySuperuser;
  }

  get onlyExternal() {
    return this.state.filters.onlyExternal;
  }

  get onlyStaff() {
    return this.state.filters.onlyStaff;
  }

  get businessArea() {
    return this.state.filters.businessArea;
  }

  // Actions
  setSearchTerm = (searchTerm: string) => {
    runInAction(() => {
      this.state.searchTerm = searchTerm;
    });
    logger.debug("Search term updated", { searchTerm });
  };

  setCurrentUserResultsPage = (page: number) => {
    runInAction(() => {
      this.state.currentUserResultsPage = page;
    });
    logger.debug("Current page updated", { page });
  };

  setIsOnUserPage = (isOnUserPage: boolean) => {
    runInAction(() => {
      this.state.isOnUserPage = isOnUserPage;
    });

    // Reset filters when leaving user page
    if (!isOnUserPage) {
      runInAction(() => {
        this.state.filters = {
          onlySuperuser: false,
          onlyExternal: false,
          onlyStaff: false,
          businessArea: "All",
        };
        this.state.searchTerm = "";
      });
    }

    logger.debug("User page status updated", { isOnUserPage });
  };

  setSearchFilters = (filters: UserSearchFilters) => {
    runInAction(() => {
      this.state.filters = { ...filters };
      this.state.currentUserResultsPage = 1; // Reset to first page when filters change
    });
    logger.debug("Search filters updated", { filters });
  };

  reFetch = async () => {
    await this.fetchUsers();
  };

  // Private method to fetch users
  private fetchUsers = async () => {
    if (!this.state.isOnUserPage) {
      return;
    }

    const result = await this.executeAsync(
      async () => {
        const data = await getUsersBasedOnSearchTerm(
          this.state.searchTerm,
          this.state.currentUserResultsPage,
          this.state.filters
        );

        runInAction(() => {
          this.state.filteredItems = data.users;
          this.state.totalPages = data.total_pages;
          this.state.totalResults = data.total_results;
        });

        return data;
      },
      "fetch_users",
      { silent: false }
    );

    if (!result.success) {
      logger.error("Failed to fetch users", { error: result.error });
    }
  };

  // Override initialise to set up automatic fetching
  async initialise(): Promise<void> {
    // Set up reactive fetching when relevant state changes
    // This will be handled by the components using the store
    logger.debug("UserSearchStore initialised");
  }

  reset(): void {
    runInAction(() => {
      this.state.searchTerm = "";
      this.state.filteredItems = [];
      this.state.currentUserResultsPage = 1;
      this.state.totalPages = 1;
      this.state.totalResults = 0;
      this.state.isOnUserPage = false;
      this.state.filters = {
        onlySuperuser: false,
        onlyExternal: false,
        onlyStaff: false,
        businessArea: "All",
      };
      this.state.loading = false;
      this.state.error = null;
      this.state.initialised = true;
    });

    logger.info("UserSearchStore reset");
  }

  async dispose(): Promise<void> {
    this.reset();
    logger.info("UserSearchStore disposed");
  }

  // Method to trigger search when dependencies change
  // This will be called by components when search term, page, or filters change
  triggerSearch = async () => {
    if (this.state.isOnUserPage) {
      await this.fetchUsers();
    }
  };
}