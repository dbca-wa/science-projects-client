import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

vi.mock("../services/admin.service", () => ({
	getBranches: vi.fn().mockResolvedValue([]),
	createBranch: vi.fn().mockResolvedValue({}),
	updateBranch: vi.fn().mockResolvedValue({}),
	deleteBranch: vi.fn().mockResolvedValue(undefined),
	getBusinessAreas: vi.fn().mockResolvedValue([]),
	createBusinessArea: vi.fn().mockResolvedValue({}),
	updateBusinessArea: vi.fn().mockResolvedValue({}),
	deleteBusinessArea: vi.fn().mockResolvedValue(undefined),
	getBusinessAreaDetail: vi.fn().mockResolvedValue({}),
	createBusinessAreaFormData: vi.fn().mockResolvedValue({}),
	updateBusinessAreaFormData: vi.fn().mockResolvedValue({}),
	getAffiliations: vi.fn().mockResolvedValue([]),
	createAffiliation: vi.fn().mockResolvedValue({}),
	updateAffiliation: vi.fn().mockResolvedValue({}),
	deleteAffiliation: vi.fn().mockResolvedValue(undefined),
	mergeAffiliations: vi.fn().mockResolvedValue({}),
	cleanOrphanedAffiliations: vi.fn().mockResolvedValue({}),
	getDivisions: vi.fn().mockResolvedValue([]),
	createDivision: vi.fn().mockResolvedValue({}),
	updateDivision: vi.fn().mockResolvedValue({}),
	deleteDivision: vi.fn().mockResolvedValue(undefined),
	updateDivisionKeyStakeholder: vi.fn().mockResolvedValue({}),
	updateDivisionApprovers: vi.fn().mockResolvedValue({}),
	getServices: vi.fn().mockResolvedValue([]),
	createService: vi.fn().mockResolvedValue({}),
	updateService: vi.fn().mockResolvedValue({}),
	deleteService: vi.fn().mockResolvedValue(undefined),
	getAddresses: vi.fn().mockResolvedValue([]),
	createAddress: vi.fn().mockResolvedValue({}),
	updateAddress: vi.fn().mockResolvedValue({}),
	deleteAddress: vi.fn().mockResolvedValue(undefined),
	getLocations: vi.fn().mockResolvedValue([]),
	createLocation: vi.fn().mockResolvedValue({}),
	updateLocation: vi.fn().mockResolvedValue({}),
	deleteLocation: vi.fn().mockResolvedValue(undefined),
	getReportInfos: vi.fn().mockResolvedValue([]),
	createReportInfo: vi.fn().mockResolvedValue({}),
	updateReportInfo: vi.fn().mockResolvedValue({}),
	deleteReportInfo: vi.fn().mockResolvedValue(undefined),
	batchApprove: vi.fn().mockResolvedValue(undefined),
	batchApproveOld: vi.fn().mockResolvedValue(undefined),
	openNewCycle: vi.fn().mockResolvedValue(undefined),
	getEmailTestingSettings: vi
		.fn()
		.mockResolvedValue({ email_testing_mode: false }),
	updateEmailTestingSettings: vi.fn().mockResolvedValue({}),
	sendAllTestEmails: vi.fn().mockResolvedValue({ results: [] }),
}));

vi.mock("@/shared/services/org.service", () => ({
	getDivisions: vi.fn().mockResolvedValue([]),
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

describe("Admin hooks", () => {
	it("useBranches should return a query", async () => {
		const { useBranches } = await import("./useBranches");
		const { result } = renderHook(() => useBranches(), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useCreateBranch should return a mutation", async () => {
		const { useCreateBranch } = await import("./useBranches");
		const { result } = renderHook(() => useCreateBranch(), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useBusinessAreas should return a query", async () => {
		const { useBusinessAreas } = await import("./useBusinessAreas");
		const { result } = renderHook(() => useBusinessAreas(), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useAffiliations should return a query", async () => {
		const { useAffiliations } = await import("./useAffiliations");
		const { result } = renderHook(() => useAffiliations(), {
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

	it("useServices should return a query", async () => {
		const { useServices } = await import("./useServices");
		const { result } = renderHook(() => useServices(), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useAddresses should return a query", async () => {
		const { useAddresses } = await import("./useAddresses");
		const { result } = renderHook(() => useAddresses(), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useLocations should return a query", async () => {
		const { useLocations } = await import("./useLocations");
		const { result } = renderHook(() => useLocations(), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useReportInfo should return a query", async () => {
		const { useReportInfo } = await import("./useReportInfo");
		const { result } = renderHook(() => useReportInfo(), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useBatchApprove should return a mutation", async () => {
		const { useBatchApprove } = await import("./useAdminActions");
		const { result } = renderHook(() => useBatchApprove(), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useBatchApproveOld should return a mutation", async () => {
		const { useBatchApproveOld } = await import("./useAdminActions");
		const { result } = renderHook(() => useBatchApproveOld(), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useOpenNewCycle should return a mutation", async () => {
		const { useOpenNewCycle } = await import("./useAdminActions");
		const { result } = renderHook(() => useOpenNewCycle(), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useEmailTestingSettings should return a query", async () => {
		const { useEmailTestingSettings } =
			await import("./useEmailTestingSettings");
		const { result } = renderHook(() => useEmailTestingSettings(), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});
});
