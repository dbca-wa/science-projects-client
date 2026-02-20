import { observer } from "mobx-react-lite";
import { Activity, MapPin } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useProjectMapStore } from "@/app/stores/store-context";
import { announceToScreenReader } from "@/shared/utils/screen-reader.utils";

/**
 * HeatmapToggle component
 *
 * Toggle button for switching between marker and heatmap visualization modes.
 *
 * Features:
 * - Shows "Show Heatmap" with Activity icon when in marker mode
 * - Shows "Show Markers" with MapPin icon when in heatmap mode
 * - Styled consistently with existing MapControls buttons
 * - Proper ARIA labels for accessibility
 * - MobX observer for reactive updates
 *
 * Requirements: 1.1, 1.2, 1.3, 1.5, 1.6
 */
export const HeatmapToggle = observer(() => {
	const store = useProjectMapStore();

	const handleToggle = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		const wasHeatmapMode = store.isHeatmapMode;
		store.toggleVisualizationMode();

		// Announce the mode change to screen readers
		setTimeout(() => {
			if (wasHeatmapMode) {
				announceToScreenReader(
					"Switched to marker view. Individual project markers are now displayed."
				);
			} else {
				announceToScreenReader(
					"Switched to heatmap view. Project density visualization is now displayed."
				);
			}
		}, 100);
	};

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={handleToggle}
			onMouseDown={(e) => e.stopPropagation()}
			onMouseMove={(e) => e.stopPropagation()}
			onMouseUp={(e) => e.stopPropagation()}
			onDoubleClick={(e) => {
				e.stopPropagation();
				e.preventDefault();
			}}
			className="flex items-center gap-2 h-8 px-3 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
			aria-label={
				store.isHeatmapMode ? "Switch to marker view" : "Switch to heatmap view"
			}
			title={store.isHeatmapMode ? "Toggle Markers" : "Toggle Heatmap"}
		>
			{store.isHeatmapMode ? (
				<>
					<MapPin className="h-4 w-4" />
					<span className="text-xs font-medium">Markers</span>
				</>
			) : (
				<>
					<Activity className="h-4 w-4" />
					<span className="text-xs font-medium">Heatmap</span>
				</>
			)}
		</Button>
	);
});
