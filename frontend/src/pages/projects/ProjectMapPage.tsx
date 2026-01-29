import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { FullMapContainer } from "@/features/projects/components/map/FullMapContainer";
import { MapFilters } from "@/features/projects/components/map/MapFilters";
import { useProjectMapStore } from "@/app/stores/store-context";
import { useProjectsForMap } from "@/features/projects/hooks/useProjectsForMap";
import { useSearchStoreInit } from "@/shared/hooks/useSearchStoreInit";
import { Spinner } from "@/shared/components/ui/spinner";
import { Minimize2, Filter } from "lucide-react";
import { MapErrorBoundary } from "@/features/projects/components/map/MapErrorBoundary";
import { Button } from "@/shared/components/ui/button";
import { useScreenReaderAnnouncements } from "@/shared/utils/screen-reader.utils";

/**
 * ProjectMapPage - Complete implementation
 * 
 * Features:
 * - Interactive Leaflet map with Western Australia focus
 * - Modern circular markers (no traditional pins)
 * - Comprehensive filtering (search, business areas, users)
 * - Map fullscreen mode with sidebar
 * - GeoJSON layer management with popover controls
 * - Accessibility and keyboard navigation
 */
const ProjectMapPage = observer(() => {
  const store = useProjectMapStore();
  const [, setSearchParams] = useSearchParams();
  
  // Initialize screen reader announcements
  useScreenReaderAnnouncements();
  
  // Initialize from URL params and localStorage
  // TypeScript infers TFilters from projectMapStore
  useSearchStoreInit({
    store,
    storageKey: "projectMapState",
    urlParamMapping: {
      businessAreas: (v) => v.split(',').map(Number).filter(n => !isNaN(n)),
      user: (v) => Number(v),
      search: (v) => v,
      status: (v) => v,
      kind: (v) => v,
      year: (v) => Number(v),
      onlyActive: (v) => v === "true",
      onlyInactive: (v) => v === "true",
    },
  });

  // Sync store state to URL params
  useEffect(() => {
    // Use computed property that MobX can properly track
    const businessAreasArray = store.selectedBusinessAreasArray;
    
    // Build URL params
    const params = new URLSearchParams();
    
    if (store.state.searchTerm) {
      params.set('search', store.state.searchTerm);
    }
    
    if (businessAreasArray.length > 0) {
      params.set('businessAreas', businessAreasArray.join(','));
    }
    
    if (store.state.filterUser) {
      params.set('user', store.state.filterUser.toString());
    }

    if (store.state.filterStatus) {
      params.set('status', store.state.filterStatus);
    }

    if (store.state.filterKind) {
      params.set('kind', store.state.filterKind);
    }

    if (store.state.filterYear && store.state.filterYear !== 0) {
      params.set('year', store.state.filterYear.toString());
    }

    if (store.state.onlyActive) {
      params.set('onlyActive', 'true');
    }

    if (store.state.onlyInactive) {
      params.set('onlyInactive', 'true');
    }

    // Update URL params
    setSearchParams(params, { replace: true });
  }, [
    store.state.searchTerm,
    store.selectedBusinessAreasArray,
    store.state.filterUser,
    store.state.filterStatus,
    store.state.filterKind,
    store.state.filterYear,
    store.state.onlyActive,
    store.state.onlyInactive,
    setSearchParams,
  ]);
  
  // Get filtered projects and statistics from single API call
  const { data: mapData, isLoading, error } = useProjectsForMap(store.apiParams);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner className="size-8 mx-auto text-blue-600" />
          <div className="text-lg font-medium text-muted-foreground">Loading projects...</div>
          <div className="text-sm text-muted-foreground">Fetching project data and map layers</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">😞</div>
          <div className="text-lg font-medium text-red-600">Unable to load map</div>
          <div className="text-sm text-muted-foreground">
            We're having trouble loading the project data. Please check your connection and try refreshing the page.
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="mt-4"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  const projects = mapData?.projects || [];
  const totalProjects = mapData?.total_projects || 0;
  const projectsWithoutLocation = mapData?.projects_without_location || 0;

  // Normal mode: filter bar on top, map below
  if (!store.state.mapFullscreen) {
    return (
      <div className="flex flex-col h-screen">
        {/* Filter bar - always visible in normal mode */}
        <MapFilters 
          projectCount={projects.length} 
          totalProjects={totalProjects}
          projectsWithoutLocation={projectsWithoutLocation}
        />
        {/* Map container - takes remaining space */}
        <MapErrorBoundary>
          <FullMapContainer 
            projectCount={projects.length}
            totalProjects={totalProjects}
            projectsWithoutLocation={projectsWithoutLocation}
          />
        </MapErrorBoundary>
      </div>
    );
  }

  // Fullscreen mode: true fullscreen map with floating sidebar or minimized filter button
  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Fullscreen map */}
      <div className="absolute inset-0">
        <MapErrorBoundary>
          <FullMapContainer fullscreen={true} />
        </MapErrorBoundary>
      </div>
      
      {/* Minimized filter button - top right corner, positioned to not conflict with map controls */}
      {store.state.filtersMinimized && (
        <div className="absolute top-4 left-4 z-40">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              store.toggleFiltersMinimized();
            }}
            className="h-10 w-10 p-0 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all animate-in fade-in slide-in-from-right-2 duration-300"
            aria-label="Show filters"
            title="Show filters"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Floating sidebar - animated */}
      {!store.state.filtersMinimized && (
        <div className="absolute top-4 left-4 w-96 max-h-[calc(100vh-2rem)] bg-background border border-border rounded-lg shadow-lg flex flex-col z-40 animate-in fade-in slide-in-from-left-2 duration-300">
          {/* Sidebar header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold">Project Map</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                store.toggleFiltersMinimized();
              }}
              className="h-8 w-8 p-0"
              aria-label="Minimize filters"
              title="Minimize filters"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Sidebar content - scrollable */}
          <div className="flex-1 overflow-y-auto">
            <MapFilters 
              projectCount={projects.length} 
              totalProjects={totalProjects}
              projectsWithoutLocation={projectsWithoutLocation}
            />
          </div>
        </div>
      )}
    </div>
  );
});

ProjectMapPage.displayName = "ProjectMapPage";

export default ProjectMapPage;
