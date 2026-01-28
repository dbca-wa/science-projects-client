import { observer } from "mobx-react-lite";
import { useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import type { IProjectData } from "@/shared/types/project.types";
import { ProjectPopup } from "./ProjectPopup";
import { createProjectMarker } from "@/features/projects/utils/marker-creation";
import { useProjectMapStore } from "@/app/stores/store-context";

interface ProjectMarkerProps {
  projects: IProjectData[];
  position: [number, number];
}

/**
 * ProjectMarker component
 * 
 * Renders a modern circular marker on the map for one or more projects.
 * - Uses density-based colors (blue, green, amber, red) for selected markers
 * - Uses muted colors for unselected markers
 * - Shows count number on the marker
 * - Hover animations with scale effect
 * - Drop shadow for depth
 * - Displays popup with project details on click
 * - Accessible with proper ARIA labels
 * - Handles marker selection state for visual feedback
 */
export const ProjectMarker = observer(({
  projects,
  position,
}: ProjectMarkerProps) => {
  const store = useProjectMapStore();
  const popupRef = useRef<L.Popup>(null);
  
  // Determine if this marker is selected
  const isSelected = store.isMarkerSelected(position);
  
  // If no marker is selected, all markers show as selected (vibrant colors)
  // If a marker is selected, only that marker shows as selected, others are muted
  const shouldShowAsSelected = store.state.selectedMarkerCoords === null || isSelected;
  
  // Create the circular marker using the utility function
  const marker = createProjectMarker(projects, position, shouldShowAsSelected);
  const icon = marker.getIcon();

  // Handle marker click for selection
  const handleMarkerClick = () => {
    store.selectMarker(position);
  };

  // Handle popup close
  const handlePopupClose = () => {
    if (popupRef.current) {
      popupRef.current.close();
    }
  };

  return (
    <Marker 
      position={position} 
      icon={icon}
      zIndexOffset={shouldShowAsSelected ? 1000 : 0}  // Set z-index on React Leaflet marker
      eventHandlers={{
        click: handleMarkerClick,
      }}
    >
      <Popup 
        ref={popupRef}
        maxWidth={300} 
        minWidth={250}
        closeButton={true}
        closeOnEscapeKey={true}
      >
        <div className="p-2">
          <ProjectPopup projects={projects} onClose={handlePopupClose} />
        </div>
      </Popup>
    </Marker>
  );
});
