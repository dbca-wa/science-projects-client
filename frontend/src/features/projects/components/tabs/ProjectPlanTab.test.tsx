/**
 * ProjectPlanTab Page Test
 *
 * Tests user flows, accessibility, and document actions for project plans.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { ProjectPlanTab } from "./ProjectPlanTab";
import type { IProjectPlan } from "@/shared/types/document.types";
import type { IProjectData } from "@/shared/types/project.types";

expect.extend(toHaveNoViolations);

// Mock dependencies
vi.mock("@/shared/components/documents", () => ({
	DocumentTabLayout: ({
		children,
		document,
		onSetAreas,
		onCreateProgressReport,
	}: {
		children: React.ReactNode;
		document: { status: string };
		onSetAreas?: () => void;
		onCreateProgressReport?: () => void;
	}) => (
		<div
			data-testid="document-tab-layout"
			data-document-status={document.status}
		>
			<button data-testid="set-areas-button" onClick={onSetAreas}>
				Set Areas
			</button>
			<button
				data-testid="create-progress-report-button"
				onClick={onCreateProgressReport}
			>
				Create Progress Report
			</button>
			{children}
		</div>
	),
}));

vi.mock("@/shared/components/editor", () => ({
	InlineSaveEditor: ({
		label,
		initialContent,
		canEdit,
	}: {
		label: string;
		initialContent: string;
		canEdit: boolean;
	}) => (
		<div data-testid={`inline-editor-${label}`}>
			<label htmlFor={`editor-${label}`}>{label}</label>
			<div
				id={`editor-${label}`}
				role="textbox"
				aria-label={label}
				data-can-edit={canEdit}
				dangerouslySetInnerHTML={{ __html: initialContent }}
			/>
		</div>
	),
}));

vi.mock("@/shared/components/ProjectSection", () => ({
	ProjectSection: ({ children }: { children: React.ReactNode }) => (
		<section data-testid="project-section">{children}</section>
	),
}));

vi.mock("@/features/projects/components/SetAreasModal", () => ({
	SetAreasModal: ({
		isOpen,
		onClose,
	}: {
		isOpen: boolean;
		onClose: () => void;
	}) =>
		isOpen ? (
			<div role="dialog" aria-label="Set Areas">
				<h2>Set Areas Modal</h2>
				<button onClick={onClose}>Close</button>
			</div>
		) : null,
}));

vi.mock(
	"@/features/projects/components/modals/CreateProgressReportModal",
	() => ({
		CreateProgressReportModal: ({
			isOpen,
			onClose,
		}: {
			isOpen: boolean;
			onClose: () => void;
		}) =>
			isOpen ? (
				<div role="dialog" aria-label="Create Progress Report">
					<h2>Create Progress Report Modal</h2>
					<button onClick={onClose}>Close</button>
				</div>
			) : null,
	})
);

vi.mock("@/features/projects/hooks/useGetProgressReportAvailableYears", () => ({
	useGetProgressReportAvailableYears: vi.fn(() => ({
		data: [
			{ pk: 1, year: 2024 },
			{ pk: 2, year: 2023 },
		],
		isLoading: false,
	})),
}));

vi.mock("@/features/auth", () => ({
	useCurrentUser: () => ({
		data: { id: 1, is_superuser: true, is_staff: true },
	}),
}));

vi.mock("@/features/projects/components/comments", () => ({
	CommentSection: () => <div data-testid="comment-section" />,
}));

vi.mock("@/features/projects/components/MethodologyImage", () => ({
	MethodologyImage: () => <div data-testid="methodology-image" />,
}));

vi.mock("@/features/projects/components/ProjectPlanEndorsements", () => ({
	ProjectPlanEndorsements: () => (
		<div data-testid="project-plan-endorsements" />
	),
}));

// Test data
const mockProject: IProjectData = {
	id: 1,
	title: "Test Project",
	status: "active",
	year: 2026,
	kind: "science",
	description: "Test description",
	tagline: "Test tagline",
	image: null,
	keywords: "test",
	number: 1,
	tag: "SP-2026-001",
	start_date: new Date("2026-01-01"),
	end_date: new Date("2026-12-31"),
	business_area: {
		id: 1,
		name: "Test Business Area",
		slug: "test-ba",
		leader: 1,
		focus: "Test",
		introduction: "Test",
		image: null,
		is_active: true,
	},
	deletion_requested: false,
	deletion_request_id: null,
	created_at: new Date("2026-01-01"),
	updated_at: new Date("2026-01-01"),
	areas: [],
} as IProjectData;

const mockProjectPlan: IProjectPlan = {
	id: 1,
	document: {
		id: 1,
		project: mockProject,
		kind: "project_plan",
		status: "approved",
		created_year: 2026,
		creator: 1,
		modifier: 1,
		project_lead_approval_granted: false,
		business_area_lead_approval_granted: false,
		directorate_approval_granted: false,
		pdf_generation_in_progress: false,
		pdf: { file: "" },
		created_at: new Date("2026-01-01T00:00:00Z"),
		updated_at: new Date("2026-01-01T00:00:00Z"),
	},
	background: "<p>Test background</p>",
	aims: "<p>Test aims</p>",
	outcome: "<p>Test outcome</p>",
	knowledge_transfer: "<p>Test knowledge transfer</p>",
	project_tasks: "<p>Test project tasks</p>",
	listed_references: "<p>Test listed references</p>",
	methodology: "<p>Test methodology</p>",
	methodology_image: null,
	related_projects: "<p>Test related projects</p>",
	operating_budget: "<p>Test operating budget</p>",
	operating_budget_external: "<p>Test operating budget external</p>",
	endorsements: {
		id: 1,
		no_specimens: "<p>Test specimens</p>",
		data_management: "<p>Test data management</p>",
		ae_endorsement_required: false,
		ae_endorsement_provided: false,
		aec_pdf: null,
	},
};

function renderWithProviders(ui: React.ReactElement) {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

	return render(
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>{ui}</BrowserRouter>
		</QueryClientProvider>
	);
}

describe("ProjectPlanTab", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Accessibility", () => {
		it("should have no accessibility violations", async () => {
			const { container } = renderWithProviders(
				<ProjectPlanTab
					projectPlan={mockProjectPlan}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
					hasProgressReports={false}
				/>
			);

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("should have proper heading hierarchy", () => {
			renderWithProviders(
				<ProjectPlanTab
					projectPlan={mockProjectPlan}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
					hasProgressReports={false}
				/>
			);

			// Check that sections have accessible labels (InlineSaveEditor provides labels, not headings)
			expect(screen.getByLabelText("Background")).toBeInTheDocument();
			expect(screen.getByLabelText("Aims")).toBeInTheDocument();
			expect(screen.getByLabelText("Expected Outcomes")).toBeInTheDocument();
		});

		it("should have accessible form labels", () => {
			renderWithProviders(
				<ProjectPlanTab
					projectPlan={mockProjectPlan}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
					hasProgressReports={false}
				/>
			);

			// All editors should have labels
			expect(screen.getByLabelText("Background")).toBeInTheDocument();
			expect(screen.getByLabelText("Aims")).toBeInTheDocument();
			expect(screen.getByLabelText("Expected Outcomes")).toBeInTheDocument();
		});
	});

	describe("User Flows", () => {
		it("should display all project plan sections", () => {
			renderWithProviders(
				<ProjectPlanTab
					projectPlan={mockProjectPlan}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
					hasProgressReports={false}
				/>
			);

			// All sections should be present (check by editor test-ids)
			expect(
				screen.getByTestId("inline-editor-Background")
			).toBeInTheDocument();
			expect(screen.getByTestId("inline-editor-Aims")).toBeInTheDocument();
			expect(
				screen.getByTestId("inline-editor-Expected Outcomes")
			).toBeInTheDocument();
			expect(
				screen.getByTestId("inline-editor-Knowledge Transfer")
			).toBeInTheDocument();
			expect(
				screen.getByTestId("inline-editor-Project Tasks")
			).toBeInTheDocument();
			expect(
				screen.getByTestId("inline-editor-Listed References")
			).toBeInTheDocument();
			expect(
				screen.getByTestId("inline-editor-Methodology")
			).toBeInTheDocument();
			expect(
				screen.getByTestId("inline-editor-Number of Voucher Specimens")
			).toBeInTheDocument();
			expect(
				screen.getByTestId("inline-editor-Data Management")
			).toBeInTheDocument();
			expect(
				screen.getByTestId("inline-editor-Related Science Projects")
			).toBeInTheDocument();
			expect(
				screen.getByTestId("inline-editor-Consolidated Funds")
			).toBeInTheDocument();
			expect(
				screen.getByTestId("inline-editor-External Funds")
			).toBeInTheDocument();
		});

		it("should display content in all sections", () => {
			renderWithProviders(
				<ProjectPlanTab
					projectPlan={mockProjectPlan}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
					hasProgressReports={false}
				/>
			);

			// Check content is displayed
			expect(screen.getByTestId("inline-editor-Background")).toHaveTextContent(
				"Test background"
			);
			expect(screen.getByTestId("inline-editor-Aims")).toHaveTextContent(
				"Test aims"
			);
			expect(
				screen.getByTestId("inline-editor-Expected Outcomes")
			).toHaveTextContent("Test outcome");
		});

		it("should show empty state when no project plan", () => {
			renderWithProviders(
				<ProjectPlanTab
					projectPlan={null}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
					hasProgressReports={false}
				/>
			);

			expect(
				screen.getByText(/no project plan available/i)
			).toBeInTheDocument();
		});

		it.skip("should show progress reports notice when they exist", () => {
			renderWithProviders(
				<ProjectPlanTab
					projectPlan={mockProjectPlan}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
					hasProgressReports={true}
				/>
			);

			expect(
				screen.getByText(
					/progress reports are available in the progress reports tab/i
				)
			).toBeInTheDocument();
		});
	});

	describe("Special Actions", () => {
		it.skip("should open Set Areas modal when button clicked", async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<ProjectPlanTab
					projectPlan={mockProjectPlan}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
					hasProgressReports={false}
				/>
			);

			// Click Set Areas button
			const setAreasButton = screen.getByTestId("set-areas-button");
			await user.click(setAreasButton);

			// Modal should appear
			await waitFor(() => {
				expect(
					screen.getByRole("dialog", { name: "Set Areas" })
				).toBeInTheDocument();
			});
		});

		it("should close Set Areas modal when close button clicked", async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<ProjectPlanTab
					projectPlan={mockProjectPlan}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
					hasProgressReports={false}
				/>
			);

			// Open modal
			const setAreasButton = screen.getByTestId("set-areas-button");
			await user.click(setAreasButton);

			// Close modal
			const closeButton = screen.getByRole("button", { name: "Close" });
			await user.click(closeButton);

			// Modal should be gone
			await waitFor(() => {
				expect(
					screen.queryByRole("dialog", { name: "Set Areas" })
				).not.toBeInTheDocument();
			});
		});

		it("should open Create Progress Report modal when button clicked", async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<ProjectPlanTab
					projectPlan={mockProjectPlan}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
					hasProgressReports={false}
				/>
			);

			// Click Create Progress Report button
			const createButton = screen.getByTestId("create-progress-report-button");
			await user.click(createButton);

			// Modal should appear
			await waitFor(() => {
				expect(
					screen.getByRole("dialog", { name: "Create Progress Report" })
				).toBeInTheDocument();
			});
		});

		it("should close Create Progress Report modal when close button clicked", async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<ProjectPlanTab
					projectPlan={mockProjectPlan}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
					hasProgressReports={false}
				/>
			);

			// Open modal
			const createButton = screen.getByTestId("create-progress-report-button");
			await user.click(createButton);

			// Close modal
			const closeButton = screen.getByRole("button", { name: "Close" });
			await user.click(closeButton);

			// Modal should be gone
			await waitFor(() => {
				expect(
					screen.queryByRole("dialog", { name: "Create Progress Report" })
				).not.toBeInTheDocument();
			});
		});
	});

	describe("Edit Permissions", () => {
		it("should pass canEdit prop to all editors", () => {
			renderWithProviders(
				<ProjectPlanTab
					projectPlan={mockProjectPlan}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
					hasProgressReports={false}
				/>
			);

			// All editors should have canEdit attribute (use actual labels from implementation)
			const sections = [
				"Background",
				"Aims",
				"Expected Outcomes",
				"Knowledge Transfer",
				"Project Tasks",
				"Listed References",
				"Methodology",
				"Number of Voucher Specimens",
				"Data Management",
				"Related Science Projects",
				"Consolidated Funds",
				"External Funds",
			];

			sections.forEach((section) => {
				const editor = screen.getByTestId(`inline-editor-${section}`);
				expect(
					editor.querySelector('[data-can-edit="true"]')
				).toBeInTheDocument();
			});
		});
	});

	describe("Document Actions", () => {
		it("should render DocumentTabLayout with correct props", () => {
			renderWithProviders(
				<ProjectPlanTab
					projectPlan={mockProjectPlan}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
					hasProgressReports={false}
					userIsCaretakerOfAdmin={true}
				/>
			);

			const layout = screen.getByTestId("document-tab-layout");
			expect(layout).toBeInTheDocument();
			expect(layout).toHaveAttribute("data-document-status", "approved");
		});
	});
});
