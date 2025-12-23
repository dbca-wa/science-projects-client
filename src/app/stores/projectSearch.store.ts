import { runInAction } from "mobx";
import { BaseStore, type BaseStoreState } from "@/app/stores/base.store";
import { logger } from "@/shared/services/logger.service";
import { getProjectsBasedOnSearchTerm } from "@/features/projects/services/projects.service";
import type { IProjectData } from "@/shared/types";

interface SearchFilters {
  onlyActive: boolean;
  onlyInactive: boolean;
  filterUser: number | null;
  filterBA: string;
  filterProjectKind: string;
  filterProjectStatus: string;
  filterYear: number;
}

interface ProjectSearchStoreState extends BaseStoreState {
  searchTerm: string;
  filteredItems: IProjectData[];
  currentProjectResultsPage: number;
  totalPages: number;
  totalResults: number;
  isOnProjectsPage: boolean;
  filters: SearchFilters;
}

export class ProjectSearchStore extends BaseStore<ProjectSearchStoreState> {
  constructor() {
    super({
      searchTerm: "",
      filteredItems: [],
      loading: false,
      error: null,
      initialised: false,
      currentProjectResultsPage: 1,
      totalPages: 1,
      totalResults: 0,
      isOnProjectsPage: false,
      filters: {
        onlyActive: false,
        onlyInactive: false,
        filterBA: "All",
        filterProjectKind: "All",
        filterProjectStatus: "All",
        filterYear: 0,
        filterUser: null,
      },
    });
  }

  public async initialise(): Promise<void> {
    await this.executeAsync(
      async () => {
        runInAction(() => {
          this.state.initialised = true;
        });

        logger.info("Project search store initialised");
      },
      "initialise_project_search",
      { silent: true },
    );
  }

  // Search term management
  setSearchTerm = (value: string) => {
    runInAction(() => {
      this.state.searchTerm = value;
      this.state.currentProjectResultsPage = 1; // Reset to first page
    });

    // Trigger search if on projects page
    if (this.state.isOnProjectsPage) {
      this.fetchProjects();
    }

    logger.info("Search term updated", { searchTerm: value });
  };

  // Pagination management
  setCurrentProjectResultsPage = (value: number) => {
    runInAction(() => {
      this.state.currentProjectResultsPage = value;
    });

    // Trigger search if on projects page
    if (this.state.isOnProjectsPage) {
      this.fetchProjects();
    }

    logger.info("Page updated", { page: value });
  };

  // Page state management
  setIsOnProjectsPage = (value: boolean) => {
    runInAction(() => {
      this.state.isOnProjectsPage = value;
      
      // Reset filters when leaving projects page
      if (!value) {
        this.state.filters = {
          ...this.state.filters,
          filterBA: "All",
          filterProjectStatus: "All",
          filterProjectKind: "All",
        };
      }
    });

    // Trigger search if entering projects page
    if (value) {
      this.fetchProjects();
    }

    logger.info("Projects page state updated", { isOnProjectsPage: value });
  };

  // Filter management
  setSearchFilters = (newFilters: SearchFilters) => {
    runInAction(() => {
      this.state.filters = { ...newFilters };
      this.state.currentProjectResultsPage = 1; // Reset to first page
    });

    // Trigger search if on projects page
    if (this.state.isOnProjectsPage) {
      this.fetchProjects();
    }

    logger.info("Search filters updated", { filters: newFilters });
  };

  // API integration
  private fetchProjects = async () => {
    if (!this.state.isOnProjectsPage) return;

    await this.executeAsync(
      async () => {
        const data = await getProjectsBasedOnSearchTerm(
          this.state.searchTerm,
          this.state.currentProjectResultsPage,
          this.state.filters,
        );

        runInAction(() => {
          this.state.filteredItems = data.projects;
          this.state.totalResults = data.total_results;
          this.state.totalPages = data.total_pages;
        });

        logger.info("Projects fetched successfully", {
          count: data.projects.length,
          totalResults: data.total_results,
          totalPages: data.total_pages,
        });
      },
      "fetch_projects",
      { 
        silent: false,
        errorMessage: "Failed to fetch projects"
      },
    );
  };

  // Getters for easy access
  get searchTerm() {
    return this.state.searchTerm;
  }

  get filteredItems() {
    return this.state.filteredItems;
  }

  get currentProjectResultsPage() {
    return this.state.currentProjectResultsPage;
  }

  get totalPages() {
    return this.state.totalPages;
  }

  get totalResults() {
    return this.state.totalResults;
  }

  get isOnProjectsPage() {
    return this.state.isOnProjectsPage;
  }

  get onlyActive() {
    return this.state.filters.onlyActive;
  }

  get onlyInactive() {
    return this.state.filters.onlyInactive;
  }

  get filterUser() {
    return this.state.filters.filterUser;
  }

  get filterBA() {
    return this.state.filters.filterBA;
  }

  get filterProjectKind() {
    return this.state.filters.filterProjectKind;
  }

  get filterProjectStatus() {
    return this.state.filters.filterProjectStatus;
  }

  get filterYear() {
    return this.state.filters.filterYear;
  }

  async dispose() {
    logger.info("Project search store disposed");
  }

  reset() {
    runInAction(() => {
      this.state.searchTerm = "";
      this.state.filteredItems = [];
      this.state.loading = false;
      this.state.error = null;
      this.state.initialised = false;
      this.state.currentProjectResultsPage = 1;
      this.state.totalPages = 1;
      this.state.totalResults = 0;
      this.state.isOnProjectsPage = false;
      this.state.filters = {
        onlyActive: false,
        onlyInactive: false,
        filterBA: "All",
        filterProjectKind: "All",
        filterProjectStatus: "All",
        filterYear: 0,
        filterUser: null,
      };
    });

    logger.info("Project search store reset complete");
  }
}