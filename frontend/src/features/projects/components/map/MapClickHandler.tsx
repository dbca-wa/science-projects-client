import { useMapEvents } from "react-leaflet";
import { useProjectMapStore } from "@/app/stores/store-context";

interface MapClickHandlerProps {
	onZoomChange: (zoom: number) => void;
}

/**
 * MapClickHandler component
 *
 * Handles map click events to clear marker selection and custom double-click zoom
 */
export const MapClickHandler = ({ onZoomChange }: MapClickHandlerProps) => {
	const store = useProjectMapStore();

	const map = useMapEvents({
		click: () => {
			store.clearMarkerSelection();
		},
		dblclick: (e) => {
			// Check if the double-click originated from a button or control element
			const target = e.originalEvent.target as HTMLElement;

			// Check if click is on a button, control, or their children
			const isOnControl =
				target.closest("button") ||
				target.closest(".leaflet-control") ||
				target.closest('[role="dialog"]') || // Popovers
				target.closest("[data-radix-popper-content-wrapper]"); // Radix popovers

			// Only zoom if NOT on a control
			if (!isOnControl) {
				map.zoomIn();
			}
		},
		zoomend: () => {
			onZoomChange(map.getZoom());
		},
	});

	return null;
};
