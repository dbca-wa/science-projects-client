import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import PrintPreviewTab from "./PrintPreviewTab";
import type { IAnnualReport } from "@/features/reports/types/report.types";
import type { IReportPDFStatus } from "@/features/reports/services/report.service";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@/features/reports/hooks/useReports", () => ({
	useReportPDF: vi.fn(),
	useGenerateReportPDF: vi.fn(),
	useCancelReportPDFGen: vi.fn(),
	usePublishReportPDF: vi.fn(),
}));

vi.mock("@/features/reports/hooks/useSSE", () => ({
	useSSE: vi.fn(),
}));

vi.mock("@/features/reports/services/report.service", () => ({
	getSSEUrl: vi.fn(
		(pk: number) =>
			`http://localhost:8000/api/v1/documents/reports/${pk}/generation-progress`
	),
}));

vi.mock("@/shared/utils/image.utils", () => ({
	getImageUrl: vi.fn((path: string) => `http://localhost:8000${path}`),
}));

vi.mock("@tanstack/react-query", () => ({
	useQueryClient: vi.fn(() => ({
		invalidateQueries: vi.fn(),
	})),
}));

vi.mock("sonner", () => ({
	toast: {
		error: vi.fn(),
		success: vi.fn(),
	},
}));

vi.mock("@/app/stores/store-context", () => ({
	useAuthStore: vi.fn(() => ({ isSuperuser: false, user: { id: 1 } })),
}));

vi.mock("../modals/PublishConfirmModal", () => ({
	PublishConfirmModal: () => null,
}));

// Import mocked modules for per-test configuration
import {
	useReportPDF,
	useGenerateReportPDF,
	useCancelReportPDFGen,
	usePublishReportPDF,
} from "@/features/reports/hooks/useReports";
import { useSSE } from "@/features/reports/hooks/useSSE";

// ── Typed mock helpers ─────────────────────────────────────────────────────

const mockUseReportPDF = vi.mocked(useReportPDF);
const mockUseGenerateReportPDF = vi.mocked(useGenerateReportPDF);
const mockUseCancelReportPDFGen = vi.mocked(useCancelReportPDFGen);
const mockUsePublishReportPDF = vi.mocked(usePublishReportPDF);
const mockUseSSE = vi.mocked(useSSE);

/** Minimal mock report for all tests */
const mockReport: IAnnualReport = {
	id: 1,
	year: 2023,
	creator: null,
	division: null,
	dm: null,
	dm_sign: null,
	service_delivery_intro: null,
	research_intro: null,
	student_intro: null,
	publications: null,
	date_open: "2023-01-01",
	date_closed: "2023-12-31",
	pdf_generation_in_progress: false,
	is_published: false,
	created_at: "2023-01-01T00:00:00Z",
	updated_at: "2023-01-01T00:00:00Z",
};

/** Default mutation mock shape */
function makeMutationMock(overrides: Record<string, unknown> = {}) {
	return {
		mutate: vi.fn(),
		isPending: false,
		...overrides,
	};
}

/** Configure mocks for a given PDF status scenario */
function setupMocks(pdfStatus: {
	data?: IReportPDFStatus | undefined;
	isLoading?: boolean;
}) {
	mockUseReportPDF.mockReturnValue({
		data: pdfStatus.data,
		isLoading: pdfStatus.isLoading ?? false,
	} as ReturnType<typeof useReportPDF>);

	mockUseGenerateReportPDF.mockReturnValue(
		makeMutationMock() as unknown as ReturnType<typeof useGenerateReportPDF>
	);

	mockUseCancelReportPDFGen.mockReturnValue(
		makeMutationMock() as unknown as ReturnType<typeof useCancelReportPDFGen>
	);

	mockUsePublishReportPDF.mockReturnValue(
		makeMutationMock() as unknown as ReturnType<typeof usePublishReportPDF>
	);

	mockUseSSE.mockReturnValue({ isConnected: false, close: vi.fn() });
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("PrintPreviewTab", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders generate buttons in idle state", () => {
		setupMocks({
			data: {
				has_draft: false,
				has_published: false,
				draft_file: null,
				published_file: null,
				report: { id: 1, pdf_generation_in_progress: false },
			},
		});

		render(<PrintPreviewTab report={mockReport} />);

		expect(
			screen.getByRole("button", { name: /generate approved/i })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /generate all/i })
		).toBeInTheDocument();
	});

	it("disables buttons during generation", () => {
		setupMocks({
			data: {
				has_draft: false,
				has_published: false,
				draft_file: null,
				published_file: null,
				report: { id: 1, pdf_generation_in_progress: true },
			},
		});

		render(<PrintPreviewTab report={mockReport} />);

		// During generation, the generate buttons are replaced by a cancel button
		expect(
			screen.queryByRole("button", { name: /generate approved/i })
		).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
	});

	it("shows progress display during generation", () => {
		setupMocks({
			data: {
				has_draft: false,
				has_published: false,
				draft_file: null,
				published_file: null,
				report: { id: 1, pdf_generation_in_progress: true },
			},
		});

		render(<PrintPreviewTab report={mockReport} />);

		// Progress percentage should be visible
		expect(screen.getByText("0%")).toBeInTheDocument();
		// Default phase label when no SSE data yet
		expect(screen.getByText(/starting generation/i)).toBeInTheDocument();
		// Cancel button should be visible
		expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
	});

	it("shows iframe when PDF is available", () => {
		setupMocks({
			data: {
				has_draft: true,
				has_published: false,
				draft_file: "/files/annual_reports/pdfs/report.pdf",
				published_file: null,
				report: { id: 1, pdf_generation_in_progress: false },
			},
		});

		render(<PrintPreviewTab report={mockReport} />);

		const iframe = screen.getByTitle(/2023 annual report pdf/i);
		expect(iframe).toBeInTheDocument();
		expect(iframe.tagName).toBe("IFRAME");
		expect(iframe).toHaveAttribute(
			"src",
			"http://localhost:8000/files/annual_reports/pdfs/report.pdf"
		);
	});

	it("shows fallback message when no PDF exists", () => {
		setupMocks({
			data: {
				has_draft: false,
				has_published: false,
				draft_file: null,
				published_file: null,
				report: { id: 1, pdf_generation_in_progress: false },
			},
		});

		render(<PrintPreviewTab report={mockReport} />);

		expect(screen.getByText(/no pdf available/i)).toBeInTheDocument();
	});

	it("shows open-in-new-tab button when PDF is available", () => {
		setupMocks({
			data: {
				has_draft: true,
				has_published: false,
				draft_file: "/files/annual_reports/pdfs/report.pdf",
				published_file: null,
				report: { id: 1, pdf_generation_in_progress: false },
			},
		});

		render(<PrintPreviewTab report={mockReport} />);

		expect(screen.getByTitle(/open pdf in new tab/i)).toBeInTheDocument();
	});

	it("hides open-in-new-tab button when no PDF is available", () => {
		setupMocks({
			data: {
				has_draft: false,
				has_published: false,
				draft_file: null,
				published_file: null,
				report: { id: 1, pdf_generation_in_progress: false },
			},
		});

		render(<PrintPreviewTab report={mockReport} />);

		expect(screen.queryByTitle(/open pdf in new tab/i)).not.toBeInTheDocument();
	});
});
