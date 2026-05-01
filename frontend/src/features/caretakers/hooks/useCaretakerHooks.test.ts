import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { caretakerTasksKeys } from "./useCaretakerTasks";
import { pendingCaretakerRequestsKeys } from "./usePendingCaretakerRequests";

// Mock all service dependencies
vi.mock("../services/caretaker.service", () => ({
	getCaretakerCheck: vi.fn().mockResolvedValue({ active_caretaker: null }),
	getCaretakers: vi.fn().mockResolvedValue([]),
	requestCaretaker: vi.fn().mockResolvedValue({ task_id: 1 }),
	approveCaretakerRequest: vi.fn().mockResolvedValue({}),
	rejectCaretakerRequest: vi.fn().mockResolvedValue(undefined),
	cancelCaretakerRequest: vi.fn().mockResolvedValue(undefined),
	getPendingCaretakerRequests: vi.fn().mockResolvedValue([]),
	getOutgoingCaretakerRequests: vi.fn().mockResolvedValue([]),
	respondToCaretakerRequest: vi.fn().mockResolvedValue({ message: "ok" }),
	deleteCaretaker: vi.fn().mockResolvedValue(undefined),
	adminSetCaretaker: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/shared/services/caretaker.service", () => ({
	requestCaretaker: vi.fn().mockResolvedValue({ task_id: 1 }),
	cancelCaretakerRequest: vi.fn().mockResolvedValue(undefined),
	getCaretakerCheck: vi.fn().mockResolvedValue({ active_caretaker: null }),
	getPendingCaretakerRequests: vi.fn().mockResolvedValue([]),
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		loading: vi.fn(),
		dismiss: vi.fn(),
	},
}));

vi.mock("react-router", () => ({
	useNavigate: () => vi.fn(),
}));

vi.mock("@/features/auth", () => ({
	useCurrentUser: () => ({ data: { id: 1 } }),
}));

const createWrapper = () => {
	const qc = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	return ({ children }: { children: ReactNode }) =>
		createElement(QueryClientProvider, { client: qc }, children);
};

describe("Caretaker hook query keys", () => {
	describe("caretakerTasksKeys", () => {
		it("should generate base key", () => {
			expect(caretakerTasksKeys.all).toEqual(["caretakers", "tasks"]);
		});

		it("should generate user-specific key", () => {
			expect(caretakerTasksKeys.forUser(42)).toEqual([
				"caretakers",
				"tasks",
				42,
			]);
		});
	});

	describe("pendingCaretakerRequestsKeys", () => {
		it("should generate user-specific pending key", () => {
			const key = pendingCaretakerRequestsKeys.forUser(42);
			expect(key).toContain("pending");
			expect(key).toContain(42);
		});
	});
});

describe("Caretaker mutation hooks", () => {
	it("useRequestCaretaker should return a mutation", async () => {
		const { useRequestCaretaker } = await import("./useRequestCaretaker");
		const { result } = renderHook(() => useRequestCaretaker(), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useApproveCaretakerTask should return a mutation", async () => {
		const { useApproveCaretakerTask } =
			await import("./useApproveCaretakerTask");
		const { result } = renderHook(() => useApproveCaretakerTask(), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useRejectCaretakerTask should return a mutation", async () => {
		const { useRejectCaretakerTask } = await import("./useRejectCaretakerTask");
		const { result } = renderHook(() => useRejectCaretakerTask(), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useCancelCaretakerRequest should return a mutation", async () => {
		const { useCancelCaretakerRequest } =
			await import("./useCancelCaretakerRequest");
		const { result } = renderHook(() => useCancelCaretakerRequest(), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useRemoveCaretaker should return a mutation", async () => {
		const { useRemoveCaretaker } = await import("./useRemoveCaretaker");
		const { result } = renderHook(() => useRemoveCaretaker(), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useRespondToCaretakerRequest should return a mutation", async () => {
		const { useRespondToCaretakerRequest } =
			await import("./useRespondToCaretakerRequest");
		const { result } = renderHook(() => useRespondToCaretakerRequest(), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});
});
