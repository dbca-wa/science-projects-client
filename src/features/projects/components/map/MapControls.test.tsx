import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MapContainer } from "react-leaflet";
import { MapControls } from "./MapControls";

// Mock the LayerPopover component
vi.mock("./LayerPopover", () => ({
	LayerPopover: () => <div data-testid="layer-popover">Layer Popover</div>,
}));

// Mock the store context
const mockStore = {
	state: {
		visibleLayerTypes: ["dbcaregion"],
		showLabels: true,
		showColors: true,
		mapFullscreen: false,
	},
	toggleMapFullscreen: vi.fn(),
};

vi.mock("@/app/stores/store-context", () => ({
	useProjectMapStore: () => mockStore,
}));

// Helper component to wrap MapControls in MapContainer
const MapControlsWrapper = () => (
	<MapContainer
		center={[0, 0]}
		zoom={1}
		style={{ height: "400px", width: "400px" }}
		zoomControl={false} // Disable default zoom controls
	>
		<MapControls />
	</MapContainer>
);

describe("MapControls", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset mock store state
		mockStore.state.mapFullscreen = false;
	});

	it("should render all control buttons", () => {
		render(<MapControlsWrapper />);

		expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
		expect(screen.getByLabelText("Zoom out")).toBeInTheDocument();
		expect(screen.getByLabelText("Enter map fullscreen")).toBeInTheDocument();
		expect(screen.getByLabelText("Reset map view")).toBeInTheDocument();
		expect(screen.getByTestId("layer-popover")).toBeInTheDocument();
	});

	it("should have proper button titles", () => {
		render(<MapControlsWrapper />);

		expect(screen.getByTitle("Zoom in")).toBeInTheDocument();
		expect(screen.getByTitle("Zoom out")).toBeInTheDocument();
		expect(screen.getByTitle("Enter map fullscreen")).toBeInTheDocument();
		expect(
			screen.getByTitle("Reset to Western Australia view")
		).toBeInTheDocument();
	});

	it("should handle map fullscreen toggle", () => {
		render(<MapControlsWrapper />);

		const fullscreenButton = screen.getByLabelText("Enter map fullscreen");
		fireEvent.click(fullscreenButton);

		expect(mockStore.toggleMapFullscreen).toHaveBeenCalled();
	});

	it("should show correct fullscreen button state when not in fullscreen", () => {
		mockStore.state.mapFullscreen = false;
		render(<MapControlsWrapper />);

		expect(screen.getByLabelText("Enter map fullscreen")).toBeInTheDocument();
		expect(screen.getByTitle("Enter map fullscreen")).toBeInTheDocument();
	});

	it("should show correct fullscreen button state when in fullscreen", () => {
		mockStore.state.mapFullscreen = true;
		render(<MapControlsWrapper />);

		expect(screen.getByLabelText("Exit map fullscreen")).toBeInTheDocument();
		expect(screen.getByTitle("Exit map fullscreen")).toBeInTheDocument();
	});

	it("should render LayerPopover component", () => {
		render(<MapControlsWrapper />);

		expect(screen.getByTestId("layer-popover")).toBeInTheDocument();
	});

	it("should have proper styling classes", () => {
		render(<MapControlsWrapper />);

		// Check top-right controls
		const topControls = document.querySelector(".absolute.top-4.right-4");
		expect(topControls).toBeInTheDocument();

		const fullscreenButton = topControls?.querySelector(
			'button[title="Enter map fullscreen"]'
		);
		const resetButton = topControls?.querySelector(
			'button[title="Reset to Western Australia view"]'
		);

		// Check that top buttons have proper styling (flex-1 h-8 for matching layers button width)
		expect(fullscreenButton).toHaveClass("flex-1", "h-8", "p-0");
		expect(resetButton).toHaveClass("flex-1", "h-8", "p-0");

		// Check top-left zoom controls (positioned next to MapStats)
		const zoomControls = document.querySelector(
			".absolute.top-4.z-30.flex.gap-1"
		);
		expect(zoomControls).toBeInTheDocument();

		const zoomInButton = zoomControls?.querySelector('button[title="Zoom in"]');
		const zoomOutButton = zoomControls?.querySelector(
			'button[title="Zoom out"]'
		);

		// Check that zoom buttons have proper styling (h-8 w-8 for square buttons)
		expect(zoomInButton).toHaveClass("h-8", "w-8", "p-0");
		expect(zoomOutButton).toHaveClass("h-8", "w-8", "p-0");
	});

	it("should have proper accessibility attributes", () => {
		render(<MapControlsWrapper />);

		// Check top-right controls
		const topControls = document.querySelector(".absolute.top-4.right-4");
		expect(topControls).toBeInTheDocument();

		const fullscreenButton = topControls?.querySelector(
			'button[title="Enter map fullscreen"]'
		);
		const resetButton = topControls?.querySelector(
			'button[title="Reset to Western Australia view"]'
		);

		expect(fullscreenButton).toHaveAttribute(
			"aria-label",
			"Enter map fullscreen"
		);
		expect(resetButton).toHaveAttribute("aria-label", "Reset map view");

		// Check top-left zoom controls (positioned next to MapStats)
		const zoomControls = document.querySelector(
			".absolute.top-4.z-30.flex.gap-1"
		);
		expect(zoomControls).toBeInTheDocument();

		const zoomInButton = zoomControls?.querySelector('button[title="Zoom in"]');
		const zoomOutButton = zoomControls?.querySelector(
			'button[title="Zoom out"]'
		);

		expect(zoomInButton).toHaveAttribute("aria-label", "Zoom in");
		expect(zoomOutButton).toHaveAttribute("aria-label", "Zoom out");
	});
});
