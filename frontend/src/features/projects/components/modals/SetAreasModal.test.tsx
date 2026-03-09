import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { SetAreasModal } from "./SetAreasModal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { IProjectData } from "@/shared/types/project.types";

expect.extend(toHaveNoViolations);
import type { ISimpleLocationData } from "@/shared/types/org.types";

// Mock hooks
vi.mock("@/shared/hooks/queries/useLocations", () => ({
	useLocations: vi.fn(),
}));

vi.mock("../../hooks/useSetProjectAreas", () => ({
	useSetProjectAreas: vi.fn(),
}));

// Import mocked hooks
import { useLocations } from "@/shared/hooks/queries/useLocations";
import { useSetProjectAreas } from "../../hooks/useSetProjectAreas";

// Mock data
const mockProject: IProjectData = {
	id: 1,
	title: "Test Project",
	status: "active",
	kind: "science",
	year: 2024,
	number: 1,
} as IProjectData;

const mockDbcaRegions: ISimpleLocationData[] = [
	{ id: 1, name: "Kimberley Region", area_type: "dbca_region" },
	{ id: 2, name: "Pilbara Region", area_type: "dbca_region" },
];

const mockDbcaDistricts: ISimpleLocationData[] = [
	{ id: 3, name: "Broome District", area_type: "dbca_district" },
	{ id: 4, name: "Karratha District", area_type: "dbca_district" },
];

const mockIbra: ISimpleLocationData[] = [
	{ id: 5, name: "Dampierland", area_type: "ibra" },
	{ id: 6, name: "Pilbara", area_type: "ibra" },
];

const mockImcra: ISimpleLocationData[] = [
	{ id: 7, name: "Kimberley", area_type: "imcra" },
	{ id: 8, name: "Pilbara Nearshore", area_type: "imcra" },
];

const mockNrm: ISimpleLocationData[] = [
	{ id: 9, name: "Rangelands", area_type: "nrm" },
	{ id: 10, name: "Northern Agricultural", area_type: "nrm" },
];

const mockCurrentAreas: ISimpleLocationData[] = [
	{ id: 1, name: "Kimberley Region", area_type: "dbca_region" },
	{ id: 5, name: "Dampierland", area_type: "ibra" },
];

