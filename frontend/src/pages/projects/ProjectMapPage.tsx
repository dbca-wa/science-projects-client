import { observer } from "mobx-react-lite";
import { FullMapContainer } from "@/features/projects/components/map/FullMapContainer";
import { MapFilters } from "@/features/projects/components/map/MapFilters";
import { useProjectMapStore } from "@/app/stores/store-context";
import { useProjectsForMap } from "@/features/projects/hooks/useProjectsForMap";

/**
 * ProjectMapPage - Complete implementation
 * 
 * Features:
 * - Interactive Leaflet map with Western Australia focus
 * - Modern circular markers (no traditional pins)
 * - Comprehensive filtering (search, business areas, users)
 * - Responsive sidebar with mobile overlay
 * - GeoJSON layer management with popover controls
 * - Accessibility and keyboard navigation
 */
const ProjectMapPage = observer(() => {
  const store = useProjectMapStore();
  
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

  return (
    <div className="flex flex-col h-screen">
      <MapFilters 
        projectCount={projects.length} 
        totalProjects={totalProjects}
        projectsWithoutLocation={projectsWithoutLocation}
      />
      <FullMapContainer />
    </div>
  );
});

ProjectMapPage.displayName = "ProjectMapPage";

export default ProjectMapPage;
