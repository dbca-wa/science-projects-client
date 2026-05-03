import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { getDocumentTasks, getEndorsementTasks } from "./dashboard.service";
import { apiClient } from "@/shared/services/api/client.service";

vi.mock("@/shared/services/api/client.service", () => ({
	apiClient: {
		get: vi.fn(),
	},
}));

describe("dashboard.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getDocumentTasks", () => {
		it("should GET document tasks from pending action endpoint", async () => {
			const mockTasks = { documents: [] };
			(apiClient.get as Mock).mockResolvedValue(mockTasks);

			const result = await getDocumentTasks();

			expect(apiClient.get).toHaveBeenCalledWith(
				"documents/projectdocuments/pendingmyaction"
			);
			expect(result).toEqual(mockTasks);
		});
	});

	describe("getEndorsementTasks", () => {
		it("should GET endorsement tasks from pending action endpoint", async () => {
			const mockTasks = { endorsements: [] };
			(apiClient.get as Mock).mockResolvedValue(mockTasks);

			const result = await getEndorsementTasks();

			expect(apiClient.get).toHaveBeenCalledWith(
				"documents/endorsements/pendingmyaction"
			);
			expect(result).toEqual(mockTasks);
		});
	});
});