describe("SetAreasModal", () => {
	let queryClient: QueryClient;
	let mockMutate: ReturnType<typeof vi.fn>;
	let mockOnClose: () => void;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false },
			},
		});

		mockMutate = vi.fn();
		mockOnClose = vi.fn() as () => void;

		// Setup default mock implementations
		vi.mocked(useLocations).mockReturnValue({
			dbcaRegions: mockDbcaRegions,
			dbcaDistricts: mockDbcaDistricts,
			ibra: mockIbra,
			imcra: mockImcra,
			nrm: mockNrm,
			locationsLoading: false,
			error: null,
		});

		(useSetProjectAreas as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			mutate: mockMutate,
			isPending: false,
			isError: false,
			isSuccess: false,
			isIdle: true,
			isPaused: false,
			data: undefined,
			error: null,
			variables: undefined,
			context: undefined,
			failureCount: 0,
			failureReason: null,
			status: "idle",
			submittedAt: 0,
			mutateAsync: vi.fn(),
			reset: vi.fn(),
		} as ReturnType<typeof useSetProjectAreas>);
	});

	const renderModal = (props: Partial<typeof SetAreasModal.arguments> = {}) => {
		return render(
			<QueryClientProvider client={queryClient}>
				<SetAreasModal
					isOpen={true}
					onClose={mockOnClose}
					project={mockProject}
					currentAreas={mockCurrentAreas}
					{...props}
				/>
			</QueryClientProvider>
		);
	};

	describe("Rendering", () => {
		it("should render modal with title and description", () => {
			renderModal();

			expect(screen.getByText("Set Project Areas")).toBeInTheDocument();
			expect(
				screen.getByText(
					"Select the areas where this project will be conducted."
				)
			).toBeInTheDocument();
		});

		it("should render search input", () => {
			renderModal();

			const searchInput = screen.getByLabelText("Search Areas");
			expect(searchInput).toBeInTheDocument();
			expect(searchInput).toHaveAttribute(
				"placeholder",
				"Search by name or type..."
			);
		});

		it("should render all area types", () => {
			renderModal();

			// Check for areas from each type
			expect(screen.getByText("Kimberley Region")).toBeInTheDocument();
			expect(screen.getByText("Broome District")).toBeInTheDocument();
			expect(screen.getByText("Dampierland")).toBeInTheDocument();
			expect(screen.getByText("Kimberley")).toBeInTheDocument();
			expect(screen.getByText("Rangelands")).toBeInTheDocument();
		});

		it("should render area types as labels", () => {
			renderModal();

			// Use getAllByText since there are multiple areas of each type
			expect(screen.getAllByText("DBCA Region").length).toBeGreaterThan(0);
			expect(screen.getAllByText("DBCA District").length).toBeGreaterThan(0);
			expect(screen.getAllByText("IBRA").length).toBeGreaterThan(0);
			expect(screen.getAllByText("IMCRA").length).toBeGreaterThan(0);
			expect(screen.getAllByText("NRM").length).toBeGreaterThan(0);
		});

		it("should render action buttons", () => {
			renderModal();

			expect(
				screen.getByRole("button", { name: "Cancel" })
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: "Save Areas" })
			).toBeInTheDocument();
		});

		it("should show loading state", () => {
			vi.mocked(useLocations).mockReturnValue({
				dbcaRegions: [],
				dbcaDistricts: [],
				ibra: [],
				imcra: [],
				nrm: [],
				locationsLoading: true,
				error: null,
			});

			renderModal();

			expect(screen.getByText("Loading areas...")).toBeInTheDocument();
		});

		it("should show empty state when no areas found", () => {
			vi.mocked(useLocations).mockReturnValue({
				dbcaRegions: [],
				dbcaDistricts: [],
				ibra: [],
				imcra: [],
				nrm: [],
				locationsLoading: false,
				error: null,
			});

			renderModal();

			expect(screen.getByText("No areas found")).toBeInTheDocument();
		});
	});

	describe("Initial State", () => {
		it("should pre-select current areas", () => {
			renderModal();

			// Kimberley Region (id: 1) should be checked
			const kimberleyCheckbox = screen.getByRole("checkbox", {
				name: /Kimberley Region/i,
			});
			expect(kimberleyCheckbox).toBeChecked();

			// Dampierland (id: 5) should be checked
			const dampierCheckbox = screen.getByRole("checkbox", {
				name: /Dampierland/i,
			});
			expect(dampierCheckbox).toBeChecked();

			// Pilbara Region (id: 2) should not be checked
			const pilbaraCheckbox = screen.getByRole("checkbox", {
				name: /Pilbara Region/i,
			});
			expect(pilbaraCheckbox).not.toBeChecked();
		});

		it("should show correct selected count", () => {
			renderModal();

			expect(screen.getByText("2 areas selected")).toBeInTheDocument();
		});

		it("should handle empty current areas", () => {
			renderModal({ currentAreas: [] });

			expect(screen.getByText("0 areas selected")).toBeInTheDocument();

			// No checkboxes should be checked
			const checkboxes = screen.getAllByRole("checkbox");
			checkboxes.forEach((checkbox) => {
				expect(checkbox).not.toBeChecked();
			});
		});
	});

	describe("Search Functionality", () => {
		it("should filter areas by name", async () => {
			const user = userEvent.setup();
			renderModal();

			const searchInput = screen.getByLabelText("Search Areas");
			await user.type(searchInput, "Kimberley");

			// Should show Kimberley Region and Kimberley (IMCRA)
			expect(screen.getByText("Kimberley Region")).toBeInTheDocument();
			expect(screen.getByText("Kimberley")).toBeInTheDocument();

			// Should not show Pilbara areas
			expect(screen.queryByText("Pilbara Region")).not.toBeInTheDocument();
			expect(screen.queryByText("Pilbara")).not.toBeInTheDocument();
		});

		it("should filter areas by type", async () => {
			const user = userEvent.setup();
			renderModal();

			const searchInput = screen.getByLabelText("Search Areas");
			await user.type(searchInput, "IBRA");

			// Should show only IBRA areas
			expect(screen.getByText("Dampierland")).toBeInTheDocument();
			expect(screen.getByText("Pilbara")).toBeInTheDocument();

			// Should not show other types
			expect(screen.queryByText("Kimberley Region")).not.toBeInTheDocument();
			expect(screen.queryByText("Broome District")).not.toBeInTheDocument();
		});

		it("should be case-insensitive", async () => {
			const user = userEvent.setup();
			renderModal();

			const searchInput = screen.getByLabelText("Search Areas");
			await user.type(searchInput, "kimberley");

			expect(screen.getByText("Kimberley Region")).toBeInTheDocument();
			expect(screen.getByText("Kimberley")).toBeInTheDocument();
		});

		it("should show no results message when search has no matches", async () => {
			const user = userEvent.setup();
			renderModal();

			const searchInput = screen.getByLabelText("Search Areas");
			await user.type(searchInput, "NonexistentArea");

			expect(screen.getByText("No areas found")).toBeInTheDocument();
		});

		it("should clear search and show all areas", async () => {
			const user = userEvent.setup();
			renderModal();

			const searchInput = screen.getByLabelText("Search Areas");
			await user.type(searchInput, "Kimberley");

			// Should show filtered results
			expect(screen.queryByText("Pilbara Region")).not.toBeInTheDocument();

			// Clear search
			await user.clear(searchInput);

			// Should show all areas again
			expect(screen.getByText("Pilbara Region")).toBeInTheDocument();
		});
	});

	describe("Area Selection", () => {
		it("should select an area", async () => {
			const user = userEvent.setup();
			renderModal();

			const pilbaraCheckbox = screen.getByRole("checkbox", {
				name: /Pilbara Region/i,
			});

			expect(pilbaraCheckbox).not.toBeChecked();
			expect(screen.getByText("2 areas selected")).toBeInTheDocument();

			await user.click(pilbaraCheckbox);

			expect(pilbaraCheckbox).toBeChecked();
			expect(screen.getByText("3 areas selected")).toBeInTheDocument();
		});

		it("should deselect an area", async () => {
			const user = userEvent.setup();
			renderModal();

			const kimberleyCheckbox = screen.getByRole("checkbox", {
				name: /Kimberley Region/i,
			});

			expect(kimberleyCheckbox).toBeChecked();
			expect(screen.getByText("2 areas selected")).toBeInTheDocument();

			await user.click(kimberleyCheckbox);

			expect(kimberleyCheckbox).not.toBeChecked();
			expect(screen.getByText("1 area selected")).toBeInTheDocument();
		});

		it("should handle multiple selections", async () => {
			const user = userEvent.setup();
			renderModal();

			const pilbaraCheckbox = screen.getByRole("checkbox", {
				name: /Pilbara Region/i,
			});
			const broomeCheckbox = screen.getByRole("checkbox", {
				name: /Broome District/i,
			});

			await user.click(pilbaraCheckbox);
			await user.click(broomeCheckbox);

			expect(pilbaraCheckbox).toBeChecked();
			expect(broomeCheckbox).toBeChecked();
			expect(screen.getByText("4 areas selected")).toBeInTheDocument();
		});

		it("should update count with singular/plural correctly", async () => {
			const user = userEvent.setup();
			renderModal({ currentAreas: [mockCurrentAreas[0]] });

			expect(screen.getByText("1 area selected")).toBeInTheDocument();

			const dampierCheckbox = screen.getByRole("checkbox", {
				name: /Dampierland/i,
			});
			await user.click(dampierCheckbox);

			expect(screen.getByText("2 areas selected")).toBeInTheDocument();
		});
	});

	describe("Save Functionality", () => {
		it("should call mutation with selected areas", async () => {
			const user = userEvent.setup();
			renderModal();

			const saveButton = screen.getByRole("button", { name: "Save Areas" });
			await user.click(saveButton);

			expect(mockMutate).toHaveBeenCalledWith(
				{
					projectId: 1,
					areas: [1, 5], // Current areas
				},
				expect.objectContaining({
					onSuccess: expect.any(Function),
				})
			);
		});

		it("should close modal on successful save", async () => {
			const user = userEvent.setup();
			renderModal();

			const saveButton = screen.getByRole("button", { name: "Save Areas" });
			await user.click(saveButton);

			// Simulate successful mutation
			const onSuccess = mockMutate.mock.calls[0][1].onSuccess;
			onSuccess();

			expect(mockOnClose).toHaveBeenCalled();
		});

		it("should disable save button when no areas selected", () => {
			renderModal({ currentAreas: [] });

			const saveButton = screen.getByRole("button", { name: "Save Areas" });
			expect(saveButton).toBeDisabled();
		});

		it("should disable save button during mutation", () => {
			(useSetProjectAreas as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				mutate: mockMutate,
				isPending: true,
				isError: false,
				isSuccess: false,
				isIdle: false,
				isPaused: false,
				data: undefined,
				error: null,
				variables: { projectId: 1, areas: [] },
				context: undefined,
				failureCount: 0,
				failureReason: null,
				status: "pending",
				submittedAt: Date.now(),
				mutateAsync: vi.fn(),
				reset: vi.fn(),
			} as ReturnType<typeof useSetProjectAreas>);

			renderModal();

			const saveButton = screen.getByRole("button", { name: "Saving..." });
			expect(saveButton).toBeDisabled();
		});

		it("should show loading text during save", () => {
			(useSetProjectAreas as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				mutate: mockMutate,
				isPending: true,
				isError: false,
				isSuccess: false,
				isIdle: false,
				isPaused: false,
				data: undefined,
				error: null,
				variables: { projectId: 1, areas: [] },
				context: undefined,
				failureCount: 0,
				failureReason: null,
				status: "pending",
				submittedAt: Date.now(),
				mutateAsync: vi.fn(),
				reset: vi.fn(),
			} as ReturnType<typeof useSetProjectAreas>);

			renderModal();

			expect(screen.getByText("Saving...")).toBeInTheDocument();
		});

		it("should save with updated selections", async () => {
			const user = userEvent.setup();
			renderModal();

			// Add Pilbara Region
			const pilbaraCheckbox = screen.getByRole("checkbox", {
				name: /Pilbara Region/i,
			});
			await user.click(pilbaraCheckbox);

			// Remove Dampierland
			const dampierCheckbox = screen.getByRole("checkbox", {
				name: /Dampierland/i,
			});
			await user.click(dampierCheckbox);

			const saveButton = screen.getByRole("button", { name: "Save Areas" });
			await user.click(saveButton);

			expect(mockMutate).toHaveBeenCalledWith(
				{
					projectId: 1,
					areas: [1, 2], // Kimberley Region + Pilbara Region
				},
				expect.any(Object)
			);
		});
	});

	describe("Cancel Functionality", () => {
		it("should close modal on cancel", async () => {
			const user = userEvent.setup();
			renderModal();

			const cancelButton = screen.getByRole("button", { name: "Cancel" });
			await user.click(cancelButton);

			expect(mockOnClose).toHaveBeenCalled();
		});

		it("should not save changes on cancel", async () => {
			const user = userEvent.setup();
			renderModal();

			// Make some changes
			const pilbaraCheckbox = screen.getByRole("checkbox", {
				name: /Pilbara Region/i,
			});
			await user.click(pilbaraCheckbox);

			const cancelButton = screen.getByRole("button", { name: "Cancel" });
			await user.click(cancelButton);

			expect(mockMutate).not.toHaveBeenCalled();
			expect(mockOnClose).toHaveBeenCalled();
		});
	});

	describe("Accessibility", () => {
		it("should have no accessibility violations", async () => {
			const { container } = renderModal();

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("should have proper labels for checkboxes", () => {
			renderModal();

			const kimberleyCheckbox = screen.getByRole("checkbox", {
				name: /Kimberley Region/i,
			});
			expect(kimberleyCheckbox).toHaveAccessibleName();
		});

		it("should have proper label for search input", () => {
			renderModal();

			const searchInput = screen.getByLabelText("Search Areas");
			expect(searchInput).toHaveAccessibleName();
		});

		it("should support keyboard navigation", async () => {
			const user = userEvent.setup();
			renderModal();

			const searchInput = screen.getByLabelText("Search Areas");
			await user.tab();

			expect(searchInput).toHaveFocus();
		});
	});
});
