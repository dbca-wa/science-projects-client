import { observer } from "mobx-react-lite";
import { ZoomIn, ZoomOut, Maximize, Minimize, RotateCcw } from "lucide-react";
import { useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { LayerPopover } from "./LayerPopover";
import { useProjectMapStore } from "@/app/stores/store-context";

/**
 * MapControlButtons component
 * 
 * Internal component that uses useMap hook to access the Leaflet map instance.
 * Must be rendered inside a MapContainer.
 */
const MapControlButtons = observer(() => {
	const map = useMap();
	const store = useProjectMapStore();
	const [isMapFullscreen, setIsMapFullscreen] = useState(false);

	// Listen for fullscreen changes
	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsMapFullscreen(store.state.mapFullscreen || false);
		};

		// Listen to store changes for map fullscreen state
		handleFullscreenChange();
	}, [store.state.mapFullscreen]);

	const handleZoomIn = () => {
		map.zoomIn();
	};

	const handleZoomOut = () => {
		map.zoomOut();
	};

	const handleMapFullscreen = () => {
		store.toggleMapFullscreen();
	};

	const handleResetView = () => {
		// Reset to Western Australia view
		map.setView([-25.2744, 122.2402], 6);
	};

	return (
		<div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
			{/* Layer Controls - Top */}
			<LayerPopover />

			{/* Zoom Controls - Individual buttons in same row, matching layers button width */}
			<div className="flex gap-1">
				<Button
					variant="outline"
					size="sm"
					onClick={handleZoomIn}
					className="flex-1 h-8 p-0 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
					aria-label="Zoom in"
					title="Zoom in"
				>
					<ZoomIn className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={handleZoomOut}
					className="flex-1 h-8 p-0 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
					aria-label="Zoom out"
					title="Zoom out"
				>
					<ZoomOut className="h-4 w-4" />
				</Button>
			</div>

			{/* Map Actions - Fullscreen and Reset in same row, matching layers button width */}
			<div className="flex gap-1">
				<Button
					variant="outline"
					size="sm"
					onClick={handleMapFullscreen}
					className={`flex-1 h-8 p-0 shadow-lg hover:shadow-xl transition-all ${
						isMapFullscreen 
							? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-950/50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:border-blue-800' 
							: 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
					}`}
					aria-label={isMapFullscreen ? "Exit map fullscreen" : "Enter map fullscreen"}
					title={isMapFullscreen ? "Exit map fullscreen" : "Enter map fullscreen"}
				>
					{isMapFullscreen ? (
						<Minimize className="h-4 w-4" />
					) : (
						<Maximize className="h-4 w-4" />
					)}
				</Button>
				
				<Button
					variant="outline"
					size="sm"
					onClick={handleResetView}
					className="flex-1 h-8 p-0 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
					aria-label="Reset map view"
					title="Reset to Western Australia view"
				>
					<RotateCcw className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
});

/**
 * MapControls component
 * 
 * Floating action buttons positioned in the top-right corner of the map.
 * Provides map interaction controls and layer management.
 * 
 * Features:
 * - Zoom in/out buttons (properly grouped)
 * - Map fullscreen toggle (not browser fullscreen)
 * - Reset view button (fit all markers)
 * - Layer controls via LayerPopover
 * - Proper ARIA labels and keyboard support
 * 
 * Note: This component must be rendered inside a MapContainer to access the map instance.
 */
export const MapControls = observer(() => {
	return <MapControlButtons />;
});
