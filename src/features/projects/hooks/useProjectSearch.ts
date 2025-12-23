import { observer } from "mobx-react-lite";
import { useProjectSearchStore } from "@/app/providers/store.provider";

interface SearchFilters {
  onlyActive: boolean;
  onlyInactive: boolean;
  filterUser: number | null;
  filterBA: string;
  filterProjectKind: string;
  filterProjectStatus: string;
  filterYear: number;
}

interface IProjectSearchHook {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filteredItems: any[];
  loading: boolean;
  currentProjectResultsPage: number;
  setCurrentProjectResultsPage: (value: number) => void;
  totalPages: number;
  totalResults: number;
  isOnProjectsPage: boolean;
  setIsOnProjectsPage: (value: boolean) => void;
  onlyActive: boolean;
  onlyInactive: boolean;
  filterUser: number | null;
  filterBA: string;
  filterProjectKind: string;
  filterProjectStatus: string;
  filterYear: number;
  setSearchFilters: (filters: SearchFilters) => void;
}

/**
 * Hook to access project search functionality using MobX ProjectSearchStore
 * Provides the same interface as the previous ProjectSearchContext for easy migration
 */
export const useProjectSearch = (): IProjectSearchHook => {
  const projectSearchStore = useProjectSearchStore();

  return {
    searchTerm: projectSearchStore.searchTerm,
    setSearchTerm: projectSearchStore.setSearchTerm,
    filteredItems: projectSearchStore.filteredItems,
    loading: projectSearchStore.loading,
    currentProjectResultsPage: projectSearchStore.currentProjectResultsPage,
    setCurrentProjectResultsPage: projectSearchStore.setCurrentProjectResultsPage,
    totalPages: projectSearchStore.totalPages,
    totalResults: projectSearchStore.totalResults,
    isOnProjectsPage: projectSearchStore.isOnProjectsPage,
    setIsOnProjectsPage: projectSearchStore.setIsOnProjectsPage,
    onlyActive: projectSearchStore.onlyActive,
    onlyInactive: projectSearchStore.onlyInactive,
    filterUser: projectSearchStore.filterUser,
    filterBA: projectSearchStore.filterBA,
    filterProjectKind: projectSearchStore.filterProjectKind,
    filterProjectStatus: projectSearchStore.filterProjectStatus,
    filterYear: projectSearchStore.filterYear,
    setSearchFilters: projectSearchStore.setSearchFilters,
  };
};

// Export an observer-wrapped version for components that need reactive updates
export const useProjectSearchObserver = observer(useProjectSearch);

// Export the hook with the same name as the context hook for easy migration
export const useProjectSearchContext = useProjectSearch;