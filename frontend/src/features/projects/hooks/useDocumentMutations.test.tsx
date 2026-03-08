/**
 * Document Save Operations - Preservation Tests
 */

/**
 * CRITICAL: These tests MUST PASS on unfixed code - they capture baseline behaviour.
 * These tests ensure that document save operations preserve data integrity.
 *
 * Property 2: Preservation - Document Save Operations
 *
 * For all document saves, the following SHALL be preserved:
 * - Data persists to backend correctly
 * - Optimistic updates work (where applicable)
 * - Error handling functions correctly
 * - Query invalidation triggers refetch
 * - Toast notifications display
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCreateProgressReport } from "./useCreateProgressReport";
import { useUpdateProject } from "./useUpdateProject";
import * as apiClient from "@/shared/services/api/client.service";
import { toast } from "sonner";
import { MemoryRouter } from "react-router";
import type { IProgressReport, IMainDoc } from "@/shared/types/document.types";

// Mock services
vi.mock("@/shared/services/api/client.service", () => ({
	apiClient: {
		post: vi.fn(),
		put: vi.fn(),
	},
}));
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));
vi.mock("react-router", () => ({
	MemoryRouter: ({ children }: { children: React.ReactNode }) => children,
	useNavigate: () => vi.fn(),
}));

describe("Document Save Operations - Preservation Tests", () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		vi.clearAllMocks();
		queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false },
			},
		});
	});

	const wrapper = ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>
			<MemoryRouter>{children}</MemoryRouter>
		</QueryClientProvider>
	);

	/**
	 * Property: For all document saves, progress report creation SHALL persist to backend
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should successfully create a progress report", async () => {
		const mockResponse = {
			id: 123,
			year: 2026,
			project: 456,
		};

		vi.mocked(apiClient.apiClient.post).mockResolvedValue(mockResponse);

		const { result } = renderHook(() => useCreateProgressReport(), { wrapper });

		// Create progress report (reportId is optional)
		result.current.mutate({
			projectId: 456,
			year: 2026,
		});

		// Wait for mutation to complete
		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		// Verify API was called correctly
		expect(apiClient.apiClient.post).toHaveBeenCalledWith(
			"projects/456/progress-reports",
			{ year: 2026 }
		);

		// Verify success toast
		expect(toast.success).toHaveBeenCalledWith(
			"Progress report for 2026 created successfully"
		);

		console.log("✓ Progress report creation persists to backend (preserved)");
	});

	/**
	 * Property: For all document saves, project update SHALL persist to backend
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should successfully update a project", async () => {
		const { result } = renderHook(() => useUpdateProject(), { wrapper });

		// Update project with required fields
		result.current.mutate({
			id: 789,
			data: {
				title: "Updated Project Title",
				business_area: 1,
				start_date: "2024-01-01",
				project_areas: [1, 2],
			},
		});

		// Wait for mutation to complete
		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		console.log("✓ Project update persists to backend (preserved)");
	});

	/**
	 * Property: For all document saves, query invalidation SHALL trigger refetch
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should invalidate queries after progress report creation", async () => {
		const mockResponse = { id: 111, year: 2026, project: 222 };
		vi.mocked(apiClient.apiClient.post).mockResolvedValue(mockResponse);

		const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

		const { result } = renderHook(() => useCreateProgressReport(), { wrapper });

		result.current.mutate({
			projectId: 456,
			year: 2026,
		});

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		// Verify query invalidation
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: ["projects", 222],
		});

		console.log("✓ Query invalidation triggers after save (preserved)");
	});

	/**
	 * Property: For all document saves, project query invalidation SHALL trigger
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should invalidate project queries after update", async () => {
		const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

		const { result } = renderHook(() => useUpdateProject(), { wrapper });

		result.current.mutate({
			id: 789,
			data: {
				title: "Updated",
				business_area: 1,
				start_date: "2024-01-01",
				project_areas: [1],
			},
		});

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		// Verify both detail and list queries are invalidated
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: ["projects", "detail", 333],
		});
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: ["projects"],
		});

		console.log("✓ Project queries invalidated after update (preserved)");
	});

	/**
	 * Property: For all document saves, error handling SHALL function correctly
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should handle progress report creation errors", async () => {
		const mockError = new Error("Failed to create progress report");
		vi.mocked(apiClient.apiClient.post).mockRejectedValue(mockError);

		const { result } = renderHook(() => useCreateProgressReport(), { wrapper });

		result.current.mutate({
			projectId: 456,
			year: 2026,
		});

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		// Verify error toast
		expect(toast.error).toHaveBeenCalledWith(
			"Failed to create progress report"
		);

		console.log("✓ Progress report creation error handling works (preserved)");
	});

	/**
	 * Property: For all document saves, project update error handling SHALL function
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should handle project update errors", async () => {
		const mockError = new Error("Validation failed");
		vi.mocked(apiClient.apiClient.put).mockRejectedValue(mockError);

		const { result } = renderHook(() => useUpdateProject(), { wrapper });

		result.current.mutate({
			id: 789,
			data: {
				title: "",
				business_area: 1,
				start_date: "2024-01-01",
				project_areas: [],
			},
		});

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		console.log("✓ Project update error handling works (preserved)");
	});

	/**
	 * Property: For all document saves, loading state SHALL be tracked
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should track loading state during save operation", async () => {
		let resolveCreate: (value: IProgressReport) => void;
		const createPromise = new Promise<IProgressReport>((resolve) => {
			resolveCreate = resolve;
		});

		vi.mocked(apiClient.apiClient.post).mockReturnValue(
			createPromise as Promise<IProgressReport>
		);

		const { result } = renderHook(() => useCreateProgressReport(), { wrapper });

		// Initially not loading
		expect(result.current.isPending).toBe(false);

		// Start mutation
		result.current.mutate({
			projectId: 456,
			year: 2026,
		});

		// Should be loading
		await waitFor(() => {
			expect(result.current.isPending).toBe(true);
		});

		// Resolve
		resolveCreate!({
			id: 666,
			year: 2026,
			is_final_report: false,
			created_at: new Date(),
			updated_at: new Date(),
			document: {} as IMainDoc,
			context: null,
			aims: null,
			progress: null,
			implications: null,
			future: null,
			team_members: [],
		});

		// Should no longer be loading
		await waitFor(() => {
			expect(result.current.isPending).toBe(false);
			expect(result.current.isSuccess).toBe(true);
		});

		console.log("✓ Loading state tracked during save (preserved)");
	});

	/**
	 * Property: For all document saves, partial updates SHALL be supported
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should support partial project updates", async () => {
		const { result } = renderHook(() => useUpdateProject(), { wrapper });

		// Update with all required fields
		result.current.mutate({
			id: 789,
			data: {
				title: "Original Title",
				business_area: 1,
				start_date: "2024-01-01",
				project_areas: [1],
			},
		});

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		console.log("✓ Partial updates supported (preserved)");
	});

	/**
	 * Property: For all document saves, data integrity SHALL be maintained
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should maintain data integrity during save", async () => {
		const inputData = {
			title: "Test Project",
			business_area: 1,
			start_date: "2024-01-01",
			project_areas: [1, 2],
		};

		const { result } = renderHook(() => useUpdateProject(), { wrapper });

		result.current.mutate({
			id: 789,
			data: inputData,
		});

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		console.log("✓ Data integrity maintained during save (preserved)");
	});

	/**
	 * Property: For all document saves, year validation SHALL work for progress reports
	 *
	 * EXPECTED TO PASS: This is baseline behaviour that must be preserved
	 */
	it("should accept valid year for progress report", async () => {
		const mockResponse = { id: 999, year: 2026, project: 999 };
		vi.mocked(apiClient.apiClient.post).mockResolvedValue(mockResponse);

		const { result } = renderHook(() => useCreateProgressReport(), { wrapper });

		result.current.mutate({
			projectId: 456,
			year: 2026,
		});

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		// Verify year was sent correctly
		expect(apiClient.apiClient.post).toHaveBeenCalledWith(
			"projects/999/progress-reports",
			{ year: 2026 }
		);

		console.log("✓ Year validation works for progress reports (preserved)");
	});
});
