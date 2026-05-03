import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import {
	updateProjectDescription,
	updateExternalProjectField,
	updateConceptPlanField,
	updateProjectPlanField,
	updateProgressReportField,
	updateStudentReportField,
	updateProjectClosureField,
	updateAnnualReportField,
} from "./content-update.service";
import { apiClient } from "./api/client.service";

vi.mock("./api/client.service", () => ({
	apiClient: { patch: vi.fn(), put: vi.fn() },
}));

describe("content-update.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("updateProjectDescription should PATCH description", async () => {
		(apiClient.patch as Mock).mockResolvedValue(undefined);
		await updateProjectDescription(42, "<p>New desc</p>");
		expect(apiClient.patch).toHaveBeenCalledWith("projects/42", {
			description: "<p>New desc</p>",
		});
	});

	it("updateExternalProjectField should PATCH dynamic field", async () => {
		(apiClient.patch as Mock).mockResolvedValue(undefined);
		await updateExternalProjectField(10, "aims", "<p>Aims</p>");
		expect(apiClient.patch).toHaveBeenCalledWith(
			"projects/external_project_details/10",
			{ aims: "<p>Aims</p>" }
		);
	});

	it("updateConceptPlanField should PATCH concept plan", async () => {
		(apiClient.patch as Mock).mockResolvedValue(undefined);
		await updateConceptPlanField(10, "background", "<p>BG</p>");
		expect(apiClient.patch).toHaveBeenCalledWith("documents/conceptplans/10", {
			background: "<p>BG</p>",
		});
	});

	it("updateProjectPlanField should PATCH project plan", async () => {
		(apiClient.patch as Mock).mockResolvedValue(undefined);
		await updateProjectPlanField(10, "methodology", "<p>Method</p>");
		expect(apiClient.patch).toHaveBeenCalledWith("documents/projectplans/10", {
			methodology: "<p>Method</p>",
		});
	});

	it("updateProgressReportField should PATCH progress report", async () => {
		(apiClient.patch as Mock).mockResolvedValue(undefined);
		await updateProgressReportField(10, "context", "<p>Context</p>");
		expect(apiClient.patch).toHaveBeenCalledWith(
			"documents/progressreports/10",
			{ context: "<p>Context</p>" }
		);
	});

	it("updateStudentReportField should PATCH student report", async () => {
		(apiClient.patch as Mock).mockResolvedValue(undefined);
		await updateStudentReportField(10, "progress_report", "<p>Progress</p>");
		expect(apiClient.patch).toHaveBeenCalledWith(
			"documents/studentreports/10",
			{ progress_report: "<p>Progress</p>" }
		);
	});

	it("updateProjectClosureField should PATCH project closure", async () => {
		(apiClient.patch as Mock).mockResolvedValue(undefined);
		await updateProjectClosureField(10, "reason", "<p>Reason</p>");
		expect(apiClient.patch).toHaveBeenCalledWith(
			"documents/projectclosures/10",
			{ reason: "<p>Reason</p>" }
		);
	});

	it("updateAnnualReportField should PUT report field", async () => {
		(apiClient.put as Mock).mockResolvedValue(undefined);
		await updateAnnualReportField(5, "dm", "<p>Director message</p>");
		expect(apiClient.put).toHaveBeenCalledWith("documents/reports/5", {
			dm: "<p>Director message</p>",
		});
	});
});
