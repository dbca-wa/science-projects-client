import { useRef } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ProjectMapMarkers } from "./ProjectMapMarkers";
import { GeoJSONLayer } from "./GeoJSONLayer";
import { MapControls } from "./MapControls";
import type { IProjectData } from "@/shared/types/project.types";
import type { GeoJSONData, ISimpleLocationData } from "@/features/projects/types/map.types";

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
	iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
	shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface ProjectMapProps {
	projects: IProjectData[];
	locationMetadata: ISimpleLocationData[];
	geoJsonData: GeoJSONData;
	selectedBusinessAreas: number[];
	visibleLayerTypes: string[];
	showLabels: boolean;
	showColors: boolean;
}

/**
 * ProjectMap component
 * 
 * Main Leaflet map container with markers and GeoJSON layers.
 */
export function ProjectMap({
	projects,
	locationMetadata,
	geoJsonData,
	selectedBusinessAreas,
	visibleLayerTypes,
	showLabels,
	showColors,
}: ProjectMapProps) {
	const mapRef = useRef<L.Map | null>(null);

	// Center on Western Australia
	const center: [number, number] = [-25.2744, 122.2402];
	const zoom = 5;

	return (
		<div className="h-full w-full">
			<MapContainer
				center={center}
				zoom={zoom}
				minZoom={3}
				maxZoom={18}
				zoomControl={false}
				attributionControl={false}
				className="h-full w-full"
				ref={mapRef}
			>
				<TileLayer
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				/>

				<ProjectMapMarkers
					projects={projects}
					locationMetadata={locationMetadata}
					geoJsonData={geoJsonData}
					selectedBusinessAreas={selectedBusinessAreas}
				/>

				<MapControls />

				{geoJsonData.dbcaRegions && (
					<GeoJSONLayer
						data={geoJsonData.dbcaRegions}
						visible={visibleLayerTypes.includes("dbcaregion")}
						showLabels={showLabels}
						showColors={showColors}
						color="#3b82f6"
						layerName="DBCA Regions"
					/>
				)}

				{geoJsonData.dbcaDistricts && (
					<GeoJSONLayer
						data={geoJsonData.dbcaDistricts}
						visible={visibleLayerTypes.includes("dbcadistrict")}
						showLabels={showLabels}
						showColors={showColors}
						color="#10b981"
						layerName="DBCA Districts"
					/>
				)}

				{geoJsonData.nrm && (
					<GeoJSONLayer
						data={geoJsonData.nrm}
						visible={visibleLayerTypes.includes("nrm")}
						showLabels={showLabels}
						showColors={showColors}
						color="#f59e0b"
						layerName="NRM Regions"
					/>
				)}

				{geoJsonData.ibra && (
					<GeoJSONLayer
						data={geoJsonData.ibra}
						visible={visibleLayerTypes.includes("ibra")}
						showLabels={showLabels}
						showColors={showColors}
						color="#8b5cf6"
						layerName="IBRA Regions"
					/>
				)}

				{geoJsonData.imcra && (
					<GeoJSONLayer
						data={geoJsonData.imcra}
						visible={visibleLayerTypes.includes("imcra")}
						showLabels={showLabels}
						showColors={showColors}
						color="#ef4444"
						layerName="IMCRA Regions"
					/>
				)}
			</MapContainer>
		</div>
	);
}
