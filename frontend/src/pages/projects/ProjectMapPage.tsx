import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { FullMapContainer } from "@/features/projects/components/map/FullMapContainer";
import { MapFilters } from "@/features/projects/components/map/MapFilters";
import { useMapStore } from "@/app/stores/store-context";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { applyCombinedFilters } from "@/features/projects/utils/map-filters";

/**
 * ProjectMapPage - Building incrementally
 * 
 * Progress:
 * 1. Basic page structure ✓
 * 2. Add Leaflet map ✓
 * 3. Add filter bar ✓
 * 4. Add full map with markers, layers, labels ✓
 * 5. Add floating controls button ✓
 */
const ProjectMapPage = observer(() => {
  const store = useMapStore();
  const { data: projectsData, isLoading } = useProjects();

  const projects = useMemo(() => projectsData?.projects || [], [projectsData]);

  // Calculate filtered project count
  const filteredProjectCount = useMemo(() => {
    const { filteredProjects } = applyCombinedFilters(
      projects,
      store.searchTerm,
      store.selectedBusinessAreas
    );
    return filteredProjects.length;
  }, [projects, store.searchTerm, store.selectedBusinessAreas]);

  // Calculate projects without location data
  const projectsWithoutLocation = useMemo(() => {
    return projects.filter(p => !p.areas || p.areas.length === 0).length;
  }, [projects]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading projects...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <MapFilters 
        projectCount={filteredProjectCount} 
        totalProjects={projects.length}
        projectsWithoutLocation={projectsWithoutLocation}
      />
      <FullMapContainer />
    </div>
  );
});

ProjectMapPage.displayName = "ProjectMapPage";

export default ProjectMapPage;
