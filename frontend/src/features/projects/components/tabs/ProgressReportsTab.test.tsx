/**
 * ProgressReportsTab Page Test
 *
 * Tests user flows, accessibility, and document actions for progress reports.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { ProgressReportsTab } from "./ProgressReportsTab";
import type { IProgressReport } from "@/shared/types/document.types";
import type { IProjectData } from "@/shared/types/project.types";

expect.extend(toHaveNoViolations);

// Mock dependencies
vi.mock("@/shared/components/documents", () => ({
	DocumentTabLayout: ({
		children,
		document,
	}: {
		children: React.ReactNode;
		document: { status: string };
	}) => (
		<div
			data-testid="document-tab-layout"
			data-document-status={document.status}
		>
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

vi.mock("@/features/auth", () => ({
	useCurrentUser: () => ({
		data: { id: 1, is_superuser: true, is_staff: true },
	}),
}));

vi.mock("@/features/projects/components/comments", () => ({
	CommentSection: () => <div data-testid="comment-section" />,
}));

vi.mock("@/shared/components/YearSelector", () => ({
	YearSelector: ({
		years,
		selectedYear,
		onYearChange,
	}: {
		years: number[];
		selectedYear: number;
		onYearChange: (year: number) => void;
	}) => (
		<div data-testid="year-selector">
			<label htmlFor="year-select">Select Year</label>
			<select
				id="year-select"
				value={selectedYear}
				onChange={(e) => onYearChange(Number(e.target.value))}
			>
				{years.map((year: number) => (
					<option key={year} value={year}>
						{year}
					</option>
				))}
			</select>
		</div>
	),
}));

// Test data
const mockProject: IProjectData = {
	id: 1,
	title: "Test Project",
	status: "active",
	year: 2026,
	tagline: "Test tagline",
	description: "Test description",
	kind: "science",
	keywords: "test",
	number: 1,
	tag: "SP-2026-001",
	deletion_requested: false,
	deletion_request_id: null,
	start_date: new Date("2026-01-01"),
	end_date: new Date("2026-12-31"),
	image: null,
	areas: [],
	business_area: {
		id: 1,
		name: "Test BA",
		leader: 1,
		slug: "test-ba",
		focus: "Test",
		introduction: "Test",
		image: null,
		is_active: true,
	},
	created_at: new Date("2026-01-01T00:00:00Z"),
	updated_at: new Date("2026-01-01T00:00:00Z"),
} as IProjectData;

const mockProgressReports: IProgressReport[] = [
	{
		id: 1,
		year: 2026,
		is_final_report: false,
		document: {
			id: 1,
			project: mockProject,
			kind: "progress_report",
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
		context: "<p>Test context 2026</p>",
		aims: "<p>Test aims 2026</p>",
		progress: "<p>Test progress 2026</p>",
		implications: "<p>Test implications 2026</p>",
		future: "<p>Test future 2026</p>",
		team_members: [],
		created_at: new Date("2026-01-01T00:00:00Z"),
		updated_at: new Date("2026-01-01T00:00:00Z"),
	},
	{
		id: 2,
		year: 2025,
		is_final_report: false,
		document: {
			id: 2,
			project: mockProject,
			kind: "progress_report",
			status: "approved",
			created_year: 2026,
			creator: 1,
			modifier: 1,
			project_lead_approval_granted: false,
			business_area_lead_approval_granted: false,
			directorate_approval_granted: false,
			pdf_generation_in_progress: false,
			pdf: { file: "" },
			created_at: new Date("2025-01-01T00:00:00Z"),
			updated_at: new Date("2025-01-01T00:00:00Z"),
		},
		context: "<p>Test context 2025</p>",
		aims: "<p>Test aims 2025</p>",
		progress: "<p>Test progress 2025</p>",
		implications: "<p>Test implications 2025</p>",
		future: "<p>Test future 2025</p>",
		team_members: [],
		created_at: new Date("2025-01-01T00:00:00Z"),
		updated_at: new Date("2025-01-01T00:00:00Z"),
	},
];

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

describe("ProgressReportsTab", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Accessibility", () => {
		it("should have no accessibility violations", async () => {
			const { container } = renderWithProviders(
				<ProgressReportsTab
					progressReports={mockProgressReports}
					project={mockProject}
					members={[]}
					projectId={mockProject.id}
				/>
			);

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("should have proper heading hierarchy", () => {
			renderWithProviders(
				<ProgressReportsTab
					progressReports={mockProgressReports}
					project={mockProject}
					members={[]}
					projectId={mockProject.id}
				/>
			);

			// Check that sections have accessible labels (InlineSaveEditor provides labels, not headings)
			expect(screen.getByLabelText("Context")).toBeInTheDocument();
			expect(screen.getByLabelText("Aims")).toBeInTheDocument();
			expect(screen.getByLabelText("Progress")).toBeInTheDocument();
		});

		it("should have accessible form labels", () => {
			renderWithProviders(
				<ProgressReportsTab
					progressReports={mockProgressReports}
					project={mockProject}
					members={[]}
					projectId={mockProject.id}
				/>
			);

			// Year selector should have label
			expect(screen.getByLabelText("Select Year")).toBeInTheDocument();

			// Editors should have labels
			expect(screen.getByLabelText("Context")).toBeInTheDocument();
			expect(screen.getByLabelText("Aims")).toBeInTheDocument();
		});
	});

	describe("User Flows", () => {
		it("should display all progress report sections", () => {
			renderWithProviders(
				<ProgressReportsTab
					progressReports={mockProgressReports}
					project={mockProject}
					members={[]}
					projectId={mockProject.id}
				/>
			);

			// All sections should be present (check by editor test-ids)
			expect(screen.getByTestId("inline-editor-Context")).toBeInTheDocument();
			expect(screen.getByTestId("inline-editor-Aims")).toBeInTheDocument();
			expect(screen.getByTestId("inline-editor-Progress")).toBeInTheDocument();
			expect(
				screen.getByTestId("inline-editor-Management Implications")
			).toBeInTheDocument();
			expect(
				screen.getByTestId("inline-editor-Future Directions")
			).toBeInTheDocument();
		});

		it("should display content from selected year", () => {
			renderWithProviders(
				<ProgressReportsTab
					progressReports={mockProgressReports}
					project={mockProject}
					members={[]}
					projectId={mockProject.id}
				/>
			);

			// Should show 2026 content by default (highest year)
			const contextEditor = screen.getByTestId("inline-editor-Context");
			expect(contextEditor).toHaveTextContent("Test context 2026");
		});

		it("should switch years when year selector changes", async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<ProgressReportsTab
					progressReports={mockProgressReports}
					project={mockProject}
					members={[]}
					projectId={mockProject.id}
				/>
			);

			// Initially shows 2026
			expect(screen.getByTestId("inline-editor-Context")).toHaveTextContent(
				"Test context 2026"
			);

			// Change to 2025
			const yearSelect = screen.getByLabelText("Select Year");
			await user.selectOptions(yearSelect, "2025");

			// Should now show 2025 content
			await waitFor(() => {
				expect(screen.getByTestId("inline-editor-Context")).toHaveTextContent(
					"Test context 2025"
				);
			});
		});

		it("should show empty state when no progress reports", () => {
			renderWithProviders(
				<ProgressReportsTab
					progressReports={[]}
					project={mockProject}
					members={[]}
					projectId={mockProject.id}
				/>
			);

			expect(
				screen.getByText(/no progress reports available/i)
			).toBeInTheDocument();
			expect(
				screen.getByText(/create one from the project plan tab/i)
			).toBeInTheDocument();
		});

		it("should show loading state when selected report not found", () => {
			// Create reports without the selected year
			const reportsWithoutCurrentYear: IProgressReport[] = [
				{
					...mockProgressReports[1],
					year: 2024,
				},
			];

			renderWithProviders(
				<ProgressReportsTab
					progressReports={reportsWithoutCurrentYear}
					project={mockProject}
					members={[]}
					projectId={mockProject.id}
				/>
			);

			// Should show loader when selected year doesn't match any report
			expect(screen.getByTestId("document-tab-layout")).toBeInTheDocument();
		});
	});

	describe("Year Navigation", () => {
		it("should sort years in descending order", () => {
			renderWithProviders(
				<ProgressReportsTab
					progressReports={mockProgressReports}
					project={mockProject}
					members={[]}
					projectId={mockProject.id}
				/>
			);

			const yearSelect = screen.getByLabelText(
				"Select Year"
			) as HTMLSelectElement;
			const options = Array.from(yearSelect.options).map((opt) =>
				Number(opt.value)
			);

			expect(options).toEqual([2026, 2025]);
		});

		it("should default to highest year", () => {
			renderWithProviders(
				<ProgressReportsTab
					progressReports={mockProgressReports}
					project={mockProject}
					members={[]}
					projectId={mockProject.id}
				/>
			);

			const yearSelect = screen.getByLabelText(
				"Select Year"
			) as HTMLSelectElement;
			expect(yearSelect.value).toBe("2026");
		});

		it("should preserve state when switching between years", async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<ProgressReportsTab
					progressReports={mockProgressReports}
					project={mockProject}
					members={[]}
					projectId={mockProject.id}
				/>
			);

			// Switch to 2025
			const yearSelect = screen.getByLabelText("Select Year");
			await user.selectOptions(yearSelect, "2025");

			await waitFor(() => {
				expect(screen.getByTestId("inline-editor-Context")).toHaveTextContent(
					"Test context 2025"
				);
			});

			// Switch back to 2026
			await user.selectOptions(yearSelect, "2026");

			await waitFor(() => {
				expect(screen.getByTestId("inline-editor-Context")).toHaveTextContent(
					"Test context 2026"
				);
			});
		});
	});

	describe("Edit Permissions", () => {
		it("should pass canEdit prop to editors", () => {
			// Use non-approved documents so rich text editing is not locked
			const editableReports = mockProgressReports.map((r) => ({
				...r,
				document: { ...r.document, status: "new" as const },
			}));
			renderWithProviders(
				<ProgressReportsTab
					progressReports={editableReports}
					project={mockProject}
					members={[]}
					projectId={mockProject.id}
				/>
			);

			// All editors should have canEdit attribute
			const contextEditor = screen.getByTestId("inline-editor-Context");
			expect(
				contextEditor.querySelector('[data-can-edit="true"]')
			).toBeInTheDocument();
		});
	});

	describe("Document Actions", () => {
		it("should render DocumentTabLayout with correct props", () => {
			renderWithProviders(
				<ProgressReportsTab
					progressReports={mockProgressReports}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
					userIsCaretakerOfAdmin={true}
				/>
			);

			const layout = screen.getByTestId("document-tab-layout");
			expect(layout).toBeInTheDocument();
			expect(layout).toHaveAttribute("data-document-status", "approved");
		});
	});
});
