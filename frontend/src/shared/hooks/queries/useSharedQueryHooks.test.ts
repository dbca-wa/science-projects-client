import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { businessAreasKeys } from "./useBusinessAreas";

// Mock all service dependencies
vi.mock("@/shared/services/org.service", () => ({
	getAllBusinessAreas: vi.fn().mockResolvedValue([]),
	getAllBranches: vi.fn().mockResolvedValue([]),
	getDivisions: vi.fn().mockResolvedValue([]),
	getMyBusinessAreas: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/shared/services/admin.service", () => ({
	getAdminTasks: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/shared/services/api/locations.service", () => ({
	getAllLocations: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/shared/services/report.service", () => ({
	getReportsForDivision: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/shared/services/user.service", () => ({
	getFullUser: vi.fn().mockResolvedValue({ id: 1 }),
	getUsersBasedOnSearchTerm: vi.fn().mockResolvedValue({ users: [] }),
}));

const createWrapper = () => {
	const qc = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	return ({ children }: { children: ReactNode }) =>
		createElement(QueryClientProvider, { client: qc }, children);
};

describe("Shared query hook key factories", () => {
	it("businessAreasKeys.all should be correct", () => {
		expect(businessAreasKeys.all).toEqual(["businessAreas"]);
	});
});

describe("Shared query hooks render", () => {
	it("useBusinessAreas should return a query", async () => {
		const { useBusinessAreas } = await import("./useBusinessAreas");
		const { result } = renderHook(() => useBusinessAreas(), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useBranches should return a query", async () => {
		const { useBranches } = await import("./useBranches");
		const { result } = renderHook(() => useBranches(), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useDivisions should return a query", async () => {
		const { useDivisions } = await import("./useDivisions");
		const { result } = renderHook(() => useDivisions(), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useLocations should return location data", async () => {
		const { useLocations } = await import("./useLocations");
		const { result } = renderHook(() => useLocations(), {
			wrapper: createWrapper(),
		});
		expect(result.current.locationsLoading).toBeDefined();
		expect(result.current.dbcaRegions).toBeDefined();
	});

	it("useAdminTasks should return a query", async () => {
		const { useAdminTasks } = await import("./useAdminTasks");
		const { result } = renderHook(() => useAdminTasks(), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useInvolvedProjects should return a query", async () => {
		const { useInvolvedProjects } = await import("./useInvolvedProjects");
		const { result } = renderHook(() => useInvolvedProjects(1), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useMyBusinessAreas should return a query", async () => {
		const { useMyBusinessAreas } = await import("./useMyBusinessAreas");
		const { result } = renderHook(() => useMyBusinessAreas(), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useReportsForDivision should return a query", async () => {
		const { useReportsForDivision } = await import("./useReportsForDivision");
		const { result } = renderHook(() => useReportsForDivision(), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useServices should return a query", async () => {
		const { useServices } = await import("./useServices");
		const { result } = renderHook(() => useServices(), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});
});
