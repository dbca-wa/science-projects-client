import { getProjectsBasedOnSearchTerm } from "@/shared/lib/api";
import type { IProjectData } from "@/shared/types/index.d";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface SearchFilters {
  onlyActive: boolean;
  onlyInactive: boolean;
  filterUser: number | null;
  filterBA: string;
  filterProjectKind: string;
  filterProjectStatus: string;
  filterYear: number;
}

interface IProjectSearchContext {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filteredItems: IProjectData[];
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

const ProjectSearchContext = createContext<IProjectSearchContext | null>(null);

interface IProjectSearchProviderProps {
  children: ReactNode;
}

export const ProjectSearchProvider = ({
  children,
}: IProjectSearchProviderProps) => {
  // Combine related state into a single object to reduce rerenders
  const [state, setState] = useState({
    searchTerm: "",
    filteredItems: [] as IProjectData[],
    loading: false,
    currentProjectResultsPage: 1,
    totalResults: 0,
    totalPages: 1,
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

  // Memoize handlers to prevent unnecessary rerenders
  const setSearchTerm = useCallback((value: string) => {
    setState((prev) => ({
      ...prev,
      searchTerm: value,
      currentProjectResultsPage: 1,
    }));
  }, []);

  const setCurrentProjectResultsPage = useCallback((value: number) => {
    setState((prev) => ({ ...prev, currentProjectResultsPage: value }));
  }, []);

  const setIsOnProjectsPage = useCallback((value: boolean) => {
    setState((prev) => ({
      ...prev,
      isOnProjectsPage: value,
      // Reset filters when leaving projects page
      filters: value
        ? prev.filters
        : {
            ...prev.filters,
            filterBA: "All",
            filterProjectStatus: "All",
            filterProjectKind: "All",
          },
    }));
  }, []);

  const setSearchFilters = useCallback((newFilters: SearchFilters) => {
    setState((prev) => ({
      ...prev,
      currentProjectResultsPage: 1,
      filters: newFilters,
    }));
  }, []);

  // Separate data fetching effect
  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      if (!state.isOnProjectsPage) return;

      setState((prev) => ({ ...prev, loading: true }));

      try {
        const data = await getProjectsBasedOnSearchTerm(
          state.searchTerm,
          state.currentProjectResultsPage,
          state.filters,
        );

        if (isMounted) {
          setState((prev) => ({
            ...prev,
            filteredItems: data.projects,
            totalResults: data.total_results,
            totalPages: data.total_pages,
            loading: false,
          }));
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        if (isMounted) {
          setState((prev) => ({ ...prev, loading: false }));
        }
      }
    };

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, [
    state.searchTerm,
    state.currentProjectResultsPage,
    state.isOnProjectsPage,
    state.filters,
  ]);

  const contextValue: IProjectSearchContext = {
    searchTerm: state.searchTerm,
    setSearchTerm,
    filteredItems: state.filteredItems,
    loading: state.loading,
    currentProjectResultsPage: state.currentProjectResultsPage,
    setCurrentProjectResultsPage,
    totalPages: state.totalPages,
    totalResults: state.totalResults,
    isOnProjectsPage: state.isOnProjectsPage,
    setIsOnProjectsPage,
    ...state.filters,
    setSearchFilters,
  };

  return (
    <ProjectSearchContext.Provider value={contextValue}>
      {children}
    </ProjectSearchContext.Provider>
  );
};

export const useProjectSearchContext = () => {
  const context = useContext(ProjectSearchContext);
  if (!context) {
    throw new Error(
      "useProjectSearchContext must be used within a ProjectSearchProvider",
    );
  }
  return context;
};

export default ProjectSearchContext;
