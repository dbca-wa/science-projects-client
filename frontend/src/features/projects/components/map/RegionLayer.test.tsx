import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MapContainer } from "react-leaflet";
import { RegionLayer } from "./RegionLayer";

// Mock GeoJSON data
const mockGeoJsonData: GeoJSON.FeatureCollection = {
	type: "FeatureCollection",
	features: [
		{
			type: "Feature",
			properties: {
				DRG_REGION_NAME: "Test Region",
			},
			geometry: {
				type: "Polygon",
				coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
			},
		},
	],
};

// Helper component to wrap RegionLayer in MapContainer
const RegionLayerWrapper = ({ layerType, showColors }: { layerType: string; showColors: boolean }) => (
	<MapContainer center={[0, 0]} zoom={1} style={{ height: "400px", width: "400px" }}>
		<RegionLayer
			layerType={layerType}
			geoJsonData={mockGeoJsonData}
			showColors={showColors}
		/>
	</MapContainer>
);

describe("RegionLayer", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render without crashing", () => {
		expect(() => {
			render(<RegionLayerWrapper layerType="dbcaregion" showColors={true} />);
		}).not.toThrow();
	});

	it("should render with colors enabled", () => {
		const { container } = render(<RegionLayerWrapper layerType="dbcaregion" showColors={true} />);
		expect(container).toBeInTheDocument();
	});

	it("should render with colors disabled", () => {
		const { container } = render(<RegionLayerWrapper layerType="dbcaregion" showColors={false} />);
		expect(container).toBeInTheDocument();
	});

	it("should render different layer types", () => {
		const layerTypes = ["dbcaregion", "dbcadistrict", "nrm", "ibra", "imcra"];
		
		layerTypes.forEach(layerType => {
			expect(() => {
				render(<RegionLayerWrapper layerType={layerType} showColors={true} />);
			}).not.toThrow();
		});
	});

	it("should handle empty GeoJSON data", () => {
		const emptyGeoJson: GeoJSON.FeatureCollection = {
			type: "FeatureCollection",
			features: [],
		};

		expect(() => {
			render(
				<MapContainer center={[0, 0]} zoom={1} style={{ height: "400px", width: "400px" }}>
					<RegionLayer
						layerType="dbcaregion"
						geoJsonData={emptyGeoJson}
						showColors={true}
					/>
				</MapContainer>
			);
		}).not.toThrow();
	});

	it("should handle GeoJSON with different property names", () => {
		const geoJsonWithDifferentProps: GeoJSON.FeatureCollection = {
			type: "FeatureCollection",
			features: [
				{
					type: "Feature",
					properties: {
						NAME: "Test Region with NAME property",
					},
					geometry: {
						type: "Polygon",
						coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
					},
				},
			],
		};

		expect(() => {
			render(
				<MapContainer center={[0, 0]} zoom={1} style={{ height: "400px", width: "400px" }}>
					<RegionLayer
						layerType="nrm"
						geoJsonData={geoJsonWithDifferentProps}
						showColors={false}
					/>
				</MapContainer>
			);
		}).not.toThrow();
	});

	it("should handle GeoJSON without properties", () => {
		const geoJsonWithoutProps: GeoJSON.FeatureCollection = {
			type: "FeatureCollection",
			features: [
				{
					type: "Feature",
					properties: null,
					geometry: {
						type: "Polygon",
						coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
					},
				},
			],
		};

		expect(() => {
			render(
				<MapContainer center={[0, 0]} zoom={1} style={{ height: "400px", width: "400px" }}>
					<RegionLayer
						layerType="ibra"
						geoJsonData={geoJsonWithoutProps}
						showColors={true}
					/>
				</MapContainer>
			);
		}).not.toThrow();
	});
});