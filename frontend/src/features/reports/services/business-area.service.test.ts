import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import {
	getProblematicProjects,
	getUnapprovedDocs,
	updateBusinessAreaLead,
} from "./business-area.service";
import { apiClient } from "@/shared/services/api/client.service";

vi.mock("@/shared/services/api/client.service", () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		patch: vi.fn(),
	},
}));

describe("business-area.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("getProblematicProjects should GET with business area ID", async () => {
		(apiClient.get as Mock).mockResolvedValue({ projects: [] });
		await getProblematicProjects(5);
		const calledUrl = (apiClient.get as Mock).mock.calls[0][0] as string;
		expect(calledUrl).toContain("business_area_id=5");
	});

	it("getUnapprovedDocs should POST with business area array", async () => {
		(apiClient.post as Mock).mockResolvedValue({ documents: [] });
		await getUnapprovedDocs(5);
		expect(apiClient.post).toHaveBeenCalledWith(expect.any(String), {
			baArray: [5],
		});
	});

	it("updateBusinessAreaLead should PATCH FormData", async () => {
		(apiClient.patch as Mock).mockResolvedValue(undefined);
		const formData = new FormData();
		formData.append("name", "Updated");
		await updateBusinessAreaLead(5, formData);
		expect(apiClient.patch).toHaveBeenCalledWith(expect.any(String), formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
	});
});
