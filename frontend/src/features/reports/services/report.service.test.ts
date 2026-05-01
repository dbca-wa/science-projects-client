import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import {
	getPublishedReports,
	getLegacyReports,
	getLatestYear,
	getLatestReport,
	getReportDetail,
	getLatestProgressReports,
	getLatestStudentReports,
	getLatestInactiveReports,
	getLatestReportMedia,
	getReportMedia,
	getReportPDFStatus,
	generateReportPDF,
	cancelReportPDFGen,
	approveReport,
	publishReportPDF,
	getReportsWithoutPDF,
	toggleReportPublished,
} from "./report.service";
import { apiClient } from "@/shared/services/api/client.service";

vi.mock("@/shared/services/api/client.service", () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	},
}));

vi.mock("@/shared/services/api/config", () => ({
	API_CONFIG: { BASE_URL: "http://localhost:8000/api/v1" },
}));

vi.mock("@/shared/services/content-update.service", () => ({
	updateAnnualReportField: vi.fn(),
}));

vi.mock("@/shared/services/org.service", () => ({
	getMyBusinessAreas: vi.fn(),
}));

vi.mock("@/shared/services/report.service", () => ({
	getReportsForDivision: vi.fn(),
}));

describe("report.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("getPublishedReports should GET from published PDFs endpoint", async () => {
		(apiClient.get as Mock).mockResolvedValue([]);
		await getPublishedReports();
		expect(apiClient.get).toHaveBeenCalledWith("documents/reports/withPDF");
	});

	it("getLegacyReports should GET from legacy PDFs endpoint", async () => {
		(apiClient.get as Mock).mockResolvedValue([]);
		await getLegacyReports();
		expect(apiClient.get).toHaveBeenCalledWith(
			expect.stringContaining("legacy")
		);
	});

	it("getLatestYear should GET from latest year endpoint", async () => {
		(apiClient.get as Mock).mockResolvedValue({ year: 2025 });
		const result = await getLatestYear();
		expect(result).toEqual({ year: 2025 });
	});

	it("getLatestReport should GET latest report, optionally with division", async () => {
		(apiClient.get as Mock).mockResolvedValue({ year: 2025 });
		await getLatestReport("bcs");
		const calledUrl = (apiClient.get as Mock).mock.calls[0][0] as string;
		expect(calledUrl).toContain("division=bcs");
	});

	it("getReportDetail should GET report by ID", async () => {
		(apiClient.get as Mock).mockResolvedValue({ id: 5 });
		const result = await getReportDetail(5);
		expect(result).toEqual({ id: 5 });
	});

	it("getLatestProgressReports should GET progress reports", async () => {
		(apiClient.get as Mock).mockResolvedValue([]);
		await getLatestProgressReports(5);
		const calledUrl = (apiClient.get as Mock).mock.calls[0][0] as string;
		expect(calledUrl).toContain("report_id=5");
	});

	it("getLatestStudentReports should GET student reports", async () => {
		(apiClient.get as Mock).mockResolvedValue([]);
		await getLatestStudentReports();
		expect(apiClient.get).toHaveBeenCalled();
	});

	it("getLatestInactiveReports should GET inactive reports", async () => {
		(apiClient.get as Mock).mockResolvedValue({ progress: [], student: [] });
		await getLatestInactiveReports();
		expect(apiClient.get).toHaveBeenCalled();
	});

	it("getLatestReportMedia should GET media for latest report", async () => {
		(apiClient.get as Mock).mockResolvedValue([]);
		await getLatestReportMedia();
		expect(apiClient.get).toHaveBeenCalled();
	});

	it("getReportMedia should GET media for specific report", async () => {
		(apiClient.get as Mock).mockResolvedValue([]);
		await getReportMedia(5);
		expect(apiClient.get).toHaveBeenCalled();
	});

	it("getReportPDFStatus should GET PDF status", async () => {
		(apiClient.get as Mock).mockResolvedValue({ has_draft: true });
		const result = await getReportPDFStatus(5);
		expect(result).toEqual({ has_draft: true });
	});

	it("generateReportPDF should POST to generate endpoint", async () => {
		(apiClient.post as Mock).mockResolvedValue(undefined);
		await generateReportPDF(5, "approved");
		expect(apiClient.post).toHaveBeenCalledWith(
			expect.stringContaining("generate_pdf"),
			{ genkind: "approved" }
		);
	});

	it("cancelReportPDFGen should POST to cancel endpoint", async () => {
		(apiClient.post as Mock).mockResolvedValue(undefined);
		await cancelReportPDFGen(5);
		expect(apiClient.post).toHaveBeenCalledWith(
			expect.stringContaining("cancel_doc_gen")
		);
	});

	it("approveReport should POST to final approval endpoint", async () => {
		(apiClient.post as Mock).mockResolvedValue(undefined);
		await approveReport({
			kind: "progressreport",
			reportPk: 1,
			documentPk: 2,
			isActive: true,
		});
		expect(apiClient.post).toHaveBeenCalledWith(
			expect.stringContaining("finalApproval"),
			expect.objectContaining({ kind: "progressreport" })
		);
	});

	it("publishReportPDF should POST to publish endpoint", async () => {
		(apiClient.post as Mock).mockResolvedValue(undefined);
		await publishReportPDF(5);
		expect(apiClient.post).toHaveBeenCalled();
	});

	it("getReportsWithoutPDF should GET reports without PDFs", async () => {
		(apiClient.get as Mock).mockResolvedValue([]);
		await getReportsWithoutPDF();
		expect(apiClient.get).toHaveBeenCalled();
	});

	it("toggleReportPublished should PUT is_published flag", async () => {
		(apiClient.put as Mock).mockResolvedValue(undefined);
		await toggleReportPublished(5, true);
		expect(apiClient.put).toHaveBeenCalledWith(expect.stringContaining("5"), {
			is_published: true,
		});
	});
});
