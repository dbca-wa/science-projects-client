import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import {
	submitWizard,
	type WizardSubmissionData,
} from "./wizard-submission.service";
import { apiClient } from "@/shared/services/api/client.service";

vi.mock("@/shared/services/api/client.service", () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
	},
}));

vi.mock("@/shared/services/logger.service", () => ({
	logger: { warn: vi.fn(), debug: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

const makeBaseData = (
	overrides: Partial<WizardSubmissionData> = {}
): WizardSubmissionData => ({
	title: "Test Project",
	description: "A test project",
	keywords: ["fauna", "survey"],
	image: null,
	business_area: 1,
	departmental_service: 2,
	start_date: new Date("2026-01-01"),
	end_date: new Date("2026-12-31"),
	project_leader: 10,
	data_custodian: 11,
	areas: [100, 200],
	projectKind: "science",
	creator: 5,
	year: 2026,
	...overrides,
});

describe("wizard-submission.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("submitWizard", () => {
		it("should POST FormData to projects list endpoint", async () => {
			const mockProject = { id: 99, title: "Test Project" };
			(apiClient.post as Mock).mockResolvedValue(mockProject);

			const result = await submitWizard(makeBaseData());

			expect(apiClient.post).toHaveBeenCalledWith(
				"projects/list",
				expect.any(FormData),
				{ headers: { "Content-Type": "multipart/form-data" } }
			);
			expect(result).toEqual(mockProject);
		});

		it("should include base fields in FormData", async () => {
			const mockProject = { id: 99 };
			(apiClient.post as Mock).mockResolvedValue(mockProject);

			await submitWizard(makeBaseData());

			const formData = (apiClient.post as Mock).mock.calls[0][1] as FormData;
			expect(formData.get("title")).toBe("Test Project");
			expect(formData.get("kind")).toBe("science");
			expect(formData.get("year")).toBe("2026");
			expect(formData.get("creator")).toBe("5");
			expect(formData.get("businessArea")).toBe("1");
			expect(formData.get("projectLead")).toBe("10");
		});

		it("should include student-specific fields for student projects", async () => {
			const mockProject = { id: 99 };
			(apiClient.post as Mock).mockResolvedValue(mockProject);

			await submitWizard(
				makeBaseData({
					projectKind: "student",
					organisation: "UWA",
					level: "PhD",
				})
			);

			const formData = (apiClient.post as Mock).mock.calls[0][1] as FormData;
			expect(formData.get("kind")).toBe("student");
			expect(formData.get("organisation")).toBe("UWA");
			expect(formData.get("level")).toBe("PhD");
		});

		it("should include external-specific fields for external projects", async () => {
			const mockProject = { id: 99 };
			(apiClient.post as Mock).mockResolvedValue(mockProject);

			await submitWizard(
				makeBaseData({
					projectKind: "external",
					collaboration_with: "CSIRO",
					budget: "$50,000",
					external_description: "External collab",
					aims: "Research aims",
				})
			);

			const formData = (apiClient.post as Mock).mock.calls[0][1] as FormData;
			expect(formData.get("kind")).toBe("external");
			expect(formData.get("collaborationWith")).toBe("CSIRO");
			expect(formData.get("budget")).toBe("$50,000");
			expect(formData.get("externalDescription")).toBe("External collab");
			expect(formData.get("aims")).toBe("Research aims");
		});

		it("should add non-leader team members after project creation", async () => {
			const mockProject = { id: 99 };
			(apiClient.post as Mock).mockResolvedValue(mockProject);

			await submitWizard(
				makeBaseData({
					teamMembers: [
						{
							userId: 10,
							role: "supervising",
							isLeader: true,
							displayName: "Leader",
							position: 0,
							isStaff: true,
							timeAllocation: 1,
						},
						{
							userId: 20,
							role: "research",
							isLeader: false,
							displayName: "Member",
							position: 1,
							isStaff: true,
							timeAllocation: 0.5,
						},
					],
				})
			);

			// First call: create project, second call: add non-leader member
			expect(apiClient.post).toHaveBeenCalledTimes(2);
			expect(apiClient.post).toHaveBeenNthCalledWith(
				2,
				"/projects/project_members",
				expect.objectContaining({
					project: 99,
					user: 20,
					role: "research",
					is_leader: false,
				})
			);
		});

		it("should not add leader as team member (already set via projectLead)", async () => {
			const mockProject = { id: 99 };
			(apiClient.post as Mock).mockResolvedValue(mockProject);

			await submitWizard(
				makeBaseData({
					teamMembers: [
						{
							userId: 10,
							role: "supervising",
							isLeader: true,
							displayName: "Leader",
							position: 0,
							isStaff: true,
							timeAllocation: 1,
						},
					],
				})
			);

			// Only the project creation call, no team member calls
			expect(apiClient.post).toHaveBeenCalledTimes(1);
		});

		it("should continue if a team member addition fails", async () => {
			const mockProject = { id: 99 };
			(apiClient.post as Mock)
				.mockResolvedValueOnce(mockProject) // project creation
				.mockRejectedValueOnce(new Error("Conflict")) // first member fails
				.mockResolvedValueOnce({}); // second member succeeds

			const result = await submitWizard(
				makeBaseData({
					teamMembers: [
						{
							userId: 20,
							role: "research",
							isLeader: false,
							displayName: "Member 1",
							position: 1,
							isStaff: true,
							timeAllocation: 0,
						},
						{
							userId: 30,
							role: "technical",
							isLeader: false,
							displayName: "Member 2",
							position: 2,
							isStaff: true,
							timeAllocation: 0,
						},
					],
				})
			);

			// Should still return the project despite member failure
			expect(result).toEqual(mockProject);
			expect(apiClient.post).toHaveBeenCalledTimes(3);
		});
	});
});
