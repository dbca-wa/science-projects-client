import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

vi.mock("../services/staff-profile.service", () => ({
	getStaffProfiles: vi.fn().mockResolvedValue({ profiles: [], total: 0 }),
	getStaffProfile: vi.fn().mockResolvedValue({}),
	getStaffProfileHero: vi.fn().mockResolvedValue({}),
	getStaffProfileOverview: vi.fn().mockResolvedValue({}),
	getStaffProfileCV: vi.fn().mockResolvedValue({}),
	getMyStaffProfile: vi.fn().mockResolvedValue({}),
	getStaffProfileProjects: vi.fn().mockResolvedValue([]),
	updateStaffProfileOverview: vi.fn().mockResolvedValue({}),
	updateStaffProfileHero: vi.fn().mockResolvedValue({}),
	toggleStaffProfileVisibility: vi.fn().mockResolvedValue({}),
	getEmploymentEntries: vi.fn().mockResolvedValue([]),
	createEmploymentEntry: vi.fn().mockResolvedValue({}),
	updateEmploymentEntry: vi.fn().mockResolvedValue({}),
	deleteEmploymentEntry: vi.fn().mockResolvedValue(undefined),
	getEducationEntries: vi.fn().mockResolvedValue([]),
	createEducationEntry: vi.fn().mockResolvedValue({}),
	updateEducationEntry: vi.fn().mockResolvedValue({}),
	deleteEducationEntry: vi.fn().mockResolvedValue(undefined),
	emailStaffMember: vi.fn().mockResolvedValue(undefined),
	getPublications: vi.fn().mockResolvedValue({ publications: [] }),
	checkStaffProfile: vi.fn().mockResolvedValue({}),
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		loading: vi.fn(),
		dismiss: vi.fn(),
	},
}));

const createWrapper = () => {
	const qc = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	return ({ children }: { children: ReactNode }) =>
		createElement(QueryClientProvider, { client: qc }, children);
};

describe("Staff profile hooks", () => {
	it("useStaffProfiles should return a query", async () => {
		const mod = await import("./useStaffProfiles");
		const { result } = renderHook(
			() => mod.useStaffProfiles({ search: "", page: 1 }),
			{ wrapper: createWrapper() }
		);
		expect(result.current.isLoading).toBeDefined();
	});

	it("useStaffProfileDetail should return a query", async () => {
		const mod = await import("./useStaffProfileDetail");
		const { result } = renderHook(() => mod.useStaffProfileDetail(1), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useMyStaffProfile should return a query", async () => {
		const mod = await import("./useMyStaffProfile");
		const { result } = renderHook(() => mod.useMyStaffProfile(), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useStaffProfileHero should return a query", async () => {
		const mod = await import("./useStaffProfileHero");
		const { result } = renderHook(() => mod.useStaffProfileHero(1), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useStaffProfileOverview should return a query", async () => {
		const mod = await import("./useStaffProfileOverview");
		const { result } = renderHook(() => mod.useStaffProfileOverview(1), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useStaffProfileCV should return a query", async () => {
		const mod = await import("./useStaffProfileCV");
		const { result } = renderHook(() => mod.useStaffProfileCV(1), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useStaffProfileProjects should return a query", async () => {
		const mod = await import("./useStaffProfileProjects");
		const { result } = renderHook(() => mod.useStaffProfileProjects(1), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("usePublications should return a query", async () => {
		const mod = await import("./usePublications");
		const { result } = renderHook(() => mod.usePublications("EMP123"), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useUpdateOverview should return a mutation", async () => {
		const mod = await import("./useStaffProfileMutations");
		const { result } = renderHook(() => mod.useUpdateOverview(1), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useUpdateHero should return a mutation", async () => {
		const mod = await import("./useStaffProfileMutations");
		const { result } = renderHook(() => mod.useUpdateHero(1), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useToggleVisibility should return a mutation", async () => {
		const mod = await import("./useStaffProfileMutations");
		const { result } = renderHook(() => mod.useToggleVisibility(1), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useEmailStaffMember should return a mutation", async () => {
		const mod = await import("./useStaffProfileMutations");
		const { result } = renderHook(() => mod.useEmailStaffMember(), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});
});
