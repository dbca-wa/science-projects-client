import { observer } from "mobx-react-lite";
import { useUserSearchStore } from "@/app/providers/store.provider";
import type { IUserData } from "@/shared/types";
import { useEffect } from "react";

interface UserSearchFilters {
  onlySuperuser: boolean;
  onlyExternal: boolean;
  onlyStaff: boolean;
  businessArea: string;
}

interface IUserSearchHook {
  searchTerm: string;
  setSearchTerm: (value: string) => void;

  filteredItems: IUserData[];
  loading: boolean;

  currentUserResultsPage: number;
  setCurrentUserResultsPage: (value: number) => void;
  totalPages: number;
  totalResults: number;

  setIsOnUserPage: (value: boolean) => void;

  onlySuperuser: boolean;
  onlyExternal: boolean;
  onlyStaff: boolean;
  businessArea: string;
  setSearchFilters: (filters: UserSearchFilters) => void;
  reFetch: () => void;
}

/**
 * Hook to access user search functionality using MobX store
 * Provides the same interface as the previous UserSearchContext for easy migration
 */
export const useUserSearch = (): IUserSearchHook => {
  const store = useUserSearchStore();

  // Set up reactive search triggering
  useEffect(() => {
    // Trigger search when dependencies change
    store.triggerSearch();
  }, [
    store.searchTerm,
    store.currentUserResultsPage,
    store.isOnUserPage,
    store.filters.onlySuperuser,
    store.filters.onlyExternal,
    store.filters.onlyStaff,
    store.filters.businessArea,
  ]);

  return {
    searchTerm: store.searchTerm,
    setSearchTerm: store.setSearchTerm,

    filteredItems: store.filteredItems,
    loading: store.isLoading,

    currentUserResultsPage: store.currentUserResultsPage,
    setCurrentUserResultsPage: store.setCurrentUserResultsPage,
    totalPages: store.totalPages,
    totalResults: store.totalResults,

    setIsOnUserPage: store.setIsOnUserPage,

    onlySuperuser: store.onlySuperuser,
    onlyExternal: store.onlyExternal,
    onlyStaff: store.onlyStaff,
    businessArea: store.businessArea,
    setSearchFilters: store.setSearchFilters,
    reFetch: store.reFetch,
  };
};

// Export an observer-wrapped version for components that need reactive updates
export const useUserSearchObserver = observer(useUserSearch);

// Export the hook with the same name as the context hook for easy migration
export const useUserSearchContext = useUserSearch;