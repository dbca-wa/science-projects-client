import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { getMapProjectsBasedOnSearchTerm } from "../../api";
import { IProjectData } from "../../../types";

export interface MapSearchFilters {
  onlyActive: boolean;
  onlyInactive: boolean;
  filterBA: string;
  filterProjectKind: string;
  filterProjectStatus: string;
  filterYear: number;
  selectedLocations?: number[];
}

interface IProjectMapSearchContext {
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
  filterBA: string;
  filterProjectKind: string;
  filterProjectStatus: string;
  filterYear: number;
  selectedLocations: number[];
  setSelectedLocations: (locations: number[]) => void;
  addLocationFilter: (locationId: number) => void;
  removeLocationFilter: (locationId: number) => void;
  clearLocationFilters: () => void;
  setSearchFilters: (filters: MapSearchFilters) => void;
}

const ProjectMapSearchContext = createContext<IProjectMapSearchContext | null>(
  null,
);

interface IProjectMapSearchProviderProps {
  children: React.ReactNode;
}

export const ProjectMapSearchProvider = ({
  children,
}: IProjectMapSearchProviderProps) => {
  const [state, setState] = useState({
    isOnProjectsPage: false,
    loading: false,
    filteredItems: [] as IProjectData[],
    searchTerm: "",
    currentProjectResultsPage: 1,
    totalResults: 0,
    totalPages: 1,
    onlyActive: false,
    onlyInactive: false,
    filterBA: "All",
    filterProjectKind: "All",
    filterProjectStatus: "All",
    filterYear: 0,
    selectedLocations: [] as number[],
  });

  // Separate effect for handling page changes
  useEffect(() => {
    if (!state.isOnProjectsPage) {
      setState((prev) => ({
        ...prev,
        filterBA: "All",
        filterProjectStatus: "All",
        filterProjectKind: "All",
        selectedLocations: [],
        currentProjectResultsPage: 1,
      }));
    }
  }, [state.isOnProjectsPage]);

  // Separate effect for API calls
  useEffect(() => {
    const fetchProjects = async () => {
      if (!state.isOnProjectsPage) return;

      setState((prev) => ({ ...prev, loading: true }));

      try {
        const data = await getMapProjectsBasedOnSearchTerm(
          state.searchTerm,
          state.currentProjectResultsPage,
          {
            onlyActive: state.onlyActive,
            onlyInactive: state.onlyInactive,
            filterBA: state.filterBA,
            filterProjectKind: state.filterProjectKind,
            filterProjectStatus: state.filterProjectStatus,
            filterYear: state.filterYear,
            selectedLocations: state.selectedLocations,
          },
        );

        setState((prev) => ({
          ...prev,
          filteredItems: data.projects,
          totalResults: data.total_results,
          totalPages: data.total_pages,
          loading: false,
        }));
      } catch (error) {
        console.error("Error fetching projects:", error);
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchProjects();
  }, [
    state.searchTerm,
    state.currentProjectResultsPage,
    state.isOnProjectsPage,
    state.onlyActive,
    state.onlyInactive,
    state.filterBA,
    state.filterYear,
    state.filterProjectStatus,
    state.filterProjectKind,
    state.selectedLocations,
  ]);

  const setSearchTerm = useCallback((value: string) => {
    setState((prev) => ({ ...prev, searchTerm: value }));
  }, []);

  const setCurrentProjectResultsPage = useCallback((value: number) => {
    setState((prev) => ({ ...prev, currentProjectResultsPage: value }));
  }, []);

  const setIsOnProjectsPage = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, isOnProjectsPage: value }));
  }, []);

  const addLocationFilter = useCallback((locationId: number) => {
    setState((prev) => ({
      ...prev,
      selectedLocations: prev.selectedLocations.includes(locationId)
        ? prev.selectedLocations
        : [...prev.selectedLocations, locationId],
      currentProjectResultsPage: 1,
    }));
  }, []);

  const removeLocationFilter = useCallback((locationId: number) => {
    setState((prev) => ({
      ...prev,
      selectedLocations: prev.selectedLocations.filter(
        (id) => id !== locationId,
      ),
      currentProjectResultsPage: 1,
    }));
  }, []);

  const clearLocationFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedLocations: [],
      currentProjectResultsPage: 1,
    }));
  }, []);

  const setSearchFilters = useCallback((filters: MapSearchFilters) => {
    setState((prev) => ({
      ...prev,
      onlyActive: filters.onlyActive,
      onlyInactive: filters.onlyInactive,
      filterBA: filters.filterBA,
      filterProjectStatus: filters.filterProjectStatus,
      filterProjectKind: filters.filterProjectKind,
      filterYear: filters.filterYear,
      selectedLocations: filters.selectedLocations ?? prev.selectedLocations,
      currentProjectResultsPage: 1,
    }));
  }, []);

  const contextValue = {
    ...state,
    setSearchTerm,
    setCurrentProjectResultsPage,
    setIsOnProjectsPage,
    setSearchFilters,
    setSelectedLocations: (locations: number[]) =>
      setState((prev) => ({ ...prev, selectedLocations: locations })),
    addLocationFilter,
    removeLocationFilter,
    clearLocationFilters,
  };

  return (
    <ProjectMapSearchContext.Provider value={contextValue}>
      {children}
    </ProjectMapSearchContext.Provider>
  );
};

export const useProjectMapSearchContext = () => {
  const context = useContext(ProjectMapSearchContext);
  if (!context) {
    throw new Error(
      "useProjectMapSearchContext must be used within a ProjectMapSearchProvider",
    );
  }
  return context;
};

export default ProjectMapSearchContext;
