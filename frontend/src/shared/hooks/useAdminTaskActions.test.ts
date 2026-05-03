/**
 * useAdminTaskActions Hook Tests
 *
 * Verifies each hook (approve, reject, cancel) calls the correct
 * API endpoint and returns a usable mutation object.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

// Mock the API client
const mockPost = vi.fn().mockResolvedValue({});
vi.mock("@/shared/services/api/client.service", () => ({
	apiClient: {
		post: (...args: unknown[]) => mockPost(...args),
	},
}));

// Mock sonner toast
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

const createWrapper = () => {
	const qc = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});
	return ({ children }: { children: ReactNode }) =>
		createElement(QueryClientProvider, { client: qc }, children);
};

describe("useAdminTaskActions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("useApproveAdminTask", () => {
		it("should return a mutation with mutate function", async () => {
			const { useApproveAdminTask } = await import("./useAdminTaskActions");
			const { result } = renderHook(() => useApproveAdminTask(), {
				wrapper: createWrapper(),
			});
			expect(result.current.mutate).toBeDefined();
		});

		it("should call the correct API endpoint on mutate", async () => {
			const { useApproveAdminTask } = await import("./useAdminTaskActions");
			const { result } = renderHook(() => useApproveAdminTask(), {
				wrapper: createWrapper(),
			});

			result.current.mutate(42);

			await waitFor(() => {
				expect(mockPost).toHaveBeenCalledWith("adminoptions/tasks/42/approve");
			});
		});
	});

	describe("useRejectAdminTask", () => {
		it("should return a mutation with mutate function", async () => {
			const { useRejectAdminTask } = await import("./useAdminTaskActions");
			const { result } = renderHook(() => useRejectAdminTask(), {
				wrapper: createWrapper(),
			});
			expect(result.current.mutate).toBeDefined();
		});

		it("should call the correct API endpoint on mutate", async () => {
			const { useRejectAdminTask } = await import("./useAdminTaskActions");
			const { result } = renderHook(() => useRejectAdminTask(), {
				wrapper: createWrapper(),
			});

			result.current.mutate(99);

			await waitFor(() => {
				expect(mockPost).toHaveBeenCalledWith("adminoptions/tasks/99/reject");
			});
		});
	});

	describe("useCancelAdminTask", () => {
		it("should return a mutation with mutate function", async () => {
			const { useCancelAdminTask } = await import("./useAdminTaskActions");
			const { result } = renderHook(() => useCancelAdminTask(), {
				wrapper: createWrapper(),
			});
			expect(result.current.mutate).toBeDefined();
		});

		it("should call the correct API endpoint on mutate", async () => {
			const { useCancelAdminTask } = await import("./useAdminTaskActions");
			const { result } = renderHook(() => useCancelAdminTask(), {
				wrapper: createWrapper(),
			});

			result.current.mutate(7);

			await waitFor(() => {
				expect(mockPost).toHaveBeenCalledWith("adminoptions/tasks/7/cancel");
			});
		});
	});
});
