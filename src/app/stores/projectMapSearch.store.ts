import { runInAction } from "mobx";
import { BaseStore, type BaseStoreState } from "@/app/stores/base.store";
import { logger } from "@/shared/services/logger.service";
import { getMapProjectsBasedOnSearchTerm } from "@/features/projects/services/projects.service";
import type { IProjectData } from "@/shared/types";

export interface MapSearchFilters {
  onlyActive: boolean;
  onlyInactive: boolean;
  filterUser: number | null;
  filterBA: string;
  filterProjectKind: string;
  filterProjectStatus: string;
  filterYear: number;
  selectedLocations: number[];
}

interface ProjectMapSearchStoreState extends BaseStoreState {
  searchTerm: string;
  filteredItems: IProjectData[];
  currentProjectResultsPage: number;
  totalPages: number;
  totalResults: number;
  isOnProjectsPage: boolean;
  onlyActive: boolean;
  onlyInactive: boolean;
  filterBA: string;
  filterUser: number | null;
  filterProjectKind: string;
  filterProjectStatus: string;
  filterYear: number;
  selectedLocations: number[];
}

export class ProjectMapSearchStore extends BaseStore<ProjectMapSearchStoreState> {
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
      onlyActive: false,
      onlyInactive: false,
      filterBA: "All",
      filterProjectKind: "All",
      filterProjectStatus: "All",
      filterYear: 0,
      filterUser: null,
      selectedLocations: [],
    });
  }

  public async initialise(): Promise<void> {
    await this.executeAsync(
      async () => {
        runInAction(() => {
          this.state.initialised = true;
        });

        logger.info("Project map search store initialised");
      },
      "initialise_project_map_search",
      { silent: true },
    );
  }

  // Search term management
  setSearchTerm = (value: string) => {
    runInAction(() => {
      this.state.searchTerm = value;
    });

    // Trigger search if on projects page
    if (this.state.isOnProjectsPage) {
      this.fetchProjects();
    }

    logger.info("Map search term updated", { searchTerm: value });
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

    logger.info("Map page updated", { page: value });
  };

  // Page state management
  setIsOnProjectsPage = (value: boolean) => {
    runInAction(() => {
      this.state.isOnProjectsPage = value;
      
      // Reset filters when leaving projects page
      if (!value) {
        this.state.filterBA = "All";
        this.state.filterUser = null;
        this.state.filterProjectStatus = "All";
        this.state.filterProjectKind = "All";
        this.state.selectedLocations = [];
        this.state.currentProjectResultsPage = 1;
      }
    });

    // Trigger search if entering projects page
    if (value) {
      this.fetchProjects();
    }

    logger.info("Map projects page state updated", { isOnProjectsPage: value });
  };

  // Location filter management
  setSelectedLocations = (locations: number[]) => {
    runInAction(() => {
      this.state.selectedLocations = [...locations];
    });

    // Trigger search if on projects page
    if (this.state.isOnProjectsPage) {
      this.fetchProjects();
    }

    logger.info("Selected locations updated", { locations });
  };

  addLocationFilter = (locationId: number) => {
    if (!this.state.selectedLocations.includes(locationId)) {
      runInAction(() => {
        this.state.selectedLocations = [...this.state.selectedLocations, locationId];
        this.state.currentProjectResultsPage = 1;
      });

      // Trigger search if on projects page
      if (this.state.isOnProjectsPage) {
        this.fetchProjects();
      }

      logger.info("Location filter added", { locationId });
    }
  };

  removeLocationFilter = (locationId: number) => {
    runInAction(() => {
      this.state.selectedLocations = this.state.selectedLocations.filter(
        (id) => id !== locationId,
      );
      this.state.currentProjectResultsPage = 1;
    });

    // Trigger search if on projects page
    if (this.state.isOnProjectsPage) {
      this.fetchProjects();
    }

    logger.info("Location filter removed", { locationId });
  };

  clearLocationFilters = () => {
    runInAction(() => {
      this.state.selectedLocations = [];
      this.state.currentProjectResultsPage = 1;
    });

    // Trigger search if on projects page
    if (this.state.isOnProjectsPage) {
      this.fetchProjects();
    }

    logger.info("Location filters cleared");
  };

  // Filter management
  setSearchFilters = (filters: MapSearchFilters) => {
    runInAction(() => {
      this.state.onlyActive = filters.onlyActive;
      this.state.onlyInactive = filters.onlyInactive;
      this.state.filterBA = filters.filterBA;
      this.state.filterProjectStatus = filters.filterProjectStatus;
      this.state.filterProjectKind = filters.filterProjectKind;
      this.state.filterYear = filters.filterYear;
      this.state.filterUser = filters.filterUser;
      this.state.selectedLocations = filters.selectedLocations ?? this.state.selectedLocations;
      this.state.currentProjectResultsPage = 1;
    });

    // Trigger search if on projects page
    if (this.state.isOnProjectsPage) {
      this.fetchProjects();
    }

    logger.info("Map search filters updated", { filters });
  };

  // API integration
  private fetchProjects = async () => {
    if (!this.state.isOnProjectsPage) return;

    await this.executeAsync(
      async () => {
        const data = await getMapProjectsBasedOnSearchTerm(
          this.state.searchTerm,
          this.state.currentProjectResultsPage,
          {
            onlyActive: this.state.onlyActive,
            onlyInactive: this.state.onlyInactive,
            filterBA: this.state.filterBA,
            filterProjectKind: this.state.filterProjectKind,
            filterProjectStatus: this.state.filterProjectStatus,
            filterYear: this.state.filterYear,
            filterUser: this.state.filterUser,
            selectedLocations: this.state.selectedLocations,
          },
        );

        runInAction(() => {
          this.state.filteredItems = data.projects;
          this.state.totalResults = data.total_results;
          this.state.totalPages = data.total_pages;
        });

        logger.info("Map projects fetched successfully", {
          count: data.projects.length,
          totalResults: data.total_results,
          totalPages: data.total_pages,
        });
      },
      "fetch_map_projects",
      { 
        silent: false
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
    return this.state.onlyActive;
  }

  get onlyInactive() {
    return this.state.onlyInactive;
  }

  get filterBA() {
    return this.state.filterBA;
  }

  get filterUser() {
    return this.state.filterUser;
  }

  get filterProjectKind() {
    return this.state.filterProjectKind;
  }

  get filterProjectStatus() {
    return this.state.filterProjectStatus;
  }

  get filterYear() {
    return this.state.filterYear;
  }

  get selectedLocations() {
    return this.state.selectedLocations;
  }

  async dispose() {
    logger.info("Project map search store disposed");
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
      this.state.onlyActive = false;
      this.state.onlyInactive = false;
      this.state.filterBA = "All";
      this.state.filterProjectKind = "All";
      this.state.filterProjectStatus = "All";
      this.state.filterYear = 0;
      this.state.filterUser = null;
      this.state.selectedLocations = [];
    });

    logger.info("Project map search store reset complete");
  }
}