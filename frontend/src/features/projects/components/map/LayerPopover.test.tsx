import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LayerPopover } from "./LayerPopover";

// Mock the store context
const mockStore = {
	state: {
		visibleLayerTypes: ["dbcaregion"],
		showLabels: true,
		showColors: true,
	},
	showLayer: vi.fn(),
	hideLayer: vi.fn(),
	showAllLayers: vi.fn(),
	hideAllLayers: vi.fn(),
	toggleLabels: vi.fn(),
	toggleColors: vi.fn(),
};

vi.mock("@/app/stores/store-context", () => ({
	useProjectMapStore: () => mockStore,
}));

describe("LayerPopover", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockStore.state = {
			visibleLayerTypes: ["dbcaregion"],
			showLabels: true,
			showColors: true,
		};
	});

	it("should render layer controls trigger button", () => {
		render(<LayerPopover />);

		const trigger = screen.getByRole("button", { name: /adjust layers/i });
		expect(trigger).toBeInTheDocument();
		expect(trigger).toHaveTextContent("Layers");
	});

	it("should open popover when trigger is clicked", async () => {
		render(<LayerPopover />);

		const trigger = screen.getByRole("button", { name: /adjust layers/i });
		fireEvent.click(trigger);

		await waitFor(() => {
			expect(screen.getByText("Map Layers")).toBeInTheDocument();
		});
	});

	it("should render all layer checkboxes", async () => {
		render(<LayerPopover />);

		const trigger = screen.getByRole("button", { name: /adjust layers/i });
		fireEvent.click(trigger);

		await waitFor(() => {
			expect(screen.getByLabelText("DBCA Regions")).toBeInTheDocument();
			expect(screen.getByLabelText("DBCA Districts")).toBeInTheDocument();
			expect(screen.getByLabelText("NRM Regions")).toBeInTheDocument();
			expect(screen.getByLabelText("IBRA Bioregions")).toBeInTheDocument();
			expect(screen.getByLabelText("IMCRA Marine Regions")).toBeInTheDocument();
		});
	});

	it("should show correct layer states", async () => {
		render(<LayerPopover />);

		const trigger = screen.getByRole("button", { name: /adjust layers/i });
		fireEvent.click(trigger);

		await waitFor(() => {
			const dbcaRegionsCheckbox = screen.getByLabelText("DBCA Regions");
			const dbcaDistrictsCheckbox = screen.getByLabelText("DBCA Districts");

			expect(dbcaRegionsCheckbox).toBeChecked();
			expect(dbcaDistrictsCheckbox).not.toBeChecked();
		});
	});

	it("should handle layer toggle", async () => {
		render(<LayerPopover />);

		const trigger = screen.getByRole("button", { name: /adjust layers/i });
		fireEvent.click(trigger);

		await waitFor(() => {
			const dbcaDistrictsCheckbox = screen.getByLabelText("DBCA Districts");
			fireEvent.click(dbcaDistrictsCheckbox);
		});

		expect(mockStore.showLayer).toHaveBeenCalledWith("dbcadistrict");
	});

	it("should handle layer untoggle", async () => {
		mockStore.state.visibleLayerTypes = ["dbcaregion", "dbcadistrict"];

		render(<LayerPopover />);

		const trigger = screen.getByRole("button", { name: /adjust layers/i });
		fireEvent.click(trigger);

		await waitFor(() => {
			const dbcaRegionsCheckbox = screen.getByLabelText("DBCA Regions");
			fireEvent.click(dbcaRegionsCheckbox);
		});

		expect(mockStore.hideLayer).toHaveBeenCalledWith("dbcaregion");
	});

	it("should render Show All and Hide All buttons", async () => {
		render(<LayerPopover />);

		const trigger = screen.getByRole("button", { name: /adjust layers/i });
		fireEvent.click(trigger);

		await waitFor(() => {
			expect(screen.getByText("Show All")).toBeInTheDocument();
			expect(screen.getByText("Hide All")).toBeInTheDocument();
		});
	});

	it("should handle Show All button click", async () => {
		render(<LayerPopover />);

		const trigger = screen.getByRole("button", { name: /adjust layers/i });
		fireEvent.click(trigger);

		await waitFor(() => {
			const showAllButton = screen.getByText("Show All");
			fireEvent.click(showAllButton);
		});

		expect(mockStore.showAllLayers).toHaveBeenCalled();
	});

	it("should handle Hide All button click", async () => {
		render(<LayerPopover />);

		const trigger = screen.getByRole("button", { name: /adjust layers/i });
		fireEvent.click(trigger);

		await waitFor(() => {
			const hideAllButton = screen.getByText("Hide All");
			fireEvent.click(hideAllButton);
		});

		expect(mockStore.hideAllLayers).toHaveBeenCalled();
	});

	it("should disable Show All when all layers are visible", async () => {
		mockStore.state.visibleLayerTypes = [
			"dbcaregion",
			"dbcadistrict",
			"nrm",
			"ibra",
			"imcra",
		];

		render(<LayerPopover />);

		const trigger = screen.getByRole("button", { name: /adjust layers/i });
		fireEvent.click(trigger);

		await waitFor(() => {
			const showAllButton = screen.getByText("Show All");
			expect(showAllButton).toBeDisabled();
		});
	});

	it("should disable Hide All when no layers are visible", async () => {
		mockStore.state.visibleLayerTypes = [];

		render(<LayerPopover />);

		const trigger = screen.getByRole("button", { name: /adjust layers/i });
		fireEvent.click(trigger);

		await waitFor(() => {
			const hideAllButton = screen.getByText("Hide All");
			expect(hideAllButton).toBeDisabled();
		});
	});

	it("should render display options", async () => {
		render(<LayerPopover />);

		const trigger = screen.getByRole("button", { name: /adjust layers/i });
		fireEvent.click(trigger);

		await waitFor(() => {
			expect(screen.getByText("Display Options")).toBeInTheDocument();
			expect(screen.getByLabelText("Show Labels")).toBeInTheDocument();
			expect(screen.getByLabelText("Show Colors")).toBeInTheDocument();
		});
	});

	it("should handle Show Labels toggle", async () => {
		render(<LayerPopover />);

		const trigger = screen.getByRole("button", { name: /adjust layers/i });
		fireEvent.click(trigger);

		await waitFor(() => {
			const labelsSwitch = screen.getByLabelText("Show Labels");
			fireEvent.click(labelsSwitch);
		});

		expect(mockStore.toggleLabels).toHaveBeenCalled();
	});

	it("should handle Show Colors toggle", async () => {
		render(<LayerPopover />);

		const trigger = screen.getByRole("button", { name: /adjust layers/i });
		fireEvent.click(trigger);

		await waitFor(() => {
			const colorsSwitch = screen.getByLabelText("Show Colors");
			fireEvent.click(colorsSwitch);
		});

		expect(mockStore.toggleColors).toHaveBeenCalled();
	});

	it("should show correct switch states", async () => {
		mockStore.state.showLabels = false;
		mockStore.state.showColors = true;

		render(<LayerPopover />);

		const trigger = screen.getByRole("button", { name: /adjust layers/i });
		fireEvent.click(trigger);

		await waitFor(() => {
			const labelsSwitch = screen.getByLabelText("Show Labels");
			const colorsSwitch = screen.getByLabelText("Show Colors");

			expect(labelsSwitch).not.toBeChecked();
			expect(colorsSwitch).toBeChecked();
		});
	});

	it("should display layer count", async () => {
		mockStore.state.visibleLayerTypes = ["dbcaregion", "nrm"];

		render(<LayerPopover />);

		const trigger = screen.getByRole("button", { name: /adjust layers/i });
		fireEvent.click(trigger);

		await waitFor(() => {
			expect(screen.getByText("2 of 5 layers visible")).toBeInTheDocument();
		});
	});

	it("should render layer descriptions", async () => {
		render(<LayerPopover />);

		const trigger = screen.getByRole("button", { name: /adjust layers/i });
		fireEvent.click(trigger);

		await waitFor(() => {
			expect(
				screen.getByText(
					/Department of Biodiversity, Conservation and Attractions/
				)
			).toBeInTheDocument();
			expect(
				screen.getByText(/Natural Resource Management regions/)
			).toBeInTheDocument();
		});
	});

	it("should render color indicators", async () => {
		render(<LayerPopover />);

		const trigger = screen.getByRole("button", { name: /adjust layers/i });
		fireEvent.click(trigger);

		await waitFor(() => {
			// Check that color indicators are present by looking for divs with specific styling
			const colorIndicators = document.querySelectorAll(
				'[style*="background-color"]'
			);
			expect(colorIndicators.length).toBeGreaterThan(0);
		});
	});

	it("should have proper accessibility attributes", async () => {
		render(<LayerPopover />);

		const trigger = screen.getByRole("button", { name: /adjust layers/i });
		fireEvent.click(trigger);

		await waitFor(() => {
			const dbcaRegionsCheckbox = screen.getByLabelText("DBCA Regions");
			expect(dbcaRegionsCheckbox).toHaveAttribute(
				"aria-describedby",
				"layer-dbcaregion-desc"
			);

			const labelsSwitch = screen.getByLabelText("Show Labels");
			expect(labelsSwitch).toHaveAttribute(
				"aria-describedby",
				"show-labels-desc"
			);
		});
	});
});
