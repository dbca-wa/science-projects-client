import { observer } from "mobx-react-lite";
import { useProjectMapSearchStore } from "@/app/providers/store.provider";
import type { MapSearchFilters } from "@/app/stores/projectMapSearch.store";

/**
 * Hook for accessing project map search functionality
 * Provides backward-compatible interface with the old ProjectMapSearchContext
 */
export const useProjectMapSearch = () => {
  const store = useProjectMapSearchStore();

  return {
    // State
    searchTerm: store.searchTerm,
    filteredItems: store.filteredItems,
    loading: store.loading,
    currentProjectResultsPage: store.currentProjectResultsPage,
    totalPages: store.totalPages,
    totalResults: store.totalResults,
    isOnProjectsPage: store.isOnProjectsPage,
    onlyActive: store.onlyActive,
    onlyInactive: store.onlyInactive,
    filterBA: store.filterBA,
    filterUser: store.filterUser,
    filterProjectKind: store.filterProjectKind,
    filterProjectStatus: store.filterProjectStatus,
    filterYear: store.filterYear,
    selectedLocations: store.selectedLocations,

    // Actions
    setSearchTerm: store.setSearchTerm,
    setCurrentProjectResultsPage: store.setCurrentProjectResultsPage,
    setIsOnProjectsPage: store.setIsOnProjectsPage,
    setSelectedLocations: store.setSelectedLocations,
    addLocationFilter: store.addLocationFilter,
    removeLocationFilter: store.removeLocationFilter,
    clearLocationFilters: store.clearLocationFilters,
    setSearchFilters: store.setSearchFilters,
  };
};

// Alias for backward compatibility
export const useProjectMapSearchContext = useProjectMapSearch;

// Export the observer-wrapped hook for components
export const useProjectMapSearchObserver = () => observer(useProjectMapSearch);