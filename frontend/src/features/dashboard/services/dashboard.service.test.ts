import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import {
	getDocumentTasks,
	getEndorsementTasks,
	getMyProjects,
	getAdminTasks,
} from "./dashboard.service";
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

	describe("getMyProjects", () => {
		it("should GET projects from mine endpoint", async () => {
			const mockProjects = [{ id: 1, title: "My Project" }];
			(apiClient.get as Mock).mockResolvedValue(mockProjects);

			const result = await getMyProjects();

			expect(apiClient.get).toHaveBeenCalledWith("projects/mine");
			expect(result).toEqual(mockProjects);
		});
	});

	describe("getAdminTasks", () => {
		it("should GET admin tasks and filter to pending only", async () => {
			const mockTasks = [
				{ id: 1, status: "pending" },
				{ id: 2, status: "completed" },
				{ id: 3, status: "pending" },
			];
			(apiClient.get as Mock).mockResolvedValue(mockTasks);

			const result = await getAdminTasks();

			expect(apiClient.get).toHaveBeenCalledWith("adminoptions/tasks");
			expect(result).toHaveLength(2);
			expect(
				result.every((t: { status: string }) => t.status === "pending")
			).toBe(true);
		});

		it("should return empty array when no pending tasks", async () => {
			(apiClient.get as Mock).mockResolvedValue([
				{ id: 1, status: "completed" },
			]);

			const result = await getAdminTasks();

			expect(result).toHaveLength(0);
		});
	});
});
