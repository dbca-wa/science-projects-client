import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import {
	getStaffProfiles,
	getStaffProfileHero,
	getStaffProfileOverview,
	getStaffProfileCV,
	getStaffProfileProjects,
	updateStaffProfileOverview,
	toggleStaffProfileVisibility,
	createEmploymentEntry,
	deleteEmploymentEntry,
	createEducationEntry,
	deleteEducationEntry,
	emailStaffMember,
	getPublications,
} from "./staff-profile.service";
import { apiClient } from "@/shared/services/api/client.service";

vi.mock("@/shared/services/api/client.service", () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	},
}));

describe("staff-profile.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("getStaffProfiles should GET with search and pagination params", async () => {
		(apiClient.get as Mock).mockResolvedValue({ profiles: [], total: 0 });
		await getStaffProfiles({ search: "john", page: 2 });
		const calledUrl = (apiClient.get as Mock).mock.calls[0][0] as string;
		expect(calledUrl).toContain("searchTerm=john");
		expect(calledUrl).toContain("page=2");
	});

	it("getStaffProfileHero should GET hero data", async () => {
		(apiClient.get as Mock).mockResolvedValue({ name: "Test" });
		await getStaffProfileHero(5);
		expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining("hero"));
	});

	it("getStaffProfileOverview should GET overview data", async () => {
		(apiClient.get as Mock).mockResolvedValue({ about: "Test" });
		await getStaffProfileOverview(5);
		expect(apiClient.get).toHaveBeenCalledWith(
			expect.stringContaining("overview")
		);
	});

	it("getStaffProfileCV should GET CV data", async () => {
		(apiClient.get as Mock).mockResolvedValue({ entries: [] });
		await getStaffProfileCV(5);
		expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining("cv"));
	});

	it("getStaffProfileProjects should GET projects for user", async () => {
		(apiClient.get as Mock).mockResolvedValue([]);
		await getStaffProfileProjects(5);
		expect(apiClient.get).toHaveBeenCalledWith(
			expect.stringContaining("projects_staff_profile")
		);
	});

	it("updateStaffProfileOverview should PUT overview data", async () => {
		(apiClient.put as Mock).mockResolvedValue({ about: "Updated" });
		await updateStaffProfileOverview(5, { about: "Updated" });
		expect(apiClient.put).toHaveBeenCalledWith(
			expect.stringContaining("overview"),
			{ about: "Updated" }
		);
	});

	it("toggleStaffProfileVisibility should POST to toggle endpoint", async () => {
		(apiClient.post as Mock).mockResolvedValue({ is_hidden: false });
		const result = await toggleStaffProfileVisibility(5);
		expect(result).toEqual({ is_hidden: false });
	});

	it("createEmploymentEntry should POST entry data", async () => {
		(apiClient.post as Mock).mockResolvedValue({ id: 1 });
		await createEmploymentEntry(5, {
			position_title: "Scientist",
			start_year: 2020,
			employer: "DBCA",
		});
		expect(apiClient.post).toHaveBeenCalledWith(
			expect.stringContaining("employment"),
			expect.objectContaining({
				position_title: "Scientist",
				public_profile: 5,
			})
		);
	});

	it("deleteEmploymentEntry should DELETE entry by pk", async () => {
		(apiClient.delete as Mock).mockResolvedValue(undefined);
		await deleteEmploymentEntry(10);
		expect(apiClient.delete).toHaveBeenCalledWith(
			expect.stringContaining("10")
		);
	});

	it("createEducationEntry should POST entry data", async () => {
		(apiClient.post as Mock).mockResolvedValue({ id: 1 });
		await createEducationEntry(5, {
			institution: "UWA",
			qualification_name: "PhD",
			end_year: 2020,
			location: "Perth",
		});
		expect(apiClient.post).toHaveBeenCalledWith(
			expect.stringContaining("education"),
			expect.objectContaining({ institution: "UWA", public_profile: 5 })
		);
	});

	it("deleteEducationEntry should DELETE entry by pk", async () => {
		(apiClient.delete as Mock).mockResolvedValue(undefined);
		await deleteEducationEntry(10);
		expect(apiClient.delete).toHaveBeenCalledWith(
			expect.stringContaining("10")
		);
	});

	it("emailStaffMember should POST email data", async () => {
		(apiClient.post as Mock).mockResolvedValue(undefined);
		await emailStaffMember(5, {
			senderEmail: "public@example.com",
			message: "Hello",
		});
		expect(apiClient.post).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				pk: 5,
				senderEmail: "public@example.com",
				message: "Hello",
			})
		);
	});

	it("getPublications should GET publications by employee ID", async () => {
		(apiClient.get as Mock).mockResolvedValue({ publications: [] });
		await getPublications("EMP123");
		expect(apiClient.get).toHaveBeenCalledWith(
			expect.stringContaining("EMP123")
		);
	});
});
