/**
 * ProjectClosureTab Tests
 *
 * Verifies reopen project modal behaviour:
 * - Reopen button should be visible for closed projects
 * - Clicking reopen button should open a confirmation modal
 * - Modal should contain confirmation checkbox and reason textarea
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { ProjectClosureTab } from "./ProjectClosureTab";
import type { IProjectClosure } from "@/shared/types/document.types";
import type { IProjectData } from "@/shared/types/project.types";

// Mock dependencies
vi.mock("@/shared/components/documents", () => ({
	DocumentTabLayout: ({
		children,
		onReopenProject,
	}: {
		children: React.ReactNode;
		onReopenProject?: () => void;
	}) => (
		<div data-testid="document-tab-layout">
			{/* Simulate reopen button that would be in DocumentActionsSection */}
			<button data-testid="reopen-project-button" onClick={onReopenProject}>
				Reopen Project
			</button>
			{children}
		</div>
	),
}));

vi.mock("@/shared/components/editor", () => ({
	InlineSaveEditor: ({ label }: { label: string }) => (
		<div data-testid={`inline-editor-${label}`}>{label}</div>
	),
}));

vi.mock("@/shared/components/editor/FormRichTextEditor", () => ({
	FormRichTextEditor: ({
		value,
		onChange,
		placeholder,
	}: {
		value: string;
		onChange: (val: string) => void;
		placeholder?: string;
	}) => (
		<textarea
			data-testid="rich-text-editor"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			aria-label="Reason for reopening"
		/>
	),
}));

vi.mock("@/shared/components/ProjectSection", () => ({
	ProjectSection: ({
		title,
		children,
	}: {
		title: string;
		children: React.ReactNode;
	}) => <div data-testid={`section-${title}`}>{children}</div>,
}));

vi.mock("@/features/auth", () => ({
	useCurrentUser: () => ({
		data: { id: 1, is_superuser: true, is_staff: true },
	}),
}));

vi.mock("@/features/projects/components/comments", () => ({
	CommentSection: () => <div data-testid="comment-section" />,
}));

vi.mock("@/shared/hooks/queries/useUpdateContent", () => ({
	useUpdateContent: () => ({
		mutate: vi.fn(),
		isPending: false,
	}),
}));

// Test data
const mockProject: IProjectData = {
	id: 1,
	title: "Test Project",
	status: "completed",
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

const mockProjectClosure: IProjectClosure = {
	id: 1,
	document: {
		id: 1,
		project: mockProject,
		kind: "project_closure",
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
	intended_outcome: "<p>Test outcome</p>",
	reason: "<p>Test reason</p>",
	scientific_outputs: "<p>Test outputs</p>",
	knowledge_transfer: "<p>Test transfer</p>",
	data_location: "<p>Test data location</p>",
	hardcopy_location: "<p>Test hardcopy location</p>",
	backup_location: "<p>Test backup location</p>",
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

describe("ProjectClosureTab", () => {
	/**
	 * Test 1: Reopen button should exist for closed projects
	 */
	it("should show reopen button for closed projects", () => {
		renderWithProviders(
			<ProjectClosureTab
				projectClosure={mockProjectClosure}
				project={mockProject}
				projectId={mockProject.id}
				members={[]}
				isBaLead={true}
			/>
		);

		// Button should exist (this works)
		const reopenButton = screen.getByTestId("reopen-project-button");
		expect(reopenButton).toBeInTheDocument();

		console.log("✓ Reopen button exists (expected)");
	});

	/**
	 * Test 2: Clicking reopen button should open the modal
	 */
	it("should open reopen modal when button is clicked", async () => {
		const user = userEvent.setup();

		renderWithProviders(
			<ProjectClosureTab
				projectClosure={mockProjectClosure}
				project={mockProject}
				projectId={mockProject.id}
				members={[]}
				isBaLead={true}
			/>
		);

		// Click the reopen button
		const reopenButton = screen.getByTestId("reopen-project-button");
		await user.click(reopenButton);

		// Reopen modal should appear after clicking the button
		// This assertion verifies the modal is rendered
		await waitFor(() => {
			const modal = screen.queryByRole("dialog");
			expect(modal).toBeInTheDocument();
		});

		// If we get here without the modal, log diagnostic info
		const modal = screen.queryByRole("dialog");
		if (!modal) {
			console.log("Reopen modal not rendered:");
			console.log("- Reopen button exists: YES");
			console.log("- Button is clickable: YES");
			console.log("- Modal appears after click: NO");
			console.log("- Modal component may be missing");
		}
	});

	/**
	 * Test 3: Modal should have a confirmation checkbox
	 */
	it("should show confirmation checkbox in reopen modal", async () => {
		const user = userEvent.setup();

		renderWithProviders(
			<ProjectClosureTab
				projectClosure={mockProjectClosure}
				project={mockProject}
				projectId={mockProject.id}
				members={[]}
				isBaLead={true}
			/>
		);

		// Click the reopen button
		const reopenButton = screen.getByTestId("reopen-project-button");
		await user.click(reopenButton);

		// Confirmation checkbox should exist in the modal
		await waitFor(() => {
			const checkbox = screen.queryByRole("checkbox", {
				name: /are you sure you want to reopen this project/i,
			});
			expect(checkbox).toBeInTheDocument();
		});

		const checkbox = screen.queryByRole("checkbox");
		if (!checkbox) {
			console.log(
				"Confirmation checkbox not found — modal may not be implemented"
			);
		}
	});

	/**
	 * Test 4: Modal should have a reason textarea
	 */
	it("should show reason textarea in reopen modal", async () => {
		const user = userEvent.setup();

		renderWithProviders(
			<ProjectClosureTab
				projectClosure={mockProjectClosure}
				project={mockProject}
				projectId={mockProject.id}
				members={[]}
				isBaLead={true}
			/>
		);

		// Click the reopen button
		const reopenButton = screen.getByTestId("reopen-project-button");
		await user.click(reopenButton);

		// Rich text editor for reason should exist in the modal
		await waitFor(() => {
			const editor = screen.queryByTestId("rich-text-editor");
			expect(editor).toBeInTheDocument();
		});
	});

	/**
	 * Test 5: Check if ReopenProjectModal component exists in codebase
	 *
	 * This test verifies that the ReopenProjectModal component is available and can be imported.
	 */
	it("should have ReopenProjectModal component available", async () => {
		// Try to dynamically import the component
		try {
			// This will succeed if the component exists
			const module = await import("../modals/ReopenProjectModal");
			const componentExists = !!module.ReopenProjectModal;
			expect(componentExists).toBe(true);
		} catch (error) {
			console.log("Import error:", error);
			expect(false).toBe(true); // Fail the test if import fails
		}
	});
});
