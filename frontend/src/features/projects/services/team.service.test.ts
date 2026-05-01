import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import {
	getProjectTeam,
	inviteTeamMember,
	updateTeamMember,
	removeTeamMember,
	updateTeamPositions,
	promoteToLeader,
} from "./team.service";
import { apiClient } from "@/shared/services/api/client.service";

vi.mock("@/shared/services/api/client.service", () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	},
}));

describe("team.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getProjectTeam", () => {
		it("should GET team members for a project", async () => {
			const mockTeam = [{ user: { id: 1 }, role: "research" }];
			(apiClient.get as Mock).mockResolvedValue(mockTeam);

			const result = await getProjectTeam(42);

			expect(apiClient.get).toHaveBeenCalledWith("/projects/42/team");
			expect(result).toEqual(mockTeam);
		});

		it("should return empty array on error", async () => {
			(apiClient.get as Mock).mockRejectedValue(new Error("Network error"));

			const result = await getProjectTeam(42);

			expect(result).toEqual([]);
		});

		it("should return empty array when API returns null", async () => {
			(apiClient.get as Mock).mockResolvedValue(null);

			const result = await getProjectTeam(42);

			expect(result).toEqual([]);
		});
	});

	describe("inviteTeamMember", () => {
		it("should POST team member data to create endpoint", async () => {
			const mockMember = { user: { id: 5 }, role: "research" };
			(apiClient.post as Mock).mockResolvedValue(mockMember);

			const result = await inviteTeamMember(42, {
				user_id: 5,
				role: "research",
				time_allocation: 0.5,
				position: 2,
			});

			expect(apiClient.post).toHaveBeenCalledWith("/projects/project_members", {
				project: 42,
				user: 5,
				role: "research",
				time_allocation: 0.5,
				position: 2,
				is_leader: false,
				comments: "",
				short_code: "",
			});
			expect(result).toEqual(mockMember);
		});

		it("should throw on failure", async () => {
			(apiClient.post as Mock).mockRejectedValue(new Error("Conflict"));

			await expect(
				inviteTeamMember(42, {
					user_id: 5,
					role: "research",
					time_allocation: 0,
				})
			).rejects.toThrow("Conflict");
		});
	});

	describe("updateTeamMember", () => {
		it("should PUT updated data to member endpoint", async () => {
			const mockUpdated = { user: { id: 5 }, role: "technical" };
			(apiClient.put as Mock).mockResolvedValue(mockUpdated);

			const result = await updateTeamMember(42, 5, { role: "technical" });

			expect(apiClient.put).toHaveBeenCalledWith(
				"/projects/project_members/42/5",
				{ role: "technical" }
			);
			expect(result).toEqual(mockUpdated);
		});
	});

	describe("removeTeamMember", () => {
		it("should DELETE team member", async () => {
			(apiClient.delete as Mock).mockResolvedValue(undefined);

			await removeTeamMember(42, 5);

			expect(apiClient.delete).toHaveBeenCalledWith(
				"/projects/project_members/42/5"
			);
		});
	});

	describe("updateTeamPositions", () => {
		it("should PUT position data to team endpoint", async () => {
			const mockResult = [{ user: { id: 1 }, position: 0 }];
			(apiClient.put as Mock).mockResolvedValue(mockResult);

			const positions = { members: [{ id: 1, position: 0 }] };
			const result = await updateTeamPositions(42, positions);

			expect(apiClient.put).toHaveBeenCalledWith(
				"/projects/42/team",
				positions
			);
			expect(result).toEqual(mockResult);
		});
	});

	describe("promoteToLeader", () => {
		it("should POST promote request", async () => {
			(apiClient.post as Mock).mockResolvedValue(undefined);

			await promoteToLeader(42, 5);

			expect(apiClient.post).toHaveBeenCalledWith("/projects/promote", {
				project_id: 42,
				user_id: 5,
			});
		});
	});
});
