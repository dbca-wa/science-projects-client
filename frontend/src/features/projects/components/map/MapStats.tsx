import { observer } from "mobx-react-lite";

interface MapStatsProps {
  projectCount: number;
  totalProjects: number;
  projectsWithoutLocation: number;
}

/**
 * MapStats - Project statistics overlay for the map
 * 
 * Positioned as a floating overlay in the bottom-left corner of the map
 * Only shown in normal (non-fullscreen) mode
 */
export const MapStats = observer(({ 
  projectCount, 
  totalProjects,
  projectsWithoutLocation 
}: MapStatsProps) => {
  return (
    <div className="absolute top-4 left-4 z-30 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2 text-sm text-muted-foreground backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
      <div>
        <span className="font-medium text-foreground">{projectCount}</span> of{" "}
        <span className="font-medium text-foreground">{totalProjects}</span> projects shown
      </div>
      {projectsWithoutLocation > 0 && (
        <div className="text-xs mt-1">
          {projectsWithoutLocation} project{projectsWithoutLocation !== 1 ? "s" : ""} lack location data
        </div>
      )}
    </div>
  );
});