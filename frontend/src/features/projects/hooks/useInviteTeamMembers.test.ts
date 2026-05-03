import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import type { IPendingInvite } from "../types/team.types";

const mockInviteTeamMember = vi.fn();

vi.mock("../services/team.service", () => ({
	inviteTeamMember: (...args: unknown[]) => mockInviteTeamMember(...args),
}));

const createWrapper = () => {
	const qc = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	return {
		wrapper: ({ children }: { children: ReactNode }) =>
			createElement(QueryClientProvider, { client: qc }, children),
		queryClient: qc,
	};
};

const createPendingInvite = (
	overrides: Partial<IPendingInvite> = {}
): IPendingInvite => ({
	id: `invite-${Math.random()}`,
	user: {
		id: 10,
		display_first_name: "Jane",
		display_last_name: "Doe",
		is_staff: true,
		is_superuser: false,
		image: null,
	},
	role: "technical",
	roleLabel: "Technical Support",
	timeAllocation: 0.5,
	shortCode: "",
	...overrides,
});

describe("useInviteTeamMembers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return succeeded array with all invites when all succeed", async () => {
		mockInviteTeamMember.mockResolvedValue({ id: 1 });

		const { useInviteTeamMembers } = await import("./useInviteTeamMembers");
		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useInviteTeamMembers(42), { wrapper });

		const invites = [
			createPendingInvite({
				id: "a",
				user: { ...createPendingInvite().user, id: 10 },
			}),
			createPendingInvite({
				id: "b",
				user: { ...createPendingInvite().user, id: 20 },
			}),
		];

		result.current.mutate(invites);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(result.current.data?.succeeded).toHaveLength(2);
		expect(result.current.data?.failed).toHaveLength(0);
		expect(mockInviteTeamMember).toHaveBeenCalledTimes(2);
	});

	it("should return failed array with all invites when all fail", async () => {
		mockInviteTeamMember.mockRejectedValue(new Error("Server error"));

		const { useInviteTeamMembers } = await import("./useInviteTeamMembers");
		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useInviteTeamMembers(42), { wrapper });

		const invites = [
			createPendingInvite({ id: "a" }),
			createPendingInvite({ id: "b" }),
		];

		result.current.mutate(invites);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(result.current.data?.succeeded).toHaveLength(0);
		expect(result.current.data?.failed).toHaveLength(2);
		expect(result.current.data?.failed[0].error.message).toBe("Server error");
	});

	it("should split correctly on partial failure", async () => {
		mockInviteTeamMember
			.mockResolvedValueOnce({ id: 1 })
			.mockRejectedValueOnce(new Error("Duplicate member"))
			.mockResolvedValueOnce({ id: 3 });

		const { useInviteTeamMembers } = await import("./useInviteTeamMembers");
		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useInviteTeamMembers(42), { wrapper });

		const invites = [
			createPendingInvite({
				id: "a",
				user: { ...createPendingInvite().user, id: 10 },
			}),
			createPendingInvite({
				id: "b",
				user: { ...createPendingInvite().user, id: 20 },
			}),
			createPendingInvite({
				id: "c",
				user: { ...createPendingInvite().user, id: 30 },
			}),
		];

		result.current.mutate(invites);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(result.current.data?.succeeded).toHaveLength(2);
		expect(result.current.data?.failed).toHaveLength(1);
		expect(result.current.data?.failed[0].invite.id).toBe("b");
	});

	it("should invalidate team query after mutation settles", async () => {
		mockInviteTeamMember.mockResolvedValue({ id: 1 });

		const { useInviteTeamMembers } = await import("./useInviteTeamMembers");
		const { wrapper, queryClient } = createWrapper();
		const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

		const { result } = renderHook(() => useInviteTeamMembers(42), { wrapper });

		result.current.mutate([createPendingInvite()]);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: ["projects", 42, "team"],
		});
	});

	it("should invalidate team query even when all invites fail", async () => {
		mockInviteTeamMember.mockRejectedValue(new Error("fail"));

		const { useInviteTeamMembers } = await import("./useInviteTeamMembers");
		const { wrapper, queryClient } = createWrapper();
		const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

		const { result } = renderHook(() => useInviteTeamMembers(42), { wrapper });

		result.current.mutate([createPendingInvite()]);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: ["projects", 42, "team"],
		});
	});

	it("should handle non-Error rejection reasons gracefully", async () => {
		mockInviteTeamMember.mockRejectedValue("string error");

		const { useInviteTeamMembers } = await import("./useInviteTeamMembers");
		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useInviteTeamMembers(42), { wrapper });

		result.current.mutate([createPendingInvite()]);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(result.current.data?.failed).toHaveLength(1);
		expect(result.current.data?.failed[0].error).toBeInstanceOf(Error);
		expect(result.current.data?.failed[0].error.message).toBe("Unknown error");
	});
});
