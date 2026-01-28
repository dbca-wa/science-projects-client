import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
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
 * Renders a pin-shaped marker on the map for one or more projects.
 * - Green color if not filtered
 * - Gray color if filtered
 * - Shows count number on the marker
 * - Displays popup with project details on click
 */
export const ProjectMarker = ({
  projects,
  position,
  isFiltered,
}: ProjectMarkerProps) => {
  const count = projects.length;
  const displayCount = count > 100 ? "100+" : count.toString();

  // Marker styling classes
  const pinBgClass = isFiltered ? "bg-gray-500" : "bg-green-500";
  const textClass = isFiltered ? "text-gray-600" : "text-green-600";

  // Create custom DivIcon for pin-shaped marker
  const icon = L.divIcon({
    className: "bg-transparent border-none",
    html: `
      <div class="relative">
        <div class="
          relative
          w-10 h-10
          transform translate-y-0
          transition-transform duration-200 ease-in-out
          hover:translate-y-1
          cursor-pointer
        ">
          <div class="
            absolute
            w-8 h-8
            rounded-full
            ${pinBgClass}
            left-0
            shadow-md
            z-10
          "></div>
          
          <div class="
            absolute
            w-4 h-4
            ${pinBgClass}
            transform rotate-45
            top-6
            left-2
            shadow-lg
            z-0
          "></div>
          
          <div class="
            absolute
            w-6 h-6
            rounded-full
            bg-white
            top-1
            left-1
            flex items-center justify-center
            text-xs font-bold ${textClass}
            z-20
          ">${displayCount}</div>
        </div>
        
        <div class="
          absolute
          w-4 h-1
          rounded-full
          bg-black
          opacity-20
          bottom-0
          left-2
          blur-xs
        "></div>
      </div>
    `,
    iconSize: [40, 46],
    iconAnchor: [20, 46],
    popupAnchor: [0, -36],
  });

  return (
    <Marker position={position} icon={icon}>
      <Popup maxWidth={400} minWidth={250}>
        <div className="p-2">
          <ProjectPopup projects={projects} />
        </div>
      </Popup>
    </Marker>
  );
};
