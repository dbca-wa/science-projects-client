import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { getReportsForDivision } from "./report.service";
import { apiClient } from "./api/client.service";

vi.mock("./api/client.service", () => ({
	apiClient: { get: vi.fn() },
}));

describe("shared report.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should GET all reports when no division slug provided", async () => {
		(apiClient.get as Mock).mockResolvedValue([]);
		await getReportsForDivision();
		expect(apiClient.get).toHaveBeenCalledWith("documents/reports");
	});

	it("should GET reports filtered by division slug", async () => {
		(apiClient.get as Mock).mockResolvedValue([]);
		await getReportsForDivision("bcs");
		expect(apiClient.get).toHaveBeenCalledWith(
			"documents/reports?division=bcs"
		);
	});
});
