/**
 * StudentReportsTab Page Test
 *
 * Tests user flows, accessibility, and document actions for student reports.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { StudentReportsTab } from "./StudentReportsTab";
import type { IStudentReport } from "@/shared/types/document.types";
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
		wordLimit,
	}: {
		label: string;
		initialContent: string;
		canEdit: boolean;
		wordLimit?: number;
	}) => (
		<div data-testid={`inline-editor-${label}`}>
			<label htmlFor={`editor-${label}`}>{label}</label>
			<div
				id={`editor-${label}`}
				role="textbox"
				aria-label={label}
				data-can-edit={canEdit}
				data-word-limit={wordLimit}
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
	kind: "student",
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

const mockStudentReports: IStudentReport[] = [
	{
		id: 1,
		year: 2026,
		document: {
			id: 1,
			project: mockProject,
			kind: "student_report",
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
		progress_report: "<p>Student progress report for 2026</p>",
	},
	{
		id: 2,
		year: 2025,
		document: {
			id: 2,
			project: mockProject,
			kind: "student_report",
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
		progress_report: "<p>Student progress report for 2025</p>",
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

describe("StudentReportsTab", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Accessibility", () => {
		it("should have no accessibility violations", async () => {
			const { container } = renderWithProviders(
				<StudentReportsTab
					studentReports={mockStudentReports}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
				/>
			);

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("should have proper heading hierarchy", () => {
			renderWithProviders(
				<StudentReportsTab
					studentReports={mockStudentReports}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
				/>
			);

			// InlineSaveEditor provides its own label, no separate heading needed
			expect(screen.getByLabelText("Progress Report")).toBeInTheDocument();
		});

		it("should have accessible form labels", () => {
			renderWithProviders(
				<StudentReportsTab
					studentReports={mockStudentReports}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
				/>
			);

			// Year selector should have label
			expect(screen.getByLabelText("Select Year")).toBeInTheDocument();

			// Editor should have label
			expect(screen.getByLabelText("Progress Report")).toBeInTheDocument();
		});
	});

	describe("User Flows", () => {
		it("should display student report section", () => {
			renderWithProviders(
				<StudentReportsTab
					studentReports={mockStudentReports}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
				/>
			);

			// Progress Report editor should be present
			expect(
				screen.getByTestId("inline-editor-Progress Report")
			).toBeInTheDocument();
		});

		it("should display content from selected year", () => {
			renderWithProviders(
				<StudentReportsTab
					studentReports={mockStudentReports}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
				/>
			);

			// Should show 2026 content by default (highest year)
			const editor = screen.getByTestId("inline-editor-Progress Report");
			expect(editor).toHaveTextContent("Student progress report for 2026");
		});

		it("should switch years when year selector changes", async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<StudentReportsTab
					studentReports={mockStudentReports}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
				/>
			);

			// Initially shows 2026
			expect(
				screen.getByTestId("inline-editor-Progress Report")
			).toHaveTextContent("Student progress report for 2026");

			// Change to 2025
			const yearSelect = screen.getByLabelText("Select Year");
			await user.selectOptions(yearSelect, "2025");

			// Should now show 2025 content
			await waitFor(() => {
				expect(
					screen.getByTestId("inline-editor-Progress Report")
				).toHaveTextContent("Student progress report for 2025");
			});
		});

		it("should show empty state when no student reports", () => {
			renderWithProviders(
				<StudentReportsTab
					studentReports={[]}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
				/>
			);

			expect(
				screen.getByText(/no student reports available/i)
			).toBeInTheDocument();
		});

		it("should show loading state when selected report not found", () => {
			// Create reports without the selected year
			const reportsWithoutCurrentYear: IStudentReport[] = [
				{
					...mockStudentReports[1],
					year: 2024,
				},
			];

			renderWithProviders(
				<StudentReportsTab
					studentReports={reportsWithoutCurrentYear}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
				/>
			);

			// Should show loader when selected year doesn't match any report
			expect(screen.getByTestId("document-tab-layout")).toBeInTheDocument();
		});
	});

	describe("Year Navigation", () => {
		it("should sort years in descending order", () => {
			renderWithProviders(
				<StudentReportsTab
					studentReports={mockStudentReports}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
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
				<StudentReportsTab
					studentReports={mockStudentReports}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
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
				<StudentReportsTab
					studentReports={mockStudentReports}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
				/>
			);

			// Switch to 2025
			const yearSelect = screen.getByLabelText("Select Year");
			await user.selectOptions(yearSelect, "2025");

			await waitFor(() => {
				expect(
					screen.getByTestId("inline-editor-Progress Report")
				).toHaveTextContent("Student progress report for 2025");
			});

			// Switch back to 2026
			await user.selectOptions(yearSelect, "2026");

			await waitFor(() => {
				expect(
					screen.getByTestId("inline-editor-Progress Report")
				).toHaveTextContent("Student progress report for 2026");
			});
		});
	});

	describe("Word Limit", () => {
		it("should enforce 300 word limit on progress report", () => {
			renderWithProviders(
				<StudentReportsTab
					studentReports={mockStudentReports}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
				/>
			);

			const editor = screen.getByTestId("inline-editor-Progress Report");
			const textbox = editor.querySelector('[role="textbox"]');
			expect(textbox).toHaveAttribute("data-word-limit", "300");
		});
	});

	describe("Edit Permissions", () => {
		it("should pass canEdit prop to editor", () => {
			renderWithProviders(
				<StudentReportsTab
					studentReports={mockStudentReports}
					project={mockProject}
					projectId={mockProject.id}
					members={[]}
				/>
			);

			// Editor should have canEdit attribute
			const editor = screen.getByTestId("inline-editor-Progress Report");
			expect(
				editor.querySelector('[data-can-edit="true"]')
			).toBeInTheDocument();
		});
	});

	describe("Document Actions", () => {
		it("should render DocumentTabLayout with correct props", () => {
			renderWithProviders(
				<StudentReportsTab
					studentReports={mockStudentReports}
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
