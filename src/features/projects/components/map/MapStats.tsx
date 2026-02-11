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
export const MapStats = observer(
	({ projectCount, totalProjects, projectsWithoutLocation }: MapStatsProps) => {
		return (
			<div className="absolute top-4 left-4 z-30 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-muted-foreground backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 max-w-[calc(100vw-8rem)]">
				<div className="whitespace-nowrap">
					<span className="font-medium text-foreground">{projectCount}</span>
					{" / "}
					<span className="font-medium text-foreground">{totalProjects}</span>
				</div>
				{projectsWithoutLocation > 0 && (
					<div className="text-[10px] sm:text-xs mt-0.5 sm:mt-1">
						{projectsWithoutLocation} lack location
					</div>
				)}
			</div>
		);
	}
);
