import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { FullMapContainer } from "@/features/projects/components/map/FullMapContainer";
import { MapFilters } from "@/features/projects/components/map/MapFilters";
import { useProjectMapStore } from "@/app/stores/store-context";
import { useProjectsForMap } from "@/features/projects/hooks/useProjectsForMap";
import { useSearchStoreInit } from "@/shared/hooks/useSearchStoreInit";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

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
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize from URL params and localStorage
  // TypeScript infers TFilters from projectMapStore
  useSearchStoreInit({
    store,
    storageKey: "projectMapState",
    urlParamMapping: {
      businessAreas: (v) => v.split(',').map(Number).filter(n => !isNaN(n)),
      user: (v) => Number(v),
      search: (v) => v,
    },
  });

  // Sync store state to URL params
  useEffect(() => {
    // Use computed property that MobX can properly track, with fallback
    const businessAreasArray = store.selectedBusinessAreasArray || store.state.selectedBusinessAreas || [];
    
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

    // Update URL params
    setSearchParams(params, { replace: true });
  }, [
    store.state.searchTerm,
    store.selectedBusinessAreasArray || store.state.selectedBusinessAreas,
    store.state.filterUser,
    setSearchParams,
  ]);
  
  // Get filtered projects and statistics from single API call
  const { data: mapData, isLoading, error } = useProjectsForMap(store.apiParams);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading projects...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-red-600">Error loading map</div>
          <div className="text-sm text-muted-foreground mt-2">
            Please try refreshing the page. If the problem persists, contact support.
          </div>
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
        <FullMapContainer 
          projectCount={projects.length}
          totalProjects={totalProjects}
          projectsWithoutLocation={projectsWithoutLocation}
        />
      </div>
    );
  }

  // Fullscreen mode: true fullscreen map with floating sidebar
  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Fullscreen map */}
      <div className="absolute inset-0">
        <FullMapContainer fullscreen={true} />
      </div>
      
      {/* Floating sidebar */}
      <div className="absolute top-4 left-4 w-96 max-h-[calc(100vh-2rem)] bg-background border border-border rounded-lg shadow-lg flex flex-col z-40">
        {/* Sidebar header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">Project Map</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => store.toggleMapFullscreen()}
            className="h-8 w-8 p-0"
            aria-label="Exit map fullscreen"
          >
            <X className="h-4 w-4" />
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
    </div>
  );
});

ProjectMapPage.displayName = "ProjectMapPage";

export default ProjectMapPage;
