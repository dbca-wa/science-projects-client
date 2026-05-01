import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import {
	getAllBusinessAreas,
	getAllBranches,
	getAllAffiliations,
	getDivisions,
	getMyBusinessAreas,
} from "./org.service";
import { apiClient } from "./api/client.service";

vi.mock("./api/client.service", () => ({
	apiClient: { get: vi.fn() },
}));

describe("shared org.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("getAllBusinessAreas should GET from business_areas endpoint", async () => {
		(apiClient.get as Mock).mockResolvedValue([]);
		await getAllBusinessAreas();
		expect(apiClient.get).toHaveBeenCalledWith("agencies/business_areas");
	});

	it("getAllBranches should GET from branches endpoint", async () => {
		(apiClient.get as Mock).mockResolvedValue([]);
		await getAllBranches();
		expect(apiClient.get).toHaveBeenCalledWith("agencies/branches");
	});

	it("getAllAffiliations should GET from affiliations endpoint", async () => {
		(apiClient.get as Mock).mockResolvedValue([]);
		await getAllAffiliations();
		expect(apiClient.get).toHaveBeenCalledWith("agencies/affiliations");
	});

	it("getDivisions should GET from divisions endpoint", async () => {
		(apiClient.get as Mock).mockResolvedValue([]);
		await getDivisions();
		expect(apiClient.get).toHaveBeenCalledWith("agencies/divisions");
	});

	it("getMyBusinessAreas should GET from mine endpoint", async () => {
		(apiClient.get as Mock).mockResolvedValue([]);
		await getMyBusinessAreas();
		expect(apiClient.get).toHaveBeenCalledWith("agencies/business_areas/mine");
	});
});
