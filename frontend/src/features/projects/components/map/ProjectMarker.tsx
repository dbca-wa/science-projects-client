import { observer } from "mobx-react-lite";
import { useRef, memo, useState } from "react";
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
 * - Hover animations with scale effect and elevated z-index
 * - Drop shadow for depth
 * - Displays popup with project details on click
 * - Accessible with proper ARIA labels
 * - Handles marker selection state for visual feedback
 * - Hovered markers get highest z-index (2000), selected markers get medium z-index (1000)
 * - Optimized with React.memo to prevent unnecessary re-renders
 */
const ProjectMarkerComponent = observer(({
  projects,
  position,
}: ProjectMarkerProps) => {
  const store = useProjectMapStore();
  const popupRef = useRef<L.Popup>(null);
  const [isHovered, setIsHovered] = useState(false);
  
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

  // Handle mouse enter
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Calculate z-index: hovered markers get highest priority, then selected, then normal
  const getZIndexOffset = () => {
    if (isHovered) return 2000; // Highest priority for hovered markers
    if (shouldShowAsSelected) return 1000; // Selected markers
    return 0; // Normal markers
  };

  return (
    <Marker 
      position={position} 
      icon={icon}
      zIndexOffset={getZIndexOffset()}  // Dynamic z-index based on hover and selection state
      eventHandlers={{
        click: handleMarkerClick,
        mouseover: handleMouseEnter,
        mouseout: handleMouseLeave,
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

// Memoize the component to prevent unnecessary re-renders
// Only re-render when projects, position, or selection state changes
export const ProjectMarker = memo(ProjectMarkerComponent, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.projects.length === nextProps.projects.length &&
    prevProps.projects.every((project, index) => 
      project.id === nextProps.projects[index]?.id
    ) &&
    prevProps.position[0] === nextProps.position[0] &&
    prevProps.position[1] === nextProps.position[1]
  );
});
