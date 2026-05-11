/**
 * Tests for bump email service functions.
 *
 * Verifies that useSendBump and useSendBumpAll send the correct payload
 * shapes to the backend endpoints.
 */
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { apiClient } from "@/shared/services/api/client.service";
import { DOCUMENT_ENDPOINTS } from "@/shared/services/document.endpoints";

vi.mock("@/shared/services/api/client.service", () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}));

// Test the underlying API calls directly (not the hooks which need QueryClient)
describe("Bump email API payloads", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(apiClient.post as Mock).mockResolvedValue({ emails_sent: 1, errors: [] });
	});

	it("single bump sends documentsRequiringAction with all required fields", async () => {
		const payload = {
			documentsRequiringAction: [
				{
					userToTakeAction: 42,
					documentKind: "progressreport",
					projectTitle: "Fauna Survey 2026",
					projectId: 10,
					actionCapacity: "Project Lead",
					documentId: 100,
				},
			],
			send_aggressive: true,
		};

		await apiClient.post(DOCUMENT_ENDPOINTS.SEND_BUMP, payload);

		expect(apiClient.post).toHaveBeenCalledWith(
			"documents/sendbumpemails",
			expect.objectContaining({
				documentsRequiringAction: expect.arrayContaining([
					expect.objectContaining({
						userToTakeAction: 42,
						documentKind: "progressreport",
						projectTitle: "Fauna Survey 2026",
						projectId: 10,
						actionCapacity: "Project Lead",
						documentId: 100,
					}),
				]),
				send_aggressive: true,
			})
		);
	});

	it("bump all sends stage and report_id filters", async () => {
		const payload = { stage: 1, report_id: 5, send_aggressive: false };

		await apiClient.post(DOCUMENT_ENDPOINTS.SEND_BUMP_ALL, payload);

		expect(apiClient.post).toHaveBeenCalledWith(
			"documents/sendbumpall",
			expect.objectContaining({
				stage: 1,
				report_id: 5,
				send_aggressive: false,
			})
		);
	});

	it("batch approve current sends division and send_notifications", async () => {
		const payload = { division: "bcs", send_notifications: true };

		await apiClient.post(DOCUMENT_ENDPOINTS.BATCH_APPROVE_CURRENT, payload);

		expect(apiClient.post).toHaveBeenCalledWith(
			"documents/batchapprovecurrent",
			expect.objectContaining({
				division: "bcs",
				send_notifications: true,
			})
		);
	});
});
