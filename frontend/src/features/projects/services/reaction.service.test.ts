import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { getReactions, toggleReaction } from "./reaction.service";
import { apiClient } from "@/shared/services/api/client.service";

vi.mock("@/shared/services/api/client.service", () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
	},
}));

describe("reaction.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getReactions", () => {
		it("should GET reactions for a comment", async () => {
			const mockReactions = [{ id: 1, reaction: "thumbs_up" }];
			(apiClient.get as Mock).mockResolvedValue(mockReactions);

			const result = await getReactions(42);

			expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining("42"));
			expect(result).toEqual(mockReactions);
		});

		it("should throw on failure", async () => {
			(apiClient.get as Mock).mockRejectedValue(new Error("Failed"));

			await expect(getReactions(42)).rejects.toThrow("Failed");
		});
	});

	describe("toggleReaction", () => {
		it("should POST reaction toggle data", async () => {
			const mockReaction = { id: 1, reaction: "thumbup" };
			(apiClient.post as Mock).mockResolvedValue(mockReaction);

			const result = await toggleReaction(42, "thumbup");

			expect(apiClient.post).toHaveBeenCalledWith(expect.any(String), {
				comment: 42,
				reaction: "thumbup",
			});
			expect(result).toEqual(mockReaction);
		});

		it("should return null when reaction is removed", async () => {
			(apiClient.post as Mock).mockResolvedValue(null);

			const result = await toggleReaction(42, "thumbup");

			expect(result).toBeNull();
		});
	});
});
