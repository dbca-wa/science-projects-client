import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { axe, toHaveNoViolations } from "jest-axe";
import { CreateProgressReportModal } from "./CreateProgressReportModal";
import type { IProjectData } from "@/shared/types/project.types";

expect.extend(toHaveNoViolations);

// Mock the hooks
vi.mock("@/features/projects/hooks/useCreateProgressReport", () => ({
	useCreateProgressReport: vi.fn(),
}));

vi.mock("@/features/projects/hooks/useGetProgressReportAvailableYears", () => ({
	useGetProgressReportAvailableYears: vi.fn(),
}));

import { useCreateProgressReport } from "@/features/projects/hooks/useCreateProgressReport";
import { useGetProgressReportAvailableYears } from "@/features/projects/hooks/useGetProgressReportAvailableYears";

// Helper to create mock project
const createMockProject = (
	overrides: Partial<IProjectData> = {}
): IProjectData => ({
	id: 1,
	title: "Test Project",
	tag: "TEST-001",
	tagline: "",
	status: "active",
	kind: "science",
	year: 2024,
	number: 1,
	start_date: new Date("2024-01-01"),
	end_date: new Date("2024-12-31"),
	description: "",
	image: null,
	areas: [],
	business_area: {
		id: 1,
		name: "Test Business Area",
		slug: "test-ba",
		introduction: "",
		image: null,
		leader: undefined,
		is_active: true,
		focus: "",
	},
	keywords: "",
	deletion_requested: false,
	deletion_request_id: null,
	created_at: new Date("2024-01-01T00:00:00Z"),
	updated_at: new Date("2024-01-01T00:00:00Z"),
	...overrides,
});

describe("CreateProgressReportModal", () => {
	let queryClient: QueryClient;
	let mockProject: IProjectData;
	let mockMutate: ReturnType<typeof vi.fn>;
	let mockOnClose: () => void;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false },
			},
		});

		mockProject = createMockProject({
			id: 123,
			title: "Test Project",
		});

		mockMutate = vi.fn();
		mockOnClose = vi.fn();

		vi.mocked(useCreateProgressReport).mockReturnValue({
			mutate: mockMutate,
			isPending: false,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);

		vi.mocked(useGetProgressReportAvailableYears).mockReturnValue({
			data: [
				{ id: 1, year: 2024 },
				{ id: 2, year: 2023 },
				{ id: 3, year: 2022 },
			],
			isLoading: false,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);

		vi.clearAllMocks();
	});

	const renderModal = (isOpen = true) => {
		return render(
			<QueryClientProvider client={queryClient}>
				<CreateProgressReportModal
					isOpen={isOpen}
					onClose={mockOnClose}
					project={mockProject}
				/>
			</QueryClientProvider>
		);
	};

	describe("Rendering", () => {
		it("should render modal when open", () => {
			renderModal(true);

			expect(
				screen.getByRole("heading", { name: /create progress report/i })
			).toBeInTheDocument();
		});

		it("should not render modal when closed", () => {
			renderModal(false);

			expect(
				screen.queryByRole("heading", { name: /create progress report/i })
			).not.toBeInTheDocument();
		});

		it("should display modal description", () => {
			renderModal(true);

			expect(
				screen.getByText(/add a new progress report for this project/i)
			).toBeInTheDocument();
		});

		it("should display year select field", () => {
			renderModal(true);

			expect(screen.getByLabelText(/financial year/i)).toBeInTheDocument();
		});

		it("should display create button", () => {
			renderModal(true);

			expect(
				screen.getByRole("button", { name: /create progress report/i })
			).toBeInTheDocument();
		});

		it("should display cancel button", () => {
			renderModal(true);

			expect(
				screen.getByRole("button", { name: /cancel/i })
			).toBeInTheDocument();
		});
	});

	describe("Initial State", () => {
		it("should have no year selected initially", () => {
			renderModal(true);

			const yearSelect = screen.getByRole("combobox", {
				name: /financial year/i,
			});
			expect(yearSelect).toHaveTextContent(/select a financial year/i);
		});

		it("should have create button disabled when year is not selected", () => {
			renderModal(true);

			const createButton = screen.getByRole("button", {
				name: /create progress report/i,
			});
			expect(createButton).toBeDisabled();
		});

		it("should not show loading state initially", () => {
			renderModal(true);

			const createButton = screen.getByRole("button", {
				name: /create progress report/i,
			});
			expect(createButton).not.toHaveTextContent(/creating/i);
		});
	});

	describe("Year Selection", () => {
		it("should display year select component", () => {
			renderModal(true);

			const yearSelect = screen.getByRole("combobox", {
				name: /financial year/i,
			});
			expect(yearSelect).toBeInTheDocument();
		});

		it("should show info about year selection", () => {
			renderModal(true);

			expect(
				screen.getByText(/only years with an existing annual report are shown/i)
			).toBeInTheDocument();
		});

		it("should show helper text for year selection", () => {
			renderModal(true);

			expect(
				screen.getByText(
					/years that already have a progress report for this project are excluded/i
				)
			).toBeInTheDocument();
		});
	});

	describe("Create Functionality", () => {
		it("should have mutation hook available", () => {
			renderModal(true);

			// Verify the hook was called
			expect(useCreateProgressReport).toHaveBeenCalled();
		});

		it("should show loading state during creation", () => {
			vi.mocked(useCreateProgressReport).mockReturnValue({
				mutate: mockMutate,
				isPending: true,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any);

			renderModal(true);

			const createButton = screen.getByRole("button", { name: /creating/i });
			expect(createButton).toBeDisabled();
		});

		it("should disable create button during creation", () => {
			vi.mocked(useCreateProgressReport).mockReturnValue({
				mutate: mockMutate,
				isPending: true,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any);

			renderModal(true);

			const createButton = screen.getByRole("button", { name: /creating/i });
			expect(createButton).toBeDisabled();
		});
	});

	describe("Cancel Functionality", () => {
		it("should close modal when cancel is clicked", async () => {
			const user = userEvent.setup();
			renderModal(true);

			const cancelButton = screen.getByRole("button", { name: /cancel/i });
			await user.click(cancelButton);

			expect(mockOnClose).toHaveBeenCalled();
		});

		it("should close modal on Escape key", async () => {
			const user = userEvent.setup();
			renderModal(true);

			await user.keyboard("{Escape}");

			await waitFor(() => {
				expect(mockOnClose).toHaveBeenCalled();
			});
		});
	});

	describe("Accessibility", () => {
		it("should have no accessibility violations", async () => {
			const { container } = renderModal(true);

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("should have proper ARIA labels", () => {
			renderModal(true);

			expect(screen.getByLabelText(/financial year/i)).toBeInTheDocument();
		});

		it("should have accessible dialog role", () => {
			renderModal(true);

			expect(screen.getByRole("dialog")).toBeInTheDocument();
		});

		it("should have accessible heading", () => {
			renderModal(true);

			expect(
				screen.getByRole("heading", { name: /create progress report/i })
			).toBeInTheDocument();
		});
	});
});
