import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import {
	getAllProjects,
	getProjectById,
	createProject,
	updateProject,
	updateProjectStatus,
	deleteProject,
	getAllProjectYears,
	getProjectsForMap,
	getMyProjects,
	getInvolvedProjects,
} from "./project.service";
import { apiClient } from "@/shared/services/api/client.service";

vi.mock("@/shared/services/api/client.service", () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
		getBlob: vi.fn(),
	},
}));

// Mock content-update re-exports
vi.mock("@/shared/services/content-update.service", () => ({
	updateProjectDescription: vi.fn(),
	updateExternalProjectField: vi.fn(),
	updateConceptPlanField: vi.fn(),
	updateProjectPlanField: vi.fn(),
	updateProjectPlanEndorsementField: vi.fn(),
	updateProgressReportField: vi.fn(),
	updateStudentReportField: vi.fn(),
	updateProjectClosureField: vi.fn(),
}));

describe("project.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getAllProjects", () => {
		it("should GET projects from list endpoint with no params", async () => {
			const mockResponse = { projects: [], total_results: 0, total_pages: 0 };
			(apiClient.get as Mock).mockResolvedValue(mockResponse);

			const result = await getAllProjects();

			expect(apiClient.get).toHaveBeenCalledWith("projects/list");
			expect(result).toEqual(mockResponse);
		});

		it("should include search and filter params in URL", async () => {
			const mockResponse = { projects: [], total_results: 0, total_pages: 0 };
			(apiClient.get as Mock).mockResolvedValue(mockResponse);

			await getAllProjects({
				page: 2,
				searchTerm: "fauna",
				businessarea: "BCS",
				projectkind: "science",
				projectstatus: "active",
				year: 2024,
			});

			const calledUrl = (apiClient.get as Mock).mock.calls[0][0] as string;
			expect(calledUrl).toContain("page=2");
			expect(calledUrl).toContain("searchTerm=fauna");
			expect(calledUrl).toContain("businessarea=BCS");
			expect(calledUrl).toContain("projectkind=science");
			expect(calledUrl).toContain("projectstatus=active");
			expect(calledUrl).toContain("year=2024");
		});

		it("should not include 'All' filter values", async () => {
			const mockResponse = { projects: [], total_results: 0, total_pages: 0 };
			(apiClient.get as Mock).mockResolvedValue(mockResponse);

			await getAllProjects({ businessarea: "All", projectkind: "All" });

			const calledUrl = (apiClient.get as Mock).mock.calls[0][0] as string;
			expect(calledUrl).not.toContain("businessarea");
			expect(calledUrl).not.toContain("projectkind");
		});
	});

	describe("getProjectById", () => {
		it("should GET project details by ID", async () => {
			const mockProject = { project: { id: 42, title: "Test" } };
			(apiClient.get as Mock).mockResolvedValue(mockProject);

			const result = await getProjectById(42);

			expect(apiClient.get).toHaveBeenCalledWith("projects/42");
			expect(result).toEqual(mockProject);
		});
	});

	describe("createProject", () => {
		it("should POST project data to list endpoint", async () => {
			const mockCreated = { id: 1, title: "New Project" };
			(apiClient.post as Mock).mockResolvedValue(mockCreated);

			const result = await createProject({ title: "New Project" });

			expect(apiClient.post).toHaveBeenCalledWith("projects/list", {
				title: "New Project",
			});
			expect(result).toEqual(mockCreated);
		});
	});

	describe("updateProject", () => {
		it("should PATCH project data by ID", async () => {
			const mockUpdated = { id: 42, title: "Updated" };
			(apiClient.patch as Mock).mockResolvedValue(mockUpdated);

			const result = await updateProject(42, { title: "Updated" });

			expect(apiClient.patch).toHaveBeenCalledWith("projects/42", {
				title: "Updated",
			});
			expect(result).toEqual(mockUpdated);
		});
	});

	describe("updateProjectStatus", () => {
		it("should PATCH status field on project", async () => {
			(apiClient.patch as Mock).mockResolvedValue({ id: 42, status: "active" });

			await updateProjectStatus(42, "active");

			expect(apiClient.patch).toHaveBeenCalledWith("projects/42", {
				status: "active",
			});
		});
	});

	describe("deleteProject", () => {
		it("should DELETE project by ID", async () => {
			(apiClient.delete as Mock).mockResolvedValue(undefined);

			await deleteProject(42);

			expect(apiClient.delete).toHaveBeenCalledWith("projects/42");
		});
	});

	describe("getAllProjectYears", () => {
		it("should GET years from years endpoint", async () => {
			(apiClient.get as Mock).mockResolvedValue([2024, 2023, 2022]);

			const result = await getAllProjectYears();

			expect(apiClient.get).toHaveBeenCalledWith("projects/listofyears");
			expect(result).toEqual([2024, 2023, 2022]);
		});
	});

	describe("getProjectsForMap", () => {
		it("should GET map projects with no params", async () => {
			const mockResponse = {
				projects: [],
				total_projects: 0,
				projects_without_location: 0,
			};
			(apiClient.get as Mock).mockResolvedValue(mockResponse);

			await getProjectsForMap();

			expect(apiClient.get).toHaveBeenCalledWith("projects/map");
		});

		it("should include location and business area filters", async () => {
			const mockResponse = {
				projects: [],
				total_projects: 0,
				projects_without_location: 0,
			};
			(apiClient.get as Mock).mockResolvedValue(mockResponse);

			await getProjectsForMap({
				locations: [1, 2],
				businessAreas: [3, 4],
				searchTerm: "test",
			});

			const calledUrl = (apiClient.get as Mock).mock.calls[0][0] as string;
			expect(calledUrl).toContain("locations=1%2C2");
			expect(calledUrl).toContain("businessarea=3%2C4");
			expect(calledUrl).toContain("searchTerm=test");
		});
	});

	describe("getMyProjects", () => {
		it("should GET projects from mine endpoint", async () => {
			const mockProjects = [{ id: 1 }];
			(apiClient.get as Mock).mockResolvedValue(mockProjects);

			const result = await getMyProjects();

			expect(apiClient.get).toHaveBeenCalledWith("projects/mine");
			expect(result).toEqual(mockProjects);
		});
	});

	describe("getInvolvedProjects", () => {
		it("should GET projects for a specific user", async () => {
			const mockProjects = [{ id: 1 }];
			(apiClient.get as Mock).mockResolvedValue(mockProjects);

			const result = await getInvolvedProjects(42);

			expect(apiClient.get).toHaveBeenCalledWith("users/42/projects");
			expect(result).toEqual(mockProjects);
		});
	});
});
