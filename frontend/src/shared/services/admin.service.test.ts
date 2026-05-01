import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { getAdminTasks } from "./admin.service";
import { apiClient } from "./api/client.service";

vi.mock("./api/client.service", () => ({
	apiClient: { get: vi.fn() },
}));

describe("shared admin.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should GET admin tasks and filter to pending only", async () => {
		(apiClient.get as Mock).mockResolvedValue([
			{ id: 1, status: "pending" },
			{ id: 2, status: "completed" },
			{ id: 3, status: "pending" },
		]);

		const result = await getAdminTasks();

		expect(apiClient.get).toHaveBeenCalledWith("adminoptions/tasks");
		expect(result).toHaveLength(2);
		expect(
			result.every((t: { status: string }) => t.status === "pending")
		).toBe(true);
	});
});
