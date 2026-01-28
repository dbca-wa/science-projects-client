import { useMap } from "react-leaflet";
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface MapControlsProps {
	onResetView?: () => void;
}

/**
 * MapControls component
 * 
 * Map control buttons positioned in top-right corner.
 * - Zoom in/out
 * - Reset view (fit all markers)
 * - Fullscreen toggle
 */
export function MapControls({ onResetView }: MapControlsProps) {
	const map = useMap();

	const handleZoomIn = () => {
		map.zoomIn();
	};

	const handleZoomOut = () => {
		map.zoomOut();
	};

	const handleFullscreen = () => {
		const container = map.getContainer();
		if (!document.fullscreenElement) {
			container.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	};

	const handleReset = () => {
		if (onResetView) {
			onResetView();
		} else {
			// Default: reset to initial view
			map.setView([-25.2744, 122.2402], 5);
		}
	};

	return (
		<div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
			<Button
				variant="outline"
				size="icon"
				onClick={handleZoomIn}
				className="bg-background shadow-md"
				aria-label="Zoom in"
			>
				<ZoomIn className="h-4 w-4" />
			</Button>

			<Button
				variant="outline"
				size="icon"
				onClick={handleZoomOut}
				className="bg-background shadow-md"
				aria-label="Zoom out"
			>
				<ZoomOut className="h-4 w-4" />
			</Button>

			<Button
				variant="outline"
				size="icon"
				onClick={handleReset}
				className="bg-background shadow-md"
				aria-label="Reset view"
			>
				<RotateCcw className="h-4 w-4" />
			</Button>

			<Button
				variant="outline"
				size="icon"
				onClick={handleFullscreen}
				className="bg-background shadow-md"
				aria-label="Toggle fullscreen"
			>
				<Maximize className="h-4 w-4" />
			</Button>
		</div>
	);
}
