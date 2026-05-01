import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { performDocumentAction, deleteDocument } from "./document.service";
import { apiClient } from "@/shared/services/api/client.service";

vi.mock("@/shared/services/api/client.service", () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	},
}));

describe("document.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("performDocumentAction", () => {
		it("should POST approve action to approve endpoint", async () => {
			(apiClient.post as Mock).mockResolvedValue({ ok: true });

			await performDocumentAction("concept", 123, {
				action: "approve",
				stage: 1,
				documentPk: 123,
				send_email: true,
			});

			expect(apiClient.post).toHaveBeenCalledWith("documents/actions/approve", {
				stage: 1,
				documentPk: 123,
				reason: undefined,
				feedbackHTML: undefined,
			});
		});

		it("should POST recall action to recall endpoint", async () => {
			(apiClient.post as Mock).mockResolvedValue({ ok: true });

			await performDocumentAction("projectplan", 456, {
				action: "recall",
				stage: 2,
				documentPk: 456,
				reason: "Needs revision",
				feedbackHTML: "<p>Please fix</p>",
				send_email: true,
			});

			expect(apiClient.post).toHaveBeenCalledWith("documents/actions/recall", {
				stage: 2,
				documentPk: 456,
				reason: "Needs revision",
				feedbackHTML: "<p>Please fix</p>",
			});
		});

		it("should POST send_back action to send_back endpoint", async () => {
			(apiClient.post as Mock).mockResolvedValue({ ok: true });

			await performDocumentAction("progressreport", 789, {
				action: "send_back",
				stage: 3,
				documentPk: 789,
				send_email: false,
			});

			expect(apiClient.post).toHaveBeenCalledWith(
				"documents/actions/send_back",
				{
					stage: 3,
					documentPk: 789,
					reason: undefined,
					feedbackHTML: undefined,
				}
			);
		});

		it("should throw for unknown action", async () => {
			await expect(
				performDocumentAction("concept", 123, {
					action: "unknown" as "approve",
					stage: 1,
					documentPk: 123,
					send_email: true,
				})
			).rejects.toThrow("Unknown action: unknown");
		});
	});

	describe("deleteDocument", () => {
		it("should DELETE document by ID", async () => {
			const mockResponse = { success: true, message: "Deleted" };
			(apiClient.delete as Mock).mockResolvedValue(mockResponse);

			const result = await deleteDocument("concept", 123);

			expect(apiClient.delete).toHaveBeenCalledWith(
				"documents/projectdocuments/123"
			);
			expect(result).toEqual(mockResponse);
		});
	});
});
