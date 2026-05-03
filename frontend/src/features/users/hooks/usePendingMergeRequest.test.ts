/**
 * usePendingMergeRequest Hook Tests
 *
 * Verifies the hook returns the correct pending merge task when one
 * exists, and null when no pending merge task matches.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import type { IAdminTask } from "@/shared/types/admin.types";

const mockGet = vi.fn();
vi.mock("@/shared/services/api/client.service", () => ({
	apiClient: {
		get: (...args: unknown[]) => mockGet(...args),
	},
}));

const createWrapper = () => {
	const qc = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
		},
	});
	return ({ children }: { children: ReactNode }) =>
		createElement(QueryClientProvider, { client: qc }, children);
};

const makeMergeTask = (overrides: Partial<IAdminTask> = {}): IAdminTask => ({
	id: 1,
	action: "mergeuser",
	status: "pending",
	requester: {
		id: 10,
		display_first_name: "Admin",
		display_last_name: "User",
		email: "admin@example.com",
	},
	primary_user: {
		id: 10,
		display_first_name: "Admin",
		display_last_name: "User",
		email: "admin@example.com",
	},
	secondary_users: [
		{
			id: 20,
			display_first_name: "Secondary",
			display_last_name: "User",
			email: "secondary@example.com",
		},
	],
	created_at: "2025-01-01T00:00:00Z",
	updated_at: "2025-01-01T00:00:00Z",
	...overrides,
});

describe("usePendingMergeRequest", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return the pending merge task when one exists for the user", async () => {
		const task = makeMergeTask();
		mockGet.mockResolvedValue([task]);

		const { usePendingMergeRequest } = await import("./usePendingMergeRequest");
		const { result } = renderHook(() => usePendingMergeRequest(20), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(result.current.data).toEqual(task);
		});
	});

	it("should return null when no pending merge task exists", async () => {
		mockGet.mockResolvedValue([]);

		const { usePendingMergeRequest } = await import("./usePendingMergeRequest");
		const { result } = renderHook(() => usePendingMergeRequest(20), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(result.current.data).toBeNull();
		});
	});

	it("should return null when tasks exist but none match the user", async () => {
		const task = makeMergeTask({
			secondary_users: [
				{
					id: 999,
					display_first_name: "Other",
					display_last_name: "User",
					email: "other@example.com",
				},
			],
		});
		mockGet.mockResolvedValue([task]);

		const { usePendingMergeRequest } = await import("./usePendingMergeRequest");
		const { result } = renderHook(() => usePendingMergeRequest(20), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(result.current.data).toBeNull();
		});
	});

	it("should not fetch when userId is null", async () => {
		const { usePendingMergeRequest } = await import("./usePendingMergeRequest");
		const { result } = renderHook(() => usePendingMergeRequest(null), {
			wrapper: createWrapper(),
		});

		// Query should not be enabled, so data stays undefined
		expect(result.current.data).toBeUndefined();
		expect(mockGet).not.toHaveBeenCalled();
	});

	it("should ignore non-merge tasks", async () => {
		const caretakerTask = makeMergeTask({
			action: "setcaretaker",
		});
		mockGet.mockResolvedValue([caretakerTask]);

		const { usePendingMergeRequest } = await import("./usePendingMergeRequest");
		const { result } = renderHook(() => usePendingMergeRequest(20), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(result.current.data).toBeNull();
		});
	});

	it("should ignore non-pending merge tasks", async () => {
		const approvedTask = makeMergeTask({
			status: "approved",
		});
		mockGet.mockResolvedValue([approvedTask]);

		const { usePendingMergeRequest } = await import("./usePendingMergeRequest");
		const { result } = renderHook(() => usePendingMergeRequest(20), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(result.current.data).toBeNull();
		});
	});
});
