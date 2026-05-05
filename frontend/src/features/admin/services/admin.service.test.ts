import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import {
	getBranches,
	createBranch,
	updateBranch,
	deleteBranch,
	getBusinessAreas,
	createBusinessArea,
	updateBusinessArea,
	deleteBusinessArea,
	getAffiliations,
	createAffiliation,
	updateAffiliation,
	deleteAffiliation,
	mergeAffiliations,
	cleanOrphanedAffiliations,
	createDivision,
	updateDivision,
	deleteDivision,
	getReportInfos,
	createReportInfo,
	updateReportInfo,
	deleteReportInfo,
	batchApprove,
	batchApproveOld,
	openNewCycle,
	getEmailTestingSettings,
	updateEmailTestingSettings,
	sendAllTestEmails,
} from "./admin.service";
import { apiClient } from "@/shared/services/api/client.service";

vi.mock("@/shared/services/api/client.service", () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}));

vi.mock("@/shared/services/org.service", () => ({
	getDivisions: vi.fn(),
}));

describe("admin.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("branches CRUD", () => {
		it("getBranches should GET all branches", async () => {
			(apiClient.get as Mock).mockResolvedValue([]);
			await getBranches();
			expect(apiClient.get).toHaveBeenCalledWith(
				expect.stringContaining("branches")
			);
		});

		it("createBranch should POST branch data", async () => {
			(apiClient.post as Mock).mockResolvedValue({ id: 1 });
			await createBranch({ name: "New Branch", manager: null });
			expect(apiClient.post).toHaveBeenCalledWith(
				expect.stringContaining("branches"),
				{ name: "New Branch", manager: null }
			);
		});

		it("updateBranch should PUT branch data", async () => {
			(apiClient.put as Mock).mockResolvedValue({ id: 1 });
			await updateBranch(1, { name: "Updated", manager: null });
			expect(apiClient.put).toHaveBeenCalled();
		});

		it("deleteBranch should DELETE branch", async () => {
			(apiClient.delete as Mock).mockResolvedValue(undefined);
			await deleteBranch(1);
			expect(apiClient.delete).toHaveBeenCalled();
		});
	});

	describe("business areas CRUD", () => {
		it("getBusinessAreas should GET all business areas", async () => {
			(apiClient.get as Mock).mockResolvedValue([]);
			await getBusinessAreas();
			expect(apiClient.get).toHaveBeenCalledWith(
				expect.stringContaining("business_areas")
			);
		});

		it("createBusinessArea should POST data", async () => {
			(apiClient.post as Mock).mockResolvedValue({ id: 1 });
			await createBusinessArea({
				name: "BCS",
				is_active: true,
				focus: "",
				introduction: "",
				image: null,
			});
			expect(apiClient.post).toHaveBeenCalled();
		});

		it("updateBusinessArea should PUT data", async () => {
			(apiClient.put as Mock).mockResolvedValue({ id: 1 });
			await updateBusinessArea(1, {
				name: "Updated",
				is_active: true,
				focus: "",
				introduction: "",
				image: null,
			});
			expect(apiClient.put).toHaveBeenCalled();
		});

		it("deleteBusinessArea should DELETE", async () => {
			(apiClient.delete as Mock).mockResolvedValue(undefined);
			await deleteBusinessArea(1);
			expect(apiClient.delete).toHaveBeenCalled();
		});
	});

	describe("affiliations CRUD", () => {
		it("getAffiliations should GET all affiliations", async () => {
			(apiClient.get as Mock).mockResolvedValue([]);
			await getAffiliations();
			expect(apiClient.get).toHaveBeenCalled();
		});

		it("createAffiliation should POST data", async () => {
			(apiClient.post as Mock).mockResolvedValue({ id: 1 });
			await createAffiliation({ name: "UWA" });
			expect(apiClient.post).toHaveBeenCalled();
		});

		it("updateAffiliation should PUT data", async () => {
			(apiClient.put as Mock).mockResolvedValue({ id: 1 });
			await updateAffiliation(1, { name: "Updated" });
			expect(apiClient.put).toHaveBeenCalled();
		});

		it("deleteAffiliation should DELETE", async () => {
			(apiClient.delete as Mock).mockResolvedValue(undefined);
			await deleteAffiliation(1);
			expect(apiClient.delete).toHaveBeenCalled();
		});

		it("mergeAffiliations should POST merge data", async () => {
			(apiClient.post as Mock).mockResolvedValue({ message: "Merged" });
			await mergeAffiliations({
				primaryAffiliation: { pk: 1 },
				secondaryAffiliations: [{ pk: 2 }, { pk: 3 }],
			});
			expect(apiClient.post).toHaveBeenCalled();
		});

		it("cleanOrphanedAffiliations should POST clean request", async () => {
			(apiClient.post as Mock).mockResolvedValue({ deleted_count: 5 });
			const result = await cleanOrphanedAffiliations();
			expect(result.deleted_count).toBe(5);
		});
	});

	describe("divisions CRUD", () => {
		it("createDivision should POST data", async () => {
			(apiClient.post as Mock).mockResolvedValue({ id: 1 });
			await createDivision({
				name: "BCS",
				slug: "bcs",
				director: null,
				approver: null,
			});
			expect(apiClient.post).toHaveBeenCalled();
		});

		it("updateDivision should PUT data", async () => {
			(apiClient.put as Mock).mockResolvedValue({ id: 1 });
			await updateDivision(1, {
				name: "Updated",
				slug: "updated",
				director: null,
				approver: null,
			});
			expect(apiClient.put).toHaveBeenCalled();
		});

		it("deleteDivision should DELETE", async () => {
			(apiClient.delete as Mock).mockResolvedValue(undefined);
			await deleteDivision(1);
			expect(apiClient.delete).toHaveBeenCalled();
		});
	});

	describe("report info CRUD", () => {
		it("getReportInfos should GET all reports", async () => {
			(apiClient.get as Mock).mockResolvedValue([]);
			await getReportInfos();
			expect(apiClient.get).toHaveBeenCalled();
		});

		it("createReportInfo should POST data", async () => {
			(apiClient.post as Mock).mockResolvedValue({ id: 1 });
			await createReportInfo({ year: 2026, division: 1 });
			expect(apiClient.post).toHaveBeenCalled();
		});

		it("updateReportInfo should PUT data", async () => {
			(apiClient.put as Mock).mockResolvedValue({ id: 1 });
			await updateReportInfo(1, { year: 2026, dm: "Updated" });
			expect(apiClient.put).toHaveBeenCalled();
		});

		it("deleteReportInfo should DELETE", async () => {
			(apiClient.delete as Mock).mockResolvedValue(undefined);
			await deleteReportInfo(1);
			expect(apiClient.delete).toHaveBeenCalled();
		});
	});

	describe("admin actions", () => {
		it("batchApprove should POST with division and notification options", async () => {
			(apiClient.post as Mock).mockResolvedValue(undefined);
			await batchApprove({ division: "bcs", send_notifications: true });
			expect(apiClient.post).toHaveBeenCalledWith(
				expect.stringContaining("batchapprove"),
				expect.objectContaining({ division: "bcs", send_notifications: true })
			);
		});

		it("batchApproveOld should POST with options", async () => {
			(apiClient.post as Mock).mockResolvedValue(undefined);
			await batchApproveOld();
			expect(apiClient.post).toHaveBeenCalledWith(
				expect.stringContaining("batchapproveold"),
				expect.objectContaining({ send_notifications: false })
			);
		});

		it("openNewCycle should POST with cycle options", async () => {
			(apiClient.post as Mock).mockResolvedValue(undefined);
			await openNewCycle({
				division: "bcs",
				update: true,
				prepopulate: true,
				send_emails: true,
			});
			expect(apiClient.post).toHaveBeenCalledWith(
				expect.stringContaining("opennewcycle"),
				expect.objectContaining({
					division: "bcs",
					update: true,
					prepopulate: true,
					send_emails: true,
				})
			);
		});

		it("openNewCycle should pass custom message fields", async () => {
			(apiClient.post as Mock).mockResolvedValue(undefined);
			await openNewCycle({
				division: "bcs",
				send_emails: true,
				custom_message: "<p>Please update by Friday.</p>",
			});
			expect(apiClient.post).toHaveBeenCalledWith(
				expect.stringContaining("opennewcycle"),
				expect.objectContaining({
					custom_message: "<p>Please update by Friday.</p>",
				})
			);
		});

		it("openNewCycle should pass per-group custom messages", async () => {
			(apiClient.post as Mock).mockResolvedValue(undefined);
			await openNewCycle({
				division: "bcs",
				send_emails: true,
				custom_messages: {
					ba_leads: "<p>BA message</p>",
					project_leads: "<p>PL message</p>",
					team_members: "<p>TM message</p>",
				},
			});
			expect(apiClient.post).toHaveBeenCalledWith(
				expect.stringContaining("opennewcycle"),
				expect.objectContaining({
					custom_messages: {
						ba_leads: "<p>BA message</p>",
						project_leads: "<p>PL message</p>",
						team_members: "<p>TM message</p>",
					},
				})
			);
		});
	});

	describe("email testing", () => {
		it("getEmailTestingSettings should GET admin options", async () => {
			(apiClient.get as Mock).mockResolvedValue({ email_testing_mode: false });
			await getEmailTestingSettings();
			expect(apiClient.get).toHaveBeenCalled();
		});

		it("updateEmailTestingSettings should PUT settings", async () => {
			(apiClient.put as Mock).mockResolvedValue({ email_testing_mode: true });
			await updateEmailTestingSettings({
				email_testing_mode: true,
				email_test_user: 42,
			});
			expect(apiClient.put).toHaveBeenCalledWith(expect.any(String), {
				email_testing_mode: true,
				email_test_user: 42,
			});
		});

		it("sendAllTestEmails should POST with optional overrides", async () => {
			(apiClient.post as Mock).mockResolvedValue({
				message: "Sent",
				results: [],
			});
			await sendAllTestEmails({
				recipient_user_id: 1,
				template_name: "bump_email",
			});
			expect(apiClient.post).toHaveBeenCalledWith(
				expect.stringContaining("send-all-test-emails"),
				expect.objectContaining({
					recipient_user_id: 1,
					template_name: "bump_email",
				})
			);
		});
	});

	describe("new cycle draft", () => {
		it("getNewCycleDraft should GET the draft endpoint", async () => {
			(apiClient.get as Mock).mockResolvedValue({ draft: null });
			const { getNewCycleDraft } = await import("./admin.service");
			await getNewCycleDraft();
			expect(apiClient.get).toHaveBeenCalledWith(
				expect.stringContaining("new-cycle-draft")
			);
		});

		it("saveNewCycleDraft should POST draft data", async () => {
			(apiClient.post as Mock).mockResolvedValue({ status: "draft saved" });
			const { saveNewCycleDraft } = await import("./admin.service");
			const draft = { prepopulateMode: "all", sendBaLeads: true };
			await saveNewCycleDraft(draft);
			expect(apiClient.post).toHaveBeenCalledWith(
				expect.stringContaining("new-cycle-draft"),
				{ draft }
			);
		});

		it("clearNewCycleDraft should DELETE the draft", async () => {
			(apiClient.delete as Mock).mockResolvedValue({ status: "draft cleared" });
			const { clearNewCycleDraft } = await import("./admin.service");
			await clearNewCycleDraft();
			expect(apiClient.delete).toHaveBeenCalledWith(
				expect.stringContaining("new-cycle-draft")
			);
		});
	});
});
