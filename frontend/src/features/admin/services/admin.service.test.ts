/**
 * Tests for admin service — email-triggering functions.
 *
 * Verifies that openNewCycle, batchApprove, batchApproveOld, and sendAllTestEmails
 * send the correct payload shapes to the backend.
 */
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import {
	openNewCycle,
	batchApprove,
	batchApproveOld,
	sendAllTestEmails,
} from "./admin.service";
import { apiClient } from "@/shared/services/api/client.service";
import { ADMIN_ENDPOINTS } from "./admin.endpoints";

vi.mock("@/shared/services/api/client.service", () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}));

describe("openNewCycle", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(apiClient.post as Mock).mockResolvedValue(undefined);
	});

	it("sends all required fields to the correct endpoint", async () => {
		await openNewCycle({
			division: "bcs",
			update: true,
			prepopulate: false,
			send_emails: true,
			recipient_groups: ["ba_leads", "project_leads"],
			excluded_user_ids: [5, 10],
			recipient_user_pks: [1, 2, 3],
			custom_message: "<p>Please update your reports</p>",
		});

		expect(apiClient.post).toHaveBeenCalledWith(
			ADMIN_ENDPOINTS.OPEN_NEW_CYCLE,
			expect.objectContaining({
				division: "bcs",
				update: true,
				prepopulate: false,
				send_emails: true,
				recipient_groups: ["ba_leads", "project_leads"],
				excluded_user_ids: [5, 10],
				recipient_user_pks: [1, 2, 3],
				custom_message: "<p>Please update your reports</p>",
			})
		);
	});

	it("sends recipient_user_pks when provided", async () => {
		await openNewCycle({
			send_emails: true,
			recipient_groups: ["ba_leads"],
			recipient_user_pks: [100, 200, 300],
		});

		const payload = (apiClient.post as Mock).mock.calls[0][1];
		expect(payload.recipient_user_pks).toEqual([100, 200, 300]);
	});

	it("sends custom_messages per group when provided", async () => {
		await openNewCycle({
			send_emails: true,
			recipient_groups: ["ba_leads", "project_leads", "team_members"],
			custom_messages: {
				ba_leads: "<p>BA lead message</p>",
				project_leads: "<p>PL message</p>",
				team_members: "<p>Team message</p>",
			},
		});

		const payload = (apiClient.post as Mock).mock.calls[0][1];
		expect(payload.custom_messages).toEqual({
			ba_leads: "<p>BA lead message</p>",
			project_leads: "<p>PL message</p>",
			team_members: "<p>Team message</p>",
		});
	});

	it("defaults update=true, prepopulate=false, send_emails=false", async () => {
		await openNewCycle({});

		const payload = (apiClient.post as Mock).mock.calls[0][1];
		expect(payload.update).toBe(true);
		expect(payload.prepopulate).toBe(false);
		expect(payload.send_emails).toBe(false);
	});
});

describe("batchApprove", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(apiClient.post as Mock).mockResolvedValue(undefined);
	});

	it("sends division and send_notifications", async () => {
		await batchApprove({ division: "bcs", send_notifications: true });

		expect(apiClient.post).toHaveBeenCalledWith(
			ADMIN_ENDPOINTS.BATCH_APPROVE,
			expect.objectContaining({
				division: "bcs",
				send_notifications: true,
			})
		);
	});

	it("defaults send_notifications to false", async () => {
		await batchApprove({});

		const payload = (apiClient.post as Mock).mock.calls[0][1];
		expect(payload.send_notifications).toBe(false);
	});
});

describe("batchApproveOld", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(apiClient.post as Mock).mockResolvedValue(undefined);
	});

	it("sends division and send_notifications", async () => {
		await batchApproveOld({ division: "bcs", send_notifications: true });

		expect(apiClient.post).toHaveBeenCalledWith(
			ADMIN_ENDPOINTS.BATCH_APPROVE_OLD,
			expect.objectContaining({
				division: "bcs",
				send_notifications: true,
			})
		);
	});
});

describe("sendAllTestEmails", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(apiClient.post as Mock).mockResolvedValue({
			message: "ok",
			preview_dir: "email_previews",
			results: [],
		});
	});

	it("sends overrides to correct endpoint", async () => {
		await sendAllTestEmails({
			recipient_user_id: 5,
			actioner_user_id: 10,
			template_name: "bump_email",
		});

		expect(apiClient.post).toHaveBeenCalledWith(
			ADMIN_ENDPOINTS.SEND_ALL_TEST_EMAILS,
			expect.objectContaining({
				recipient_user_id: 5,
				actioner_user_id: 10,
				template_name: "bump_email",
			})
		);
	});

	it("sends empty object when no overrides", async () => {
		await sendAllTestEmails();

		expect(apiClient.post).toHaveBeenCalledWith(
			ADMIN_ENDPOINTS.SEND_ALL_TEST_EMAILS,
			{}
		);
	});
});
