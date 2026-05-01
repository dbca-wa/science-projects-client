import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import {
	getProblematicProjects,
	getUnapprovedDocs,
	getBusinessAreaDetail,
	updateBusinessAreaLead,
} from "./business-area.service";
import { apiClient } from "@/shared/services/api/client.service";

vi.mock("@/shared/services/api/client.service", () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
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

	it("getBusinessAreaDetail should GET business area by ID", async () => {
		(apiClient.get as Mock).mockResolvedValue({ id: 5, name: "BCS" });
		const result = await getBusinessAreaDetail(5);
		expect(result).toEqual({ id: 5, name: "BCS" });
	});

	it("updateBusinessAreaLead should PUT FormData", async () => {
		(apiClient.put as Mock).mockResolvedValue(undefined);
		const formData = new FormData();
		formData.append("name", "Updated");
		await updateBusinessAreaLead(5, formData);
		expect(apiClient.put).toHaveBeenCalledWith(expect.any(String), formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
	});
});
