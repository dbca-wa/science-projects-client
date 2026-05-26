/**
 * Tests for document service — email-triggering actions.
 *
 * Verifies that performDocumentAction sends the correct payload shape
 * to the backend for approve, recall, and send_back actions.
 */
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { performDocumentAction } from "./document.service";
import { apiClient } from "@/shared/services/api/client.service";
import { DOCUMENT_ENDPOINTS } from "./document.endpoints";

vi.mock("@/shared/services/api/client.service", () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}));

describe("performDocumentAction", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(apiClient.post as Mock).mockResolvedValue({});
	});

	it("approve action sends stage, documentPk, feedbackHTML, and send_email", async () => {
		await performDocumentAction("concept", 42, {
			action: "approve",
			stage: 2,
			documentPk: 42,
			feedbackHTML: "<p>Looks good</p>",
			send_email: true,
		});

		expect(apiClient.post).toHaveBeenCalledWith(
			DOCUMENT_ENDPOINTS.APPROVE,
			expect.objectContaining({
				stage: 2,
				documentPk: 42,
				feedbackHTML: "<p>Looks good</p>",
				send_email: true,
			})
		);
	});

	it("recall action sends to correct endpoint with stage and feedback", async () => {
		await performDocumentAction("progressreport", 99, {
			action: "recall",
			stage: 1,
			documentPk: 99,
			reason: "Need to revise",
			feedbackHTML: "<p>Revise methodology</p>",
			send_email: true,
		});

		expect(apiClient.post).toHaveBeenCalledWith(
			DOCUMENT_ENDPOINTS.RECALL,
			expect.objectContaining({
				stage: 1,
				documentPk: 99,
				reason: "Need to revise",
				feedbackHTML: "<p>Revise methodology</p>",
			})
		);
	});

	it("send_back action sends to correct endpoint", async () => {
		await performDocumentAction("projectplan", 55, {
			action: "send_back",
			stage: 2,
			documentPk: 55,
			feedbackHTML: "<p>Budget incomplete</p>",
			send_email: true,
		});

		expect(apiClient.post).toHaveBeenCalledWith(
			DOCUMENT_ENDPOINTS.SEND_BACK,
			expect.objectContaining({
				stage: 2,
				documentPk: 55,
				feedbackHTML: "<p>Budget incomplete</p>",
			})
		);
	});

	it("includes send_email field in POST body", async () => {
		await performDocumentAction("concept", 42, {
			action: "approve",
			stage: 1,
			documentPk: 42,
			send_email: false,
		});

		const payload = (apiClient.post as Mock).mock.calls[0][1];
		expect(payload).toHaveProperty("send_email", false);
	});

	it("includes send_email=true when checkbox is selected", async () => {
		await performDocumentAction("concept", 42, {
			action: "approve",
			stage: 1,
			documentPk: 42,
			send_email: true,
		});

		const payload = (apiClient.post as Mock).mock.calls[0][1];
		expect(payload).toHaveProperty("send_email", true);
	});

	it("throws for unknown action", async () => {
		await expect(
			performDocumentAction("concept", 42, {
				action: "invalid" as never,
				stage: 1,
				documentPk: 42,
				send_email: true,
			})
		).rejects.toThrow("Unknown action: invalid");
	});
});
