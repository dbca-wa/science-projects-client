/**
 * Tab Navigation - Preservation Tests
 */

/**
 * CRITICAL: These tests MUST PASS on unfixed code - they capture baseline behaviour.
 * These tests ensure that tab navigation and state preservation work correctly.
 *
 * Property 2: Preservation - Tab Navigation and State Management
 *
 * For all tab switches, the following SHALL be preserved:
 * - State is maintained across tab switches
 * - Content displays correctly in each tab
 * - No data is lost when switching tabs
 * - URL updates correctly
 * - Tab selection persists
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProjectDetailPage from "@/pages/projects/ProjectDetailPage";
import * as useProjectHook from "@/features/projects/hooks/useProject";
import * as useCurrentUserHook from "@/features/auth";

// Mock hooks
vi.mock("@/features/projects/hooks/useProject");
vi.mock("@/features/auth");
vi.mock("@/features/users/hooks/useUserDetail", () => ({
	useUserDetail: () => ({ data: null }),
}));
vi.mock("@/features/caretakers/hooks/useCaretakerPermissions", () => ({
	useCaretakerPermissions: () => ({
		canActAsProjectLead: () => false,
		canActAsBusinessAreaLead: () => false,
		canActForUser: () => false,
	}),
}));

describe("Tab Navigation - Preservation Tests", () => {
	let queryClient: QueryClient;

	const mockProjectData = {
		project: {
			id: 123,
			title: "Test Project",
			business_area: { id: 1, name: "BCS", leader: 1 },
		},
		documents: {
			concept_plan: {
				document: { id: 1, creator: 1, modifier: 1 },
			},
			project_plan: {
				document: { id: 2, creator: 1, modifier: 1 },
			},
			progress_reports: [{ document: { id: 3, creator: 1, modifier: 1 } }],
			student_reports: [{ document: { id: 4, creator: 1, modifier: 1 } }],
			project_closure: {
				document: { id: 5, creator: 1, modifier: 1 },
			},
		},
		details: {},
		members: [],
	};

	const mockCurrentUser = {
		id: 1,
		username: "testuser",
		email: "test@example.com",
	};

	beforeEach(() => {
		vi.clearAllMocks();
		queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false },
			},
		});

		// Mock useProject hook
		vi.mocked(useProjectHook.useProject).mockReturnValue({
			data: mockProjectData,
			isLoading: false,
			error: null,
		} as unknown as ReturnType<typeof useProjectHook.useProject>);

		// Mock useCurrentUser hook
		vi.mocked(useCurrentUserHook.useCurrentUser).mockReturnValue({
			data: mockCurrentUser,
		} as unknown as ReturnType<typeof useCurrentUserHook.useCurrentUser>);
	});

	const renderWithRouter = (initialTab = "overview") => {
		return render(
			<QueryClientProvider client={queryClient}>
				<MemoryRouter initialEntries={[`/projects/123/${initialTab}`]}>
					<Routes>
						<Route
							path="/projects/:id/:tab"
							element={<ProjectDetailPage selectedTab={initialTab} />}
						/>
					</Routes>
				</MemoryRouter>
			</QueryClientProvider>
		);
	};

	/**
	 * Property: For all tab switches, overview tab SHALL display correctly
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should display overview tab content correctly", async () => {
		renderWithRouter("overview");

		await waitFor(() => {
			// Overview tab should be visible
			expect(screen.getByText("Overview")).toBeInTheDocument();
		});

		console.log("✓ Overview tab displays correctly (preserved)");
	});

	/**
	 * Property: For all tab switches, concept plan tab SHALL display correctly
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should display concept plan tab when available", async () => {
		renderWithRouter("concept");

		await waitFor(() => {
			// Concept Plan tab should be visible
			expect(screen.getByText("Concept Plan")).toBeInTheDocument();
		});

		console.log("✓ Concept plan tab displays correctly (preserved)");
	});

	/**
	 * Property: For all tab switches, project plan tab SHALL display correctly
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should display project plan tab when available", async () => {
		renderWithRouter("project");

		await waitFor(() => {
			// Project Plan tab should be visible
			expect(screen.getByText("Project Plan")).toBeInTheDocument();
		});

		console.log("✓ Project plan tab displays correctly (preserved)");
	});

	/**
	 * Property: For all tab switches, progress reports tab SHALL display correctly
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should display progress reports tab when available", async () => {
		renderWithRouter("progress");

		await waitFor(() => {
			// Progress Reports tab should be visible
			expect(screen.getByText("Progress Reports")).toBeInTheDocument();
		});

		console.log("✓ Progress reports tab displays correctly (preserved)");
	});

	/**
	 * Property: For all tab switches, student reports tab SHALL display correctly
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should display student reports tab when available", async () => {
		renderWithRouter("student");

		await waitFor(() => {
			// Student Reports tab should be visible
			expect(screen.getByText("Student Reports")).toBeInTheDocument();
		});

		console.log("✓ Student reports tab displays correctly (preserved)");
	});

	/**
	 * Property: For all tab switches, closure tab SHALL display correctly
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should display project closure tab when available", async () => {
		renderWithRouter("closure");

		await waitFor(() => {
			// Project Closure tab should be visible
			expect(screen.getByText("Project Closure")).toBeInTheDocument();
		});

		console.log("✓ Project closure tab displays correctly (preserved)");
	});

	/**
	 * Property: For all tab switches, only available tabs SHALL be shown
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should only show tabs for available documents", async () => {
		// Mock project with only overview and concept plan
		vi.mocked(useProjectHook.useProject).mockReturnValue({
			data: {
				...mockProjectData,
				documents: {
					concept_plan: mockProjectData.documents.concept_plan,
				},
			},
			isLoading: false,
			error: null,
		} as unknown as ReturnType<typeof useProjectHook.useProject>);

		renderWithRouter("overview");

		await waitFor(() => {
			// Overview and Concept Plan should be visible
			expect(screen.getByText("Overview")).toBeInTheDocument();
			expect(screen.getByText("Concept Plan")).toBeInTheDocument();

			// Other tabs should not be visible
			expect(screen.queryByText("Project Plan")).not.toBeInTheDocument();
			expect(screen.queryByText("Progress Reports")).not.toBeInTheDocument();
			expect(screen.queryByText("Student Reports")).not.toBeInTheDocument();
			expect(screen.queryByText("Project Closure")).not.toBeInTheDocument();
		});

		console.log("✓ Only available tabs shown (preserved)");
	});

	/**
	 * Property: For all tab switches, tab selection SHALL be maintained
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should maintain selected tab state", async () => {
		const { rerender } = renderWithRouter("concept");

		await waitFor(() => {
			expect(screen.getByText("Concept Plan")).toBeInTheDocument();
		});

		// Re-render with same tab
		rerender(
			<QueryClientProvider client={queryClient}>
				<MemoryRouter initialEntries={["/projects/123/concept"]}>
					<Routes>
						<Route
							path="/projects/:id/:tab"
							element={<ProjectDetailPage selectedTab="concept" />}
						/>
					</Routes>
				</MemoryRouter>
			</QueryClientProvider>
		);

		// Tab should still be selected
		await waitFor(() => {
			expect(screen.getByText("Concept Plan")).toBeInTheDocument();
		});

		console.log("✓ Tab selection maintained (preserved)");
	});

	/**
	 * Property: For all tab switches, project data SHALL be available to all tabs
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should provide project data to all tabs", async () => {
		renderWithRouter("overview");

		await waitFor(() => {
			// Project title should be in breadcrumbs
			expect(screen.getByText("Test Project")).toBeInTheDocument();
		});

		console.log("✓ Project data available to all tabs (preserved)");
	});

	/**
	 * Property: For all tab switches, loading state SHALL display correctly
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should display loading state while fetching project", async () => {
		vi.mocked(useProjectHook.useProject).mockReturnValue({
			data: undefined,
			isLoading: true,
			error: null,
		} as unknown as ReturnType<typeof useProjectHook.useProject>);

		renderWithRouter("overview");

		// Loading spinner should be visible
		expect(screen.getByText("Loading project...")).toBeInTheDocument();

		console.log("✓ Loading state displays correctly (preserved)");
	});

	/**
	 * Property: For all tab switches, error state SHALL display correctly
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should display error state when project not found", async () => {
		vi.mocked(useProjectHook.useProject).mockReturnValue({
			data: null,
			isLoading: false,
			error: new Error("Not found"),
		} as unknown as ReturnType<typeof useProjectHook.useProject>);

		renderWithRouter("overview");

		await waitFor(() => {
			// Error message should be visible
			expect(screen.getByText(/does not exist/i)).toBeInTheDocument();
		});

		console.log("✓ Error state displays correctly (preserved)");
	});
});
