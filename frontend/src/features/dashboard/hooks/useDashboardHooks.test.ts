import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { dashboardKeys } from "./useDashboardTasks";

vi.mock("../services/dashboard.service", () => ({
	getDocumentTasks: vi.fn().mockResolvedValue({ documents: [] }),
	getEndorsementTasks: vi.fn().mockResolvedValue({ endorsements: [] }),
	getMyProjects: vi.fn().mockResolvedValue([]),
	getAdminTasks: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/shared/services/admin.service", () => ({
	getAdminTasks: vi.fn().mockResolvedValue([]),
}));

const createWrapper = () => {
	const qc = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	return ({ children }: { children: ReactNode }) =>
		createElement(QueryClientProvider, { client: qc }, children);
};

describe("Dashboard hook query keys", () => {
	it("should have correct document tasks key", () => {
		expect(dashboardKeys.documentTasks).toEqual(["dashboard", "documentTasks"]);
	});

	it("should have correct endorsement tasks key", () => {
		expect(dashboardKeys.endorsementTasks).toEqual([
			"dashboard",
			"endorsementTasks",
		]);
	});

	it("should have correct my projects key", () => {
		expect(dashboardKeys.myProjects).toEqual(["dashboard", "myProjects"]);
	});

	it("should generate caretaker tasks key with userId", () => {
		expect(dashboardKeys.caretakerTasks(42)).toEqual([
			"dashboard",
			"caretakerTasks",
			42,
		]);
	});
});

describe("Dashboard hooks", () => {
	it("useDocumentTasks should return a query", async () => {
		const { useDocumentTasks } = await import("./useDashboardTasks");
		const { result } = renderHook(() => useDocumentTasks(), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useEndorsementTasks should return a query", async () => {
		const { useEndorsementTasks } = await import("./useDashboardTasks");
		const { result } = renderHook(() => useEndorsementTasks(), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useMyProjects should return a query", async () => {
		const { useMyProjects } = await import("./useDashboardTasks");
		const { result } = renderHook(() => useMyProjects(), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});
});
