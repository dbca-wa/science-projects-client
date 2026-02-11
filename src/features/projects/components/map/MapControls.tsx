import { observer } from "mobx-react-lite";
import { ZoomIn, ZoomOut, Maximize, Minimize, RotateCcw } from "lucide-react";
import { useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { LayerPopover } from "./LayerPopover";
import { HeatmapToggle } from "./HeatmapToggle";
import { useProjectMapStore } from "@/app/stores/store-context";
import { mapAnnouncements } from "@/shared/utils/screen-reader.utils";

/**
 * ZoomControls component
 *
 * Zoom controls positioned in the bottom-right corner where Leaflet attribution used to be.
 */
const ZoomControls = observer(() => {
	const map = useMap();

	const handleZoomIn = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		map.zoomIn();
	};

	const handleZoomOut = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		map.zoomOut();
	};

	return (
		<div
			className="absolute bottom-4 right-4 z-30 flex flex-col gap-1"
			onMouseDown={(e) => e.stopPropagation()}
			onMouseMove={(e) => e.stopPropagation()}
			onMouseUp={(e) => e.stopPropagation()}
			onDoubleClick={(e) => {
				e.stopPropagation();
				e.preventDefault();
			}}
		>
			<Button
				variant="outline"
				size="sm"
				onClick={handleZoomIn}
				className="h-8 w-8 p-0 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
				aria-label="Zoom in"
				title="Zoom in"
			>
				<ZoomIn className="h-4 w-4" />
			</Button>
			<Button
				variant="outline"
				size="sm"
				onClick={handleZoomOut}
				className="h-8 w-8 p-0 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
				aria-label="Zoom out"
				title="Zoom out"
			>
				<ZoomOut className="h-4 w-4" />
			</Button>
		</div>
	);
});

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

	const handleMapFullscreen = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		const wasFullscreen = store.state.mapFullscreen;
		store.toggleMapFullscreen();

		// Announce the change after a brief delay to ensure state has updated
		setTimeout(() => {
			mapAnnouncements.fullscreenToggle(!wasFullscreen);
		}, 100);
	};

	const handleResetView = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		// Reset to Western Australia view
		map.setView([-25.2744, 122.2402], 6);
		mapAnnouncements.viewReset();
	};

	return (
		<div
			className="absolute top-4 right-4 z-30 flex flex-col gap-2"
			onMouseDown={(e) => e.stopPropagation()}
			onMouseMove={(e) => e.stopPropagation()}
			onMouseUp={(e) => e.stopPropagation()}
			onDoubleClick={(e) => {
				e.stopPropagation();
				e.preventDefault();
			}}
		>
			{/* Map Actions - Fullscreen and Reset in same row, matching layers button width */}
			<div className="flex gap-1">
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
				<Button
					variant="outline"
					size="sm"
					onClick={handleMapFullscreen}
					className={`flex-1 h-8 p-0 shadow-lg hover:shadow-xl transition-all ${
						isMapFullscreen
							? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-900/80 dark:border-blue-700 dark:text-blue-200 dark:hover:bg-blue-800 dark:hover:border-blue-600"
							: "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
					}`}
					aria-label={
						isMapFullscreen ? "Exit map fullscreen" : "Enter map fullscreen"
					}
					title={
						isMapFullscreen ? "Exit map fullscreen" : "Enter map fullscreen"
					}
				>
					{isMapFullscreen ? (
						<Minimize className="h-4 w-4" />
					) : (
						<Maximize className="h-4 w-4" />
					)}
				</Button>
			</div>

			{/* Heatmap Toggle - Full width button */}
			<HeatmapToggle />

			{/* Layer Controls - Hidden on small screens unless fullscreen */}
			<div className={isMapFullscreen ? "" : "hidden sm:block"}>
				<LayerPopover />
			</div>
		</div>
	);
});

/**
 * MapControls component
 *
 * Floating action buttons positioned in the top-right corner of the map.
 * Provides map interaction controls and layer management.
 * Zoom controls are positioned in the bottom-right corner.
 *
 * Features:
 * - Map fullscreen toggle (not browser fullscreen)
 * - Reset view button (fit all markers)
 * - Layer controls via LayerPopover
 * - Zoom in/out buttons (bottom-right corner)
 * - Proper ARIA labels and keyboard support
 *
 * Note: This component must be rendered inside a MapContainer to access the map instance.
 */
export const MapControls = observer(() => {
	return (
		<>
			<MapControlButtons />
			<ZoomControls />
		</>
	);
});
