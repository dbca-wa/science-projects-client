import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapControls } from "./MapControls";

/**
 * BasicMap - Step 2: Add Leaflet map
 *
 * Simple map centered on Western Australia with floating controls
 */
export function BasicMap() {
	return (
		<div className="flex-1 relative">
			<MapContainer
				center={[-25.2744, 122.2402]}
				zoom={6}
				style={{ height: "100%", width: "100%" }}
				doubleClickZoom={false}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
			</MapContainer>

			{/* Floating controls button */}
			<MapControls />
		</div>
	);
}
