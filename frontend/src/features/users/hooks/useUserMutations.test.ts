import { describe, it, expect, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

// Mock all dependencies
vi.mock("react-router", () => ({
	useNavigate: () => vi.fn(),
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		loading: vi.fn(),
		dismiss: vi.fn(),
	},
}));

vi.mock("../services/user.service", () => ({
	deleteUser: vi.fn().mockResolvedValue(undefined),
	activateUser: vi.fn().mockResolvedValue(undefined),
	deactivateUser: vi.fn().mockResolvedValue(undefined),
	toggleAdminStatus: vi.fn().mockResolvedValue(undefined),
	inviteUser: vi.fn().mockResolvedValue({ invited: true }),
	requestMergeUsers: vi.fn().mockResolvedValue(undefined),
	toggleStaffProfileVisibility: vi.fn().mockResolvedValue({ success: true }),
	adminUpdateUser: vi.fn().mockResolvedValue({ id: 1 }),
	getUsersBasedOnSearchTerm: vi.fn(),
	getFullUser: vi.fn(),
}));

const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});
	return ({ children }: { children: ReactNode }) =>
		createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("User mutation hooks", () => {
	describe("useDeleteUser", () => {
		it("should return a mutation function", async () => {
			const { useDeleteUser } = await import("./useDeleteUser");
			const { result } = renderHook(() => useDeleteUser(), {
				wrapper: createWrapper(),
			});
			expect(result.current.mutate).toBeDefined();
		});
	});

	describe("useActivateUser", () => {
		it("should return a mutation function", async () => {
			const { useActivateUser } = await import("./useActivateUser");
			const { result } = renderHook(() => useActivateUser(), {
				wrapper: createWrapper(),
			});
			expect(result.current.mutate).toBeDefined();
		});
	});

	describe("useDeactivateUser", () => {
		it("should return a mutation function", async () => {
			const { useDeactivateUser } = await import("./useDeactivateUser");
			const { result } = renderHook(() => useDeactivateUser(), {
				wrapper: createWrapper(),
			});
			expect(result.current.mutate).toBeDefined();
		});
	});

	describe("useToggleAdminStatus", () => {
		it("should return a mutation function", async () => {
			const { useToggleAdminStatus } = await import("./useToggleAdminStatus");
			const { result } = renderHook(() => useToggleAdminStatus(), {
				wrapper: createWrapper(),
			});
			expect(result.current.mutate).toBeDefined();
		});
	});

	describe("useInviteUser", () => {
		it("should return a mutation function", async () => {
			const { useInviteUser } = await import("./useInviteUser");
			const { result } = renderHook(() => useInviteUser(), {
				wrapper: createWrapper(),
			});
			expect(result.current.mutate).toBeDefined();
		});
	});

	describe("useDeleteUser — mutation execution", () => {
		it("should call deleteUser service on mutate", async () => {
			const { deleteUser } = await import("../services/user.service");
			const { useDeleteUser } = await import("./useDeleteUser");

			const { result } = renderHook(() => useDeleteUser(), {
				wrapper: createWrapper(),
			});

			act(() => {
				result.current.mutate(42);
			});

			await waitFor(() => {
				expect(deleteUser).toHaveBeenCalledWith(42);
			});
		});
	});
});
