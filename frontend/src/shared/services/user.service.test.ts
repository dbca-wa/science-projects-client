import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { getUsersBasedOnSearchTerm, getFullUser } from "./user.service";
import { apiClient } from "@/shared/services/api/client.service";

vi.mock("@/shared/services/api/client.service", () => ({
	apiClient: {
		get: vi.fn(),
	},
}));

describe("shared user.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getUsersBasedOnSearchTerm", () => {
		it("should build URL with page parameter", async () => {
			const mockResponse = { users: [], total_results: 0, total_pages: 0 };
			(apiClient.get as Mock).mockResolvedValue(mockResponse);

			await getUsersBasedOnSearchTerm("", 1, {});

			expect(apiClient.get).toHaveBeenCalledWith("users/list?page=1");
		});

		it("should include search term in URL", async () => {
			const mockResponse = { users: [], total_results: 0, total_pages: 0 };
			(apiClient.get as Mock).mockResolvedValue(mockResponse);

			await getUsersBasedOnSearchTerm("john", 1, {});

			expect(apiClient.get).toHaveBeenCalledWith(
				"users/list?page=1&search=john"
			);
		});

		it("should include role filter in URL", async () => {
			const mockResponse = { users: [], total_results: 0, total_pages: 0 };
			(apiClient.get as Mock).mockResolvedValue(mockResponse);

			await getUsersBasedOnSearchTerm("", 1, { roleFilter: "staff" });

			expect(apiClient.get).toHaveBeenCalledWith(
				"users/list?page=1&only_staff=true"
			);
		});

		it("should include business area filter in URL", async () => {
			const mockResponse = { users: [], total_results: 0, total_pages: 0 };
			(apiClient.get as Mock).mockResolvedValue(mockResponse);

			await getUsersBasedOnSearchTerm("", 1, { businessArea: 5 });

			expect(apiClient.get).toHaveBeenCalledWith(
				"users/list?page=1&businessArea=5"
			);
		});

		it("should include ignore array in URL", async () => {
			const mockResponse = { users: [], total_results: 0, total_pages: 0 };
			(apiClient.get as Mock).mockResolvedValue(mockResponse);

			await getUsersBasedOnSearchTerm("", 1, { ignoreArray: [1, 2, 3] });

			expect(apiClient.get).toHaveBeenCalledWith(
				"users/list?page=1&ignoreArray=1,2,3"
			);
		});

		it("should not include 'all' role filter", async () => {
			const mockResponse = { users: [], total_results: 0, total_pages: 0 };
			(apiClient.get as Mock).mockResolvedValue(mockResponse);

			await getUsersBasedOnSearchTerm("", 1, { roleFilter: "all" });

			expect(apiClient.get).toHaveBeenCalledWith("users/list?page=1");
		});

		it("should combine multiple filters", async () => {
			const mockResponse = { users: [], total_results: 0, total_pages: 0 };
			(apiClient.get as Mock).mockResolvedValue(mockResponse);

			await getUsersBasedOnSearchTerm("jane", 2, {
				roleFilter: "ba_lead",
				businessArea: 3,
			});

			expect(apiClient.get).toHaveBeenCalledWith(
				"users/list?page=2&search=jane&only_ba_lead=true&businessArea=3"
			);
		});
	});

	describe("getFullUser", () => {
		it("should GET user details by ID", async () => {
			const mockUser = { id: 42, username: "testuser" };
			(apiClient.get as Mock).mockResolvedValue(mockUser);

			const result = await getFullUser(42);

			expect(apiClient.get).toHaveBeenCalledWith("users/42");
			expect(result).toEqual(mockUser);
		});
	});
});
