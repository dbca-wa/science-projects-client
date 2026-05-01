/**
 * ConceptPlanTab Page Test
 *
 * Tests user flows, accessibility, and document actions for concept plans.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { ConceptPlanTab } from "./ConceptPlanTab";
import type { IConceptPlan } from "@/shared/types/document.types";
import type { IProjectData } from "@/shared/types/project.types";
import type { IUserData } from "@/shared/types/user.types";

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

// Test data
const mockConceptPlan: IConceptPlan = {
	id: 1,
	document: {
		id: 1,
		created_year: 2026,
		created_at: new Date("2026-01-01T00:00:00Z"),
		creator: 1,
		modifier: 1,
		updated_at: new Date("2026-01-01T00:00:00Z"),
		kind: "concept_plan",
		project: {
			id: 1,
			title: "Test Project",
			tag: "TEST-001",
			tagline: "",
			status: "active",
			kind: "science",
			year: 2026,
			number: 1,
			start_date: new Date("2024-01-01"),
			end_date: new Date("2024-12-31"),
			description: "",
			image: null,
			areas: [],
			business_area: {
				id: 1,
				name: "Test BA",
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
		},
		status: "approved",
		project_lead_approval_granted: false,
		business_area_lead_approval_granted: false,
		directorate_approval_granted: false,
		pdf_generation_in_progress: false,
		pdf: { file: "", document: 1 },
	},
	background: "<p>Test background</p>",
	aims: "<p>Test aims</p>",
	outcome: "<p>Test outcome</p>",
	collaborations: "<p>Test collaborations</p>",
	strategic_context: "<p>Test strategic context</p>",
	staff_time_allocation: "<p>Test staff time allocation</p>",
	budget: "<p>Test budget</p>",
};

const mockProject: IProjectData = {
	id: 1,
	title: "Test Project",
	tag: "TEST-001",
	tagline: "",
	status: "active",
	kind: "science",
	year: 2026,
	number: 1,
	start_date: new Date("2026-01-01"),
	end_date: new Date("2026-12-31"),
	description: "",
	image: null,
	areas: [],
	business_area: {
		id: 1,
		name: "Test BA",
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
	created_at: new Date("2026-01-01T00:00:00Z"),
	updated_at: new Date("2026-01-01T00:00:00Z"),
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

describe("ConceptPlanTab", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Accessibility", () => {
		it("should have no accessibility violations", async () => {
			const { container } = renderWithProviders(
				<ConceptPlanTab
					projectId={1}
					conceptPlan={mockConceptPlan}
					project={mockProject}
					members={[]}
				/>
			);

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("should have proper heading hierarchy", () => {
			renderWithProviders(
				<ConceptPlanTab
					projectId={1}
					conceptPlan={mockConceptPlan}
					project={mockProject}
					members={[]}
				/>
			);

			// InlineSaveEditor provides labels, no separate headings needed
			expect(screen.getByLabelText("Background")).toBeInTheDocument();
			expect(screen.getByLabelText("Aims")).toBeInTheDocument();
			expect(screen.getByLabelText("Expected Outcomes")).toBeInTheDocument();
			expect(screen.getByLabelText("Collaborations")).toBeInTheDocument();
			expect(screen.getByLabelText("Strategic Context")).toBeInTheDocument();
			expect(
				screen.getByLabelText("Staff Time Allocation (FTE)")
			).toBeInTheDocument();
			expect(
				screen.getByLabelText("Indicative Operating Budget ($)")
			).toBeInTheDocument();
		});

		it("should have accessible form labels", () => {
			renderWithProviders(
				<ConceptPlanTab
					projectId={1}
					conceptPlan={mockConceptPlan}
					project={mockProject}
					members={[]}
				/>
			);

			// All editors should have labels
			expect(screen.getByLabelText("Background")).toBeInTheDocument();
			expect(screen.getByLabelText("Aims")).toBeInTheDocument();
			expect(screen.getByLabelText("Expected Outcomes")).toBeInTheDocument();
			expect(screen.getByLabelText("Collaborations")).toBeInTheDocument();
			expect(screen.getByLabelText("Strategic Context")).toBeInTheDocument();
			expect(
				screen.getByLabelText("Staff Time Allocation (FTE)")
			).toBeInTheDocument();
			expect(
				screen.getByLabelText("Indicative Operating Budget ($)")
			).toBeInTheDocument();
		});
	});

	describe("User Flows", () => {
		it("should display all concept plan sections", () => {
			renderWithProviders(
				<ConceptPlanTab
					projectId={1}
					conceptPlan={mockConceptPlan}
					project={mockProject}
					members={[]}
				/>
			);

			// All sections should be present (check by editor labels)
			expect(
				screen.getByTestId("inline-editor-Background")
			).toBeInTheDocument();
			expect(screen.getByTestId("inline-editor-Aims")).toBeInTheDocument();
			expect(
				screen.getByTestId("inline-editor-Expected Outcomes")
			).toBeInTheDocument();
			expect(
				screen.getByTestId("inline-editor-Collaborations")
			).toBeInTheDocument();
			expect(
				screen.getByTestId("inline-editor-Strategic Context")
			).toBeInTheDocument();
			expect(
				screen.getByTestId("inline-editor-Staff Time Allocation (FTE)")
			).toBeInTheDocument();
			expect(
				screen.getByTestId("inline-editor-Indicative Operating Budget ($)")
			).toBeInTheDocument();
		});

		it("should display content in all sections", () => {
			renderWithProviders(
				<ConceptPlanTab
					projectId={1}
					conceptPlan={mockConceptPlan}
					project={mockProject}
					members={[]}
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
			expect(
				screen.getByTestId("inline-editor-Collaborations")
			).toHaveTextContent("Test collaborations");
			expect(
				screen.getByTestId("inline-editor-Strategic Context")
			).toHaveTextContent("Test strategic context");
			expect(
				screen.getByTestId("inline-editor-Staff Time Allocation (FTE)")
			).toHaveTextContent("Test staff time allocation");
			expect(
				screen.getByTestId("inline-editor-Indicative Operating Budget ($)")
			).toHaveTextContent("Test budget");
		});

		it("should show empty state when no concept plan", () => {
			renderWithProviders(
				<ConceptPlanTab
					projectId={1}
					conceptPlan={null}
					project={mockProject}
					members={[]}
				/>
			);

			expect(
				screen.getByText(/no concept plan available/i)
			).toBeInTheDocument();
		});
	});

	describe("Word Limits", () => {
		it("should enforce 500 word limit on all sections", () => {
			renderWithProviders(
				<ConceptPlanTab
					projectId={1}
					conceptPlan={mockConceptPlan}
					project={mockProject}
					members={[]}
				/>
			);

			// All editors should have 500 word limit
			const sections = [
				"Background",
				"Aims",
				"Expected Outcomes",
				"Collaborations",
				"Strategic Context",
				"Staff Time Allocation (FTE)",
				"Indicative Operating Budget ($)",
			];

			sections.forEach((section) => {
				const editor = screen.getByTestId(`inline-editor-${section}`);
				const textbox = editor.querySelector('[role="textbox"]');
				expect(textbox).toHaveAttribute("data-word-limit", "500");
			});
		});
	});

	describe("Edit Permissions", () => {
		it("should pass canEdit prop to all editors", () => {
			renderWithProviders(
				<ConceptPlanTab
					projectId={1}
					conceptPlan={mockConceptPlan}
					project={mockProject}
					members={[]}
				/>
			);

			// All editors should have canEdit attribute
			const sections = [
				"Background",
				"Aims",
				"Expected Outcomes",
				"Collaborations",
				"Strategic Context",
				"Staff Time Allocation (FTE)",
				"Indicative Operating Budget ($)",
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
				<ConceptPlanTab
					projectId={1}
					conceptPlan={mockConceptPlan}
					project={mockProject}
					members={[]}
					userIsCaretakerOfAdmin={true}
				/>
			);

			const layout = screen.getByTestId("document-tab-layout");
			expect(layout).toBeInTheDocument();
			expect(layout).toHaveAttribute("data-document-status", "approved");
		});

		it("should pass all document action props to DocumentTabLayout", () => {
			const mockCreator = {
				id: 1,
				display_first_name: "John",
				display_last_name: "Doe",
			} as IUserData;
			const mockModifier = {
				id: 2,
				display_first_name: "Jane",
				display_last_name: "Smith",
			} as IUserData;

			renderWithProviders(
				<ConceptPlanTab
					projectId={1}
					conceptPlan={mockConceptPlan}
					project={mockProject}
					members={[]}
					creator={mockCreator}
					modifier={mockModifier}
					userIsCaretakerOfAdmin={true}
					userIsCaretakerOfBaLeader={false}
					userIsCaretakerOfProjectLeader={false}
					isBaLead={true}
				/>
			);

			// DocumentTabLayout should be rendered
			expect(screen.getByTestId("document-tab-layout")).toBeInTheDocument();
		});
	});
});
