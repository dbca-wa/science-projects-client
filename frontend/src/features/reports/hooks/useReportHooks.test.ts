import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

vi.mock("../services/report.service", () => ({
	getPublishedReports: vi.fn().mockResolvedValue([]),
	getLegacyReports: vi.fn().mockResolvedValue([]),
	getLatestYear: vi.fn().mockResolvedValue({ year: 2025 }),
	getLatestReport: vi.fn().mockResolvedValue({}),
	getReportDetail: vi.fn().mockResolvedValue({}),
	getLatestProgressReports: vi.fn().mockResolvedValue([]),
	getLatestStudentReports: vi.fn().mockResolvedValue([]),
	getLatestInactiveReports: vi.fn().mockResolvedValue({}),
	getLatestReportMedia: vi.fn().mockResolvedValue([]),
	getReportMedia: vi.fn().mockResolvedValue([]),
	getReportPDFStatus: vi.fn().mockResolvedValue({}),
	generateReportPDF: vi.fn().mockResolvedValue(undefined),
	cancelReportPDFGen: vi.fn().mockResolvedValue(undefined),
	approveReport: vi.fn().mockResolvedValue(undefined),
	publishReportPDF: vi.fn().mockResolvedValue(undefined),
	getReportsWithoutPDF: vi.fn().mockResolvedValue([]),
	toggleReportPublished: vi.fn().mockResolvedValue(undefined),
	getMyBusinessAreas: vi.fn().mockResolvedValue([]),
	getReportsForDivision: vi.fn().mockResolvedValue([]),
	updateAnnualReportField: vi.fn().mockResolvedValue(undefined),
	addReportPDF: vi.fn().mockResolvedValue(undefined),
	addLegacyPDF: vi.fn().mockResolvedValue(undefined),
	updateReportPDF: vi.fn().mockResolvedValue(undefined),
	updateLegacyPDF: vi.fn().mockResolvedValue(undefined),
	deleteReportPDFFile: vi.fn().mockResolvedValue(undefined),
	deleteLegacyPDFFile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../services/business-area.service", () => ({
	getProblematicProjects: vi.fn().mockResolvedValue({}),
	getUnapprovedDocs: vi.fn().mockResolvedValue({}),
	getBusinessAreaDetail: vi.fn().mockResolvedValue({}),
	updateBusinessAreaLead: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/shared/services/report.service", () => ({
	getReportsForDivision: vi.fn().mockResolvedValue([]),
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

describe("Report hooks", () => {
	it("usePublishedReports should return a query", async () => {
		const { usePublishedReports } = await import("./useReports");
		const { result } = renderHook(() => usePublishedReports(), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useLegacyReports should return a query", async () => {
		const { useLegacyReports } = await import("./useReports");
		const { result } = renderHook(() => useLegacyReports(), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useLatestYear should return a query", async () => {
		const { useLatestYear } = await import("./useReports");
		const { result } = renderHook(() => useLatestYear(), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useLatestReport should return a query", async () => {
		const { useLatestReport } = await import("./useReports");
		const { result } = renderHook(() => useLatestReport("bcs"), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useApproveReport should return a mutation", async () => {
		const { useApproveReport } = await import("./useReports");
		const { result } = renderHook(() => useApproveReport(), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useGenerateReportPDF should return a mutation", async () => {
		const { useGenerateReportPDF } = await import("./useReports");
		const { result } = renderHook(() => useGenerateReportPDF(), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useBusinessAreaDetail should return a query", async () => {
		const { useBusinessAreaDetail } = await import("./useBusinessAreaLead");
		const { result } = renderHook(() => useBusinessAreaDetail(1), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useUpdateBusinessAreaLead should return a mutation", async () => {
		const { useUpdateBusinessAreaLead } = await import("./useBusinessAreaLead");
		const { result } = renderHook(() => useUpdateBusinessAreaLead(), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useReportMedia should return a query", async () => {
		const { useLatestReportMedia } = await import("./useReports");
		const { result } = renderHook(() => useLatestReportMedia(), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});
});
