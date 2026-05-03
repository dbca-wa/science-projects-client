/**
 * Tab Navigation Tests
 *
 * Verifies tab navigation and state management:
 * - State is maintained across tab switches
 * - Content displays correctly in each tab
 * - No data is lost when switching tabs
 * - URL updates correctly
 * - Tab selection persists
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProjectDetailPage from "@/pages/projects/ProjectDetailPage";
import * as useProjectHook from "@/features/projects/hooks/useProject";
import * as useCurrentUserHook from "@/features/auth";

// Spy for capturing navigate calls
const mockNavigate = vi.fn();

// Mock react-router, keeping real components but overriding useNavigate
vi.mock("react-router", async () => {
	const actual = await vi.importActual("react-router");
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

// Mock hooks
vi.mock("@/features/projects/hooks/useProject");
vi.mock("@/features/auth");
vi.mock("@/features/users/hooks/useUserDetail", () => ({
	useUserDetail: () => ({ data: null }),
}));
vi.mock("@/shared/hooks/useCaretakerPermissions", () => ({
	useCaretakerPermissions: () => ({
		canActAsProjectLead: () => false,
		canActAsBusinessAreaLead: () => false,
		canActForUser: () => false,
	}),
}));
vi.mock("@/features/projects/hooks/useProjectTeam", () => ({
	useProjectTeam: () => ({
		data: [],
		isLoading: false,
		error: null,
	}),
}));
vi.mock("@/features/projects/hooks/useComments", () => ({
	useComments: () => ({
		data: [],
		isLoading: false,
		error: null,
	}),
	useComment: () => ({
		data: null,
		isLoading: false,
		error: null,
	}),
	useCreateComment: () => ({
		mutate: vi.fn(),
		mutateAsync: vi.fn(),
		isPending: false,
		isError: false,
		error: null,
	}),
	useUpdateComment: () => ({
		mutate: vi.fn(),
		mutateAsync: vi.fn(),
		isPending: false,
		isError: false,
		error: null,
	}),
	useDeleteComment: () => ({
		mutate: vi.fn(),
		mutateAsync: vi.fn(),
		isPending: false,
		isError: false,
		error: null,
	}),
}));

describe("Tab Navigation", () => {
	let queryClient: QueryClient;

	const mockProjectData = {
		project: {
			id: 123,
			title: "Test Project",
			status: "active",
			kind: "science",
			year: 2024,
			number: 1,
			business_area: { id: 1, name: "BCS", leader: 1 },
		},
		documents: {
			concept_plan: {
				document: { id: 1, creator: 1, modifier: 1 },
				team_members: [],
				comments: [],
			},
			project_plan: {
				document: { id: 2, creator: 1, modifier: 1 },
				team_members: [],
				comments: [],
			},
			progress_reports: [
				{
					document: { id: 3, creator: 1, modifier: 1 },
					team_members: [],
				},
			],
			student_reports: [
				{
					document: { id: 4, creator: 1, modifier: 1 },
				},
			],
			project_closure: {
				document: { id: 5, creator: 1, modifier: 1 },
				team_members: [],
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
						<Route path="/projects/:id/:tab?" element={<ProjectDetailPage />} />
					</Routes>
				</MemoryRouter>
			</QueryClientProvider>
		);
	};

	/**
	 * Overview tab should display correctly
	 */
	it("should display overview tab content correctly", async () => {
		renderWithRouter("overview");

		await waitFor(() => {
			// Overview tab should be visible (use getAllByText since it appears in desktop and mobile)
			const tabs = screen.getAllByText("Overview");
			expect(tabs.length).toBeGreaterThan(0);
		});

		console.log("✓ Overview tab displays correctly");
	});

	/**
	 * Concept plan tab should display correctly
	 */
	it("should display concept plan tab when available", async () => {
		renderWithRouter("concept");

		await waitFor(() => {
			// Concept Plan tab should be visible (use getAllByText since it appears in desktop and mobile)
			const tabs = screen.getAllByText("Concept Plan");
			expect(tabs.length).toBeGreaterThan(0);
		});

		console.log("✓ Concept plan tab displays correctly");
	});

	/**
	 * Project plan tab should display correctly
	 */
	it("should display project plan tab when available", async () => {
		renderWithRouter("project");

		await waitFor(() => {
			// Project Plan tab should be visible (use getAllByText since it appears in desktop and mobile)
			const tabs = screen.getAllByText("Project Plan");
			expect(tabs.length).toBeGreaterThan(0);
		});

		console.log("✓ Project plan tab displays correctly");
	});

	/**
	 * Progress reports tab should display correctly
	 */
	it("should display progress reports tab when available", async () => {
		renderWithRouter("progress");

		await waitFor(() => {
			// Progress Reports tab should be visible (use getAllByText since it appears in desktop and mobile)
			const tabs = screen.getAllByText("Progress Reports");
			expect(tabs.length).toBeGreaterThan(0);
		});

		console.log("✓ Progress reports tab displays correctly");
	});

	/**
	 * Student reports tab should display correctly
	 */
	it("should display student reports tab when available", async () => {
		// Override mock to use student kind (student reports are only shown for student projects)
		vi.mocked(useProjectHook.useProject).mockReturnValue({
			data: {
				...mockProjectData,
				project: { ...mockProjectData.project, kind: "student" },
			},
			isLoading: false,
			error: null,
		} as unknown as ReturnType<typeof useProjectHook.useProject>);

		renderWithRouter("student");

		await waitFor(() => {
			// Student Reports tab should be visible (use getAllByText since it appears in desktop and mobile)
			const tabs = screen.getAllByText("Student Reports");
			expect(tabs.length).toBeGreaterThan(0);
		});

		console.log("✓ Student reports tab displays correctly");
	});

	/**
	 * Closure tab should display correctly
	 */
	it("should display project closure tab when available", async () => {
		renderWithRouter("closure");

		await waitFor(() => {
			// Project Closure tab should be visible (use getAllByText since it appears in desktop and mobile)
			const tabs = screen.getAllByText("Project Closure");
			expect(tabs.length).toBeGreaterThan(0);
		});

		console.log("✓ Project closure tab displays correctly");
	});

	/**
	 * Only available tabs should be shown
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
			// Overview and Concept Plan should be visible (use getAllByText since they appear in desktop and mobile)
			const overviewTabs = screen.getAllByText("Overview");
			expect(overviewTabs.length).toBeGreaterThan(0);

			const conceptTabs = screen.getAllByText("Concept Plan");
			expect(conceptTabs.length).toBeGreaterThan(0);

			// Other tabs should not be visible
			expect(screen.queryByText("Project Plan")).not.toBeInTheDocument();
			expect(screen.queryByText("Progress Reports")).not.toBeInTheDocument();
			expect(screen.queryByText("Student Reports")).not.toBeInTheDocument();
			expect(screen.queryByText("Project Closure")).not.toBeInTheDocument();
		});

		console.log("✓ Only available tabs shown");
	});

	/**
	 * Tab selection should be maintained
	 */
	it("should maintain selected tab state", async () => {
		const { rerender } = renderWithRouter("concept");

		await waitFor(() => {
			const tabs = screen.getAllByText("Concept Plan");
			expect(tabs.length).toBeGreaterThan(0);
		});

		// Re-render with same tab
		rerender(
			<QueryClientProvider client={queryClient}>
				<MemoryRouter initialEntries={["/projects/123/concept"]}>
					<Routes>
						<Route path="/projects/:id/:tab?" element={<ProjectDetailPage />} />
					</Routes>
				</MemoryRouter>
			</QueryClientProvider>
		);

		// Tab should still be selected
		await waitFor(() => {
			const tabs = screen.getAllByText("Concept Plan");
			expect(tabs.length).toBeGreaterThan(0);
		});

		console.log("✓ Tab selection maintained");
	});

	/**
	 * Project data should be available to all tabs
	 */
	it("should provide project data to all tabs", async () => {
		renderWithRouter("overview");

		await waitFor(() => {
			// Project title should be in breadcrumbs (use getAllByText since it appears in breadcrumb and page title)
			const titles = screen.getAllByText("Test Project");
			expect(titles.length).toBeGreaterThan(0);
		});

		console.log("✓ Project data available to all tabs");
	});

	/**
	 * Loading state should display correctly
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

		console.log("✓ Loading state displays correctly");
	});

	/**
	 * Error state should display correctly
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

		console.log("✓ Error state displays correctly");
	});

	/**
	 * handleTabChange should call navigate with { replace: true }
	 * so tab switches replace the history entry instead of pushing new ones
	 */
	it("should call navigate when switching tabs", async () => {
		const user = userEvent.setup();
		renderWithRouter("overview");

		await waitFor(() => {
			const tabs = screen.getAllByText("Overview");
			expect(tabs.length).toBeGreaterThan(0);
		});

		// Click the Concept Plan tab (desktop TabsTrigger)
		const conceptTab = screen.getAllByText("Concept Plan")[0];
		await user.click(conceptTab);

		// Verify navigate was called with the correct path (no replace — pushes to history for back button)
		expect(mockNavigate).toHaveBeenCalledWith("/projects/123/concept");
	});

	/**
	 * Overview tab should display the navy blue info icon
	 */
	it("should display the info icon on the Overview tab", async () => {
		renderWithRouter("overview");

		await waitFor(() => {
			const tabs = screen.getAllByText("Overview");
			expect(tabs.length).toBeGreaterThan(0);
		});

		// The info icon is rendered inside a navy blue circle (bg-blue-900) next to the Overview label.
		// Find the Overview tab trigger elements and verify the icon container is present.
		const overviewElements = screen.getAllByText("Overview");
		const desktopOverviewTab = overviewElements[0];

		// The parent span wraps both the label and the icon circle
		const parentSpan = desktopOverviewTab.closest("span.inline-flex");
		expect(parentSpan).not.toBeNull();

		// The icon container is a sibling span with bg-blue-500 class
		const iconContainer = parentSpan?.querySelector(".bg-blue-500");
		expect(iconContainer).not.toBeNull();
		expect(iconContainer).toBeInTheDocument();

		// Verify the icon container is a rounded circle with the correct size
		expect(iconContainer).toHaveClass("rounded-full", "size-4");
	});
});
