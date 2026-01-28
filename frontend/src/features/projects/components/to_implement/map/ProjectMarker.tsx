import { CircleMarker, Popup } from "react-leaflet";
import { renderToString } from "react-dom/server";
import type { IProjectData } from "@/shared/types/project.types";
import { ProjectPopup } from "./ProjectPopup";

interface ProjectMarkerProps {
  projects: IProjectData[];
  position: [number, number];
  isFiltered: boolean;
}

/**
 * ProjectMarker component
 * 
 * Renders a circular marker on the map for one or more projects.
 * - Green color if not filtered
 * - Gray color if filtered
 * - Shows count badge if multiple projects
 * - Displays popup with project details on click
 */
export const ProjectMarker = ({
  projects,
  position,
  isFiltered,
}: ProjectMarkerProps) => {
  const count = projects.length;
  const isCluster = count > 1;

  // Marker styling
  const fillColor = isFiltered ? "#9ca3af" : "#10b981"; // gray-400 : green-500
  const radius = isCluster ? 12 : 8;

  return (
    <CircleMarker
      center={position}
      radius={radius}
      pathOptions={{
        fillColor,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }}
    >
      <Popup maxWidth={400} minWidth={250}>
        <div className="p-2">
          <ProjectPopup projects={projects} />
        </div>
      </Popup>
      
      {/* Count badge for clusters */}
      {isCluster && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#fff",
            fontSize: "10px",
            fontWeight: "bold",
            pointerEvents: "none",
          }}
        >
          {count}
        </div>
      )}
    </CircleMarker>
  );
};
